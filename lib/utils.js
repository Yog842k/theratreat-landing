const { ObjectId } = require('mongodb');

class ValidationUtils {
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePhone(phone) {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
    return phoneRegex.test(phone);
  }

  static validatePassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  static validateObjectId(id) {
    return ObjectId.isValid(id);
  }

  static sanitizeString(str) {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/[<>]/g, '');
  }

  static validateRequiredFields(obj, requiredFields) {
    const missing = [];
    for (const field of requiredFields) {
      if (!obj[field] || (typeof obj[field] === 'string' && !obj[field].trim())) {
        missing.push(field);
      }
    }
    return missing;
  }

  static validateUserRegistration(data) {
    const errors = [];
    const required = ['name', 'email', 'password', 'userType'];
    const missing = this.validateRequiredFields(data, required);
    
    if (missing.length > 0) {
      errors.push(`Missing required fields: ${missing.join(', ')}`);
    }

    if (data.email && !this.validateEmail(data.email)) {
      errors.push('Invalid email format');
    }

    if (data.password && !this.validatePassword(data.password)) {
      errors.push('Password must be at least 8 characters with uppercase, lowercase, and number');
    }

    if (data.phone && !this.validatePhone(data.phone)) {
      errors.push('Invalid phone number format');
    }

    if (data.userType && !['user', 'patient', 'therapist', 'instructor', 'student', 'clinic', 'admin'].includes(data.userType)) {
      errors.push('Invalid user type');
    }

    return errors;
  }

  static validateTherapistProfile(data) {
    const errors = [];
    const required = ['specializations', 'experience', 'qualifications'];
    const missing = this.validateRequiredFields(data, required);
    
    if (missing.length > 0) {
      errors.push(`Missing required fields: ${missing.join(', ')}`);
    }

    if (data.experience && (isNaN(data.experience) || data.experience < 0)) {
      errors.push('Experience must be a positive number');
    }

    if (data.rating && (isNaN(data.rating) || data.rating < 0 || data.rating > 5)) {
      errors.push('Rating must be between 0 and 5');
    }

    return errors;
  }
}

class ResponseUtils {
  static success(data, message = 'Success', statusCode = 200) {
    return Response.json({
      success: true,
      message,
      data
    }, { status: statusCode });
  }

  static error(message = 'Internal Server Error', statusCode = 500, errors = null) {
    return Response.json({
      success: false,
      message,
      errors
    }, { status: statusCode });
  }

  // New helper: include a short machine-readable code alongside the message
  static errorCode(code, message = 'Internal Server Error', statusCode = 500, errors = null) {
    return Response.json({
      success: false,
      code,
      message,
      errors
    }, { status: statusCode });
  }

  static notFound(message = 'Resource not found') {
    return this.error(message, 404);
  }

  static badRequest(message = 'Bad request', errors = null) {
    return this.error(message, 400, errors);
  }

  static unauthorized(message = 'Unauthorized') {
    return this.error(message, 401);
  }

  static forbidden(message = 'Forbidden') {
    return this.error(message, 403);
  }
}

module.exports = {
  ValidationUtils,
  ResponseUtils
};
