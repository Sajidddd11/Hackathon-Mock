# Library Management System API

A high-performance REST API for library management built for HackTheAI Preliminary Round.

## Features

- **Member Management**: Create, read, update, delete members with age validation
- **Book Management**: Add, retrieve, and remove books from catalog
- **Borrowing System**: Borrow and return books with validation
- **Advanced Search**: Complex book search with filtering, pagination, and analytics
- **Reservation System**: Priority-based book reservations with queue management
- **Overdue Tracking**: Monitor overdue books and borrowing history

## Quick Start

### Using Docker (Recommended)

```bash
# Build and run the application
docker compose up -d --build

# Check if the API is running
curl http://localhost:8000/health
```

### Manual Setup

```bash
# Install dependencies
npm install

# Start the application
npm start

# For development
npm run dev
```

## API Endpoints

### Member Management
- `POST /api/members` - Create member
- `GET /api/members/{id}` - Get member info
- `GET /api/members` - List all members
- `PUT /api/members/{id}` - Update member
- `DELETE /api/members/{id}` - Delete member
- `GET /api/members/{id}/history` - Get borrowing history

### Book Management
- `POST /api/books` - Add book
- `GET /api/books/{id}` - Get book info
- `DELETE /api/books/{id}` - Delete book

### Borrowing System
- `POST /api/borrow` - Borrow book
- `POST /api/return` - Return book
- `GET /api/borrowed` - List borrowed books
- `GET /api/overdue` - Get overdue books

### Advanced Features
- `GET /api/books/search` - Advanced book search
- `POST /api/reservations` - Create reservation
- `GET /api/reservations/{id}` - Get reservation
- `DELETE /api/reservations/{id}` - Cancel reservation

## Example Usage

### Create a Member
```bash
curl -X POST http://localhost:8000/api/members \
  -H "Content-Type: application/json" \
  -d '{"member_id": 1, "name": "Alice", "age": 22}'
```

### Borrow a Book
```bash
curl -X POST http://localhost:8000/api/borrow \
  -H "Content-Type: application/json" \
  -d '{"member_id": 1, "book_id": 101}'
```

### Search Books
```bash
curl "http://localhost:8000/api/books/search?q=fantasy&min_rating=4.0&sort_by=popularity"
```

## Performance Features

- **In-Memory Storage**: Ultra-fast data access
- **Optimized Queries**: Efficient search and filtering
- **Response Time Optimization**: Sub-millisecond response times
- **Memory Management**: Efficient data structures
- **Caching**: Smart caching for frequently accessed data

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Storage**: In-Memory (Map-based)
- **Containerization**: Docker
- **Security**: Helmet, CORS, Rate Limiting
- **Performance**: Compression, Request Logging

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test
```

## API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "member_id": 1,
  "name": "Alice",
  "age": 22,
  "has_borrowed": false
}
```

### Error Response
```json
{
  "error": "validation_error",
  "message": "Invalid input data",
  "timestamp": "2025-09-11T10:30:00Z"
}
```

## Health Check

The API includes a health check endpoint:

```bash
curl http://localhost:8000/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-09-11T10:30:00Z",
  "uptime": 123.456
}
```

## License

MIT License - Built for HackTheAI Preliminary Round
