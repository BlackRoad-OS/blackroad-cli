// BR-CLI Backup Command
import chalk from 'chalk';
import BackupManager from '../lib/backup.js';
import Table from 'cli-table3';
import inquirer from 'inquirer';
import ora from 'ora';

export async function backupCommand(program) {
    const backup = new BackupManager();

    const cmd = program
        .command('backup')
        .description('Backup and restore infrastructure configuration');

    // Create backup
    cmd
        .command('create [name]')
        .description('Create a new backup')
        .option('-t, --type <type>', 'Backup type (full|incremental)', 'full')
        .action(async (name, options) => {
            const spinner = ora('Creating backup...').start();
            
            try {
                const result = await backup.createBackup(name, options);
                spinner.succeed(chalk.green('Backup created successfully'));
                
                console.log(chalk.cyan('\nBackup Details:'));
                console.log(chalk.gray('  Name:     '), result.backup.name);
                console.log(chalk.gray('  Type:     '), result.backup.type);
                console.log(chalk.gray('  Timestamp:'), result.backup.timestamp);
                console.log(chalk.gray('  Path:     '), result.path);
                
                const dataKeys = Object.keys(result.backup.data);
                if (dataKeys.length > 0) {
                    console.log(chalk.gray('  Contains: '), dataKeys.join(', '));
                }
            } catch (error) {
                spinner.fail(chalk.red('Backup failed'));
                console.error(chalk.red('Error:'), error.message);
                process.exit(1);
            }
        });

    // List backups
    cmd
        .command('list')
        .alias('ls')
        .description('List all backups')
        .action(() => {
            const backups = backup.listBackups();

            if (backups.length === 0) {
                console.log(chalk.yellow('No backups found'));
                console.log(chalk.gray('Create a backup with: br backup create'));
                return;
            }

            const table = new Table({
                head: ['Name', 'Type', 'Timestamp', 'Size'],
                style: { head: ['cyan'] }
            });

            backups.forEach(b => {
                table.push([
                    b.name,
                    b.type,
                    new Date(b.timestamp).toLocaleString(),
                    `${(b.size / 1024).toFixed(2)} KB`
                ]);
            });

            console.log(table.toString());
            console.log(chalk.gray(`\nTotal: ${backups.length} backups`));
        });

    // Restore backup
    cmd
        .command('restore <name>')
        .description('Restore from a backup')
        .option('-f, --force', 'Skip confirmation')
        .action(async (name, options) => {
            if (!options.force) {
                const answer = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'confirm',
                        message: `Restore from backup "${name}"? This will overwrite current configuration.`,
                        default: false
                    }
                ]);

                if (!answer.confirm) {
                    console.log(chalk.gray('Cancelled'));
                    return;
                }
            }

            const spinner = ora('Restoring backup...').start();

            try {
                const restored = await backup.restoreBackup(name);
                spinner.succeed(chalk.green('Backup restored successfully'));
                
                console.log(chalk.cyan('\nRestored:'));
                const dataKeys = Object.keys(restored.data);
                dataKeys.forEach(key => {
                    console.log(chalk.gray('  •'), key);
                });
            } catch (error) {
                spinner.fail(chalk.red('Restore failed'));
                console.error(chalk.red('Error:'), error.message);
                process.exit(1);
            }
        });

    // Show backup details
    cmd
        .command('show <name>')
        .description('Show backup details')
        .action((name) => {
            const backupData = backup.getBackup(name);

            if (!backupData) {
                console.log(chalk.red(`Backup "${name}" not found`));
                return;
            }

            console.log(chalk.bold.cyan(`\n📦 Backup: ${backupData.name}\n`));
            console.log(chalk.cyan('Type:      '), backupData.type);
            console.log(chalk.cyan('Timestamp: '), backupData.timestamp);
            console.log(chalk.cyan('Hostname:  '), backupData.metadata.hostname);
            console.log(chalk.cyan('User:      '), backupData.metadata.user);
            
            console.log(chalk.cyan('\nContents:'));
            Object.keys(backupData.data).forEach(key => {
                const items = Object.keys(backupData.data[key]);
                console.log(chalk.gray(`  ${key}:`), items.length, 'items');
            });
        });

    // Delete backup
    cmd
        .command('delete <name>')
        .alias('rm')
        .description('Delete a backup')
        .option('-f, --force', 'Skip confirmation')
        .action(async (name, options) => {
            if (!options.force) {
                const answer = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'confirm',
                        message: `Delete backup "${name}"?`,
                        default: false
                    }
                ]);

                if (!answer.confirm) {
                    console.log(chalk.gray('Cancelled'));
                    return;
                }
            }

            const deleted = backup.deleteBackup(name);
            
            if (deleted) {
                console.log(chalk.green('✓ Backup deleted'));
            } else {
                console.log(chalk.red(`Backup "${name}" not found`));
            }
        });
}
