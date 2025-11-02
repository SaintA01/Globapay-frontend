const { pool } = require('../config/database');

class Plan {
  // Get plans by network
  static async findByNetwork(networkId) {
    const query = `
      SELECT p.* 
      FROM plans p
      WHERE p.network_id = $1 AND p.is_active = true
      ORDER BY p.cost_price
    `;
    const result = await pool.query(query, [networkId]);
    return result.rows;
  }

  // Get plan by ID
  static async findById(id) {
    const query = 'SELECT p.* FROM plans p WHERE p.id = $1 AND p.is_active = true';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Calculate selling price with markup
  static calculateSellingPrice(costPrice, markupType, markupValue) {
    if (markupType === 'percentage') {
      return costPrice * (1 + markupValue / 100);
    } else if (markupType === 'fixed') {
      return costPrice + markupValue;
    }
    return costPrice;
  }
}

module.exports = Plan;
