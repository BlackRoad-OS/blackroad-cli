// BR-CLI Scale Command
import chalk from 'chalk';
import AutoScaler from '../lib/autoscale.js';
import Table from 'cli-table3';
import inquirer from 'inquirer';
import ora from 'ora';

export async function scaleCommand(program) {
    const scaler = new AutoScaler();

    const cmd = program
        .command('scale')
        .description('Auto-scaling and capacity management');

    // Scale service
    cmd
        .command('set <service> <count>')
        .description('Scale service to specific count')
        .action(async (service, count) => {
            const spinner = ora(`Scaling ${service} to ${count} instances...`).start();

            try {
                const result = await scaler.scale(service, 'scale-to', parseInt(count));
                spinner.succeed(chalk.green('Scaling complete'));

                console.log(chalk.cyan('\nScaling Summary:'));
                console.log(chalk.gray('  Service:  '), result.service);
                console.log(chalk.gray('  Previous: '), result.previousCount);
                console.log(chalk.gray('  New:      '), result.newCount);
            } catch (error) {
                spinner.fail(chalk.red('Scaling failed'));
                console.error(chalk.red('Error:'), error.message);
                process.exit(1);
            }
        });

    // Scale up
    cmd
        .command('up <service> [amount]')
        .description('Scale up a service')
        .action(async (service, amount = '1') => {
            const spinner = ora(`Scaling up ${service}...`).start();

            try {
                const result = await scaler.scale(service, 'scale-up', parseInt(amount));
                spinner.succeed(chalk.green('Scaled up successfully'));

                console.log(chalk.green(`\n✓ ${service}: ${result.previousCount} → ${result.newCount} instances\n`));
            } catch (error) {
                spinner.fail(chalk.red('Scale up failed'));
                console.error(chalk.red('Error:'), error.message);
                process.exit(1);
            }
        });

    // Scale down
    cmd
        .command('down <service> [amount]')
        .description('Scale down a service')
        .action(async (service, amount = '1') => {
            const spinner = ora(`Scaling down ${service}...`).start();

            try {
                const result = await scaler.scale(service, 'scale-down', parseInt(amount));
                spinner.succeed(chalk.green('Scaled down successfully'));

                console.log(chalk.yellow(`\n✓ ${service}: ${result.previousCount} → ${result.newCount} instances\n`));
            } catch (error) {
                spinner.fail(chalk.red('Scale down failed'));
                console.error(chalk.red('Error:'), error.message);
                process.exit(1);
            }
        });

    // Add scaling rule
    cmd
        .command('rule-add')
        .description('Add auto-scaling rule')
        .action(async () => {
            console.log(chalk.bold.cyan('\n⚖️  Create Auto-Scaling Rule\n'));

            const answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'name',
                    message: 'Rule name:',
                    validate: input => input.length > 0
                },
                {
                    type: 'input',
                    name: 'target',
                    message: 'Target service:'
                },
                {
                    type: 'list',
                    name: 'metric',
                    message: 'Metric to monitor:',
                    choices: ['cpu', 'memory', 'requests', 'latency']
                },
                {
                    type: 'list',
                    name: 'operator',
                    message: 'Operator:',
                    choices: ['>', '<', '>=', '<=']
                },
                {
                    type: 'number',
                    name: 'threshold',
                    message: 'Threshold value:'
                },
                {
                    type: 'list',
                    name: 'action',
                    message: 'Action:',
                    choices: ['scale-up', 'scale-down']
                }
            ]);

            const rule = {
                name: answers.name,
                target: answers.target,
                enabled: true,
                condition: {
                    metric: answers.metric,
                    operator: answers.operator,
                    threshold: answers.threshold
                },
                action: answers.action
            };

            scaler.addRule(rule);
            console.log(chalk.green('\n✓ Rule added successfully\n'));
        });

    // List rules
    cmd
        .command('rules')
        .description('List auto-scaling rules')
        .action(() => {
            if (scaler.rules.length === 0) {
                console.log(chalk.yellow('No scaling rules configured'));
                console.log(chalk.gray('Add a rule with: br scale rule-add'));
                return;
            }

            const table = new Table({
                head: ['Name', 'Target', 'Condition', 'Action', 'Status'],
                style: { head: ['cyan'] }
            });

            scaler.rules.forEach(rule => {
                const condition = `${rule.condition.metric} ${rule.condition.operator} ${rule.condition.threshold}`;
                table.push([
                    rule.name,
                    rule.target,
                    condition,
                    rule.action,
                    rule.enabled ? chalk.green('enabled') : chalk.gray('disabled')
                ]);
            });

            console.log(table.toString());
        });

    // Scaling history
    cmd
        .command('history')
        .description('View scaling history')
        .action(() => {
            const history = scaler.getHistory();

            if (history.length === 0) {
                console.log(chalk.yellow('No scaling history'));
                return;
            }

            const table = new Table({
                head: ['Timestamp', 'Service', 'Action', 'Previous', 'New'],
                style: { head: ['cyan'] }
            });

            history.slice(-10).forEach(event => {
                table.push([
                    new Date(event.timestamp).toLocaleString(),
                    event.service,
                    event.action,
                    event.previousCount,
                    event.newCount
                ]);
            });

            console.log(table.toString());
        });
}
