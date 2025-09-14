# Library Management API - Postman Collection

This Postman collection contains all 15 endpoints for testing the Library Management System API.

## 🚀 Quick Setup

### 1. Import the Collection
1. Open Postman
2. Click **Import** button
3. Select `Library_Management_API.postman_collection.json`
4. Select `Library_Management_API.postman_environment.json`

### 2. Set Environment
1. Click the environment dropdown (top right)
2. Select "Library Management API Environment"
3. Verify `base_url` is set to `http://localhost:8000`

### 3. Start the API
```bash
# Make sure your API is running
npm start
# or
docker compose up -d --build
```

## 📋 Collection Structure

### **Health Check**
- ✅ Health Check - Verify API is running

### **Member Management (Q1-Q4, Q8-Q9)**
- ✅ Q1: Create Member - `POST /api/members`
- ✅ Q2: Get Member Info - `GET /api/members/{id}`
- ✅ Q3: List All Members - `GET /api/members`
- ✅ Q4: Update Member Info - `PUT /api/members/{id}`
- ✅ Q8: Get Borrowing History - `GET /api/members/{id}/history`
- ✅ Q9: Delete Member - `DELETE /api/members/{id}`

### **Book Management (Q11-Q12, Q15)**
- ✅ Q11: Add Book - `POST /api/books`
- ✅ Q12: Get Book Info - `GET /api/books/{id}`
- ✅ Q15: Delete Book - `DELETE /api/books/{id}`

### **Borrowing System (Q5-Q7, Q10)**
- ✅ Q5: Borrow Book - `POST /api/borrow`
- ✅ Q6: Return Book - `POST /api/return`
- ✅ Q7: List Borrowed Books - `GET /api/borrowed`
- ✅ Q10: Get Overdue Books - `GET /api/overdue`

### **Advanced Features (Q13-Q14)**
- ✅ Q13: Advanced Book Search - `GET /api/books/search`
- ✅ Q14: Create Reservation - `POST /api/reservations`
- ✅ Get Reservation - `GET /api/reservations/{id}`
- ✅ Cancel Reservation - `DELETE /api/reservations/{id}`

### **Error Testing**
- ✅ Invalid Age (400) - Test validation
- ✅ Non-existent Member (404) - Test error handling
- ✅ Borrow Non-existent Book (404) - Test error handling
- ✅ Duplicate Member (400) - Test business logic

### **Performance Testing**
- ✅ Quick Search Test - Basic performance test
- ✅ Complex Search Test - Advanced performance test

## 🧪 Testing Workflow

### **Recommended Test Sequence:**

1. **Health Check** - Verify API is running
2. **Create Member** - Set up test data
3. **Create Book** - Set up test data
4. **Borrow Book** - Test borrowing system
5. **List Borrowed Books** - Verify borrowing worked
6. **Return Book** - Test return system
7. **Advanced Search** - Test complex search
8. **Create Reservation** - Test reservation system
9. **Error Tests** - Verify error handling
10. **Performance Tests** - Check response times

### **Quick Test Script:**
You can run the entire collection using Postman's Collection Runner:
1. Click on the collection name
2. Click "Run" button
3. Select all requests
4. Click "Run Library Management API"

## 📊 Expected Results

### **Success Responses (200):**
- All CRUD operations should return 200
- Search should return 200 with results
- Health check should return 200

### **Error Responses:**
- **400**: Validation errors (invalid age, duplicate IDs)
- **404**: Not found errors (non-existent members/books)

### **Response Times:**
- **Simple operations**: < 5ms
- **Complex search**: < 50ms
- **All operations**: < 100ms

## 🔧 Environment Variables

The collection uses these environment variables:
- `base_url`: API base URL (default: http://localhost:8000)
- `member_id`: Test member ID
- `book_id`: Test book ID
- `reservation_id`: Reservation ID (auto-populated)
- `transaction_id`: Transaction ID (auto-populated)

## 🎯 Hackathon Testing

This collection covers all 15 required endpoints for the HackTheAI Preliminary Round:

1. ✅ **Q1**: Create Member
2. ✅ **Q2**: Get Member Info
3. ✅ **Q3**: List All Members
4. ✅ **Q4**: Update Member Info
5. ✅ **Q5**: Borrow Book
6. ✅ **Q6**: Return Book
7. ✅ **Q7**: List Borrowed Books
8. ✅ **Q8**: Get Borrowing History
9. ✅ **Q9**: Delete Member
10. ✅ **Q10**: Get Overdue Books
11. ✅ **Q11**: Add Book
12. ✅ **Q12**: Get Book Info
13. ✅ **Q13**: Advanced Book Search
14. ✅ **Q14**: Complex Reservation System
15. ✅ **Q15**: Delete Book

## 🚀 Performance Tips

- Use Collection Runner for batch testing
- Monitor response times in Postman
- Test error scenarios to verify robustness
- Use environment variables for dynamic testing

Happy testing! 🎉
