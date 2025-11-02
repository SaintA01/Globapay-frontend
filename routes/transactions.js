const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { validate, validation } = require('../middleware/validation');
const auth = require('../middleware/auth');

// Protected routes
router.post('/', auth.verifyToken, validate(validation.createTransaction), transactionController.createTransaction);
router.get('/', auth.verifyToken, transactionController.getUserTransactions);
router.get('/:transactionId', auth.verifyToken, transactionController.getTransaction);
router.post('/process', auth.verifyToken, transactionController.processTransaction);

module.exports = router;
