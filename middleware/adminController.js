const { Transaction, User, Country, Service, Network, Plan } = require('../models');
const { pool } = require('../config/database');

const adminController = {
  // Get dashboard statistics
  getDashboardStats: async (req, res, next) => {
    try {
      const stats = await Transaction.getDashboardStats();
      
      // Additional stats
      const todayRevenue = await pool.query(`
        SELECT COALESCE(SUM(amount_paid), 0) as revenue 
        FROM transactions 
        WHERE status = 'success' AND DATE(created_at) = CURRENT_DATE
      `);

      const pendingTransactions = await pool.query(`
        SELECT COUNT(*) as count FROM transactions WHERE status = 'pending'
      `);

      res.json({
        ...stats,
        today_revenue: parseFloat(todayRevenue.rows[0].revenue),
        pending_transactions: parseInt(pendingTransactions.rows[0].count)
      });
    } catch (error) {
      next(error);
    }
  },

  // Get all transactions with filters
  getTransactions: async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 50,
        status,
        country_id,
        service_id,
        start_date,
        end_date
      } = req.query;

      const offset = (page - 1) * limit;
      
      const transactions = await Transaction.findAllForAdmin(
        { status, country_id, service_id, start_date, end_date },
        limit,
        offset
      );

      // Get total count
      let countQuery = 'SELECT COUNT(*) FROM transactions WHERE 1=1';
      const countValues = [];
      let paramCount = 0;

      if (status) {
        paramCount++;
        countQuery += ` AND status = $${paramCount}`;
        countValues.push(status);
      }

      if (country_id) {
        paramCount++;
        countQuery += ` AND country_id = $${paramCount}`;
        countValues.push(country_id);
      }

      if (service_id) {
        paramCount++;
        countQuery += ` AND service_id = $${paramCount}`;
        countValues.push(service_id);
      }

      const countResult = await pool.query(countQuery, countValues);
      const total = parseInt(countResult.rows[0].count);

      res.json({
        transactions,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Get all users
  getUsers: async (req, res, next) => {
    try {
      const { page = 1, limit = 50 } = req.query;
      const offset = (page - 1) * limit;

      const query = `
        SELECT id, name, email, phone, country, balance, created_at
        FROM users 
        ORDER BY created_at DESC 
        LIMIT $1 OFFSET $2
      `;
      const result = await pool.query(query, [limit, offset]);
      
      const countResult = await pool.query('SELECT COUNT(*) FROM users');
      const total = parseInt(countResult.rows[0].count);

      res.json({
        users: result.rows,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Create new country
  createCountry: async (req, res, next) => {
    try {
      const country = await Country.create(req.body);
      res.status(201).json({
        message: 'Country created successfully',
        country
      });
    } catch (error) {
      next(error);
    }
  },

  // Create new plan
  createPlan: async (req, res, next) => {
    try {
      const { network_id, name, description, cost_price, selling_price, validity, data_volume } = req.body;
      
      const query = `
        INSERT INTO plans (network_id, name, description, cost_price, selling_price, validity, data_volume, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING *
      `;
      
      const result = await pool.query(query, [
        network_id, name, description, cost_price, selling_price, validity, data_volume
      ]);

      res.status(201).json({
        message: 'Plan created successfully',
        plan: result.rows[0]
      });
    } catch (error) {
      next(error);
    }
  },

  // Update plan
  updatePlan: async (req, res, next) => {
    try {
      const { planId } = req.params;
      const { name, description, cost_price, selling_price, validity, data_volume, is_active } = req.body;
      
      const query = `
        UPDATE plans 
        SET name = $1, description = $2, cost_price = $3, selling_price = $4, 
            validity = $5, data_volume = $6, is_active = $7, updated_at = NOW()
        WHERE id = $8
        RETURNING *
      `;
      
      const result = await pool.query(query, [
        name, description, cost_price, selling_price, validity, data_volume, is_active, planId
      ]);

      if (!result.rows[0]) {
        return res.status(404).json({ message: 'Plan not found' });
      }

      res.json({
        message: 'Plan updated successfully',
        plan: result.rows[0]
      });
    } catch (error) {
      next(error);
    }
  },

  // Manual transaction resolution
  resolveTransaction: async (req, res, next) => {
    try {
      const { transactionId } = req.params;
      const { status, notes } = req.body;

      const transaction = await Transaction.findByTransactionId(transactionId);
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      await Transaction.updateStatus(transactionId, status, { admin_notes: notes });

      res.json({
        message: 'Transaction resolved successfully',
        transaction: await Transaction.findByTransactionId(transactionId)
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = adminController;
