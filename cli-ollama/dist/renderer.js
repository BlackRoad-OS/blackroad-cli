export class Renderer {
    states = new Map();
    prefixStyle;
    constructor(ui) {
        this.prefixStyle = ui?.prefixStyle ?? 'brackets';
    }
    write(agentName, text) {
        if (!text)
            return;
        const state = this.getState(agentName);
        const parts = text.split('\n');
        const prefix = this.formatPrefix(agentName);
        parts.forEach((part, index) => {
            if (part.length > 0) {
                if (state.atLineStart) {
                    process.stdout.write(prefix);
                }
                process.stdout.write(part);
                state.atLineStart = false;
            }
            if (index < parts.length - 1) {
                process.stdout.write('\n');
                state.atLineStart = true;
            }
        });
    }
    finalize(agentName) {
        const state = this.getState(agentName);
        if (!state.atLineStart) {
            process.stdout.write('\n');
            state.atLineStart = true;
        }
    }
    formatPrefix(agentName) {
        if (this.prefixStyle === 'brackets') {
            return `[${agentName}] `;
        }
        return `${agentName}: `;
    }
    getState(agentName) {
        const existing = this.states.get(agentName);
        if (existing)
            return existing;
        const state = { atLineStart: true };
        this.states.set(agentName, state);
        return state;
    }
}
//# sourceMappingURL=renderer.js.map