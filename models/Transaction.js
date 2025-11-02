const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Transaction {
  // Create new transaction
  static async create(transactionData) {
    const {
      user_id, country_id, service_id, network_id, plan_id,
      recipient, amount_paid, payment_gateway, api_provider_id
    } = transactionData;

    const transaction_id = `GPAY${uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase()}`;

    const query = `
      INSERT INTO transactions (
        user_id, country_id, service_id, network_id, plan_id,
        recipient, amount_paid, payment_gateway, api_provider_id,
        transaction_id, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending', NOW())
      RETURNING *
    `;

    const values = [
      user_id, country_id, service_id, network_id, plan_id,
      recipient, amount_paid, payment_gateway, api_provider_id,
      transaction_id
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find transaction by ID
  static async findById(id) {
    const query = `
      SELECT t.*, 
             c.name as country_name,
             s.name as service_name,
             n.name as network_name,
             p.name as plan_name
      FROM transactions t
      LEFT JOIN countries c ON t.country_id = c.id
      LEFT JOIN services s ON t.service_id = s.id
      LEFT JOIN networks n ON t.network_id = n.id
      LEFT JOIN plans p ON t.plan_id = p.id
      WHERE t.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Find transaction by transaction_id
  static async findByTransactionId(transactionId) {
    const query = 'SELECT * FROM transactions WHERE transaction_id = $1';
    const result = await pool.query(query, [transactionId]);
    return result.rows[0];
  }

  // Get user transactions
  static async findByUser(userId, limit = 10, offset = 0) {
    const query = `
      SELECT t.*, 
             c.name as country_name,
             s.name as service_name,
             n.name as network_name
      FROM transactions t
      LEFT JOIN countries c ON t.country_id = c.id
      LEFT JOIN services s ON t.service_id = s.id
      LEFT JOIN networks n ON t.network_id = n.id
      WHERE t.user_id = $1
      ORDER BY t.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
  }

  // Update transaction status
  static async updateStatus(transactionId, status, apiResponse = null) {
    const query = `
      UPDATE transactions 
      SET status = $1, api_response = $2, updated_at = NOW()
      WHERE transaction_id = $3
      RETURNING *
    `;
    const result = await pool.query(query, [status, apiResponse, transactionId]);
    return result.rows[0];
  }

  // Get transactions for admin
  static async findAllForAdmin(filters = {}, limit = 50, offset = 0) {
    let query = `
      SELECT t.*, 
             u.name as user_name,
             u.email as user_email,
             c.name as country_name,
             s.name as service_name,
             n.name as network_name
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN countries c ON t.country_id = c.id
      LEFT JOIN services s ON t.service_id = s.id
      LEFT JOIN networks n ON t.network_id = n.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 0;

    if (filters.status) {
      paramCount++;
      query += ` AND t.status = $${paramCount}`;
      values.push(filters.status);
    }

    if (filters.country_id) {
      paramCount++;
      query += ` AND t.country_id = $${paramCount}`;
      values.push(filters.country_id);
    }

    if (filters.service_id) {
      paramCount++;
      query += ` AND t.service_id = $${paramCount}`;
      values.push(filters.service_id);
    }

    if (filters.start_date) {
      paramCount++;
      query += ` AND t.created_at >= $${paramCount}`;
      values.push(filters.start_date);
    }

    if (filters.end_date) {
      paramCount++;
      query += ` AND t.created_at <= $${paramCount}`;
      values.push(filters.end_date);
    }

    query += ` ORDER BY t.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Get dashboard stats
  static async getDashboardStats() {
    const query = `
      SELECT 
        COUNT(*) as total_transactions,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_transactions,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_transactions,
        COALESCE(SUM(CASE WHEN status = 'success' THEN amount_paid ELSE 0 END), 0) as total_revenue,
        COUNT(DISTINCT user_id) as total_users
      FROM transactions
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    `;
    const result = await pool.query(query);
    return result.rows[0];
  }
}

module.exports = Transaction;
