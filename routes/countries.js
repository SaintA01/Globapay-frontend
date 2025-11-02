const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', serviceController.getCountries);
router.get('/:countryId/services', serviceController.getCountryServices);
router.get('/:countryId/catalog', serviceController.getServiceCatalog);

module.exports = router;
