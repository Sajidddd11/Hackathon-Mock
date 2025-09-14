const express = require('express');
const router = express.Router();
const database = require('../data/database');

// Q14: Complex Book Reservation System with Priority Queue - POST /api/reservations
router.post('/', (req, res) => {
  try {
    const {
      member_id,
      book_id,
      reservation_type = "standard",
      preferred_pickup_date,
      max_wait_days = 14,
      notification_preferences = {},
      group_reservation = null,
      special_requests = {},
      payment_info = {}
    } = req.body;
    
    // Validate required fields
    if (!member_id || !book_id) {
      return res.status(400).json({
        error: "missing_required_fields",
        message: "member_id and book_id are required"
      });
    }
    
    // Check if member exists
    const member = database.getMember(member_id);
    if (!member) {
      return res.status(404).json({
        error: "member_not_found",
        message: `member with id: ${member_id} was not found`
      });
    }
    
    // Check if book exists
    const book = database.getBook(book_id);
    if (!book) {
      return res.status(404).json({
        error: "book_not_found",
        message: `book with id: ${book_id} was not found`
      });
    }
    
    // Check if member already has active reservations (limit: 2)
    const memberReservations = database.getAllReservations()
      .filter(r => r.member_id === member_id && r.status === "pending");
    
    if (memberReservations.length >= 2) {
      return res.status(400).json({
        error: "reservation_limit_exceeded",
        message: `Member already has ${memberReservations.length} active reservations (limit: 2)`,
        details: {
          current_reservations: memberReservations.length,
          limit: 2
        }
      });
    }
    
    // Check if book is available for reservation
    if (book.is_available) {
      return res.status(400).json({
        error: "book_available",
        message: `Book with id: ${book_id} is currently available for immediate borrowing`,
        details: {
          suggestion: "Use the borrow endpoint instead of reservation"
        }
      });
    }
    
    // Check for date conflicts
    if (preferred_pickup_date) {
      const pickupDate = new Date(preferred_pickup_date);
      const now = new Date();
      
      if (pickupDate < now) {
        return res.status(400).json({
          error: "invalid_pickup_date",
          message: "Preferred pickup date cannot be in the past"
        });
      }
      
      // Check for library closure (mock: weekends are closed)
      const dayOfWeek = pickupDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return res.status(400).json({
          error: "library_closed",
          message: "Library is closed on weekends",
          details: {
            suggested_dates: [
              new Date(pickupDate.getTime() + (1 * 24 * 60 * 60 * 1000)).toISOString(),
              new Date(pickupDate.getTime() + (2 * 24 * 60 * 60 * 1000)).toISOString()
            ]
          }
        });
      }
    }
    
    // Create reservation
    const reservationData = {
      member_id,
      book_id,
      reservation_type,
      preferred_pickup_date,
      max_wait_days,
      notification_preferences,
      group_reservation,
      special_requests,
      payment_info
    };
    
    const reservation = database.createReservation(reservationData);
    
    // Get queue analytics
    const queueAnalytics = getQueueAnalytics(book_id);
    const memberPriorityFactors = getMemberPriorityFactors(member_id);
    const notificationsScheduled = scheduleNotifications(reservation);
    const conflictResolution = getConflictResolution(book_id, member_id);
    
    // Build response
    const response = {
      reservation_id: reservation.reservation_id,
      member_id: reservation.member_id,
      book_id: reservation.book_id,
      book_title: book.title,
      reservation_status: reservation.status,
      queue_position: reservation.queue_position,
      estimated_availability_date: calculateEstimatedAvailability(book_id),
      priority_score: reservation.priority_score,
      reservation_details: {
        created_at: reservation.created_at,
        expires_at: reservation.expires_at,
        pickup_window_start: preferred_pickup_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        pickup_window_end: new Date(new Date(preferred_pickup_date || Date.now() + 7 * 24 * 60 * 60 * 1000).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        reservation_type: reservation.reservation_type,
        fee_paid: payment_info.premium_fee || 0
      },
      queue_analytics: queueAnalytics,
      member_priority_factors: memberPriorityFactors,
      notifications_scheduled: notificationsScheduled,
      conflict_resolution: conflictResolution
    };
    
    res.status(200).json(response);
    
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({
      error: "internal_server_error",
      message: "An unexpected error occurred while creating reservation",
      timestamp: new Date().toISOString()
    });
  }
});

// Get reservation by ID
router.get('/:reservation_id', (req, res) => {
  try {
    const { reservation_id } = req.params;
    
    const reservation = database.getReservation(reservation_id);
    
    if (!reservation) {
      return res.status(404).json({
        error: "reservation_not_found",
        message: `Reservation with id: ${reservation_id} was not found`
      });
    }
    
    res.status(200).json(reservation);
    
  } catch (error) {
    console.error('Error getting reservation:', error);
    res.status(500).json({
      error: "internal_server_error",
      message: "An unexpected error occurred"
    });
  }
});

// Cancel reservation
router.delete('/:reservation_id', (req, res) => {
  try {
    const { reservation_id } = req.params;
    
    const reservation = database.getReservation(reservation_id);
    
    if (!reservation) {
      return res.status(404).json({
        error: "reservation_not_found",
        message: `Reservation with id: ${reservation_id} was not found`
      });
    }
    
    if (reservation.status === "cancelled") {
      return res.status(400).json({
        error: "already_cancelled",
        message: "Reservation has already been cancelled"
      });
    }
    
    // Update reservation status
    database.updateReservation(reservation_id, { status: "cancelled" });
    
    res.status(200).json({
      message: `Reservation ${reservation_id} has been cancelled successfully`,
      reservation_id: reservation_id,
      status: "cancelled"
    });
    
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    res.status(500).json({
      error: "internal_server_error",
      message: "An unexpected error occurred"
    });
  }
});

// Helper functions
function getQueueAnalytics(bookId) {
  const reservations = database.getReservationsByBook(bookId);
  
  return {
    total_in_queue: reservations.length,
    avg_wait_time_days: Math.floor(Math.random() * 10) + 3, // Mock data
    queue_movement_rate: reservations.length > 5 ? "high" : "moderate",
    cancellation_rate: 0.15
  };
}

function getMemberPriorityFactors(memberId) {
  const member = database.getMember(memberId);
  const transactions = database.getTransactionsByMember(memberId);
  
  return {
    borrowing_frequency: Math.min(1.0, transactions.length / 10),
    return_punctuality: 0.9, // Mock data
    membership_tier: member.membership_tier,
    special_circumstances: ["academic_priority"], // Mock data
    loyalty_score: 8.5 // Mock data
  };
}

function scheduleNotifications(reservation) {
  return [
    {
      type: "queue_position_update",
      scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    },
    {
      type: "availability_alert",
      scheduled_for: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
}

function getConflictResolution(bookId, memberId) {
  const reservations = database.getReservationsByBook(bookId);
  const competingMembers = reservations
    .filter(r => r.member_id !== memberId)
    .slice(0, 2)
    .map(r => r.member_id);
  
  return {
    simultaneous_requests: Math.floor(Math.random() * 3) + 1,
    resolution_method: "priority_score",
    competing_members: competingMembers
  };
}

function calculateEstimatedAvailability(bookId) {
  // Mock calculation based on current borrowings
  const activeTransactions = database.getActiveTransactions()
    .filter(t => t.book_id === bookId);
  
  if (activeTransactions.length === 0) {
    return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  }
  
  // Estimate based on average borrowing duration
  const avgBorrowingDays = 14;
  const estimatedReturn = new Date(Date.now() + avgBorrowingDays * 24 * 60 * 60 * 1000);
  
  return estimatedReturn.toISOString();
}

module.exports = router;
