import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';

// Integration definitions
const INTEGRATIONS = {
  platforms: {
    railway: {
      name: 'Railway',
      envKey: 'RAILWAY_TOKEN',
      dashboard: 'https://railway.com/project/03ce1e43-5086-4255-b2bc-0146c8916f4c',
      checkUrl: 'https://railway.app/health'
    },
    cloudflare: {
      name: 'Cloudflare',
      envKey: 'CLOUDFLARE_API_TOKEN',
      dashboard: 'https://dash.cloudflare.com',
      checkUrl: 'https://blackroad.io'
    },
    vercel: {
      name: 'Vercel',
      envKey: 'VERCEL_TOKEN',
      dashboard: 'https://vercel.com/blackroad',
      checkUrl: 'https://blackroadai.vercel.app'
    },
    digitalocean: {
      name: 'DigitalOcean',
      envKey: 'DIGITALOCEAN_SSH_KEY',
      dashboard: 'https://cloud.digitalocean.com'
    },
    github: {
      name: 'GitHub',
      envKey: 'GITHUB_TOKEN',
      dashboard: 'https://github.com/BlackRoad-OS',
      checkUrl: 'https://api.github.com'
    }
  },
  productivity: {
    asana: {
      name: 'Asana',
      envKey: 'ASANA_TOKEN',
      checkUrl: 'https://app.asana.com/api/1.0/users/me'
    },
    notion: {
      name: 'Notion',
      envKey: 'NOTION_TOKEN',
      checkUrl: 'https://api.notion.com/v1/users/me'
    },
    linear: {
      name: 'Linear',
      envKey: 'LINEAR_API_KEY',
      checkUrl: 'https://api.linear.app/graphql'
    }
  },
  auth: {
    clerk: {
      name: 'Clerk',
      envKey: 'CLERK_SECRET_KEY',
      checkUrl: 'https://api.clerk.com/v1/users'
    }
  },
  payments: {
    stripe: {
      name: 'Stripe',
      envKey: 'STRIPE_SECRET_KEY',
      checkUrl: 'https://api.stripe.com/v1/customers'
    }
  },
  ai: {
    openai: {
      name: 'OpenAI',
      envKey: 'OPENAI_API_KEY',
      checkUrl: 'https://api.openai.com/v1/models'
    },
    anthropic: {
      name: 'Anthropic',
      envKey: 'ANTHROPIC_API_KEY'
    },
    huggingface: {
      name: 'Hugging Face',
      envKey: 'HUGGINGFACE_TOKEN',
      checkUrl: 'https://huggingface.co/api/whoami'
    },
    google: {
      name: 'Google AI',
      envKey: 'GOOGLE_API_KEY'
    },
    xai: {
      name: 'xAI',
      envKey: 'XAI_API_KEY'
    }
  },
  tunnels: {
    cloudflare_tunnel: {
      name: 'Cloudflare Tunnel',
      envKey: 'CLOUDFLARE_TUNNEL_TOKEN'
    },
    ngrok: {
      name: 'ngrok',
      envKey: 'NGROK_AUTH_TOKEN'
    },
    tailscale: {
      name: 'Tailscale',
      envKey: 'TAILSCALE_AUTH_KEY'
    }
  }
};

function checkEnvConfigured(envKey) {
  return !!process.env[envKey];
}

async function checkIntegrationHealth(integration) {
  if (!integration.checkUrl) {
    return { configured: checkEnvConfigured(integration.envKey), healthy: null };
  }

  const configured = checkEnvConfigured(integration.envKey);
  if (!configured) {
    return { configured: false, healthy: false };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const headers = {};
    if (integration.envKey && process.env[integration.envKey]) {
      headers['Authorization'] = `Bearer ${process.env[integration.envKey]}`;
    }
    if (integration.name === 'Notion') {
      headers['Notion-Version'] = '2022-06-28';
    }

    const response = await fetch(integration.checkUrl, {
      method: integration.checkUrl.includes('graphql') ? 'POST' : 'GET',
      headers,
      signal: controller.signal
    });

    clearTimeout(timeout);
    return { configured: true, healthy: response.ok || response.status < 500 };
  } catch (e) {
    return { configured: true, healthy: false, error: e.message };
  }
}

export async function integrationsCommand(options) {
  const { category, check, json } = options;

  // Filter by category if specified
  let categoriesToShow = Object.keys(INTEGRATIONS);
  if (category) {
    categoriesToShow = categoriesToShow.filter(c => c === category.toLowerCase());
    if (categoriesToShow.length === 0) {
      console.log(chalk.red(`Unknown category: ${category}`));
      console.log(chalk.gray(`Available: ${Object.keys(INTEGRATIONS).join(', ')}`));
      return;
    }
  }

  if (check) {
    const spinner = ora('Checking integration health...').start();
    const results = {};

    for (const cat of categoriesToShow) {
      results[cat] = {};
      for (const [key, integration] of Object.entries(INTEGRATIONS[cat])) {
        results[cat][key] = {
          ...integration,
          ...(await checkIntegrationHealth(integration))
        };
      }
    }

    spinner.stop();

    if (json) {
      console.log(JSON.stringify(results, null, 2));
      return;
    }

    // Display results
    console.log();
    console.log(chalk.bold('  Integration Health Check'));
    console.log(chalk.gray('  ═══════════════════════════════════════'));
    console.log();

    for (const [cat, integrations] of Object.entries(results)) {
      const categoryIcon = {
        platforms: '🚀',
        productivity: '📋',
        auth: '🔐',
        payments: '💳',
        ai: '🤖',
        tunnels: '🔗'
      }[cat] || '📦';

      console.log(chalk.bold(`  ${categoryIcon} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`));

      for (const [key, integration] of Object.entries(integrations)) {
        const configIcon = integration.configured ? '✅' : '⬜';
        const healthIcon = integration.healthy === true ? '💚'
          : integration.healthy === false ? '💔'
          : '❓';

        const status = integration.configured
          ? (integration.healthy ? chalk.green('healthy') : chalk.red('unhealthy'))
          : chalk.gray('not configured');

        console.log(`     ${configIcon} ${healthIcon} ${integration.name.padEnd(18)} ${status}`);
      }
      console.log();
    }
  } else {
    // Just list integrations
    if (json) {
      const result = {};
      for (const cat of categoriesToShow) {
        result[cat] = {};
        for (const [key, integration] of Object.entries(INTEGRATIONS[cat])) {
          result[cat][key] = {
            ...integration,
            configured: checkEnvConfigured(integration.envKey)
          };
        }
      }
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    console.log();
    console.log(chalk.bold('  BlackRoad OS Integrations'));
    console.log(chalk.gray('  ═══════════════════════════════════════'));
    console.log();

    const table = new Table({
      head: [
        chalk.gray('Category'),
        chalk.gray('Integration'),
        chalk.gray('Status'),
        chalk.gray('Env Key')
      ],
      style: { head: [], border: ['gray'] }
    });

    for (const cat of categoriesToShow) {
      for (const [key, integration] of Object.entries(INTEGRATIONS[cat])) {
        const configured = checkEnvConfigured(integration.envKey);
        const status = configured ? chalk.green('✅ Configured') : chalk.gray('⬜ Not set');

        table.push([
          cat,
          integration.name,
          status,
          chalk.cyan(integration.envKey)
        ]);
      }
    }

    console.log(table.toString());
    console.log();

    // Count configured
    let total = 0;
    let configured = 0;
    for (const cat of Object.keys(INTEGRATIONS)) {
      for (const [key, integration] of Object.entries(INTEGRATIONS[cat])) {
        total++;
        if (checkEnvConfigured(integration.envKey)) configured++;
      }
    }

    console.log(chalk.gray(`  ${configured}/${total} integrations configured`));
    console.log();
    console.log(chalk.gray('  Tip: Run with --check to verify connectivity'));
    console.log(chalk.gray('  Tip: Run with --category <name> to filter'));
    console.log();
  }
}

export async function modelsCommand(options) {
  const { type, safe, json } = options;

  // Open source models registry
  const MODELS = {
    llm: [
      { id: 'meta-llama/Llama-3.1-405B-Instruct', name: 'Llama 3.1 405B', params: '405B', license: 'Llama 3.1', safe: true },
      { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek V3', params: '671B MoE', license: 'MIT', safe: true },
      { id: 'mistralai/Mistral-Large-Instruct-2407', name: 'Mistral Large 2', params: '123B', license: 'Apache 2.0', safe: true },
      { id: 'Qwen/Qwen2.5-72B-Instruct', name: 'Qwen 2.5 72B', params: '72B', license: 'Apache 2.0', safe: true },
      { id: 'meta-llama/Llama-3.1-70B-Instruct', name: 'Llama 3.1 70B', params: '70B', license: 'Llama 3.1', safe: true },
      { id: 'mistralai/Mixtral-8x22B-Instruct-v0.1', name: 'Mixtral 8x22B', params: '141B MoE', license: 'Apache 2.0', safe: true },
    ],
    code: [
      { id: 'deepseek-ai/DeepSeek-Coder-V2-Instruct', name: 'DeepSeek Coder V2', params: '236B MoE', license: 'MIT', safe: true },
      { id: 'Qwen/Qwen2.5-Coder-32B-Instruct', name: 'Qwen 2.5 Coder', params: '32B', license: 'Apache 2.0', safe: true },
      { id: 'bigcode/starcoder2-15b-instruct-v0.1', name: 'StarCoder2 15B', params: '15B', license: 'OpenRAIL', safe: true },
    ],
    embeddings: [
      { id: 'BAAI/bge-large-en-v1.5', name: 'BGE Large', dims: '1024', license: 'MIT', safe: true },
      { id: 'nomic-ai/nomic-embed-text-v1.5', name: 'Nomic Embed', dims: '768', license: 'Apache 2.0', safe: true },
    ],
    vision: [
      { id: 'liuhaotian/llava-v1.6-34b', name: 'LLaVA 1.6 34B', params: '34B', license: 'Apache 2.0', safe: true },
      { id: 'OpenGVLab/InternVL2-26B', name: 'InternVL2', params: '26B', license: 'MIT', safe: true },
    ],
    audio: [
      { id: 'openai/whisper-large-v3', name: 'Whisper Large V3', type: 'STT', license: 'MIT', safe: true },
      { id: 'suno/bark', name: 'Bark', type: 'TTS', license: 'MIT', safe: true },
    ]
  };

  let typesToShow = Object.keys(MODELS);
  if (type) {
    typesToShow = typesToShow.filter(t => t === type.toLowerCase());
    if (typesToShow.length === 0) {
      console.log(chalk.red(`Unknown type: ${type}`));
      console.log(chalk.gray(`Available: ${Object.keys(MODELS).join(', ')}`));
      return;
    }
  }

  if (json) {
    const result = {};
    for (const t of typesToShow) {
      result[t] = safe ? MODELS[t].filter(m => m.safe) : MODELS[t];
    }
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log();
  console.log(chalk.bold('  Open Source AI Models (Auditable & Forkable)'));
  console.log(chalk.gray('  ═══════════════════════════════════════════════'));
  console.log();

  for (const t of typesToShow) {
    const typeIcon = {
      llm: '🧠',
      code: '💻',
      embeddings: '🔢',
      vision: '👁️',
      audio: '🎵'
    }[t] || '📦';

    console.log(chalk.bold(`  ${typeIcon} ${t.toUpperCase()}`));

    const table = new Table({
      head: [
        chalk.gray('Model'),
        chalk.gray('Size'),
        chalk.gray('License'),
        chalk.gray('Safe')
      ],
      style: { head: [], border: ['gray'] }
    });

    const models = safe ? MODELS[t].filter(m => m.safe) : MODELS[t];
    for (const model of models) {
      const size = model.params || model.dims || model.type || '-';
      const safeIcon = model.safe ? chalk.green('✅') : chalk.red('❌');
      table.push([
        model.name,
        size,
        model.license,
        safeIcon
      ]);
    }

    console.log(table.toString());
    console.log();
  }

  console.log(chalk.gray('  All models are auditable (open source) and forkable (permissive license)'));
  console.log(chalk.gray('  Use --safe to show only verified safe models'));
  console.log();
}
