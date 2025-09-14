// Mock data for initial testing and development
const mockData = {
  members: new Map([
    [1, {
      member_id: 1,
      name: "Alice Johnson",
      age: 22,
      has_borrowed: false,
      created_at: "2025-09-01T10:00:00Z",
      membership_tier: "standard"
    }],
    [2, {
      member_id: 2,
      name: "Bob Smith",
      age: 30,
      has_borrowed: true,
      created_at: "2025-09-02T14:30:00Z",
      membership_tier: "gold"
    }],
    [3, {
      member_id: 3,
      name: "Charlie Brown",
      age: 25,
      has_borrowed: false,
      created_at: "2025-09-03T09:15:00Z",
      membership_tier: "standard"
    }]
  ]),
  
  books: new Map([
    [101, {
      book_id: 101,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      isbn: "978-0743273565",
      is_available: false,
      category: "Classic Literature",
      published_date: "1925-04-10",
      rating: 4.2,
      borrowing_count: 45,
      created_at: "2025-09-01T10:00:00Z"
    }],
    [102, {
      book_id: 102,
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      isbn: "978-0061120084",
      is_available: true,
      category: "Fiction",
      published_date: "1960-07-11",
      rating: 4.5,
      borrowing_count: 38,
      created_at: "2025-09-01T10:00:00Z"
    }],
    [103, {
      book_id: 103,
      title: "1984",
      author: "George Orwell",
      isbn: "978-0451524935",
      is_available: true,
      category: "Dystopian Fiction",
      published_date: "1949-06-08",
      rating: 4.3,
      borrowing_count: 52,
      created_at: "2025-09-01T10:00:00Z"
    }],
    [104, {
      book_id: 104,
      title: "Pride and Prejudice",
      author: "Jane Austen",
      isbn: "978-0141439518",
      is_available: false,
      category: "Romance",
      published_date: "1813-01-28",
      rating: 4.4,
      borrowing_count: 67,
      created_at: "2025-09-01T10:00:00Z"
    }],
    [105, {
      book_id: 105,
      title: "The Catcher in the Rye",
      author: "J.D. Salinger",
      isbn: "978-0316769174",
      is_available: true,
      category: "Coming-of-age Fiction",
      published_date: "1951-07-16",
      rating: 3.8,
      borrowing_count: 29,
      created_at: "2025-09-01T10:00:00Z"
    }]
  ]),
  
  transactions: new Map([
    [501, {
      transaction_id: 501,
      member_id: 1,
      book_id: 101,
      borrowed_at: "2025-09-11T10:30:00Z",
      due_date: "2025-09-25T10:30:00Z",
      returned_at: null,
      status: "active"
    }],
    [502, {
      transaction_id: 502,
      member_id: 2,
      book_id: 104,
      borrowed_at: "2025-09-12T14:15:00Z",
      due_date: "2025-09-26T14:15:00Z",
      returned_at: null,
      status: "active"
    }],
    [503, {
      transaction_id: 503,
      member_id: 1,
      book_id: 102,
      borrowed_at: "2025-08-15T09:00:00Z",
      due_date: "2025-08-29T09:00:00Z",
      returned_at: "2025-08-28T16:30:00Z",
      status: "returned"
    }]
  ]),
  
  reservations: new Map(),
  
  // Auto-increment counters
  nextMemberId: 4,
  nextBookId: 106,
  nextTransactionId: 504,
  nextReservationId: 1
};

module.exports = mockData;
