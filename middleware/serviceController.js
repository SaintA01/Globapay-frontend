const { Country, Service, Network, Plan } = require('../models');

const serviceController = {
  // Get all countries
  getCountries: async (req, res, next) => {
    try {
      const countries = await Country.findAll();
      res.json({ countries });
    } catch (error) {
      next(error);
    }
  },

  // Get services for a country
  getCountryServices: async (req, res, next) => {
    try {
      const { countryId } = req.params;
      const services = await Service.findByCountry(countryId);
      res.json({ services });
    } catch (error) {
      next(error);
    }
  },

  // Get networks for a service in a country
  getServiceNetworks: async (req, res, next) => {
    try {
      const { countryId, serviceId } = req.params;
      const networks = await Network.findByCountryAndService(countryId, serviceId);
      res.json({ networks });
    } catch (error) {
      next(error);
    }
  },

  // Get plans for a network
  getNetworkPlans: async (req, res, next) => {
    try {
      const { networkId } = req.params;
      const plans = await Plan.findByNetwork(networkId);
      res.json({ plans });
    } catch (error) {
      next(error);
    }
  },

  // Get complete service catalog for a country
  getServiceCatalog: async (req, res, next) => {
    try {
      const { countryId } = req.params;
      
      const country = await Country.findById(countryId);
      if (!country) {
        return res.status(404).json({ message: 'Country not found' });
      }

      const services = await Service.findByCountry(countryId);
      
      // Get networks and plans for each service
      const catalog = await Promise.all(
        services.map(async (service) => {
          const networks = await Network.findByCountryAndService(countryId, service.id);
          
          const networksWithPlans = await Promise.all(
            networks.map(async (network) => {
              const plans = await Plan.findByNetwork(network.id);
              return { ...network, plans };
            })
          );

          return { ...service, networks: networksWithPlans };
        })
      );

      res.json({
        country,
        catalog
      });
    } catch (error) {
      next(error);
    }
  },

  // Search plans
  searchPlans: async (req, res, next) => {
    try {
      const { countryId, serviceId, networkId, query } = req.query;
      
      let searchQuery = `
        SELECT p.*, n.name as network_name, s.name as service_name, c.name as country_name
        FROM plans p
        JOIN networks n ON p.network_id = n.id
        JOIN services s ON n.service_id = s.id
        JOIN countries c ON n.country_id = c.id
        WHERE p.is_active = true AND n.is_active = true
      `;

      const values = [];
      let paramCount = 0;

      if (countryId) {
        paramCount++;
        searchQuery += ` AND n.country_id = $${paramCount}`;
        values.push(countryId);
      }

      if (serviceId) {
        paramCount++;
        searchQuery += ` AND n.service_id = $${paramCount}`;
        values.push(serviceId);
      }

      if (networkId) {
        paramCount++;
        searchQuery += ` AND p.network_id = $${paramCount}`;
        values.push(networkId);
      }

      if (query) {
        paramCount++;
        searchQuery += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
        values.push(`%${query}%`);
      }

      searchQuery += ' ORDER BY p.cost_price LIMIT 50';

      const { pool } = require('../config/database');
      const result = await pool.query(searchQuery, values);
      
      res.json({ plans: result.rows });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = serviceController;
