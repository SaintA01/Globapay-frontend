const express = require('express');
const router = express.Router();
const paymentProcessor = require('../utils/paymentProcessor');
const { Payment, Transaction } = require('../models');
const { validate, validation } = require('../middleware/validation');
const auth = require('../middleware/auth');

// Initiate payment
router.post('/initiate', auth.verifyToken, validate(validation.initiatePayment), async (req, res, next) => {
  try {
    const { transaction_id, payment_method } = req.body;
    
    // Get transaction
    const transaction = await Transaction.findByTransactionId(transaction_id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get payment record
    const payment = await Payment.findByReference(transaction.payment_reference);
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    // Initialize payment based on method
    const paymentResult = await paymentProcessor.initiatePayment({
      payment_method,
      amount: payment.amount,
      currency: payment.currency,
      email: req.user.email,
      reference: payment.payment_reference,
      metadata: {
        transaction_id: transaction.transaction_id,
        user_id: req.user.id,
        service: 'digital-services'
      }
    });

    res.json({
      message: 'Payment initialized',
      payment: {
        reference: payment.payment_reference,
        amount: payment.amount,
        currency: payment.currency,
        ...paymentResult
      }
    });

  } catch (error) {
    next(error);
  }
});

// Verify payment
router.get('/verify/:reference', auth.verifyToken, async (req, res, next) => {
  try {
    const { reference } = req.params;
    
    const payment = await Payment.findByReference(reference);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Verify payment with gateway
    const verification = await paymentProcessor.verifyPayment(reference, payment.payment_gateway);

    // Update payment status
    await Payment.updateStatus(reference, verification.status, verification.data);

    res.json({
      payment: {
        ...payment,
        status: verification.status,
        verified_at: new Date()
      },
      verification: verification.data
    });

  } catch (error) {
    next(error);
  }
});

// Get user payments
router.get('/', auth.verifyToken, async (req, res, next) => {
  try {
    const payments = await Payment.findByUser(req.user.id);
    res.json({ payments });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
