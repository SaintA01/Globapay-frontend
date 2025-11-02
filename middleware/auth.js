const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const config = require('../config/config');

const auth = {
  // Verify JWT token
  verifyToken: async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
      }

      const decoded = jwt.verify(token, config.jwt.secret);
      
      // Get user from database
      const query = 'SELECT id, name, email, phone, country, balance FROM users WHERE id = $1';
      const result = await pool.query(query, [decoded.userId]);
      
      if (!result.rows[0]) {
        return res.status(401).json({ message: 'Invalid token. User not found.' });
      }

      req.user = result.rows[0];
      next();
    } catch (error) {
      res.status(401).json({ message: 'Invalid token.' });
    }
  },

  // Optional auth (for public routes that can have authenticated users)
  optionalAuth: async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (token) {
        const decoded = jwt.verify(token, config.jwt.secret);
        const query = 'SELECT id, name, email, phone, country, balance FROM users WHERE id = $1';
