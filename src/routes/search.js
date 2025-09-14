const express = require('express');
const router = express.Router();
const database = require('../data/database');

// Q13: Advanced Book Search with Complex Filtering - GET /api/books/search
router.get('/', (req, res) => {
  try {
    const {
      q: query,
      category,
      author,
      published_after,
      published_before,
      min_rating,
      max_rating,
      availability,
      sort_by = 'title',
      sort_order = 'asc',
      page = 1,
      limit = 20,
      include_analytics = false,
      member_preferences = false,
      borrowing_trends = false
    } = req.query;
    
    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    
    // Validate date range
    if (published_after && published_before) {
      const afterDate = new Date(published_after);
      const beforeDate = new Date(published_before);
      if (afterDate > beforeDate) {
        return res.status(400).json({
          error: "invalid_query_parameters",
          message: "Invalid date range: published_after cannot be later than published_before",
          details: {
            invalid_params: ["published_after", "published_before"],
            suggested_corrections: {
              published_after: "2020-01-01",
              published_before: "2023-12-31"
            }
          }
        });
      }
    }
    
    // Build filters
    const filters = {};
    if (category) filters.category = category;
    if (author) filters.author = author;
    if (min_rating !== undefined) filters.min_rating = parseFloat(min_rating);
    if (max_rating !== undefined) filters.max_rating = parseFloat(max_rating);
    if (availability !== undefined) {
      filters.availability = availability === 'available' ? true : 
                           availability === 'borrowed' ? false : undefined;
    }
    
    // Add date filters
    if (published_after) filters.published_after = published_after;
    if (published_before) filters.published_before = published_before;
    
    // Perform search
    const startTime = Date.now();
    let books = database.searchBooks(query, filters);
    
    // Apply date filters
    if (published_after || published_before) {
      books = books.filter(book => {
        const publishedDate = new Date(book.published_date);
        if (published_after && publishedDate < new Date(published_after)) return false;
        if (published_before && publishedDate > new Date(published_before)) return false;
        return true;
      });
    }
    
    // Calculate pagination
    const totalResults = books.length;
    const totalPages = Math.ceil(totalResults / limitNum);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedBooks = books.slice(startIndex, endIndex);
    
    // Enhance books with additional data
    const enhancedBooks = paginatedBooks.map(book => {
      const enhanced = {
        book_id: book.book_id,
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        category: book.category,
        published_date: book.published_date,
        rating: book.rating,
        is_available: book.is_available,
        borrowing_count: book.borrowing_count,
        popularity_score: Math.min(10, (book.borrowing_count / 10) + (book.rating * 2)),
        relevance_score: query ? calculateRelevanceScore(book, query) : 1.0
      };
      
      // Add analytics if requested
      if (include_analytics || borrowing_trends) {
        enhanced.avg_borrowing_duration = 14.5; // Mock data
        enhanced.borrowing_trend = book.borrowing_count > 20 ? "increasing" : "stable";
        enhanced.reservation_count = Math.floor(Math.random() * 5);
      }
      
      // Add member preferences if requested
      if (member_preferences) {
        enhanced.member_rating = book.rating + (Math.random() - 0.5) * 0.5;
        enhanced.similar_books = getSimilarBooks(book.book_id);
      }
      
      return enhanced;
    });
    
    // Build response
    const response = {
      books: enhancedBooks,
      pagination: {
        current_page: pageNum,
        total_pages: totalPages,
        total_results: totalResults,
        has_next: pageNum < totalPages,
        has_previous: pageNum > 1
      }
    };
    
    // Add analytics if requested
    if (include_analytics) {
      const searchTime = Date.now() - startTime;
      const allBooks = database.getAllBooks();
      
      response.analytics = {
        search_time_ms: searchTime,
        filters_applied: Object.keys(filters).filter(key => filters[key] !== undefined),
        trending_categories: getTrendingCategories(allBooks),
        popular_authors: getPopularAuthors(allBooks),
        availability_summary: {
          available: allBooks.filter(b => b.is_available).length,
          borrowed: allBooks.filter(b => !b.is_available).length,
          reserved: 0 // Mock data
        }
      };
    }
    
    // Add suggestions
    response.suggestions = {
      related_searches: getRelatedSearches(query),
      alternative_categories: getAlternativeCategories(category),
      recommended_books: getRecommendedBooks(enhancedBooks.slice(0, 3))
    };
    
    res.status(200).json(response);
    
  } catch (error) {
    console.error('Error in book search:', error);
    res.status(500).json({
      error: "search_error",
      message: "An error occurred during search",
      timestamp: new Date().toISOString()
    });
  }
});

// Helper functions
function calculateRelevanceScore(book, query) {
  const searchTerm = query.toLowerCase();
  let score = 0;
  
  if (book.title.toLowerCase().includes(searchTerm)) score += 0.5;
  if (book.author.toLowerCase().includes(searchTerm)) score += 0.3;
  if (book.category.toLowerCase().includes(searchTerm)) score += 0.2;
  
  return Math.min(1.0, score);
}

function getSimilarBooks(bookId) {
  // Mock implementation - return random book IDs
  const allBooks = database.getAllBooks();
  const similarBooks = allBooks
    .filter(book => book.book_id !== bookId)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map(book => book.book_id);
  
  return similarBooks;
}

function getTrendingCategories(allBooks) {
  const categoryCount = {};
  allBooks.forEach(book => {
    categoryCount[book.category] = (categoryCount[book.category] || 0) + 1;
  });
  
  return Object.entries(categoryCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([category]) => category);
}

function getPopularAuthors(allBooks) {
  const authorCount = {};
  allBooks.forEach(book => {
    authorCount[book.author] = (authorCount[book.author] || 0) + 1;
  });
  
  return Object.entries(authorCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 2)
    .map(([author]) => author);
}

function getRelatedSearches(query) {
  if (!query) return [];
  
  const related = {
    'fantasy': ['lord of the rings', 'fantasy novels', 'tolkien'],
    'fiction': ['novels', 'literature', 'stories'],
    'classic': ['classic literature', 'timeless', 'masterpiece']
  };
  
  const lowerQuery = query.toLowerCase();
  for (const [key, searches] of Object.entries(related)) {
    if (lowerQuery.includes(key)) {
      return searches;
    }
  }
  
  return ['books', 'reading', 'literature'];
}

function getAlternativeCategories(category) {
  if (!category) return [];
  
  const alternatives = {
    'Fiction': ['Novels', 'Literature', 'Stories'],
    'Fantasy': ['Epic Fantasy', 'Urban Fantasy', 'Magic'],
    'Classic Literature': ['Classics', 'Timeless', 'Masterpieces']
  };
  
  return alternatives[category] || [];
}

function getRecommendedBooks(currentBooks) {
  const allBooks = database.getAllBooks();
  const currentIds = currentBooks.map(book => book.book_id);
  
  return allBooks
    .filter(book => !currentIds.includes(book.book_id))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3)
    .map(book => book.book_id);
}

module.exports = router;
