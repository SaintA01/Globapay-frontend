const { pool } = require('../config/database');

class Country {
  // Get all active countries
  static async findAll() {
    const query = 'SELECT * FROM countries WHERE is_active = true ORDER BY name';
    const result = await pool.query(query);
    return result.rows;
  }

  // Find country by code
  static async findByCode(code) {
    const query = 'SELECT * FROM countries WHERE code = $1 AND is_active = true';
    const result = await pool.query(query, [code]);
    return result.rows[0];
  }

  // Find country by ID
  static async findById(id) {
    const query = 'SELECT * FROM countries WHERE id = $1 AND is_active = true';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Get country services
  static async getServices(countryId) {
    const query = `
      SELECT DISTINCT s.* 
      FROM services s
      JOIN networks n ON n.service_id = s.id
      WHERE n.country_id = $1 AND s.is_active = true AND n.is_active = true
      ORDER BY s.name
    `;
    const result = await pool.query(query, [countryId]);
    return result.rows;
  }

  // Admin: Create country
  static async create(countryData) {
    const { name, code, currency, flag_icon, languages, payment_methods } = countryData;
    const query = `
      INSERT INTO countries (name, code, currency, flag_icon, languages, payment_methods, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `;
    const result = await pool.query(query, [name, code, currency, flag_icon, languages, payment_methods]);
    return result.rows[0];
  }
}

module.exports = Country;
