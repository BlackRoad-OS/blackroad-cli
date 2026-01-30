<<<<<<< HEAD
// BR-CLI Memory Integration Module
// Enables context-aware operations with persistent memory

import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class BRMemory {
    constructor() {
        this.memoryDir = path.join(os.homedir(), '.blackroad');
        this.memoryDb = path.join(this.memoryDir, 'br-cli-memory.db');
        this.contextFile = path.join(this.memoryDir, 'br-cli-context.json');
        
        this.ensureMemoryDir();
    }

    ensureMemoryDir() {
        if (!fs.existsSync(this.memoryDir)) {
            fs.mkdirSync(this.memoryDir, { recursive: true });
        }
    }

    /**
     * Record a command execution to memory
     */
    async recordCommand(command, args, result) {
        const record = {
            command,
            args,
            result: result ? 'success' : 'failure',
            timestamp: new Date().toISOString(),
            cwd: process.cwd(),
            user: os.userInfo().username
        };

        try {
            await execAsync(
                `sqlite3 "${this.memoryDb}" "INSERT INTO command_history (command, args, result, timestamp, cwd, user) VALUES ('${command}', '${JSON.stringify(args)}', '${record.result}', '${record.timestamp}', '${record.cwd}', '${record.user}');"`
            );
        } catch (error) {
            // Memory recording is non-critical, continue silently
            console.debug('Memory recording failed:', error.message);
        }
    }

    /**
     * Get recent command history
     */
    async getHistory(limit = 10) {
        try {
            const { stdout } = await execAsync(
                `sqlite3 -json "${this.memoryDb}" "SELECT * FROM command_history ORDER BY timestamp DESC LIMIT ${limit};"`
            );
            return JSON.parse(stdout || '[]');
        } catch (error) {
            return [];
        }
    }

    /**
     * Save current context (for session continuity)
     */
    async saveContext(context) {
        try {
            fs.writeFileSync(this.contextFile, JSON.stringify(context, null, 2));
        } catch (error) {
            console.error('Failed to save context:', error.message);
        }
    }

    /**
     * Load saved context
     */
    async loadContext() {
        try {
            if (fs.existsSync(this.contextFile)) {
                return JSON.parse(fs.readFileSync(this.contextFile, 'utf-8'));
            }
        } catch (error) {
            console.error('Failed to load context:', error.message);
        }
        return null;
    }

    /**
     * Create a checkpoint
     */
    async createCheckpoint(phase, metadata = {}) {
        const checkpoint = {
            id: `checkpoint-${Date.now()}`,
            phase,
            timestamp: new Date().toISOString(),
            metadata
        };

        try {
            await execAsync(
                `./br-cli-agent-collaboration.sh checkpoint "${phase}"`
            );
            return checkpoint.id;
        } catch (error) {
            console.error('Checkpoint creation failed:', error.message);
            return null;
        }
    }

    /**
     * Query memory for intelligent suggestions
     */
    async getSuggestions(context) {
        const history = await this.getHistory(20);
        
        // Simple frequency-based suggestions
        const commandFreq = {};
        history.forEach(record => {
            commandFreq[record.command] = (commandFreq[record.command] || 0) + 1;
        });

        return Object.entries(commandFreq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([cmd]) => cmd);
=======
// BR-CLI Memory System - Persistent command history
import fs from 'fs';
import path from 'path';
import os from 'os';

class BRMemory {
    constructor() {
        this.dbPath = path.join(os.homedir(), '.blackroad', 'br-cli-history.json');
        this.ensureDir();
        this.history = this.load();
    }

    ensureDir() {
        const dir = path.dirname(this.dbPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    load() {
        if (fs.existsSync(this.dbPath)) {
            try {
                return JSON.parse(fs.readFileSync(this.dbPath, 'utf-8'));
            } catch (error) {
                return [];
            }
        }
        return [];
    }

    save() {
        try {
            fs.writeFileSync(this.dbPath, JSON.stringify(this.history, null, 2));
        } catch (error) {
            console.debug('Failed to save history:', error.message);
        }
    }

    recordCommand(command, args = {}) {
        try {
            this.history.push({
                command,
                args: JSON.stringify(args),
                timestamp: new Date().toISOString(),
                cwd: process.cwd(),
                user: os.userInfo().username
            });
            
            // Keep only last 1000 commands
            if (this.history.length > 1000) {
                this.history = this.history.slice(-1000);
            }
            
            this.save();
        } catch (error) {
            console.debug('Failed to record command:', error.message);
        }
    }

    getHistory(limit = 10) {
        return this.history.slice(-limit).reverse();
>>>>>>> fe685a4 (feat: Add policy, secrets, and workflow commands + new libs)
    }
}

export default BRMemory;
