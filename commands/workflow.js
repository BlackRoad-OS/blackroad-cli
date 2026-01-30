// BR-CLI Workflow Command - Workflow automation and orchestration
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import os from 'os';
import yaml from 'js-yaml';
import inquirer from 'inquirer';
import Table from 'cli-table3';

class WorkflowEngine {
    constructor() {
        this.workflowDir = path.join(os.homedir(), '.blackroad', 'workflows');
        this.ensureWorkflowDir();
    }

    ensureWorkflowDir() {
        if (!fs.existsSync(this.workflowDir)) {
            fs.mkdirSync(this.workflowDir, { recursive: true });
        }
    }

    loadWorkflow(name) {
        const filepath = path.join(this.workflowDir, `${name}.yaml`);
        if (!fs.existsSync(filepath)) {
            throw new Error(`Workflow "${name}" not found`);
        }
        const content = fs.readFileSync(filepath, 'utf-8');
        return yaml.load(content);
    }

    saveWorkflow(name, workflow) {
        const filepath = path.join(this.workflowDir, `${name}.yaml`);
        fs.writeFileSync(filepath, yaml.dump(workflow));
        return filepath;
    }

    listWorkflows() {
        const files = fs.readdirSync(this.workflowDir);
        return files
            .filter(f => f.endsWith('.yaml') || f.endsWith('.yml'))
            .map(f => f.replace(/\.(yaml|yml)$/, ''));
    }

    async executeWorkflow(workflow, context = {}) {
        const results = [];

        for (const step of workflow.steps || []) {
            console.log(chalk.cyan(`\n▶ Step: ${step.name}`));

            try {
                const result = await this.executeStep(step, context);
                results.push({ step: step.name, success: true, result });
                
                // Update context with step outputs
                if (step.outputs) {
                    Object.assign(context, result);
                }

            } catch (error) {
                console.error(chalk.red(`✗ Step failed: ${error.message}`));
                
                if (step.on_error === 'continue') {
                    results.push({ step: step.name, success: false, error: error.message });
                } else {
                    throw error;
                }
            }
        }

        return results;
    }

    async executeStep(step, context) {
        // Simulate step execution
        console.log(chalk.gray(`  Action: ${step.action}`));
        
        if (step.params) {
            console.log(chalk.gray('  Params:'), JSON.stringify(step.params, null, 2));
        }

        // Simulate work
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log(chalk.green('  ✓ Complete'));
        
        return { status: 'success' };
    }
}

export async function workflowCommand(program) {
    const engine = new WorkflowEngine();

    const cmd = program
        .command('workflow')
        .description('Manage and execute workflows');

    // List workflows
    cmd
        .command('list')
        .alias('ls')
        .description('List all workflows')
        .action(() => {
            const workflows = engine.listWorkflows();

            if (workflows.length === 0) {
                console.log(chalk.yellow('No workflows found'));
                console.log(chalk.gray('Create a workflow with: br workflow create'));
                return;
            }

            const table = new Table({
                head: ['Workflow Name'],
                style: { head: ['cyan'] }
            });

            workflows.forEach(name => {
                table.push([name]);
            });

            console.log(table.toString());
            console.log(chalk.gray(`\nTotal: ${workflows.length} workflows`));
        });

    // Create workflow
    cmd
        .command('create <name>')
        .description('Create a new workflow interactively')
        .action(async (name) => {
            console.log(chalk.bold.cyan('\n⚙️  Create Workflow\n'));

            const answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'description',
                    message: 'Workflow description:'
                },
                {
                    type: 'list',
                    name: 'trigger',
                    message: 'Trigger type:',
                    choices: ['manual', 'scheduled', 'event']
                }
            ]);

            const workflow = {
                name,
                description: answers.description,
                trigger: answers.trigger,
                steps: [
                    {
                        name: 'example-step',
                        action: 'run-command',
                        params: {
                            command: 'echo "Hello from workflow"'
                        }
                    }
                ]
            };

            const filepath = engine.saveWorkflow(name, workflow);
            console.log(chalk.green('\n✓ Workflow created:'), filepath);
            console.log(chalk.gray('Edit the file to customize steps'));
        });

    // Run workflow
    cmd
        .command('run <name>')
        .description('Execute a workflow')
        .option('-c, --context <json>', 'Initial context (JSON)')
        .action(async (name, options) => {
            try {
                const workflow = engine.loadWorkflow(name);
                const context = options.context ? JSON.parse(options.context) : {};

                console.log(chalk.bold.cyan(`\n⚙️  Running Workflow: ${workflow.name}\n`));
                
                if (workflow.description) {
                    console.log(chalk.gray(workflow.description));
                }

                const results = await engine.executeWorkflow(workflow, context);

                console.log(chalk.bold.cyan('\n📊 Workflow Results\n'));
                
                const table = new Table({
                    head: ['Step', 'Status'],
                    style: { head: ['cyan'] }
                });

                results.forEach(r => {
                    table.push([
                        r.step,
                        r.success ? chalk.green('✓ success') : chalk.red('✗ failed')
                    ]);
                });

                console.log(table.toString());

                const successCount = results.filter(r => r.success).length;
                console.log(chalk.green(`\n✓ ${successCount}/${results.length} steps completed\n`));

            } catch (error) {
                console.error(chalk.red('✗ Workflow failed:'), error.message);
                process.exit(1);
            }
        });

    // Show workflow details
    cmd
        .command('show <name>')
        .description('Show workflow details')
        .action((name) => {
            try {
                const workflow = engine.loadWorkflow(name);

                console.log(chalk.bold.cyan(`\n⚙️  Workflow: ${workflow.name}\n`));
                
                if (workflow.description) {
                    console.log(chalk.cyan('Description:'), workflow.description);
                }
                
                console.log(chalk.cyan('Trigger:'), workflow.trigger);
                console.log(chalk.cyan('Steps:'), workflow.steps?.length || 0);

                if (workflow.steps && workflow.steps.length > 0) {
                    console.log(chalk.cyan('\nSteps:\n'));
                    
                    workflow.steps.forEach((step, i) => {
                        console.log(chalk.gray(`${i + 1}.`), step.name);
                        console.log(chalk.gray('   Action:'), step.action);
                        if (step.on_error) {
                            console.log(chalk.gray('   On Error:'), step.on_error);
                        }
                    });
                }

            } catch (error) {
                console.error(chalk.red('✗'), error.message);
                process.exit(1);
            }
        });

    // Example workflow
    cmd
        .command('example')
        .description('Show example workflow configuration')
        .action(() => {
            const example = {
                name: 'deploy-production',
                description: 'Deploy service to production environment',
                trigger: 'manual',
                steps: [
                    {
                        name: 'check-policies',
                        action: 'policy-check',
                        params: {
                            action: 'deploy',
                            env: 'prod'
                        },
                        on_error: 'abort'
                    },
                    {
                        name: 'backup',
                        action: 'backup-create',
                        params: {
                            service: 'api'
                        }
                    },
                    {
                        name: 'deploy',
                        action: 'deploy-service',
                        params: {
                            service: 'api',
                            strategy: 'rolling',
                            selector: 'env=prod'
                        }
                    },
                    {
                        name: 'verify',
                        action: 'health-check',
                        params: {
                            service: 'api',
                            timeout: 300
                        }
                    },
                    {
                        name: 'notify',
                        action: 'send-notification',
                        params: {
                            channel: 'slack',
                            message: 'Production deployment complete'
                        },
                        on_error: 'continue'
                    }
                ]
            };

            console.log(chalk.bold.cyan('\n⚙️  Example Workflow\n'));
            console.log(chalk.gray('Save this to ~/.blackroad/workflows/deploy-production.yaml:\n'));
            console.log(yaml.dump(example));
        });
}
