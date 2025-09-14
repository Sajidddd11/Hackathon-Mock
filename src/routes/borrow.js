const express = require('express');
const router = express.Router();
const database = require('../data/database');

// Q5: Borrow Book - POST /api/borrow
router.post('/', (req, res) => {
  try {
    const { member_id, book_id } = req.body;
    
    // Validate required fields
    if (!member_id || !book_id) {
      return res.status(400).json({
        message: "Missing required fields: member_id and book_id are required"
      });
    }
    
    // Check if member exists
    const member = database.getMember(member_id);
    if (!member) {
      return res.status(404).json({
        message: `member with id: ${member_id} was not found`
      });
    }
    
    // Check if book exists
    const book = database.getBook(book_id);
    if (!book) {
      return res.status(404).json({
        message: `book with id: ${book_id} was not found`
      });
    }
    
    // Check if member already has an active borrowing
    if (member.has_borrowed) {
      return res.status(400).json({
        message: `member with id: ${member_id} has already borrowed a book`
      });
    }
    
    // Check if book is available
    if (!book.is_available) {
      return res.status(400).json({
        message: `book with id: ${book_id} is not available`
      });
    }
    
    // Create transaction
    const transaction = database.createTransaction({ member_id, book_id });
    
    // Update member and book status
    database.updateMember(member_id, { has_borrowed: true });
    database.updateBook(book_id, { is_available: false });
    
    res.status(200).json({
      transaction_id: transaction.transaction_id,
      member_id: transaction.member_id,
      book_id: transaction.book_id,
      borrowed_at: transaction.borrowed_at,
      status: transaction.status
    });
    
  } catch (error) {
    console.error('Error borrowing book:', error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
});


module.exports = router;
