const request = require('supertest');
const app = require('../src/app');

describe('Library Management API', () => {
  // Test data
  const testMember = {
    member_id: 999,
    name: "Test User",
    age: 25
  };

  const testBook = {
    book_id: 999,
    title: "Test Book",
    author: "Test Author",
    isbn: "978-0000000000"
  };

  describe('Health Check', () => {
    test('GET /health should return 200', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
    });
  });

  describe('Member Management', () => {
    test('POST /api/members should create a member', async () => {
      const response = await request(app)
        .post('/api/members')
        .send(testMember);
      
      expect(response.status).toBe(200);
      expect(response.body.member_id).toBe(testMember.member_id);
      expect(response.body.name).toBe(testMember.name);
      expect(response.body.age).toBe(testMember.age);
      expect(response.body.has_borrowed).toBe(false);
    });

    test('GET /api/members/{id} should return member info', async () => {
      const response = await request(app).get(`/api/members/${testMember.member_id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.member_id).toBe(testMember.member_id);
    });

    test('GET /api/members should return all members', async () => {
      const response = await request(app).get('/api/members');
      
      expect(response.status).toBe(200);
      expect(response.body.members).toBeInstanceOf(Array);
      expect(response.body.members.length).toBeGreaterThan(0);
    });

    test('PUT /api/members/{id} should update member', async () => {
      const updateData = { name: "Updated Name", age: 26 };
      const response = await request(app)
        .put(`/api/members/${testMember.member_id}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body.name).toBe("Updated Name");
      expect(response.body.age).toBe(26);
    });

    test('DELETE /api/members/{id} should delete member', async () => {
      const response = await request(app).delete(`/api/members/${testMember.member_id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.message).toContain('deleted successfully');
    });
  });

  describe('Book Management', () => {
    test('POST /api/books should create a book', async () => {
      const response = await request(app)
        .post('/api/books')
        .send(testBook);
      
      expect(response.status).toBe(200);
      expect(response.body.book_id).toBe(testBook.book_id);
      expect(response.body.title).toBe(testBook.title);
      expect(response.body.author).toBe(testBook.author);
      expect(response.body.is_available).toBe(true);
    });

    test('GET /api/books/{id} should return book info', async () => {
      const response = await request(app).get(`/api/books/${testBook.book_id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.book_id).toBe(testBook.book_id);
    });

    test('DELETE /api/books/{id} should delete book', async () => {
      const response = await request(app).delete(`/api/books/${testBook.book_id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.message).toContain('deleted successfully');
    });
  });

  describe('Borrowing System', () => {
    beforeEach(async () => {
      // Create test member and book
      await request(app).post('/api/members').send(testMember);
      await request(app).post('/api/books').send(testBook);
    });

    afterEach(async () => {
      // Clean up
      await request(app).delete(`/api/members/${testMember.member_id}`);
      await request(app).delete(`/api/books/${testBook.book_id}`);
    });

    test('POST /api/borrow should borrow a book', async () => {
      const response = await request(app)
        .post('/api/borrow')
        .send({
          member_id: testMember.member_id,
          book_id: testBook.book_id
        });
      
      expect(response.status).toBe(200);
      expect(response.body.member_id).toBe(testMember.member_id);
      expect(response.body.book_id).toBe(testBook.book_id);
      expect(response.body.status).toBe('active');
    });

    test('POST /api/return should return a book', async () => {
      // First borrow the book
      await request(app)
        .post('/api/borrow')
        .send({
          member_id: testMember.member_id,
          book_id: testBook.book_id
        });

      // Then return it
      const response = await request(app)
        .post('/api/return')
        .send({
          member_id: testMember.member_id,
          book_id: testBook.book_id
        });
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('returned');
    });

    test('GET /api/borrowed should return borrowed books', async () => {
      const response = await request(app).get('/api/borrowed');
      
      expect(response.status).toBe(200);
      expect(response.body.borrowed_books).toBeInstanceOf(Array);
    });

    test('GET /api/overdue should return overdue books', async () => {
      const response = await request(app).get('/api/overdue');
      
      expect(response.status).toBe(200);
      expect(response.body.overdue_books).toBeInstanceOf(Array);
    });
  });

  describe('Search System', () => {
    test('GET /api/books/search should return search results', async () => {
      const response = await request(app)
        .get('/api/books/search')
        .query({ q: 'fantasy', limit: 10 });
      
      expect(response.status).toBe(200);
      expect(response.body.books).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('POST /api/members with invalid age should return 400', async () => {
      const response = await request(app)
        .post('/api/members')
        .send({
          member_id: 1000,
          name: "Test",
          age: 10 // Invalid age
        });
      
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('invalid age');
    });

    test('GET /api/members/{id} with non-existent ID should return 404', async () => {
      const response = await request(app).get('/api/members/99999');
      
      expect(response.status).toBe(404);
      expect(response.body.message).toContain('not found');
    });

    test('POST /api/borrow with non-existent member should return 404', async () => {
      const response = await request(app)
        .post('/api/borrow')
        .send({
          member_id: 99999,
          book_id: 101
        });
      
      expect(response.status).toBe(404);
      expect(response.body.message).toContain('not found');
    });
  });
});
