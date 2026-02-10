// BlackRoad OS Service Registry
// Comprehensive service and integration registry

export const services = {
  core: [
    { name: 'Main Site', slug: 'blackroad', url: 'blackroad.io', railway: false, platform: 'cloudflare' },
    { name: 'App Console', slug: 'app', url: 'app.blackroad.io', railway: false, platform: 'cloudflare' },
    { name: 'API', slug: 'api', url: 'api.blackroad.io', railway: false, platform: 'cloudflare' },
  ],
  infrastructure: [
    { name: 'API Gateway', slug: 'api-gateway', url: 'gateway.blackroad.io', railway: true, platform: 'railway' },
    { name: 'Core', slug: 'core', url: 'core.blackroad.io', railway: true, platform: 'railway' },
    { name: 'Operator', slug: 'operator', url: 'operator.blackroad.io', railway: true, platform: 'railway' },
    { name: 'WS Server', slug: 'ws-server', url: 'ws.blackroad.io', railway: true, platform: 'railway' },
    { name: 'Mesh Network', slug: 'mesh', url: 'mesh.blackroad.io', railway: true, platform: 'railway' },
  ],
  services: [
    { name: 'Agents', slug: 'agents', url: 'agents.blackroad.io', railway: true, platform: 'railway' },
    { name: 'Beacon', slug: 'beacon', url: 'beacon.blackroad.io', railway: true, platform: 'railway' },
    { name: 'Prism Console', slug: 'prism', url: 'prism.blackroad.io', railway: true, platform: 'railway' },
    { name: 'Research', slug: 'research', url: 'research.blackroad.io', railway: true, platform: 'railway' },
  ],
  ai: [
    { name: 'LLM Server', slug: 'llm', url: 'llm.blackroad.io', railway: true, platform: 'railway' },
    { name: 'RAG Service', slug: 'rag', url: 'rag.blackroad.io', railway: true, platform: 'railway' },
    { name: 'ML Pipeline', slug: 'ml', url: 'ml.blackroad.io', railway: true, platform: 'railway' },
    { name: 'Vector DB', slug: 'vectordb', url: 'vectordb.blackroad.io', railway: true, platform: 'railway' },
    { name: 'Model Forge', slug: 'forge', url: 'forge.blackroad.io', railway: true, platform: 'railway' },
  ],
  web: [
    { name: 'Home', slug: 'home', url: 'home.blackroad.io', railway: true, platform: 'railway' },
    { name: 'Demo', slug: 'demo', url: 'demo.blackroad.io', railway: true, platform: 'railway' },
    { name: 'Docs', slug: 'docs', url: 'docs.blackroad.io', railway: false, platform: 'cloudflare' },
    { name: 'Brand', slug: 'brand', url: 'brand.blackroad.io', railway: false, platform: 'cloudflare' },
    { name: 'Status', slug: 'status', url: 'status.blackroad.io', railway: false, platform: 'cloudflare' },
  ],
  vercel: [
    { name: 'Math', slug: 'math', url: 'math.blackroad.io', railway: false, platform: 'vercel' },
    { name: 'BlackRoad AI', slug: 'blackroadai', url: 'blackroadai.com', railway: false, platform: 'vercel' },
    { name: 'Lucidia', slug: 'lucidia', url: 'lucidia.earth', railway: false, platform: 'vercel' },
  ]
};

export const getAllServices = () => {
  return [
    ...services.core,
    ...services.infrastructure,
    ...services.services,
    ...services.ai,
    ...services.web,
    ...services.vercel
  ];
};

export const getServiceBySlug = (slug) => {
  return getAllServices().find(s => s.slug === slug);
};

export const getRailwayServices = () => {
  return getAllServices().filter(s => s.railway);
};

export const getCloudflareServices = () => {
  return getAllServices().filter(s => s.platform === 'cloudflare');
};

export const getVercelServices = () => {
  return getAllServices().filter(s => s.platform === 'vercel');
};

export const getServicesByPlatform = (platform) => {
  return getAllServices().filter(s => s.platform === platform);
};

// Dashboard URLs
export const dashboards = {
  // Deployment Platforms
  railway: 'https://railway.com/project/03ce1e43-5086-4255-b2bc-0146c8916f4c',
  cloudflare: 'https://dash.cloudflare.com/848cf0b18d51e0170e0d1537aec3505a',
  vercel: 'https://vercel.com/blackroad',
  digitalocean: 'https://cloud.digitalocean.com/droplets',

  // Source Control
  github: 'https://github.com/BlackRoad-OS',
  actions: 'https://github.com/BlackRoad-OS/blackroad-cli/actions',

  // Monitoring
  status: 'https://status.blackroad.io',

  // Productivity
  asana: 'https://app.asana.com',
  notion: 'https://notion.so',
  linear: 'https://linear.app',

  // Auth & Payments
  clerk: 'https://dashboard.clerk.com',
  stripe: 'https://dashboard.stripe.com',

  // AI Providers
  huggingface: 'https://huggingface.co/blackroad-os',
  openai: 'https://platform.openai.com',

  // Tunnels
  ngrok: 'http://localhost:4040',
};

// Integration status (for health checks)
export const integrations = {
  platforms: {
    railway: { name: 'Railway', envKey: 'RAILWAY_TOKEN', dashboard: dashboards.railway },
    cloudflare: { name: 'Cloudflare', envKey: 'CLOUDFLARE_API_TOKEN', dashboard: dashboards.cloudflare },
    vercel: { name: 'Vercel', envKey: 'VERCEL_TOKEN', dashboard: dashboards.vercel },
    digitalocean: { name: 'DigitalOcean', envKey: 'DIGITALOCEAN_SSH_KEY', dashboard: dashboards.digitalocean },
    github: { name: 'GitHub', envKey: 'GITHUB_TOKEN', dashboard: dashboards.github },
  },
  productivity: {
    asana: { name: 'Asana', envKey: 'ASANA_TOKEN', dashboard: dashboards.asana },
    notion: { name: 'Notion', envKey: 'NOTION_TOKEN', dashboard: dashboards.notion },
    linear: { name: 'Linear', envKey: 'LINEAR_API_KEY', dashboard: dashboards.linear },
  },
  auth: {
    clerk: { name: 'Clerk', envKey: 'CLERK_SECRET_KEY', dashboard: dashboards.clerk },
  },
  payments: {
    stripe: { name: 'Stripe', envKey: 'STRIPE_SECRET_KEY', dashboard: dashboards.stripe },
  },
  ai: {
    openai: { name: 'OpenAI', envKey: 'OPENAI_API_KEY', dashboard: dashboards.openai },
    anthropic: { name: 'Anthropic', envKey: 'ANTHROPIC_API_KEY' },
    huggingface: { name: 'Hugging Face', envKey: 'HUGGINGFACE_TOKEN', dashboard: dashboards.huggingface },
    google: { name: 'Google AI', envKey: 'GOOGLE_API_KEY' },
    xai: { name: 'xAI', envKey: 'XAI_API_KEY' },
  },
  tunnels: {
    cloudflare_tunnel: { name: 'Cloudflare Tunnel', envKey: 'CLOUDFLARE_TUNNEL_TOKEN' },
    ngrok: { name: 'ngrok', envKey: 'NGROK_AUTH_TOKEN', dashboard: dashboards.ngrok },
    tailscale: { name: 'Tailscale', envKey: 'TAILSCALE_AUTH_KEY' },
  }
};

// Check if an integration is configured
export const isIntegrationConfigured = (category, name) => {
  const integration = integrations[category]?.[name];
  if (!integration) return false;
  return !!process.env[integration.envKey];
};

// Get all configured integrations
export const getConfiguredIntegrations = () => {
  const configured = [];
  for (const [category, items] of Object.entries(integrations)) {
    for (const [name, integration] of Object.entries(items)) {
      if (process.env[integration.envKey]) {
        configured.push({ category, name, ...integration });
      }
    }
  }
  return configured;
};
