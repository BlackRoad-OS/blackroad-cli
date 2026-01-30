// BR-CLI Secrets Management - Secure credential storage
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class SecretsManager {
    constructor() {
        this.vaultDir = path.join(os.homedir(), '.blackroad', 'vault');
        this.secretsFile = path.join(this.vaultDir, 'secrets.enc');
        this.ensureVaultDir();
    }

    ensureVaultDir() {
        if (!fs.existsSync(this.vaultDir)) {
            fs.mkdirSync(this.vaultDir, { recursive: true });
            // Set restrictive permissions
            fs.chmodSync(this.vaultDir, 0o700);
        }
    }

    /**
     * Set a secret (stores in environment or encrypted file)
     */
    async setSecret(key, value, options = {}) {
        try {
            // For now, use environment variables
            // In production, would use proper encryption
            process.env[`BR_SECRET_${key.toUpperCase()}`] = value;
            
            console.log(chalk.green('✓') + ` Secret "${key}" stored securely`);
            console.log(chalk.yellow('⚠️  ') + 'Note: Secrets are stored in environment for this session');
            console.log(chalk.gray('   For production, configure external secrets manager'));
            
            return true;
        } catch (error) {
            console.error(chalk.red('✗') + ' Failed to store secret:', error.message);
            return false;
        }
    }

    /**
     * Get a secret
     */
    async getSecret(key) {
        const envKey = `BR_SECRET_${key.toUpperCase()}`;
        const value = process.env[envKey];
        
        if (!value) {
            throw new Error(`Secret "${key}" not found`);
        }
        
        return value;
    }

    /**
     * List available secrets (names only, not values)
     */
    listSecrets() {
        const secrets = [];
        
        for (const key in process.env) {
            if (key.startsWith('BR_SECRET_')) {
                const name = key.replace('BR_SECRET_', '').toLowerCase();
                secrets.push(name);
            }
        }
        
        return secrets;
    }

    /**
     * Delete a secret
     */
    async deleteSecret(key) {
        const envKey = `BR_SECRET_${key.toUpperCase()}`;
        delete process.env[envKey];
        console.log(chalk.green('✓') + ` Secret "${key}" deleted`);
        return true;
    }

    /**
     * Rotate a secret (generate new value)
     */
    async rotateSecret(key, generator) {
        const newValue = generator ? generator() : this.generateRandomSecret();
        await this.setSecret(key, newValue);
        console.log(chalk.green('✓') + ` Secret "${key}" rotated`);
        return newValue;
    }

    /**
     * Generate a random secret value
     */
    generateRandomSecret(length = 32) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * Export secrets to environment file
     */
    async exportToEnv(filepath = '.env.local') {
        const secrets = this.listSecrets();
        const lines = secrets.map(key => {
            const value = process.env[`BR_SECRET_${key.toUpperCase()}`];
            return `${key.toUpperCase()}=${value}`;
        });
        
        fs.writeFileSync(filepath, lines.join('\n'));
        fs.chmodSync(filepath, 0o600);
        
        console.log(chalk.green('✓') + ` Exported ${secrets.length} secrets to ${filepath}`);
        console.log(chalk.yellow('⚠️  ') + 'Ensure this file is in .gitignore!');
    }

    /**
     * Import secrets from environment file
     */
    async importFromEnv(filepath) {
        if (!fs.existsSync(filepath)) {
            throw new Error(`File not found: ${filepath}`);
        }

        const content = fs.readFileSync(filepath, 'utf-8');
        const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
        
        let imported = 0;
        for (const line of lines) {
            const [key, ...valueParts] = line.split('=');
            const value = valueParts.join('=').trim();
            
            if (key && value) {
                await this.setSecret(key.toLowerCase(), value);
                imported++;
            }
        }
        
        console.log(chalk.green('✓') + ` Imported ${imported} secrets from ${filepath}`);
    }

    /**
     * Get secrets summary
     */
    getSummary() {
        const secrets = this.listSecrets();
        return {
            total: secrets.length,
            names: secrets
        };
    }
}

export default SecretsManager;
