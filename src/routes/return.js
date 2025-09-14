const express = require('express');
const router = express.Router();
const database = require('../data/database');

// Q6: Return Book - POST /api/return
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
    
    // Find active transaction for this member and book
    const activeTransactions = database.getActiveTransactions();
    const transaction = activeTransactions.find(t => 
      t.member_id === member_id && t.book_id === book_id
    );
    
    if (!transaction) {
      return res.status(400).json({
        message: `member with id: ${member_id} has not borrowed book with id: ${book_id}`
      });
    }
    
    // Update transaction
    const updatedTransaction = database.updateTransaction(transaction.transaction_id, {
      returned_at: new Date().toISOString(),
      status: "returned"
    });
    
    // Update member and book status
    database.updateMember(member_id, { has_borrowed: false });
    database.updateBook(book_id, { is_available: true });
    
    res.status(200).json({
      transaction_id: updatedTransaction.transaction_id,
      member_id: updatedTransaction.member_id,
      book_id: updatedTransaction.book_id,
      returned_at: updatedTransaction.returned_at,
      status: updatedTransaction.status
    });
    
  } catch (error) {
    console.error('Error returning book:', error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
});

module.exports = router;
