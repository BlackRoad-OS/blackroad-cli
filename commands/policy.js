// BR-CLI Policy Command - Manage operational policies
import chalk from 'chalk';
import PolicyEngine from '../lib/policy.js';
import Table from 'cli-table3';
import inquirer from 'inquirer';

export async function policyCommand(program) {
    const policy = new PolicyEngine();

    const cmd = program
        .command('policy')
        .description('Manage operational policies and compliance rules');

    // List policies
    cmd
        .command('list')
        .alias('ls')
        .description('List all policies')
        .option('-e, --enabled', 'Show only enabled policies')
        .option('-d, --disabled', 'Show only disabled policies')
        .action((options) => {
            let policies = policy.policies;
            
            if (options.enabled) {
                policies = policies.filter(p => p.enabled !== false);
            } else if (options.disabled) {
                policies = policies.filter(p => p.enabled === false);
            }

            const table = new Table({
                head: ['Name', 'Scope', 'Rules', 'Status'],
                style: { head: ['cyan'] }
            });

            policies.forEach(p => {
                table.push([
                    p.name,
                    p.scope?.commands?.join(', ') || 'global',
                    p.rules?.length || 0,
                    p.enabled !== false ? chalk.green('enabled') : chalk.gray('disabled')
                ]);
            });

            if (policies.length === 0) {
                console.log(chalk.yellow('No policies found'));
                console.log(chalk.gray('Create a policy with: br policy create'));
            } else {
                console.log(table.toString());
                console.log(chalk.gray(`\nTotal: ${policies.length} policies`));
            }
        });

    // Create policy
    cmd
        .command('create')
        .description('Create a new policy interactively')
        .action(async () => {
            console.log(chalk.bold.cyan('\n📋 Create New Policy\n'));

            const answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'name',
                    message: 'Policy name:',
                    validate: input => input.length > 0
                },
                {
                    type: 'input',
                    name: 'description',
                    message: 'Description:'
                },
                {
                    type: 'list',
                    name: 'scope',
                    message: 'Scope:',
                    choices: ['global', 'deploy', 'run', 'inventory', 'secrets']
                },
                {
                    type: 'confirm',
                    name: 'enabled',
                    message: 'Enable immediately?',
                    default: true
                }
            ]);

            const newPolicy = {
                name: answers.name,
                description: answers.description,
                scope: answers.scope === 'global' ? {} : { commands: [answers.scope] },
                enabled: answers.enabled,
                rules: []
            };

            const filepath = policy.addPolicy(newPolicy);
            console.log(chalk.green('\n✓ Policy created:'), filepath);
            console.log(chalk.gray('Edit the file to add rules'));
        });

    // Check action against policies
    cmd
        .command('check <action>')
        .description('Check if an action is allowed by policies')
        .option('-c, --context <json>', 'Additional context (JSON)')
        .action((action, options) => {
            const context = options.context ? JSON.parse(options.context) : {};
            const result = policy.evaluate({ command: action }, context);

            console.log(chalk.bold.cyan('\n📋 Policy Check\n'));
            console.log(chalk.cyan('Action:'), action);
            console.log(chalk.cyan('Result:'), result.allowed ? chalk.green('✓ ALLOWED') : chalk.red('✗ DENIED'));

            if (result.violations.length > 0) {
                console.log(chalk.red('\n❌ Violations:\n'));
                result.violations.forEach(v => {
                    console.log(chalk.red('  •'), `${v.policy}: ${v.message}`);
                });
            }

            if (result.warnings.length > 0) {
                console.log(chalk.yellow('\n⚠️  Warnings:\n'));
                result.warnings.forEach(w => {
                    console.log(chalk.yellow('  •'), `${w.policy}: ${w.message}`);
                });
            }

            if (result.violations.length === 0 && result.warnings.length === 0) {
                console.log(chalk.green('\n✓ No violations or warnings\n'));
            }
        });

    // Summary
    cmd
        .command('summary')
        .description('Show policy summary')
        .action(() => {
            const summary = policy.getSummary();

            console.log(chalk.bold.cyan('\n📊 Policy Summary\n'));
            console.log(chalk.cyan('Total Policies:    '), summary.total);
            console.log(chalk.green('Enabled:           '), summary.enabled);
            console.log(chalk.gray('Disabled:          '), summary.disabled);

            console.log(chalk.cyan('\nBy Scope:'));
            Object.entries(summary.byScope).forEach(([scope, count]) => {
                console.log(`  ${scope.padEnd(15)} ${count}`);
            });
        });

    // Example policy
    cmd
        .command('example')
        .description('Show example policy configuration')
        .action(() => {
            const example = {
                name: 'Production Safety',
                description: 'Prevent destructive operations in production',
                scope: {
                    commands: ['run', 'deploy']
                },
                enabled: true,
                rules: [
                    {
                        name: 'require-approval',
                        enforcement: 'block',
                        condition: {
                            and: [
                                { field: 'env', operator: 'equals', value: 'prod' },
                                { field: 'approved', operator: '!=', value: true }
                            ]
                        },
                        message: 'Production deployments require approval'
                    },
                    {
                        name: 'warn-large-rollout',
                        enforcement: 'warn',
                        condition: {
                            field: 'node_count',
                            operator: '>',
                            value: 100
                        },
                        message: 'Large rollout detected - consider phased deployment'
                    }
                ]
            };

            console.log(chalk.bold.cyan('\n📋 Example Policy\n'));
            console.log(chalk.gray('Save this to ~/.blackroad/policies/prod-safety.yaml:\n'));
            console.log(yaml.dump(example));
        });
}
