const axios = require('axios');

class ApiIntegrations {
  // Fulfill order through API provider
  async fulfillOrder(apiProvider, orderData) {
    try {
      switch (apiProvider.name.toLowerCase()) {
        case 'reloadly':
          return await this.fulfillWithReloadly(apiProvider, orderData);
        
        case 'vtung':
          return await this.fulfillWithVtuNg(apiProvider, orderData);
        
        default:
          return await this.fulfillGeneric(apiProvider, orderData);
      }
    } catch (error) {
      console.error('API Integration error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Reloadly integration
  async fulfillWithReloadly(apiProvider, orderData) {
    // First, get access token
    const authResponse = await axios.post('https://auth.reloadly.com/oauth/token', {
      client_id: apiProvider.client_id,
      client_secret: apiProvider.client_secret,
      grant_type: 'client_credentials',
      audience: 'https://topups.reloadly.com'
    });

    const accessToken = authResponse.data.access_token;

    // Then make the topup request
    const response = await axios.post(
      'https://topups.reloadly.com/topups',
      {
        recipientPhone: {
          countryCode: 'NG', // This should be dynamic
          number: orderData.recipient
        },
        operatorId: orderData.plan_id, // This should be the operator ID
        amount: orderData.amount,
        useLocalAmount: false
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      data: response.data,
      transactionId: response.data.transactionId
    };
  }

  // VTU.ng integration
  async fulfillWithVtuNg(apiProvider, orderData) {
    const response = await axios.post(
      'https://vtu.ng/wp-json/api/v1/',
      {
        username: apiProvider.username,
        password: apiProvider.api_key,
        network: this.mapNetworkToVtuNg(orderData.network),
        amount: orderData.amount,
        phone: orderData.recipient
      }
    );

    if (response.data.status === 'success') {
      return {
        success: true,
        data: response.data,
        transactionId: response.data.transaction_id
      };
    } else {
      return {
        success: false,
        error: response.data.message
      };
    }
  }

  // Generic API integration
  async fulfillGeneric(apiProvider, orderData) {
    const response = await axios.post(apiProvider.endpoint, {
      ...orderData,
      api_key: apiProvider.api_key,
      secret_key: apiProvider.secret_key
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success || response.data.status === 'success') {
      return {
        success: true,
        data: response.data
      };
    } else {
      return {
        success: false,
        error: response.data.message || 'API request failed'
      };
    }
  }

  // Helper to map network names
  mapNetworkToVtuNg(network) {
    const mapping = {
      'mtn': 'mtn',
      'glo': 'glo', 
      'airtel': 'airtel',
      '9mobile': 'etisalat'
    };
    return mapping[network.toLowerCase()] || network;
  }

  // Check API provider balance
  async checkBalance(apiProvider) {
    try {
      // Implementation depends on the provider
      // This is a generic implementation
      const response = await axios.get(`${apiProvider.endpoint}/balance`, {
        headers: {
          Authorization: `Bearer ${apiProvider.api_key}`
        }
      });

      return {
        success: true,
        balance: response.data.balance
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new ApiIntegrations();
