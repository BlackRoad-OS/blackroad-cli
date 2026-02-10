/**
 * BlackRoad OS - Clerk Integration
 * Full authentication integration
 */

const CLERK_API_BASE = 'https://api.clerk.com/v1';

class ClerkIntegration {
  constructor(secretKey = process.env.CLERK_SECRET_KEY) {
    this.secretKey = secretKey;
    this.publishableKey = process.env.CLERK_PUBLISHABLE_KEY;
  }

  /**
   * Make authenticated request to Clerk API
   */
  async request(endpoint, method = 'GET', body = null) {
    const url = `${CLERK_API_BASE}${endpoint}`;

    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json'
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Clerk API Error: ${error.errors?.[0]?.message || response.statusText}`);
    }

    return response.json();
  }

  /**
   * List all users
   */
  async listUsers(options = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);
    if (options.emailAddress) params.append('email_address', options.emailAddress);

    return this.request(`/users?${params.toString()}`);
  }

  /**
   * Get user by ID
   */
  async getUser(userId) {
    return this.request(`/users/${userId}`);
  }

  /**
   * Create a new user
   */
  async createUser({ email, password, firstName, lastName, publicMetadata = {} }) {
    return this.request('/users', 'POST', {
      email_address: [email],
      password,
      first_name: firstName,
      last_name: lastName,
      public_metadata: publicMetadata
    });
  }

  /**
   * Update user
   */
  async updateUser(userId, updates) {
    return this.request(`/users/${userId}`, 'PATCH', updates);
  }

  /**
   * Delete user
   */
  async deleteUser(userId) {
    return this.request(`/users/${userId}`, 'DELETE');
  }

  /**
   * Ban a user
   */
  async banUser(userId) {
    return this.request(`/users/${userId}/ban`, 'POST');
  }

  /**
   * Unban a user
   */
  async unbanUser(userId) {
    return this.request(`/users/${userId}/unban`, 'POST');
  }

  /**
   * Get user's sessions
   */
  async getUserSessions(userId) {
    return this.request(`/users/${userId}/sessions`);
  }

  /**
   * Revoke all sessions for a user
   */
  async revokeUserSessions(userId) {
    return this.request(`/users/${userId}/sessions`, 'POST', {
      revoke_all: true
    });
  }

  /**
   * Verify session token
   */
  async verifyToken(token) {
    return this.request('/tokens/verify', 'POST', { token });
  }

  /**
   * Create invitation
   */
  async createInvitation({ email, publicMetadata = {}, redirectUrl = null }) {
    const body = {
      email_address: email,
      public_metadata: publicMetadata
    };
    if (redirectUrl) body.redirect_url = redirectUrl;

    return this.request('/invitations', 'POST', body);
  }

  /**
   * List invitations
   */
  async listInvitations(status = null) {
    const params = status ? `?status=${status}` : '';
    return this.request(`/invitations${params}`);
  }

  /**
   * Revoke invitation
   */
  async revokeInvitation(invitationId) {
    return this.request(`/invitations/${invitationId}/revoke`, 'POST');
  }

  /**
   * Get organization
   */
  async getOrganization(orgId) {
    return this.request(`/organizations/${orgId}`);
  }

  /**
   * List organizations
   */
  async listOrganizations() {
    return this.request('/organizations');
  }

  /**
   * Create organization
   */
  async createOrganization({ name, slug, createdBy, publicMetadata = {} }) {
    return this.request('/organizations', 'POST', {
      name,
      slug,
      created_by: createdBy,
      public_metadata: publicMetadata
    });
  }

  /**
   * Add member to organization
   */
  async addOrganizationMember(orgId, userId, role = 'org:member') {
    return this.request(`/organizations/${orgId}/memberships`, 'POST', {
      user_id: userId,
      role
    });
  }

  /**
   * Remove member from organization
   */
  async removeOrganizationMember(orgId, userId) {
    return this.request(`/organizations/${orgId}/memberships/${userId}`, 'DELETE');
  }

  /**
   * Get webhook events
   */
  async getWebhookEvents() {
    return this.request('/webhooks');
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload, signature, secret = process.env.CLERK_WEBHOOK_SECRET) {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Get frontend configuration for client-side SDK
   */
  getFrontendConfig() {
    return {
      publishableKey: this.publishableKey,
      signInUrl: '/sign-in',
      signUpUrl: '/sign-up',
      afterSignInUrl: '/dashboard',
      afterSignUpUrl: '/onboarding'
    };
  }
}

// Export singleton instance
export const clerk = new ClerkIntegration();
export default ClerkIntegration;
