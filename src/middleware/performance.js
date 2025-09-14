// Performance optimization middleware
const compression = require('compression');

// Custom compression options for better performance
const compressionOptions = {
  level: 6, // Balanced compression level
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    // Don't compress if already compressed
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Use compression for JSON responses
    return compression.filter(req, res);
  }
};

// Response time optimization
const optimizeResponse = (req, res, next) => {
  // Set optimal headers for performance
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Cache control for static responses
  if (req.path === '/health') {
    res.setHeader('Cache-Control', 'public, max-age=30');
  }
  
  next();
};

// Memory usage monitoring
const memoryMonitor = (req, res, next) => {
  const startMemory = process.memoryUsage();
  
  res.on('finish', () => {
    const endMemory = process.memoryUsage();
    const memoryDiff = endMemory.heapUsed - startMemory.heapUsed;
    
    // Log if memory usage is high
    if (memoryDiff > 1024 * 1024) { // 1MB
      console.warn(`High memory usage for ${req.method} ${req.path}: ${memoryDiff} bytes`);
    }
  });
  
  next();
};

module.exports = {
  compressionOptions,
  optimizeResponse,
  memoryMonitor
};
