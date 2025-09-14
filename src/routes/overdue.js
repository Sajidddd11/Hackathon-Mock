const express = require('express');
const router = express.Router();
const database = require('../data/database');

// Q10: Get Overdue Books - GET /api/overdue
router.get('/', (req, res) => {
  try {
    const overdueBooks = database.getOverdueBooks();
    
    res.status(200).json({
      overdue_books: overdueBooks
    });
    
  } catch (error) {
    console.error('Error getting overdue books:', error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
});

module.exports = router;
