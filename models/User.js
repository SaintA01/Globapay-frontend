const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Create new user
  static async create(userData) {
    const { name, email, password, phone, country } = userData;
    const hashedPassword = await bcrypt.hash(password, 12);

    const query = `
      INSERT INTO users (name, email, password, phone, country, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id, name, email, phone, country, balance, created_at
    `;

    const values = [name, email, hashedPassword, phone, country];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find user by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  // Find user by ID
  static async findById(id) {
    const query = 'SELECT id, name, email, phone, country, balance, created_at FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Update user balance
  static async updateBalance(userId, amount) {
    const query = 'UPDATE users SET balance = balance + $1, updated_at = NOW() WHERE id = $2 RETURNING balance';
    const result = await pool.query(query, [amount, userId]);
    return result.rows[0].balance;
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Update user profile
  static async updateProfile(userId, updateData) {
    const { name, phone, country } = updateData;
    const query = `
      UPDATE users 
      SET name = $1, phone = $2, country = $3, updated_at = NOW() 
      WHERE id = $4 
      RETURNING id, name, email, phone, country
    `;
    const result = await pool.query(query, [name, phone, country, userId]);
    return result.rows[0];
  }
}

module.exports = User;
