const express = require('express');
const router = express.Router();
const database = require('../data/database');

// Q11: Add Book - POST /api/books
router.post('/', (req, res) => {
  try {
    const { book_id, title, author, isbn } = req.body;
    
    // Validate required fields
    if (!book_id || !title || !author) {
      return res.status(400).json({
        message: "Missing required fields: book_id, title, and author are required"
      });
    }
    
    // Check if book already exists
    if (database.getBook(book_id)) {
      return res.status(400).json({
        message: `book with id: ${book_id} already exists`
      });
    }
    
    // Create book with specific ID
    const book = {
      book_id: book_id,
      title: title,
      author: author,
      isbn: isbn,
      is_available: true,
      category: "General",
      published_date: new Date().toISOString().split('T')[0],
      rating: 0.0,
      borrowing_count: 0,
      created_at: new Date().toISOString()
    };
    
    database.data.books.set(book_id, book);
    
    res.status(200).json({
      book_id: book.book_id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      is_available: book.is_available
    });
    
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
});

// Q12: Get Book Info - GET /api/books/{book_id}
router.get('/:book_id', (req, res) => {
  try {
    const bookId = parseInt(req.params.book_id);
    
    if (isNaN(bookId)) {
      return res.status(400).json({
        message: "Invalid book ID format"
      });
    }
    
    const book = database.getBook(bookId);
    
    if (!book) {
      return res.status(404).json({
        message: `book with id: ${bookId} was not found`
      });
    }
    
    res.status(200).json({
      book_id: book.book_id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      is_available: book.is_available
    });
    
  } catch (error) {
    console.error('Error getting book:', error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
});

// Q15: Delete Book - DELETE /api/books/{book_id}
router.delete('/:book_id', (req, res) => {
  try {
    const bookId = parseInt(req.params.book_id);
    
    if (isNaN(bookId)) {
      return res.status(400).json({
        message: "Invalid book ID format"
      });
    }
    
    // Check if book exists
    const book = database.getBook(bookId);
    if (!book) {
      return res.status(404).json({
        message: `book with id: ${bookId} was not found`
      });
    }
    
    // Check if book is currently borrowed
    const activeTransactions = database.getActiveTransactions()
      .filter(t => t.book_id === bookId);
    
    if (activeTransactions.length > 0) {
      return res.status(400).json({
        message: `cannot delete book with id: ${bookId}, book is currently borrowed`
      });
    }
    
    // Delete book
    const deleted = database.deleteBook(bookId);
    
    if (deleted) {
      res.status(200).json({
        message: `book with id: ${bookId} has been deleted successfully`
      });
    } else {
      res.status(500).json({
        message: "Failed to delete book"
      });
    }
    
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
});

module.exports = router;
