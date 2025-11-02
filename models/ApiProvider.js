const { pool } = require('../config/database');

class ApiProvider {
  // Get all active API providers
  static async findAll() {
    const query = 'SELECT * FROM api_providers WHERE is_active = true ORDER BY name';
    const result = await pool.query(query);
    return result.rows;
  }

  // Find API provider by ID
  static async findById(id) {
    const query = 'SELECT * FROM api_providers WHERE id = $1 AND is_active = true';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Get API provider for country-service-network combination
  static async findForService(countryId, serviceId, networkId) {
    const query = `
      SELECT ap.* 
      FROM api_providers ap
      JOIN api_provider_assignments apa ON ap.id = apa.api_provider_id
      WHERE apa.country_id = $1 
        AND apa.service_id = $2 
        AND apa.network_id = $3 
        AND ap.is_active = true
      LIMIT 1
    `;
    const result = await pool.query(query, [countryId, serviceId, networkId]);
    return result.rows[0];
  }

  // Update API provider balance
  static async updateBalance(providerId, amount) {
    const query = 'UPDATE api_providers SET balance = balance + $1, updated_at = NOW() WHERE id = $2 RETURNING balance';
    const result = await pool.query(query, [amount, providerId]);
    return result.rows[0].balance;
  }
}

module.exports = ApiProvider;
