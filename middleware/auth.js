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
        const result = await pool.query(query, [decoded.userId]);
        
        if (result.rows[0]) {
          req.user = result.rows[0];
        }
      }
      
      next();
    } catch (error) {
      next(); // Continue without user
    }
  },

  // Admin only middleware
  adminOnly: async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required.' });
      }

      // Check if user is admin (you can add an is_admin field to users table)
      const query = 'SELECT is_admin FROM users WHERE id = $1';
      const result = await pool.query(query, [req.user.id]);
      
      if (!result.rows[0]?.is_admin) {
        return res.status(403).json({ message: 'Admin access required.' });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: 'Server error.' });
    }
  }
};

module.exports = auth;
