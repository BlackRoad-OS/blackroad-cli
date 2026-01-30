// BR-CLI Secrets Command - Secure credential management
import chalk from 'chalk';
import SecretsManager from '../lib/secrets.js';
import Table from 'cli-table3';
import inquirer from 'inquirer';

export async function secretsCommand(program) {
    const secrets = new SecretsManager();

    const cmd = program
        .command('secrets')
        .description('Manage secrets and credentials securely');

    // List secrets
    cmd
        .command('list')
        .alias('ls')
        .description('List all secret names (not values)')
        .action(() => {
            const secretNames = secrets.listSecrets();

            if (secretNames.length === 0) {
                console.log(chalk.yellow('No secrets found'));
                console.log(chalk.gray('Add a secret with: br secrets set <name>'));
                return;
            }

            const table = new Table({
                head: ['Secret Name', 'Status'],
                style: { head: ['cyan'] }
            });

            secretNames.forEach(name => {
                table.push([name, chalk.green('✓ stored')]);
            });

            console.log(table.toString());
            console.log(chalk.gray(`\nTotal: ${secretNames.length} secrets`));
        });

    // Set a secret
    cmd
        .command('set <name>')
        .description('Store a secret securely')
        .option('-v, --value <value>', 'Secret value (or will prompt)')
        .action(async (name, options) => {
            let value = options.value;

            if (!value) {
                const answer = await inquirer.prompt([
                    {
                        type: 'password',
                        name: 'value',
                        message: `Enter secret value for "${name}":`,
                        mask: '*',
                        validate: input => input.length > 0
                    }
                ]);
                value = answer.value;
            }

            await secrets.setSecret(name, value);
        });

    // Get a secret
    cmd
        .command('get <name>')
        .description('Retrieve a secret value')
        .option('--show', 'Display value in terminal (use with caution)')
        .action(async (name, options) => {
            try {
                const value = await secrets.getSecret(name);

                if (options.show) {
                    console.log(chalk.yellow('⚠️  Secret value:'), value);
                } else {
                    console.log(chalk.green('✓ Secret found'));
                    console.log(chalk.gray('Use --show to display value'));
                    console.log(chalk.gray('Or access via: $BR_SECRET_' + name.toUpperCase()));
                }
            } catch (error) {
                console.error(chalk.red('✗'), error.message);
                process.exit(1);
            }
        });

    // Delete a secret
    cmd
        .command('delete <name>')
        .alias('rm')
        .description('Delete a secret')
        .option('-f, --force', 'Skip confirmation')
        .action(async (name, options) => {
            if (!options.force) {
                const answer = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'confirm',
                        message: `Delete secret "${name}"?`,
                        default: false
                    }
                ]);

                if (!answer.confirm) {
                    console.log(chalk.gray('Cancelled'));
                    return;
                }
            }

            await secrets.deleteSecret(name);
        });

    // Rotate a secret
    cmd
        .command('rotate <name>')
        .description('Generate a new value for a secret')
        .option('-l, --length <n>', 'Length of generated value', '32')
        .action(async (name, options) => {
            const length = parseInt(options.length);
            const generator = () => secrets.generateRandomSecret(length);
            
            const newValue = await secrets.rotateSecret(name, generator);
            
            console.log(chalk.green('✓ New value generated'));
            console.log(chalk.yellow('⚠️  Update any systems using this secret'));
        });

    // Generate random secret
    cmd
        .command('generate')
        .description('Generate a random secret value')
        .option('-l, --length <n>', 'Length', '32')
        .action((options) => {
            const length = parseInt(options.length);
            const value = secrets.generateRandomSecret(length);
            console.log(value);
        });

    // Export secrets
    cmd
        .command('export')
        .description('Export secrets to .env file')
        .option('-o, --output <file>', 'Output file', '.env.local')
        .action(async (options) => {
            await secrets.exportToEnv(options.output);
        });

    // Import secrets
    cmd
        .command('import <file>')
        .description('Import secrets from .env file')
        .action(async (file) => {
            await secrets.importFromEnv(file);
        });

    // Summary
    cmd
        .command('summary')
        .description('Show secrets summary')
        .action(() => {
            const summary = secrets.getSummary();

            console.log(chalk.bold.cyan('\n🔐 Secrets Summary\n'));
            console.log(chalk.cyan('Total Secrets:     '), summary.total);
            
            if (summary.total > 0) {
                console.log(chalk.cyan('\nSecret Names:'));
                summary.names.forEach(name => {
                    console.log(chalk.gray('  • ') + name);
                });
            }
        });
}
