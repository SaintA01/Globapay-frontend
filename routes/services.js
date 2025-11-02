const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const auth = require('../middleware/auth');

// Public routes
router.get('/networks/:countryId/:serviceId', serviceController.getServiceNetworks);
router.get('/plans/:networkId', serviceController.getNetworkPlans);
router.get('/search', serviceController.searchPlans);

module.exports = router;
