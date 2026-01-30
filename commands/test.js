// BR-CLI Test Command
import chalk from 'chalk';
import TestRunner from '../lib/testing.js';
import Table from 'cli-table3';
import ora from 'ora';

export async function testCommand(program) {
    const runner = new TestRunner();

    const cmd = program
        .command('test')
        .description('Run tests and health checks');

    // Run tests
    cmd
        .command('run [pattern]')
        .description('Run test suite')
        .option('-w, --watch', 'Watch mode')
        .action(async (pattern, options) => {
            console.log(chalk.bold.cyan('\n🧪 Running Tests\n'));
            
            const spinner = ora('Executing tests...').start();

            try {
                const results = await runner.runTests(pattern);
                spinner.stop();

                // Display results
                const passRate = ((results.passed / results.total) * 100).toFixed(1);
                
                console.log(chalk.bold.cyan('\n📊 Test Results\n'));
                console.log(chalk.green('Passed:  '), results.passed);
                console.log(chalk.red('Failed:  '), results.failed);
                console.log(chalk.yellow('Skipped: '), results.skipped);
                console.log(chalk.cyan('Total:   '), results.total);
                console.log(chalk.cyan('Pass Rate:'), `${passRate}%`);

                if (results.failed > 0) {
                    console.log(chalk.red('\n✗ Some tests failed\n'));
                    process.exit(1);
                } else {
                    console.log(chalk.green('\n✓ All tests passed!\n'));
                }
            } catch (error) {
                spinner.fail(chalk.red('Test execution failed'));
                console.error(chalk.red('Error:'), error.message);
                process.exit(1);
            }
        });

    // Health check
    cmd
        .command('health <url>')
        .description('Run health check on a URL')
        .action(async (url) => {
            const spinner = ora(`Checking ${url}...`).start();

            try {
                const result = await runner.healthCheck(url);
                
                if (result.status === 'healthy') {
                    spinner.succeed(chalk.green(`${url} is healthy`));
                } else {
                    spinner.fail(chalk.red(`${url} is unhealthy`));
                    console.error(chalk.red('Error:'), result.error);
                    process.exit(1);
                }
            } catch (error) {
                spinner.fail(chalk.red('Health check failed'));
                console.error(chalk.red('Error:'), error.message);
                process.exit(1);
            }
        });

    // Load test
    cmd
        .command('load <url>')
        .description('Run load test')
        .option('-n, --requests <n>', 'Number of requests', '100')
        .option('-c, --concurrency <n>', 'Concurrent requests', '10')
        .action(async (url, options) => {
            console.log(chalk.bold.cyan(`\n⚡ Load Testing: ${url}\n`));
            console.log(chalk.gray('Requests:   '), options.requests);
            console.log(chalk.gray('Concurrency:'), options.concurrency);

            const spinner = ora('Running load test...').start();

            try {
                const result = await runner.loadTest(url, {
                    requests: parseInt(options.requests),
                    concurrency: parseInt(options.concurrency)
                });

                spinner.succeed(chalk.green('Load test complete'));

                console.log(chalk.bold.cyan('\n📊 Results\n'));
                console.log(chalk.green('Successful:  '), result.summary.successful);
                console.log(chalk.red('Failed:      '), result.summary.failed);
                console.log(chalk.cyan('Avg Latency: '), result.summary.avgLatency);
                console.log(chalk.cyan('P95 Latency: '), result.summary.p95Latency);
                console.log(chalk.cyan('P99 Latency: '), result.summary.p99Latency);
            } catch (error) {
                spinner.fail(chalk.red('Load test failed'));
                console.error(chalk.red('Error:'), error.message);
                process.exit(1);
            }
        });

    // Test results history
    cmd
        .command('history')
        .description('View test results history')
        .option('-n, --limit <n>', 'Number of results', '10')
        .action((options) => {
            const results = runner.getResults(parseInt(options.limit));

            if (results.length === 0) {
                console.log(chalk.yellow('No test results found'));
                return;
            }

            const table = new Table({
                head: ['Timestamp', 'Total', 'Passed', 'Failed', 'Pass Rate'],
                style: { head: ['cyan'] }
            });

            results.forEach(r => {
                const passRate = ((r.passed / r.total) * 100).toFixed(1);
                table.push([
                    new Date(r.timestamp).toLocaleString(),
                    r.total,
                    chalk.green(r.passed),
                    chalk.red(r.failed),
                    `${passRate}%`
                ]);
            });

            console.log(table.toString());
        });
}
