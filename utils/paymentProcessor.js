const Stripe = require('stripe');
const axios = require('axios');
const config = require('../config/config');

class PaymentProcessor {
  constructor() {
    this.stripe = config.payment.stripe.secretKey ? new Stripe(config.payment.stripe.secretKey) : null;
  }

  // Initialize payment
  async initiatePayment(paymentData) {
    const { payment_method, amount, currency, email, reference, metadata } = paymentData;

    switch (payment_method) {
      case 'stripe':
        return await this.initiateStripePayment(amount, currency, email, reference, metadata);
      
      case 'flutterwave':
        return await this.initiateFlutterwavePayment(amount, currency, email, reference, metadata);
      
      default:
        throw new Error(`Unsupported payment method: ${payment_method}`);
    }
  }

  // Stripe payment
  async initiateStripePayment(amount, currency, email, reference, metadata) {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      payment_method_types: ['card'],
      receipt_email: email,
      metadata: {
        ...metadata,
        payment_reference: reference
      }
    });

    return {
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      gateway: 'stripe'
    };
  }

  // Flutterwave payment
  async initiateFlutterwavePayment(amount, currency, email, reference, metadata) {
    if (!config.payment.flutterwave.secretKey) {
      throw new Error('Flutterwave not configured');
    }

    const payload = {
      tx_ref: reference,
      amount: amount,
      currency: currency,
      redirect_url: `${process.env.FRONTEND_URL}/payment/verify`,
      customer: {
        email: email,
      },
      meta: metadata,
      customizations: {
        title: 'Globapay',
        description: 'Digital Services Payment'
      }
    };

    const response = await axios.post(
      'https://api.flutterwave.com/v3/payments',
      payload,
      {
        headers: {
          Authorization: `Bearer ${config.payment.flutterwave.secretKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      checkout_url: response.data.data.link,
      gateway: 'flutterwave'
    };
  }

  // Verify payment
  async verifyPayment(reference, gateway) {
    switch (gateway) {
      case 'stripe':
        return await this.verifyStripePayment(reference);
      
      case 'flutterwave':
        return await this.verifyFlutterwavePayment(reference);
      
      default:
        throw new Error(`Unsupported gateway: ${gateway}`);
    }
  }

  async verifyStripePayment(reference) {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    const paymentIntent = await this.stripe.paymentIntents.retrieve(reference);
    
    return {
      status: paymentIntent.status === 'succeeded' ? 'completed' : paymentIntent.status,
      data: paymentIntent
    };
  }

  async verifyFlutterwavePayment(reference) {
    if (!config.payment.flutterwave.secretKey) {
      throw new Error('Flutterwave not configured');
    }

    const response = await axios.get(
      `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${reference}`,
      {
        headers: {
          Authorization: `Bearer ${config.payment.flutterwave.secretKey}`
        }
      }
    );

    const transaction = response.data.data;
    const status = transaction.status === 'successful' ? 'completed' : transaction.status;

    return {
      status,
      data: transaction
    };
  }

  // Webhook utilities
  constructStripeEvent(payload, signature) {
    if (!config.payment.stripe.webhookSecret) {
      throw new Error('Stripe webhook secret not configured');
    }

    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      config.payment.stripe.webhookSecret
    );
  }
}

module.exports = new PaymentProcessor();
