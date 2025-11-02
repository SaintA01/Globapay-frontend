const Joi = require('joi');

const validation = {
  // Auth validation
  register: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().min(10).max(15).optional(),
    country: Joi.string().max(3).optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  // Transaction validation
  createTransaction: Joi.object({
    country_id: Joi.number().integer().required(),
    service_id: Joi.number().integer().required(),
    network_id: Joi.number().integer().required(),
    plan_id: Joi.number().integer().required(),
    recipient: Joi.string().required(),
    payment_method: Joi.string().required()
  }),

  // Payment validation
  initiatePayment: Joi.object({
    transaction_id: Joi.string().required(),
    payment_method: Joi.string().required()
  }),

  // Admin validations
  createCountry: Joi.object({
    name: Joi.string().required(),
    code: Joi.string().length(2).required(),
    currency: Joi.string().length(3).required(),
    flag_icon: Joi.string().optional(),
    languages: Joi.array().items(Joi.string()).optional(),
    payment_methods: Joi.array().items(Joi.string()).optional()
  }),

  createPlan: Joi.object({
    network_id: Joi.number().integer().required(),
    name: Joi.string().required(),
    description: Joi.string().optional(),
    cost_price: Joi.number().positive().required(),
    selling_price: Joi.number().positive().required(),
    validity: Joi.string().optional(),
    data_volume: Joi.string().optional()
  })
};

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

module.exports = { validation, validate };
