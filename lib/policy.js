// BR-CLI Policy Engine - Enforce operational policies
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import os from 'os';
import yaml from 'js-yaml';

class PolicyEngine {
    constructor() {
        this.policyDir = path.join(os.homedir(), '.blackroad', 'policies');
        this.policies = [];
        this.ensurePolicyDir();
        this.loadPolicies();
    }

    ensurePolicyDir() {
        if (!fs.existsSync(this.policyDir)) {
            fs.mkdirSync(this.policyDir, { recursive: true });
        }
    }

    /**
     * Load all policies from disk
     */
    loadPolicies() {
        try {
            const files = fs.readdirSync(this.policyDir);
            this.policies = files
                .filter(f => f.endsWith('.yaml') || f.endsWith('.yml'))
                .map(f => {
                    const content = fs.readFileSync(path.join(this.policyDir, f), 'utf-8');
                    return yaml.load(content);
                });
        } catch (error) {
            console.debug('Failed to load policies:', error.message);
        }
    }

    /**
     * Add a new policy
     */
    addPolicy(policy) {
        const filename = `${policy.name.replace(/\s+/g, '-').toLowerCase()}.yaml`;
        const filepath = path.join(this.policyDir, filename);
        
        fs.writeFileSync(filepath, yaml.dump(policy));
        this.policies.push(policy);
        
        return filepath;
    }

    /**
     * Evaluate if an action is allowed by policies
     */
    evaluate(action, context = {}) {
        const results = {
            allowed: true,
            violations: [],
            warnings: []
        };

        for (const policy of this.policies) {
            if (!policy.enabled) continue;

            // Check if policy applies to this action
            if (policy.scope && !this.matchesScope(action, policy.scope)) {
                continue;
            }

            // Evaluate rules
            for (const rule of policy.rules || []) {
                const ruleResult = this.evaluateRule(rule, action, context);
                
                if (!ruleResult.passed) {
                    if (rule.enforcement === 'block') {
                        results.allowed = false;
                        results.violations.push({
                            policy: policy.name,
                            rule: rule.name,
                            message: rule.message || 'Policy violation'
                        });
                    } else if (rule.enforcement === 'warn') {
                        results.warnings.push({
                            policy: policy.name,
                            rule: rule.name,
                            message: rule.message || 'Policy warning'
                        });
                    }
                }
            }
        }

        return results;
    }

    evaluateRule(rule, action, context) {
        // Simple rule evaluation - can be extended
        const passed = this.checkCondition(rule.condition, action, context);
        return { passed };
    }

    checkCondition(condition, action, context) {
        if (!condition) return true;

        // Check field conditions
        if (condition.field && condition.operator && condition.value !== undefined) {
            const fieldValue = this.getFieldValue(condition.field, action, context);
            return this.compareValues(fieldValue, condition.operator, condition.value);
        }

        // Check logical operators
        if (condition.and) {
            return condition.and.every(c => this.checkCondition(c, action, context));
        }

        if (condition.or) {
            return condition.or.some(c => this.checkCondition(c, action, context));
        }

        if (condition.not) {
            return !this.checkCondition(condition.not, action, context);
        }

        return true;
    }

    getFieldValue(field, action, context) {
        // Support dot notation
        const parts = field.split('.');
        let value = { ...action, ...context };
        
        for (const part of parts) {
            value = value?.[part];
        }
        
        return value;
    }

    compareValues(actual, operator, expected) {
        switch (operator) {
            case '==':
            case 'equals':
                return actual === expected;
            case '!=':
            case 'not_equals':
                return actual !== expected;
            case '>':
            case 'greater_than':
                return actual > expected;
            case '<':
            case 'less_than':
                return actual < expected;
            case '>=':
                return actual >= expected;
            case '<=':
                return actual <= expected;
            case 'in':
                return Array.isArray(expected) && expected.includes(actual);
            case 'not_in':
                return Array.isArray(expected) && !expected.includes(actual);
            case 'matches':
                return new RegExp(expected).test(actual);
            default:
                return false;
        }
    }

    matchesScope(action, scope) {
        if (scope.commands) {
            return scope.commands.includes(action.command);
        }
        if (scope.tags) {
            return action.tags?.some(t => scope.tags.includes(t));
        }
        return true;
    }

    /**
     * Get policy summary
     */
    getSummary() {
        return {
            total: this.policies.length,
            enabled: this.policies.filter(p => p.enabled !== false).length,
            disabled: this.policies.filter(p => p.enabled === false).length,
            byScope: this.groupByScope()
        };
    }

    groupByScope() {
        const groups = {};
        for (const policy of this.policies) {
            const scope = policy.scope?.commands?.[0] || 'global';
            groups[scope] = (groups[scope] || 0) + 1;
        }
        return groups;
    }
}

export default PolicyEngine;
