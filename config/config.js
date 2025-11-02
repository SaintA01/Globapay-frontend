module.exports = {
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'globapay-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },

  // Payment Gateways
  payment: {
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
    },
    flutterwave: {
      secretKey: process.env.FLUTTERWAVE_SECRET_KEY,
      publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY
    }
  },

  // API Providers
  apiProviders: {
    reloadly: {
      clientId: process.env.RELOADLY_CLIENT_ID,
      clientSecret: process.env.RELOADLY_CLIENT_SECRET
    },
    vtuNg: {
      apiKey: process.env.VTUNG_API_KEY
    }
  },

  // App Configuration
  app: {
    name: 'Globapay',
    version: '1.0.0',
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development'
  }
};
