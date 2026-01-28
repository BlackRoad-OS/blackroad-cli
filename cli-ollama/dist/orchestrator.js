import { streamChat } from './ollama.js';
import { Renderer } from './renderer.js';
export async function runPrompt(config, prompt) {
    const renderer = new Renderer(config.ui);
    if (config.orchestrator.mode === 'round') {
        await runRoundRobin(config, prompt, renderer);
        return;
    }
    await runParallel(config, prompt, renderer);
}
async function runParallel(config, prompt, renderer) {
    const tasks = config.agents.map(agent => runAgent(config.ollama.host, agent, prompt, renderer, undefined));
    await Promise.all(tasks);
}
async function runRoundRobin(config, prompt, renderer) {
    let history = [{ role: 'user', content: prompt }];
    for (const agent of config.agents) {
        const response = await runAgent(config.ollama.host, agent, prompt, renderer, history);
        history = history.concat({
            role: 'assistant',
            content: `${agent.name}: ${response}`
        });
    }
}
async function runAgent(host, agent, prompt, renderer, history) {
    const messages = buildMessages(agent, prompt, history);
    const request = {
        host,
        model: agent.model,
        messages,
        ...(typeof agent.temperature === 'number' ? { temperature: agent.temperature } : {}),
        ...(typeof agent.top_p === 'number' ? { top_p: agent.top_p } : {})
    };
    let response = '';
    try {
        response = await streamChat(request, chunk => renderer.write(agent.name, chunk));
    }
    finally {
        renderer.finalize(agent.name);
    }
    return response;
}
function buildMessages(agent, prompt, history) {
    const messages = [];
    if (agent.system) {
        messages.push({ role: 'system', content: agent.system });
    }
    if (history && history.length > 0) {
        messages.push(...history);
        return messages;
    }
    messages.push({ role: 'user', content: prompt });
    return messages;
}
//# sourceMappingURL=orchestrator.js.map