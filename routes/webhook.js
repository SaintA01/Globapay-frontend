const express = require('express');
const router = express.Router();
const { Payment, Transaction } = require('../models');
const paymentProcessor = require('../utils/paymentProcessor');

// Stripe webhook
router.post('/stripe', express.raw({type: 'application/json'}), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    const event = paymentProcessor.constructStripeEvent(req.body, signature);

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const reference = paymentIntent.metadata.payment_reference;

      // Update payment status
      await Payment.updateStatus(reference, 'completed', paymentIntent);

      // Get transaction and process it
      const payment = await Payment.findByReference(reference);
      if (payment) {
        // Process the transaction
        // This would trigger the API call to fulfill the order
        console.log(`Payment ${reference} completed for transaction ${payment.transaction_id}`);
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

// Flutterwave webhook
router.post('/flutterwave', express.json(), async (req, res) => {
  try {
    const { event, data } = req.body;

    if (event === 'charge.completed') {
      const reference = data.tx_ref;
      
      await Payment.updateStatus(reference, 'completed', data);

      const payment = await Payment.findByReference(reference);
      if (payment) {
        console.log(`Flutterwave payment ${reference} completed`);
      }
    }

    res.json({ status: 'success' });
  } catch (error) {
    console.error('Flutterwave webhook error:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;
