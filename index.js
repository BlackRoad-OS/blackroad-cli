#!/usr/bin/env node

const { Command } = require('commander')
const chalk = require('chalk')
const ora = require('ora')
const axios = require('axios')
const fs = require('fs')
const path = require('path')

const program = new Command()

// Config
let config = {}
const configPath = path.join(process.env.HOME, '.blackroad', 'config.json')

function loadConfig() {
  try {
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    }
  } catch (err) {
    console.error(chalk.red('Error loading config'))
  }
}

function saveConfig() {
  const dir = path.dirname(configPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
}

// API Client
const api = axios.create({
  baseURL: 'https://api.blackroad.io/v1',
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(config => {
  if (config.apiKey) {
    config.headers.Authorization = `Bearer ${config.apiKey}`
  }
  return config
})

// Commands
program
  .name('br')
  .description('BlackRoad CLI - Deploy at ludicrous speed')
  .version('1.0.0')

// Login
program
  .command('login')
  .description('Login to BlackRoad')
  .action(async () => {
    const { default: inquirer } = await import('inquirer')
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'apiKey',
        message: 'Enter your API key:'
      }
    ])
    
    config.apiKey = answers.apiKey
    saveConfig()
    console.log(chalk.green('✅ Logged in successfully!'))
  })

// Deploy
program
  .command('deploy')
  .description('Deploy your application')
  .option('-n, --name <name>', 'Deployment name')
  .action(async (options) => {
    loadConfig()
    
    if (!config.apiKey) {
      console.log(chalk.red('❌ Not logged in. Run: br login'))
      return
    }
    
    const spinner = ora('Deploying...').start()
    
    try {
      const response = await api.post('/deployments', {
        name: options.name || path.basename(process.cwd()),
        source: process.cwd()
      }, { apiKey: config.apiKey })
      
      spinner.succeed(chalk.green('✅ Deployed successfully!'))
      console.log(chalk.cyan(`🔗 URL: ${response.data.url}`))
      console.log(chalk.gray(`   ID: ${response.data.id}`))
    } catch (err) {
      spinner.fail(chalk.red('❌ Deployment failed'))
      console.error(err.message)
    }
  })

// List deployments
program
  .command('list')
  .description('List all deployments')
  .action(async () => {
    loadConfig()
    
    if (!config.apiKey) {
      console.log(chalk.red('❌ Not logged in. Run: br login'))
      return
    }
    
    try {
      const response = await api.get('/deployments', { apiKey: config.apiKey })
      
      console.log(chalk.bold('\n📦 Your Deployments:\n'))
      
      response.data.deployments.forEach(d => {
        console.log(chalk.cyan(`  • ${d.name}`))
        console.log(chalk.gray(`    Status: ${d.status}`))
        console.log(chalk.gray(`    URL: ${d.url}`))
        console.log(chalk.gray(`    ID: ${d.id}\n`))
      })
    } catch (err) {
      console.error(chalk.red('❌ Error fetching deployments'))
    }
  })

// Stats
program
  .command('stats')
  .description('View analytics')
  .option('-r, --range <range>', 'Time range (7d, 30d, 90d)', '7d')
  .action(async (options) => {
    loadConfig()
    
    if (!config.apiKey) {
      console.log(chalk.red('❌ Not logged in. Run: br login'))
      return
    }
    
    try {
      const response = await api.get(`/analytics?range=${options.range}`, { apiKey: config.apiKey })
      
      console.log(chalk.bold('\n📊 Analytics:\n'))
      console.log(chalk.cyan(`  Requests: ${response.data.requests.toLocaleString()}`))
      console.log(chalk.cyan(`  Uptime: ${response.data.uptime}%`))
      console.log(chalk.cyan(`  Avg Latency: ${response.data.latency}ms`))
      console.log()
    } catch (err) {
      console.error(chalk.red('❌ Error fetching stats'))
    }
  })

// Logs
program
  .command('logs <deploymentId>')
  .description('View deployment logs')
  .option('-f, --follow', 'Follow logs in real-time')
  .action(async (deploymentId, options) => {
    loadConfig()
    
    if (!config.apiKey) {
      console.log(chalk.red('❌ Not logged in. Run: br login'))
      return
    }
    
    console.log(chalk.gray('📝 Fetching logs...\n'))
    
    try {
      const response = await api.get(`/deployments/${deploymentId}/logs`, { apiKey: config.apiKey })
      
      response.data.logs.forEach(log => {
        const timestamp = chalk.gray(new Date(log.timestamp).toLocaleTimeString())
        const level = log.level === 'error' ? chalk.red(log.level) : chalk.blue(log.level)
        console.log(`${timestamp} [${level}] ${log.message}`)
      })
    } catch (err) {
      console.error(chalk.red('❌ Error fetching logs'))
    }
  })

// Open dashboard
program
  .command('dashboard')
  .description('Open dashboard in browser')
  .action(() => {
    const open = require('open')
    open('https://blackroad.io/dashboard')
    console.log(chalk.green('🚀 Opening dashboard...'))
  })

program.parse()
