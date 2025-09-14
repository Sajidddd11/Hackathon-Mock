// In-memory database for the Library Management System
const mockData = require('./mockData');

class Database {
  constructor() {
    // Initialize with mock data
    this.data = {
      members: new Map(mockData.members),
      books: new Map(mockData.books),
      transactions: new Map(mockData.transactions),
      reservations: new Map(mockData.reservations),
      nextMemberId: mockData.nextMemberId,
      nextBookId: mockData.nextBookId,
      nextTransactionId: mockData.nextTransactionId,
      nextReservationId: mockData.nextReservationId
    };
  }

  // Member operations
  createMember(memberData) {
    const member = {
      member_id: this.data.nextMemberId++,
      name: memberData.name,
      age: memberData.age,
      has_borrowed: false,
      created_at: new Date().toISOString(),
      membership_tier: "standard"
    };
    this.data.members.set(member.member_id, member);
    return member;
  }

  getMember(memberId) {
    return this.data.members.get(memberId);
  }

  getAllMembers() {
    return Array.from(this.data.members.values());
  }

  updateMember(memberId, updateData) {
    const member = this.data.members.get(memberId);
    if (!member) return null;
    
    const updatedMember = {
      ...member,
      ...updateData,
      member_id: memberId // Ensure ID doesn't change
    };
    this.data.members.set(memberId, updatedMember);
    return updatedMember;
  }

  deleteMember(memberId) {
    return this.data.members.delete(memberId);
  }

  // Book operations
  createBook(bookData) {
    const book = {
      book_id: this.data.nextBookId++,
      title: bookData.title,
      author: bookData.author,
      isbn: bookData.isbn,
      is_available: true,
      category: bookData.category || "General",
      published_date: bookData.published_date || new Date().toISOString().split('T')[0],
      rating: bookData.rating || 0.0,
      borrowing_count: 0,
      created_at: new Date().toISOString()
    };
    this.data.books.set(book.book_id, book);
    return book;
  }

  getBook(bookId) {
    return this.data.books.get(bookId);
  }

  getAllBooks() {
    return Array.from(this.data.books.values());
  }

  updateBook(bookId, updateData) {
    const book = this.data.books.get(bookId);
    if (!book) return null;
    
    const updatedBook = {
      ...book,
      ...updateData,
      book_id: bookId
    };
    this.data.books.set(bookId, updatedBook);
    return updatedBook;
  }

  deleteBook(bookId) {
    return this.data.books.delete(bookId);
  }

  // Transaction operations
  createTransaction(transactionData) {
    const transaction = {
      transaction_id: this.data.nextTransactionId++,
      member_id: transactionData.member_id,
      book_id: transactionData.book_id,
      borrowed_at: new Date().toISOString(),
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
      returned_at: null,
      status: "active"
    };
    this.data.transactions.set(transaction.transaction_id, transaction);
    return transaction;
  }

  getTransaction(transactionId) {
    return this.data.transactions.get(transactionId);
  }

  getAllTransactions() {
    return Array.from(this.data.transactions.values());
  }

  getActiveTransactions() {
    return Array.from(this.data.transactions.values()).filter(t => t.status === "active");
  }

  getTransactionsByMember(memberId) {
    return Array.from(this.data.transactions.values()).filter(t => t.member_id === memberId);
  }

  updateTransaction(transactionId, updateData) {
    const transaction = this.data.transactions.get(transactionId);
    if (!transaction) return null;
    
    const updatedTransaction = {
      ...transaction,
      ...updateData,
      transaction_id: transactionId
    };
    this.data.transactions.set(transactionId, updatedTransaction);
    return updatedTransaction;
  }

  // Reservation operations
  createReservation(reservationData) {
    const reservation = {
      reservation_id: `RES-${Date.now()}-${String(this.data.nextReservationId++).padStart(3, '0')}`,
      member_id: reservationData.member_id,
      book_id: reservationData.book_id,
      reservation_type: reservationData.reservation_type || "standard",
      status: "pending",
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      priority_score: this.calculatePriorityScore(reservationData.member_id),
      queue_position: this.getQueuePosition(reservationData.book_id),
      ...reservationData
    };
    this.data.reservations.set(reservation.reservation_id, reservation);
    return reservation;
  }

  getReservation(reservationId) {
    return this.data.reservations.get(reservationId);
  }

  getAllReservations() {
    return Array.from(this.data.reservations.values());
  }

  getReservationsByBook(bookId) {
    return Array.from(this.data.reservations.values())
      .filter(r => r.book_id === bookId && r.status === "pending")
      .sort((a, b) => b.priority_score - a.priority_score);
  }

  updateReservation(reservationId, updateData) {
    const reservation = this.data.reservations.get(reservationId);
    if (!reservation) return null;
    
    const updatedReservation = {
      ...reservation,
      ...updateData,
      reservation_id: reservationId
    };
    this.data.reservations.set(reservationId, updatedReservation);
    return updatedReservation;
  }

  // Helper methods
  calculatePriorityScore(memberId) {
    const member = this.getMember(memberId);
    if (!member) return 0;

    const memberTransactions = this.getTransactionsByMember(memberId);
    const borrowingFrequency = memberTransactions.length;
    const returnPunctuality = this.calculateReturnPunctuality(memberTransactions);
    const membershipTier = member.membership_tier === "gold" ? 1.5 : 1.0;
    
    return (borrowingFrequency * 0.3 + returnPunctuality * 0.4 + membershipTier * 0.3) * 10;
  }

  calculateReturnPunctuality(transactions) {
    const returnedTransactions = transactions.filter(t => t.status === "returned");
    if (returnedTransactions.length === 0) return 0.5;
    
    const onTimeReturns = returnedTransactions.filter(t => {
      const returnedDate = new Date(t.returned_at);
      const dueDate = new Date(t.due_date);
      return returnedDate <= dueDate;
    }).length;
    
    return onTimeReturns / returnedTransactions.length;
  }

  getQueuePosition(bookId) {
    return this.getReservationsByBook(bookId).length + 1;
  }

  // Search and analytics
  searchBooks(query, filters = {}) {
    let books = Array.from(this.data.books.values());
    
    // Text search
    if (query) {
      const searchTerm = query.toLowerCase();
      books = books.filter(book => 
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        book.category.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply filters
    if (filters.category) {
      books = books.filter(book => book.category === filters.category);
    }
    
    if (filters.author) {
      books = books.filter(book => book.author.toLowerCase().includes(filters.author.toLowerCase()));
    }
    
    if (filters.min_rating) {
      books = books.filter(book => book.rating >= filters.min_rating);
    }
    
    if (filters.max_rating) {
      books = books.filter(book => book.rating <= filters.max_rating);
    }
    
    if (filters.availability !== undefined) {
      books = books.filter(book => book.is_available === filters.availability);
    }
    
    // Sorting
    const sortBy = filters.sort_by || 'title';
    const sortOrder = filters.sort_order || 'asc';
    
    books.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortOrder === 'desc') {
        return bVal > aVal ? 1 : -1;
      } else {
        return aVal > bVal ? 1 : -1;
      }
    });
    
    return books;
  }

  getOverdueBooks() {
    const now = new Date();
    return this.getActiveTransactions().filter(transaction => {
      const dueDate = new Date(transaction.due_date);
      return dueDate < now;
    }).map(transaction => {
      const member = this.getMember(transaction.member_id);
      const book = this.getBook(transaction.book_id);
      const daysOverdue = Math.ceil((now - new Date(transaction.due_date)) / (1000 * 60 * 60 * 24));
      
      return {
        transaction_id: transaction.transaction_id,
        member_id: transaction.member_id,
        member_name: member ? member.name : "Unknown",
        book_id: transaction.book_id,
        book_title: book ? book.title : "Unknown",
        borrowed_at: transaction.borrowed_at,
        due_date: transaction.due_date,
        days_overdue: daysOverdue
      };
    });
  }

  // Utility methods
  isMemberActive(memberId) {
    const member = this.getMember(memberId);
    return member && !member.has_borrowed;
  }

  isBookAvailable(bookId) {
    const book = this.getBook(bookId);
    return book && book.is_available;
  }

  getMemberBorrowingHistory(memberId) {
    const transactions = this.getTransactionsByMember(memberId);
    const member = this.getMember(memberId);
    
    return {
      member_id: memberId,
      member_name: member ? member.name : "Unknown",
      borrowing_history: transactions.map(transaction => {
        const book = this.getBook(transaction.book_id);
        return {
          transaction_id: transaction.transaction_id,
          book_id: transaction.book_id,
          book_title: book ? book.title : "Unknown",
          borrowed_at: transaction.borrowed_at,
          returned_at: transaction.returned_at,
          status: transaction.status
        };
      })
    };
  }
}

// Create singleton instance
const database = new Database();

module.exports = database;
