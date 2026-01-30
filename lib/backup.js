// BR-CLI Backup System - Backup and restore infrastructure
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import ora from 'ora';
import yaml from 'js-yaml';

const execAsync = promisify(exec);

class BackupManager {
    constructor() {
        this.backupDir = path.join(os.homedir(), '.blackroad', 'backups');
        this.ensureBackupDir();
    }

    ensureBackupDir() {
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    }

    /**
     * Create a backup
     */
    async createBackup(name, options = {}) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupName = name || `backup-${timestamp}`;
        const backupPath = path.join(this.backupDir, backupName);

        const backup = {
            name: backupName,
            timestamp: new Date().toISOString(),
            type: options.type || 'full',
            metadata: {
                hostname: os.hostname(),
                user: os.userInfo().username,
                platform: os.platform()
            },
            data: {}
        };

        // Backup inventory
        const inventoryPath = path.join(os.homedir(), '.blackroad', 'inventory');
        if (fs.existsSync(inventoryPath)) {
            backup.data.inventory = this.readDirectory(inventoryPath);
        }

        // Backup policies
        const policiesPath = path.join(os.homedir(), '.blackroad', 'policies');
        if (fs.existsSync(policiesPath)) {
            backup.data.policies = this.readDirectory(policiesPath);
        }

        // Backup workflows
        const workflowsPath = path.join(os.homedir(), '.blackroad', 'workflows');
        if (fs.existsSync(workflowsPath)) {
            backup.data.workflows = this.readDirectory(workflowsPath);
        }

        // Save backup
        fs.writeFileSync(backupPath + '.json', JSON.stringify(backup, null, 2));
        
        return { path: backupPath + '.json', backup };
    }

    readDirectory(dirPath) {
        const files = {};
        if (!fs.existsSync(dirPath)) return files;

        const items = fs.readdirSync(dirPath);
        for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const stat = fs.statSync(itemPath);
            
            if (stat.isFile()) {
                files[item] = fs.readFileSync(itemPath, 'utf-8');
            }
        }
        
        return files;
    }

    /**
     * List all backups
     */
    listBackups() {
        const files = fs.readdirSync(this.backupDir);
        return files
            .filter(f => f.endsWith('.json'))
            .map(f => {
                const filepath = path.join(this.backupDir, f);
                const content = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
                const stat = fs.statSync(filepath);
                
                return {
                    name: f.replace('.json', ''),
                    timestamp: content.timestamp,
                    type: content.type,
                    size: stat.size,
                    path: filepath
                };
            })
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    /**
     * Restore from backup
     */
    async restoreBackup(name) {
        const backupPath = path.join(this.backupDir, name + '.json');
        
        if (!fs.existsSync(backupPath)) {
            throw new Error(`Backup "${name}" not found`);
        }

        const backup = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
        
        // Restore inventory
        if (backup.data.inventory) {
            const inventoryPath = path.join(os.homedir(), '.blackroad', 'inventory');
            this.writeDirectory(inventoryPath, backup.data.inventory);
        }

        // Restore policies
        if (backup.data.policies) {
            const policiesPath = path.join(os.homedir(), '.blackroad', 'policies');
            this.writeDirectory(policiesPath, backup.data.policies);
        }

        // Restore workflows
        if (backup.data.workflows) {
            const workflowsPath = path.join(os.homedir(), '.blackroad', 'workflows');
            this.writeDirectory(workflowsPath, backup.data.workflows);
        }

        return backup;
    }

    writeDirectory(dirPath, files) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        for (const [filename, content] of Object.entries(files)) {
            fs.writeFileSync(path.join(dirPath, filename), content);
        }
    }

    /**
     * Delete a backup
     */
    deleteBackup(name) {
        const backupPath = path.join(this.backupDir, name + '.json');
        
        if (fs.existsSync(backupPath)) {
            fs.unlinkSync(backupPath);
            return true;
        }
        
        return false;
    }

    /**
     * Get backup details
     */
    getBackup(name) {
        const backupPath = path.join(this.backupDir, name + '.json');
        
        if (!fs.existsSync(backupPath)) {
            return null;
        }

        return JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
    }
}

export default BackupManager;
