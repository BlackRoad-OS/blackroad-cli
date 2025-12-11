/**
 * BlackRoad OS - Stripe Integration
 * Full payment processing integration
 */

const STRIPE_API_BASE = 'https://api.stripe.com/v1';

class StripeIntegration {
  constructor(secretKey = process.env.STRIPE_SECRET_KEY) {
    this.secretKey = secretKey;
    this.publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  }

  /**
   * Make authenticated request to Stripe API
   */
  async request(endpoint, method = 'GET', body = null) {
    const url = `${STRIPE_API_BASE}${endpoint}`;

    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    if (body) {
      options.body = new URLSearchParams(body).toString();
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Stripe API Error: ${error.error?.message || response.statusText}`);
    }

    return response.json();
  }

  // ============================================================
  // CUSTOMERS
  // ============================================================

  /**
   * Create a customer
   */
  async createCustomer({ email, name, metadata = {} }) {
    return this.request('/customers', 'POST', {
      email,
      name,
      ...Object.entries(metadata).reduce((acc, [k, v]) => {
        acc[`metadata[${k}]`] = v;
        return acc;
      }, {})
    });
  }

  /**
   * Get customer
   */
  async getCustomer(customerId) {
    return this.request(`/customers/${customerId}`);
  }

  /**
   * Update customer
   */
  async updateCustomer(customerId, updates) {
    return this.request(`/customers/${customerId}`, 'POST', updates);
  }

  /**
   * List customers
   */
  async listCustomers(options = {}) {
    const params = new URLSearchParams(options).toString();
    return this.request(`/customers?${params}`);
  }

  // ============================================================
  // SUBSCRIPTIONS
  // ============================================================

  /**
   * Create subscription
   */
  async createSubscription({ customerId, priceId, trialDays = null }) {
    const body = {
      customer: customerId,
      'items[0][price]': priceId
    };

    if (trialDays) {
      body.trial_period_days = trialDays;
    }

    return this.request('/subscriptions', 'POST', body);
  }

  /**
   * Get subscription
   */
  async getSubscription(subscriptionId) {
    return this.request(`/subscriptions/${subscriptionId}`);
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId, atPeriodEnd = true) {
    if (atPeriodEnd) {
      return this.request(`/subscriptions/${subscriptionId}`, 'POST', {
        cancel_at_period_end: true
      });
    }
    return this.request(`/subscriptions/${subscriptionId}`, 'DELETE');
  }

  /**
   * Update subscription
   */
  async updateSubscription(subscriptionId, updates) {
    return this.request(`/subscriptions/${subscriptionId}`, 'POST', updates);
  }

  /**
   * List customer subscriptions
   */
  async listSubscriptions(customerId) {
    return this.request(`/subscriptions?customer=${customerId}`);
  }

  // ============================================================
  // PAYMENTS
  // ============================================================

  /**
   * Create payment intent
   */
  async createPaymentIntent({ amount, currency = 'usd', customerId = null, metadata = {} }) {
    const body = {
      amount,
      currency,
      ...Object.entries(metadata).reduce((acc, [k, v]) => {
        acc[`metadata[${k}]`] = v;
        return acc;
      }, {})
    };

    if (customerId) body.customer = customerId;

    return this.request('/payment_intents', 'POST', body);
  }

  /**
   * Confirm payment intent
   */
  async confirmPaymentIntent(paymentIntentId, paymentMethodId) {
    return this.request(`/payment_intents/${paymentIntentId}/confirm`, 'POST', {
      payment_method: paymentMethodId
    });
  }

  /**
   * Get payment intent
   */
  async getPaymentIntent(paymentIntentId) {
    return this.request(`/payment_intents/${paymentIntentId}`);
  }

  // ============================================================
  // CHECKOUT SESSIONS
  // ============================================================

  /**
   * Create checkout session
   */
  async createCheckoutSession({
    priceId,
    mode = 'subscription',
    successUrl,
    cancelUrl,
    customerId = null,
    metadata = {}
  }) {
    const body = {
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': 1,
      mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
      ...Object.entries(metadata).reduce((acc, [k, v]) => {
        acc[`metadata[${k}]`] = v;
        return acc;
      }, {})
    };

    if (customerId) body.customer = customerId;

    return this.request('/checkout/sessions', 'POST', body);
  }

  /**
   * Get checkout session
   */
  async getCheckoutSession(sessionId) {
    return this.request(`/checkout/sessions/${sessionId}`);
  }

  // ============================================================
  // BILLING PORTAL
  // ============================================================

  /**
   * Create billing portal session
   */
  async createBillingPortalSession(customerId, returnUrl) {
    return this.request('/billing_portal/sessions', 'POST', {
      customer: customerId,
      return_url: returnUrl
    });
  }

  // ============================================================
  // PRODUCTS & PRICES
  // ============================================================

  /**
   * List products
   */
  async listProducts(active = true) {
    return this.request(`/products?active=${active}`);
  }

  /**
   * Get product
   */
  async getProduct(productId) {
    return this.request(`/products/${productId}`);
  }

  /**
   * List prices for product
   */
  async listPrices(productId) {
    return this.request(`/prices?product=${productId}`);
  }

  // ============================================================
  // USAGE RECORDS (for metered billing)
  // ============================================================

  /**
   * Create usage record
   */
  async createUsageRecord(subscriptionItemId, quantity, timestamp = null) {
    const body = {
      quantity,
      action: 'increment'
    };

    if (timestamp) body.timestamp = timestamp;

    return this.request(`/subscription_items/${subscriptionItemId}/usage_records`, 'POST', body);
  }

  // ============================================================
  // INVOICES
  // ============================================================

  /**
   * List invoices
   */
  async listInvoices(customerId) {
    return this.request(`/invoices?customer=${customerId}`);
  }

  /**
   * Get invoice
   */
  async getInvoice(invoiceId) {
    return this.request(`/invoices/${invoiceId}`);
  }

  /**
   * Send invoice
   */
  async sendInvoice(invoiceId) {
    return this.request(`/invoices/${invoiceId}/send`, 'POST');
  }

  // ============================================================
  // WEBHOOKS
  // ============================================================

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload, signature) {
    const crypto = require('crypto');

    const signatureHeader = signature.split(',').reduce((acc, part) => {
      const [key, value] = part.split('=');
      acc[key] = value;
      return acc;
    }, {});

    const timestamp = signatureHeader.t;
    const sig = signatureHeader.v1;

    const signedPayload = `${timestamp}.${payload}`;
    const expectedSig = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(signedPayload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(sig),
      Buffer.from(expectedSig)
    );
  }

  /**
   * Get frontend configuration
   */
  getFrontendConfig() {
    return {
      publishableKey: this.publishableKey
    };
  }

  // ============================================================
  // BLACKROAD SPECIFIC PLANS
  // ============================================================

  /**
   * Get BlackRoad pricing plans
   */
  getPlans() {
    return {
      pro: {
        name: 'BlackRoad Pro',
        priceId: process.env.STRIPE_PRO_PRICE_ID,
        features: [
          'Unlimited AI agents',
          '100K API requests/month',
          'Priority support',
          'Custom integrations'
        ],
        price: 49
      },
      enterprise: {
        name: 'BlackRoad Enterprise',
        priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
        features: [
          'Everything in Pro',
          'Unlimited API requests',
          'Dedicated support',
          'SLA guarantee',
          'Custom deployment',
          'SSO/SAML'
        ],
        price: 199
      },
      credits: {
        name: 'API Credits',
        priceId: process.env.STRIPE_CREDITS_PRICE_ID,
        type: 'one_time',
        options: [
          { credits: 10000, price: 10 },
          { credits: 50000, price: 40 },
          { credits: 100000, price: 70 }
        ]
      }
    };
  }
}

// Export singleton instance
export const stripe = new StripeIntegration();
export default StripeIntegration;
