const { pool } = require('../config/database');

class Service {
  // Get all active services
  static async findAll() {
    const query = 'SELECT * FROM services WHERE is_active = true ORDER BY name';
    const result = await pool.query(query);
    return result.rows;
  }

  // Get services by country
  static async findByCountry(countryId) {
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

  // Get service by ID
  static async findById(id) {
    const query = 'SELECT * FROM services WHERE id = $1 AND is_active = true';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Get networks for service in country
  static async getNetworks(serviceId, countryId) {
    const query = `
      SELECT n.* 
      FROM networks n
      WHERE n.service_id = $1 AND n.country_id = $2 AND n.is_active = true
      ORDER BY n.name
    `;
    const result = await pool.query(query, [serviceId, countryId]);
    return result.rows;
  }
}

module.exports = Service;
