const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Payment {
  // Create payment record
  static async create(paymentData) {
    const { user_id, transaction_id, amount, currency, payment_gateway, payment_method } = paymentData;
    
    const payment_reference = `PAY${uuidv4().replace(/-/g, '').substring(0, 14).toUpperCase()}`;

    const query = `
      INSERT INTO payments (
        user_id, transaction_id, amount, currency, 
        payment_gateway, payment_method, payment_reference, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', NOW())
      RETURNING *
    `;

    const values = [user_id, transaction_id, amount, currency, payment_gateway, payment_method, payment_reference];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Update payment status
  static async updateStatus(paymentReference, status, gatewayResponse = null) {
    const query = `
      UPDATE payments 
      SET status = $1, gateway_response = $2, updated_at = NOW()
      WHERE payment_reference = $3
      RETURNING *
    `;
    const result = await pool.query(query, [status, gatewayResponse, paymentReference]);
    return result.rows[0];
  }

  // Find payment by reference
  static async findByReference(paymentReference) {
    const query = 'SELECT * FROM payments WHERE payment_reference = $1';
    const result = await pool.query(query, [paymentReference]);
    return result.rows[0];
  }

  // Get user payments
  static async findByUser(userId, limit = 10) {
    const query = `
      SELECT p.*, t.recipient, s.name as service_name
      FROM payments p
      JOIN transactions t ON p.transaction_id = t.transaction_id
      JOIN services s ON t.service_id = s.id
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [userId, limit]);
    return result.rows;
  }
}

module.exports = Payment;
