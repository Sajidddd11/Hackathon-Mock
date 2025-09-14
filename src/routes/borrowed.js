const express = require('express');
const router = express.Router();
const database = require('../data/database');

// Q7: List Borrowed Books - GET /api/borrowed
router.get('/', (req, res) => {
  try {
    const activeTransactions = database.getActiveTransactions();
    
    const borrowedBooks = activeTransactions.map(transaction => {
      const member = database.getMember(transaction.member_id);
      const book = database.getBook(transaction.book_id);
      
      return {
        transaction_id: transaction.transaction_id,
        member_id: transaction.member_id,
        member_name: member ? member.name : "Unknown",
        book_id: transaction.book_id,
        book_title: book ? book.title : "Unknown",
        borrowed_at: transaction.borrowed_at,
        due_date: transaction.due_date
      };
    });
    
    res.status(200).json({
      borrowed_books: borrowedBooks
    });
    
  } catch (error) {
    console.error('Error listing borrowed books:', error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
});

module.exports = router;
