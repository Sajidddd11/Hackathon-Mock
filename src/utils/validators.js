// Validation utilities for the Library Management System

/**
 * Validate member age
 * @param {number} age - The age to validate
 * @returns {boolean} - True if age is valid (12 or older)
 */
function validateAge(age) {
  const ageNum = parseInt(age);
  return !isNaN(ageNum) && ageNum >= 12;
}

/**
 * Validate member data
 * @param {Object} memberData - The member data to validate
 * @returns {Object} - Validation result with isValid and errors
 */
function validateMemberData(memberData) {
  const errors = [];
  
  if (!memberData.name || typeof memberData.name !== 'string' || memberData.name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string');
  }
  
  if (memberData.age === undefined || memberData.age === null) {
    errors.push('Age is required');
  } else if (!validateAge(memberData.age)) {
    errors.push('Age must be 12 or older');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validate book data
 * @param {Object} bookData - The book data to validate
 * @returns {Object} - Validation result with isValid and errors
 */
function validateBookData(bookData) {
  const errors = [];
  
  if (!bookData.title || typeof bookData.title !== 'string' || bookData.title.trim().length === 0) {
    errors.push('Title is required and must be a non-empty string');
  }
  
  if (!bookData.author || typeof bookData.author !== 'string' || bookData.author.trim().length === 0) {
    errors.push('Author is required and must be a non-empty string');
  }
  
  if (bookData.isbn && typeof bookData.isbn !== 'string') {
    errors.push('ISBN must be a string');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validate transaction data
 * @param {Object} transactionData - The transaction data to validate
 * @returns {Object} - Validation result with isValid and errors
 */
function validateTransactionData(transactionData) {
  const errors = [];
  
  if (!transactionData.member_id || isNaN(parseInt(transactionData.member_id))) {
    errors.push('Valid member_id is required');
  }
  
  if (!transactionData.book_id || isNaN(parseInt(transactionData.book_id))) {
    errors.push('Valid book_id is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validate reservation data
 * @param {Object} reservationData - The reservation data to validate
 * @returns {Object} - Validation result with isValid and errors
 */
function validateReservationData(reservationData) {
  const errors = [];
  
  if (!reservationData.member_id || isNaN(parseInt(reservationData.member_id))) {
    errors.push('Valid member_id is required');
  }
  
  if (!reservationData.book_id || isNaN(parseInt(reservationData.book_id))) {
    errors.push('Valid book_id is required');
  }
  
  if (reservationData.reservation_type && !['standard', 'premium', 'group'].includes(reservationData.reservation_type)) {
    errors.push('Reservation type must be standard, premium, or group');
  }
  
  if (reservationData.preferred_pickup_date) {
    const pickupDate = new Date(reservationData.preferred_pickup_date);
    if (isNaN(pickupDate.getTime())) {
      errors.push('Invalid preferred_pickup_date format');
    } else if (pickupDate < new Date()) {
      errors.push('Preferred pickup date cannot be in the past');
    }
  }
  
  if (reservationData.max_wait_days && (isNaN(parseInt(reservationData.max_wait_days)) || parseInt(reservationData.max_wait_days) < 1)) {
    errors.push('Max wait days must be a positive number');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validate search parameters
 * @param {Object} searchParams - The search parameters to validate
 * @returns {Object} - Validation result with isValid and errors
 */
function validateSearchParams(searchParams) {
  const errors = [];
  
  if (searchParams.page && (isNaN(parseInt(searchParams.page)) || parseInt(searchParams.page) < 1)) {
    errors.push('Page must be a positive integer');
  }
  
  if (searchParams.limit && (isNaN(parseInt(searchParams.limit)) || parseInt(searchParams.limit) < 1 || parseInt(searchParams.limit) > 100)) {
    errors.push('Limit must be between 1 and 100');
  }
  
  if (searchParams.min_rating && (isNaN(parseFloat(searchParams.min_rating)) || parseFloat(searchParams.min_rating) < 0 || parseFloat(searchParams.min_rating) > 5)) {
    errors.push('Min rating must be between 0 and 5');
  }
  
  if (searchParams.max_rating && (isNaN(parseFloat(searchParams.max_rating)) || parseFloat(searchParams.max_rating) < 0 || parseFloat(searchParams.max_rating) > 5)) {
    errors.push('Max rating must be between 0 and 5');
  }
  
  if (searchParams.min_rating && searchParams.max_rating && parseFloat(searchParams.min_rating) > parseFloat(searchParams.max_rating)) {
    errors.push('Min rating cannot be greater than max rating');
  }
  
  if (searchParams.published_after && isNaN(new Date(searchParams.published_after).getTime())) {
    errors.push('Invalid published_after date format');
  }
  
  if (searchParams.published_before && isNaN(new Date(searchParams.published_before).getTime())) {
    errors.push('Invalid published_before date format');
  }
  
  if (searchParams.published_after && searchParams.published_before) {
    const afterDate = new Date(searchParams.published_after);
    const beforeDate = new Date(searchParams.published_before);
    if (afterDate > beforeDate) {
      errors.push('Published after date cannot be later than published before date');
    }
  }
  
  if (searchParams.sort_by && !['title', 'author', 'published_date', 'rating', 'popularity', 'relevance'].includes(searchParams.sort_by)) {
    errors.push('Invalid sort_by parameter');
  }
  
  if (searchParams.sort_order && !['asc', 'desc'].includes(searchParams.sort_order)) {
    errors.push('Sort order must be asc or desc');
  }
  
  if (searchParams.availability && !['available', 'borrowed', 'reserved', 'all'].includes(searchParams.availability)) {
    errors.push('Availability must be available, borrowed, reserved, or all');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * Sanitize string input
 * @param {string} input - The input string to sanitize
 * @returns {string} - The sanitized string
 */
function sanitizeString(input) {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
}

/**
 * Validate email format
 * @param {string} email - The email to validate
 * @returns {boolean} - True if email format is valid
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format
 * @param {string} phone - The phone number to validate
 * @returns {boolean} - True if phone format is valid
 */
function validatePhone(phone) {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

module.exports = {
  validateAge,
  validateMemberData,
  validateBookData,
  validateTransactionData,
  validateReservationData,
  validateSearchParams,
  sanitizeString,
  validateEmail,
  validatePhone
};
