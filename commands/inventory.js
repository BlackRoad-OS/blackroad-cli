<<<<<<< HEAD
// BR-CLI inventory command - manage infrastructure inventory
import chalk from 'chalk';
import Inventory from '../lib/inventory.js';
import SelectorEngine from '../lib/selector.js';
=======
// BR-CLI Inventory Command
import chalk from 'chalk';
import Inventory from '../lib/inventory.js';
>>>>>>> fe685a4 (feat: Add policy, secrets, and workflow commands + new libs)
import Table from 'cli-table3';

export async function inventoryCommand(program) {
    const inventory = new Inventory();
<<<<<<< HEAD
    const selector = new SelectorEngine(inventory);

    const cmd = program
        .command('inventory')
        .description('Manage infrastructure inventory (nodes, agents, services)');

    // List nodes
    cmd
        .command('nodes')
        .description('List all nodes in inventory')
        .option('-s, --selector <expr>', 'Filter nodes with selector expression')
        .option('-f, --format <fmt>', 'Output format (table|json|yaml)', 'table')
        .action(async (options) => {
            let nodes = inventory.nodes;
            
            if (options.selector) {
                nodes = selector.resolve(options.selector);
            }

            if (options.format === 'json') {
                console.log(JSON.stringify(nodes, null, 2));
            } else if (options.format === 'yaml') {
                console.log(yaml.dump(nodes));
            } else {
                const table = new Table({
                    head: ['Name', 'IP', 'Role', 'Env', 'Status'],
                    style: { head: ['cyan'] }
                });

                nodes.forEach(node => {
                    table.push([
                        node.name,
                        node.ip || 'N/A',
                        node.role || 'N/A',
                        node.env || 'N/A',
                        node.status || 'unknown'
                    ]);
                });

                console.log(table.toString());
                console.log(chalk.gray(`\nTotal: ${nodes.length} nodes`));
            }
        });

    // Add node
    cmd
        .command('add-node')
        .description('Add a node to inventory')
        .requiredOption('-n, --name <name>', 'Node name')
        .requiredOption('-i, --ip <ip>', 'Node IP address')
        .option('-r, --role <role>', 'Node role')
        .option('-e, --env <env>', 'Environment (dev/stage/prod)')
        .option('-t, --tags <tags>', 'Comma-separated tags')
        .action(async (options) => {
            const node = {
                name: options.name,
                ip: options.ip,
                role: options.role || 'generic',
                env: options.env || 'dev',
                tags: options.tags ? options.tags.split(',') : [],
                addedAt: new Date().toISOString()
            };

            inventory.addNode(node);
            console.log(chalk.green('✓') + ' Node added:', node.name);
        });

    // Remove node
    cmd
        .command('remove-node <name>')
        .description('Remove a node from inventory')
        .action(async (name) => {
            inventory.removeNode(name);
            console.log(chalk.green('✓') + ' Node removed:', name);
        });

    // List agents
    cmd
        .command('agents')
        .description('List all agents in inventory')
        .option('-f, --format <fmt>', 'Output format (table|json)', 'table')
        .action(async (options) => {
            const agents = inventory.agents;

            if (options.format === 'json') {
                console.log(JSON.stringify(agents, null, 2));
            } else {
                const table = new Table({
                    head: ['Name', 'Type', 'Version', 'Status'],
                    style: { head: ['cyan'] }
                });

                agents.forEach(agent => {
                    table.push([
                        agent.name,
                        agent.type || 'N/A',
                        agent.version || 'N/A',
                        agent.status || 'unknown'
                    ]);
                });

                console.log(table.toString());
                console.log(chalk.gray(`\nTotal: ${agents.length} agents`));
            }
        });

    // List services
    cmd
        .command('services')
        .description('List all services in inventory')
        .option('-f, --format <fmt>', 'Output format (table|json)', 'table')
        .action(async (options) => {
            const services = inventory.services;

            if (options.format === 'json') {
                console.log(JSON.stringify(services, null, 2));
            } else {
                const table = new Table({
                    head: ['Name', 'URL', 'Status', 'Health'],
                    style: { head: ['cyan'] }
                });

                services.forEach(service => {
                    table.push([
                        service.name,
                        service.url || 'N/A',
                        service.status || 'unknown',
                        service.health || 'N/A'
                    ]);
                });

                console.log(table.toString());
                console.log(chalk.gray(`\nTotal: ${services.length} services`));
            }
        });

    // Summary
    cmd
        .command('summary')
        .description('Show inventory summary')
        .action(async () => {
            const summary = inventory.summary();
            
            console.log(chalk.bold('\n📊 Inventory Summary\n'));
            console.log(chalk.cyan('Nodes:      ') + summary.nodes);
            console.log(chalk.cyan('Agents:     ') + summary.agents);
            console.log(chalk.cyan('Services:   ') + summary.services);
            console.log(chalk.cyan('Roles:      ') + summary.roles.join(', '));
            console.log(chalk.cyan('Environments: ') + summary.environments.join(', '));
        });

    // Discover
    cmd
        .command('discover')
        .description('Auto-discover nodes on network')
        .action(async () => {
            console.log(chalk.yellow('🔍 Discovering nodes...'));
            await inventory.discover();
=======

    const cmd = program
        .command('inventory')
        .description('Manage infrastructure inventory');

    cmd
        .command('list')
        .alias('ls')
        .description('List all nodes')
        .action(() => {
            if (inventory.nodes.length === 0) {
                console.log(chalk.yellow('No nodes in inventory'));
                return;
            }

            const table = new Table({
                head: ['Name', 'IP', 'Role', 'Environment'],
                style: { head: ['cyan'] }
            });

            inventory.nodes.forEach(node => {
                table.push([node.name, node.ip, node.role, node.env || 'unknown']);
            });

            console.log(table.toString());
        });

    cmd
        .command('add <name>')
        .description('Add a node')
        .option('--ip <ip>', 'IP address')
        .option('--role <role>', 'Node role')
        .option('--env <env>', 'Environment')
        .action((name, options) => {
            inventory.addNode({
                name,
                ip: options.ip,
                role: options.role,
                env: options.env
            });
            console.log(chalk.green('✓ Node added'));
>>>>>>> fe685a4 (feat: Add policy, secrets, and workflow commands + new libs)
        });
}
