const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { validate, validation } = require('../middleware/validation');
const auth = require('../middleware/auth');

// All routes require admin access
router.use(auth.verifyToken, auth.adminOnly);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);
router.get('/transactions', adminController.getTransactions);
router.get('/users', adminController.getUsers);

// Management
router.post('/countries', validate(validation.createCountry), adminController.createCountry);
router.post('/plans', validate(validation.createPlan), adminController.createPlan);
router.put('/plans/:planId', adminController.updatePlan);

// Transaction management
router.put('/transactions/:transactionId/resolve', adminController.resolveTransaction);

module.exports = router;
