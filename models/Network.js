const { pool } = require('../config/database');

class Network {
  // Get networks by country and service
  static async findByCountryAndService(countryId, serviceId) {
    const query = `
      SELECT n.* 
      FROM networks n
      WHERE n.country_id = $1 AND n.service_id = $2 AND n.is_active = true
      ORDER BY n.name
    `;
    const result = await pool.query(query, [countryId, serviceId]);
    return result.rows;
  }

  // Get network by ID
  static async findById(id) {
    const query = 'SELECT n.* FROM networks n WHERE n.id = $1 AND n.is_active = true';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Get plans for network
  static async getPlans(networkId) {
    const query = `
      SELECT p.* 
      FROM plans p
      WHERE p.network_id = $1 AND p.is_active = true
      ORDER BY p.cost_price
    `;
    const result = await pool.query(query, [networkId]);
    return result.rows;
  }
}

module.exports = Network;
