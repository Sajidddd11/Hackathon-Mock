#!/bin/bash

# API Testing Script for Library Management System
# This script tests all 15 endpoints as specified in the problem set

echo "🚀 Starting Library Management API Tests"
echo "========================================"

BASE_URL="http://localhost:8000"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_status="$5"
    
    echo -n "Testing $test_name... "
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} ($http_code)"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} (Expected: $expected_status, Got: $http_code)"
        echo "Response: $response_body"
        ((TESTS_FAILED++))
    fi
}

# Wait for API to be ready
echo "Waiting for API to be ready..."
for i in {1..30}; do
    if curl -s "$BASE_URL/health" > /dev/null 2>&1; then
        echo -e "${GREEN}API is ready!${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

echo ""

# Q1: Create Member
run_test "Q1: Create Member" "POST" "/api/members" \
    '{"member_id": 1, "name": "Alice", "age": 22}' "200"

# Q2: Get Member Info
run_test "Q2: Get Member Info" "GET" "/api/members/1" "" "200"

# Q3: List All Members
run_test "Q3: List All Members" "GET" "/api/members" "" "200"

# Q4: Update Member Info
run_test "Q4: Update Member Info" "PUT" "/api/members/1" \
    '{"name": "Alice Smith", "age": 25}' "200"

# Q5: Borrow Book
run_test "Q5: Borrow Book" "POST" "/api/borrow" \
    '{"member_id": 1, "book_id": 101}' "200"

# Q6: Return Book
run_test "Q6: Return Book" "POST" "/api/return" \
    '{"member_id": 1, "book_id": 101}' "200"

# Q7: List Borrowed Books
run_test "Q7: List Borrowed Books" "GET" "/api/borrowed" "" "200"

# Q8: Get Borrowing History
run_test "Q8: Get Borrowing History" "GET" "/api/members/1/history" "" "200"

# Q9: Delete Member
run_test "Q9: Delete Member" "DELETE" "/api/members/1" "" "200"

# Q10: Get Overdue Books
run_test "Q10: Get Overdue Books" "GET" "/api/overdue" "" "200"

# Q11: Add Book
run_test "Q11: Add Book" "POST" "/api/books" \
    '{"book_id": 201, "title": "The Hobbit", "author": "J.R.R. Tolkien", "isbn": "978-0547928227"}' "200"

# Q12: Get Book Info
run_test "Q12: Get Book Info" "GET" "/api/books/201" "" "200"

# Q13: Advanced Book Search
run_test "Q13: Advanced Book Search" "GET" "/api/books/search?q=fantasy&min_rating=4.0&sort_by=popularity&include_analytics=true" "" "200"

# Q14: Create Reservation
run_test "Q14: Create Reservation" "POST" "/api/reservations" \
    '{"member_id": 2, "book_id": 201, "reservation_type": "standard"}' "200"

# Q15: Delete Book
run_test "Q15: Delete Book" "DELETE" "/api/books/201" "" "200"

# Test error cases
echo ""
echo "Testing Error Cases:"
echo "==================="

# Test invalid member creation
run_test "Error: Invalid Age" "POST" "/api/members" \
    '{"member_id": 999, "name": "Test", "age": 10}' "400"

# Test non-existent member
run_test "Error: Non-existent Member" "GET" "/api/members/99999" "" "404"

# Test borrowing non-existent book
run_test "Error: Borrow Non-existent Book" "POST" "/api/borrow" \
    '{"member_id": 2, "book_id": 99999}' "404"

echo ""
echo "Test Summary:"
echo "============="
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed.${NC}"
    exit 1
fi
