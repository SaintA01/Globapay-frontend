const { v4: uuidv4 } = require('uuid');

const helpers = {
  // Generate unique transaction ID
  generateTransactionId: () => {
    return `GPAY${uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase()}`;
  },

  // Generate payment reference
  generatePaymentReference: () => {
    return `PAY${uuidv4().replace(/-/g, '').substring(0, 14).toUpperCase()}`;
  },

  // Format currency
  formatCurrency: (amount, currency = 'NGN') => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  // Validate phone number
  validatePhoneNumber: (phone, countryCode = 'NG') => {
    const patterns = {
      'NG': /^(\+234|0)[789][01]\d{8}$/,
      'US': /^(\+1|1)?[2-9]\d{2}[2-9]\d{6}$/,
      'UK': /^(\+44|0)7\d{9}$/,
      'KE': /^(\+254|0)?[17]\d{8}$/
    };

    const pattern = patterns[countryCode] || /^\+\d{10,15}$/;
    return pattern.test(phone.replace(/\s/g, ''));
  },

  // Calculate profit margin
  calculateMargin: (costPrice, sellingPrice) => {
    return ((sellingPrice - costPrice) / costPrice) * 100;
  },

  // Sanitize object (remove undefined values)
  sanitizeObject: (obj) => {
    const sanitized = {};
    Object.keys(obj).forEach(key => {
      if (obj[key] !== undefined && obj[key] !== null) {
        sanitized[key] = obj[key];
      }
    });
    return sanitized;
  },

  // Async delay
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Retry function with exponential backoff
  retry: async (fn, retries = 3, delay = 1000) => {
    try {
      return await fn();
    } catch (error) {
      if (retries === 0) throw error;
      await helpers.delay(delay);
      return helpers.retry(fn, retries - 1, delay * 2);
    }
  }
};

module.exports = helpers;
