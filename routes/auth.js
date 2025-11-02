const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate, validation } = require('../middleware/validation');
const auth = require('../middleware/auth');

// Public routes
router.post('/register', validate(validation.register), authController.register);
router.post('/login', validate(validation.login), authController.login);

// Protected routes
router.get('/profile', auth.verifyToken, authController.getProfile);
router.put('/profile', auth.verifyToken, authController.updateProfile);
router.put('/change-password', auth.verifyToken, authController.changePassword);

module.exports = router;
