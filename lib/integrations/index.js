/**
 * BlackRoad OS - Unified Integrations
 * Central hub for all platform integrations
 */

// Platform integrations
export { asana, default as AsanaIntegration } from './asana.js';
export { notion, default as NotionIntegration } from './notion.js';
export { clerk, default as ClerkIntegration } from './clerk.js';
export { stripe, default as StripeIntegration } from './stripe.js';
export { huggingface, default as HuggingFaceIntegration } from './huggingface.js';

// Import all integrations
import { asana } from './asana.js';
import { notion } from './notion.js';
import { clerk } from './clerk.js';
import { stripe } from './stripe.js';
import { huggingface } from './huggingface.js';

/**
 * Integration status checker
 */
export async function checkIntegrationStatus() {
  const results = {};

  // Check Asana
  try {
    const user = await asana.getMe();
    results.asana = { status: 'connected', user: user.name };
  } catch (e) {
    results.asana = { status: 'error', error: e.message };
  }

  // Check Notion
  try {
    const search = await notion.search('test', { filter: { property: 'object', value: 'page' } });
    results.notion = { status: 'connected' };
  } catch (e) {
    results.notion = { status: 'error', error: e.message };
  }

  // Check Clerk
  try {
    const users = await clerk.listUsers({ limit: 1 });
    results.clerk = { status: 'connected', userCount: users.length };
  } catch (e) {
    results.clerk = { status: 'error', error: e.message };
  }

  // Check Stripe
  try {
    const customers = await stripe.listCustomers({ limit: 1 });
    results.stripe = { status: 'connected' };
  } catch (e) {
    results.stripe = { status: 'error', error: e.message };
  }

  // Check Hugging Face
  try {
    const models = await huggingface.listOrgModels();
    results.huggingface = { status: 'connected', modelCount: models.length };
  } catch (e) {
    results.huggingface = { status: 'error', error: e.message };
  }

  return results;
}

/**
 * Environment variable checker
 */
export function checkEnvironment() {
  const required = {
    // Deployment platforms
    RAILWAY_TOKEN: 'Railway deployment',
    CLOUDFLARE_API_TOKEN: 'Cloudflare deployment',
    CLOUDFLARE_ACCOUNT_ID: 'Cloudflare account',
    VERCEL_TOKEN: 'Vercel deployment',
    DIGITALOCEAN_SSH_KEY: 'DigitalOcean access',

    // Productivity
    ASANA_TOKEN: 'Asana integration',
    NOTION_TOKEN: 'Notion integration',

    // Auth & Payments
    CLERK_SECRET_KEY: 'Clerk authentication',
    STRIPE_SECRET_KEY: 'Stripe payments',

    // AI Providers
    OPENAI_API_KEY: 'OpenAI models',
    ANTHROPIC_API_KEY: 'Anthropic models',
    HUGGINGFACE_TOKEN: 'Hugging Face models'
  };

  const optional = {
    // Additional platforms
    CLOUDFLARE_TUNNEL_TOKEN: 'Cloudflare tunnels',
    NGROK_AUTH_TOKEN: 'ngrok tunnels',
    TAILSCALE_AUTH_KEY: 'Tailscale VPN',

    // Additional AI
    GOOGLE_API_KEY: 'Google AI',
    XAI_API_KEY: 'xAI / Grok',

    // Workspace
    LINEAR_API_KEY: 'Linear integration',

    // Frontend
    CLERK_PUBLISHABLE_KEY: 'Clerk frontend',
    STRIPE_PUBLISHABLE_KEY: 'Stripe frontend'
  };

  const results = {
    configured: [],
    missing: [],
    optional_missing: []
  };

  for (const [key, description] of Object.entries(required)) {
    if (process.env[key]) {
      results.configured.push({ key, description });
    } else {
      results.missing.push({ key, description });
    }
  }

  for (const [key, description] of Object.entries(optional)) {
    if (!process.env[key]) {
      results.optional_missing.push({ key, description });
    } else {
      results.configured.push({ key, description });
    }
  }

  return results;
}

/**
 * Initialize all integrations
 */
export async function initializeIntegrations() {
  console.log('Initializing BlackRoad OS integrations...');

  const env = checkEnvironment();
  console.log(`  Configured: ${env.configured.length} integrations`);
  console.log(`  Missing: ${env.missing.length} required`);
  console.log(`  Optional: ${env.optional_missing.length} not configured`);

  if (env.missing.length > 0) {
    console.warn('\nMissing required environment variables:');
    env.missing.forEach(({ key, description }) => {
      console.warn(`  - ${key}: ${description}`);
    });
  }

  return {
    asana,
    notion,
    clerk,
    stripe,
    huggingface,
    environment: env
  };
}

// Default export
export default {
  asana,
  notion,
  clerk,
  stripe,
  huggingface,
  checkIntegrationStatus,
  checkEnvironment,
  initializeIntegrations
};
