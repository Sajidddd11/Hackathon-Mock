#!/usr/bin/env node

const http = require('http');
const { performance } = require('perf_hooks');

// Performance testing script for the Library Management API
class PerformanceTester {
  constructor(baseUrl = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
    this.results = [];
  }

  async makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      
      const options = {
        hostname: 'localhost',
        port: 8000,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      const req = http.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          const endTime = performance.now();
          const responseTime = endTime - startTime;
          
          resolve({
            statusCode: res.statusCode,
            responseTime: responseTime,
            data: responseData,
            headers: res.headers
          });
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      if (data) {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }

  async testEndpoint(name, method, path, data = null, expectedStatus = 200) {
    console.log(`Testing ${name}...`);
    
    try {
      const result = await this.makeRequest(method, path, data);
      
      const testResult = {
        name,
        method,
        path,
        statusCode: result.statusCode,
        responseTime: result.responseTime,
        success: result.statusCode === expectedStatus,
        timestamp: new Date().toISOString()
      };
      
      this.results.push(testResult);
      
      console.log(`  ✓ ${name}: ${result.statusCode} (${result.responseTime.toFixed(2)}ms)`);
      
      return testResult;
    } catch (error) {
      console.error(`  ✗ ${name}: ${error.message}`);
      return null;
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Performance Tests for Library Management API\n');
    
    // Test data
    const testMember = {
      member_id: 1001,
      name: "Performance Test User",
      age: 25
    };

    const testBook = {
      book_id: 2001,
      title: "Performance Test Book",
      author: "Test Author",
      isbn: "978-0000000000"
    };

    // Health check
    await this.testEndpoint('Health Check', 'GET', '/health');

    // Member management tests
    await this.testEndpoint('Create Member', 'POST', '/api/members', testMember);
    await this.testEndpoint('Get Member', 'GET', `/api/members/${testMember.member_id}`);
    await this.testEndpoint('List Members', 'GET', '/api/members');
    await this.testEndpoint('Update Member', 'PUT', `/api/members/${testMember.member_id}`, { name: "Updated Name" });

    // Book management tests
    await this.testEndpoint('Create Book', 'POST', '/api/books', testBook);
    await this.testEndpoint('Get Book', 'GET', `/api/books/${testBook.book_id}`);

    // Borrowing tests
    await this.testEndpoint('Borrow Book', 'POST', '/api/borrow', {
      member_id: testMember.member_id,
      book_id: testBook.book_id
    });
    await this.testEndpoint('List Borrowed Books', 'GET', '/api/borrowed');
    await this.testEndpoint('Return Book', 'POST', '/api/return', {
      member_id: testMember.member_id,
      book_id: testBook.book_id
    });

    // Search tests
    await this.testEndpoint('Search Books', 'GET', '/api/books/search?q=fantasy&limit=10');
    await this.testEndpoint('Advanced Search', 'GET', '/api/books/search?q=test&min_rating=4.0&sort_by=popularity&include_analytics=true');

    // Reservation tests
    await this.testEndpoint('Create Reservation', 'POST', '/api/reservations', {
      member_id: testMember.member_id,
      book_id: testBook.book_id,
      reservation_type: "standard"
    });

    // Overdue books
    await this.testEndpoint('Get Overdue Books', 'GET', '/api/overdue');

    // Cleanup
    await this.testEndpoint('Delete Member', 'DELETE', `/api/members/${testMember.member_id}`);
    await this.testEndpoint('Delete Book', 'DELETE', `/api/books/${testBook.book_id}`);

    this.printSummary();
  }

  printSummary() {
    console.log('\n📊 Performance Test Summary');
    console.log('=' .repeat(50));
    
    const successfulTests = this.results.filter(r => r.success);
    const failedTests = this.results.filter(r => !r.success);
    
    console.log(`Total Tests: ${this.results.length}`);
    console.log(`Successful: ${successfulTests.length}`);
    console.log(`Failed: ${failedTests.length}`);
    
    if (successfulTests.length > 0) {
      const avgResponseTime = successfulTests.reduce((sum, r) => sum + r.responseTime, 0) / successfulTests.length;
      const maxResponseTime = Math.max(...successfulTests.map(r => r.responseTime));
      const minResponseTime = Math.min(...successfulTests.map(r => r.responseTime));
      
      console.log(`\nResponse Time Statistics:`);
      console.log(`  Average: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`  Fastest: ${minResponseTime.toFixed(2)}ms`);
      console.log(`  Slowest: ${maxResponseTime.toFixed(2)}ms`);
      
      // Performance rating
      if (avgResponseTime < 10) {
        console.log(`\n🏆 Excellent Performance! Average response time under 10ms`);
      } else if (avgResponseTime < 50) {
        console.log(`\n✅ Good Performance! Average response time under 50ms`);
      } else if (avgResponseTime < 100) {
        console.log(`\n⚠️  Acceptable Performance! Average response time under 100ms`);
      } else {
        console.log(`\n❌ Poor Performance! Average response time over 100ms`);
      }
    }
    
    if (failedTests.length > 0) {
      console.log(`\n❌ Failed Tests:`);
      failedTests.forEach(test => {
        console.log(`  - ${test.name}: ${test.statusCode}`);
      });
    }
    
    console.log('\n🎯 Performance Test Complete!');
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new PerformanceTester();
  tester.runAllTests().catch(console.error);
}

module.exports = PerformanceTester;
