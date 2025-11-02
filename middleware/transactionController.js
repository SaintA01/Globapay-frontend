const { Transaction, Plan, Payment, ApiProvider } = require('../models');
const { pool } = require('../config/database');
const paymentProcessor = require('../utils/paymentProcessor');
const apiIntegrations = require('../utils/apiIntegrations');

const transactionController = {
  // Create new transaction
  createTransaction: async (req, res, next) => {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const { country_id, service_id, network_id, plan_id, recipient, payment_method } = req.body;

      // Get plan details
      const plan = await Plan.findById(plan_id);
      if (!plan) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Plan not found' });
      }

      // Get API provider for this service
      const apiProvider = await ApiProvider.findForService(country_id, service_id, network_id);
      if (!apiProvider) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Service temporarily unavailable' });
      }

      // Create transaction
      const transaction = await Transaction.create({
        user_id: req.user.id,
        country_id,
        service_id,
        network_id,
        plan_id,
        recipient,
        amount_paid: plan.selling_price,
        payment_gateway: payment_method,
        api_provider_id: apiProvider.id
      });

      // Create payment record
      const payment = await Payment.create({
        user_id: req.user.id,
        transaction_id: transaction.transaction_id,
        amount: plan.selling_price,
        currency: 'NGN', // This should come from country
        payment_gateway: payment_method,
        payment_method: payment_method
      });

      await client.query('COMMIT');

      res.status(201).json({
        message: 'Transaction created successfully',
        transaction: {
          id: transaction.id,
          transaction_id: transaction.transaction_id,
          recipient: transaction.recipient,
          amount: transaction.amount_paid,
          payment_reference: payment.payment_reference
        },
        payment
      });

    } catch (error) {
      await client.query('ROLLBACK');
      next(error);
    } finally {
      client.release();
    }
  },

  // Get user transactions
  getUserTransactions: async (req, res, next) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const transactions = await Transaction.findByUser(req.user.id, limit, offset);
      
      // Get total count for pagination
      const countResult = await pool.query(
        'SELECT COUNT(*) FROM transactions WHERE user_id = $1',
        [req.user.id]
      );
      const total = parseInt(countResult.rows[0].count);

      res.json({
        transactions,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Get transaction details
  getTransaction: async (req, res, next) => {
    try {
      const { transactionId } = req.params;
      
      const transaction = await Transaction.findByTransactionId(transactionId);
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      // Check if user owns this transaction
      if (transaction.user_id !== req.user.id && !req.user.is_admin) {
        return res.status(403).json({ message: 'Access denied' });
      }

      res.json({ transaction });
    } catch (error) {
      next(error);
    }
  },

  // Process transaction after successful payment
  processTransaction: async (req, res, next) => {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const { transaction_id } = req.body;

      const transaction = await Transaction.findByTransactionId(transaction_id);
      if (!transaction) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Transaction not found' });
      }

      if (transaction.status !== 'pending') {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Transaction already processed' });
      }

      // Get API provider
      const apiProvider = await ApiProvider.findById(transaction.api_provider_id);
      
      // Call API provider to fulfill the order
      const apiResult = await apiIntegrations.fulfillOrder(apiProvider, {
        recipient: transaction.recipient,
        plan_id: transaction.plan_id,
        amount: transaction.amount_paid
      });

      // Update transaction status based on API response
      if (apiResult.success) {
        await Transaction.updateStatus(transaction_id, 'success', apiResult.data);
        
        // Update payment status
        await Payment.updateStatus(transaction.payment_reference, 'completed', apiResult.data);

        await client.query('COMMIT');

        res.json({
          message: 'Transaction completed successfully',
          transaction: await Transaction.findByTransactionId(transaction_id)
        });
      } else {
        await Transaction.updateStatus(transaction_id, 'failed', apiResult.error);
        await Payment.updateStatus(transaction.payment_reference, 'failed', apiResult.error);

        await client.query('COMMIT');

        res.status(400).json({
          message: 'Transaction failed',
          error: apiResult.error
        });
      }

    } catch (error) {
      await client.query('ROLLBACK');
      next(error);
    } finally {
      client.release();
    }
  }
};

module.exports = transactionController;
