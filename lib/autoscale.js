// BR-CLI Auto-scaling Engine
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import os from 'os';

class AutoScaler {
    constructor() {
        this.configDir = path.join(os.homedir(), '.blackroad', 'autoscale');
        this.ensureConfigDir();
        this.rules = this.loadRules();
    }

    ensureConfigDir() {
        if (!fs.existsSync(this.configDir)) {
            fs.mkdirSync(this.configDir, { recursive: true });
        }
    }

    loadRules() {
        const rulesFile = path.join(this.configDir, 'rules.json');
        if (fs.existsSync(rulesFile)) {
            return JSON.parse(fs.readFileSync(rulesFile, 'utf-8'));
        }
        return [];
    }

    saveRules() {
        const rulesFile = path.join(this.configDir, 'rules.json');
        fs.writeFileSync(rulesFile, JSON.stringify(this.rules, null, 2));
    }

    /**
     * Add scaling rule
     */
    addRule(rule) {
        this.rules.push({
            id: Date.now().toString(),
            ...rule,
            createdAt: new Date().toISOString()
        });
        this.saveRules();
    }

    /**
     * Evaluate if scaling is needed
     */
    evaluate(metrics) {
        const decisions = [];

        for (const rule of this.rules) {
            if (!rule.enabled) continue;

            const shouldScale = this.checkCondition(rule.condition, metrics);
            
            if (shouldScale) {
                decisions.push({
                    rule: rule.name,
                    action: rule.action,
                    target: rule.target,
                    reason: rule.reason || 'Condition met'
                });
            }
        }

        return decisions;
    }

    checkCondition(condition, metrics) {
        // Simple threshold check
        if (condition.metric && condition.operator && condition.threshold) {
            const value = metrics[condition.metric];
            
            switch (condition.operator) {
                case '>': return value > condition.threshold;
                case '<': return value < condition.threshold;
                case '>=': return value >= condition.threshold;
                case '<=': return value <= condition.threshold;
                default: return false;
            }
        }
        
        return false;
    }

    /**
     * Execute scaling action
     */
    async scale(service, action, amount) {
        console.log(chalk.cyan(`\n⚡ Scaling ${service}: ${action} by ${amount}\n`));
        
        // Mock scaling operation
        return {
            service,
            action,
            amount,
            previousCount: 3,
            newCount: action === 'scale-up' ? 5 : 2,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Get scaling history
     */
    getHistory() {
        const historyFile = path.join(this.configDir, 'history.json');
        if (fs.existsSync(historyFile)) {
            return JSON.parse(fs.readFileSync(historyFile, 'utf-8'));
        }
        return [];
    }

    /**
     * Record scaling event
     */
    recordEvent(event) {
        const history = this.getHistory();
        history.push({
            ...event,
            timestamp: new Date().toISOString()
        });
        
        const historyFile = path.join(this.configDir, 'history.json');
        fs.writeFileSync(historyFile, JSON.stringify(history.slice(-100), null, 2));
    }
}

export default AutoScaler;
