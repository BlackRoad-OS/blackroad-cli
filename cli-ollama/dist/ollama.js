export async function streamChat(params, onToken) {
    const host = normalizeHost(params.host);
    const url = new URL('/api/chat', host);
    const options = {};
    if (typeof params.temperature === 'number') {
        options.temperature = params.temperature;
    }
    if (typeof params.top_p === 'number') {
        options.top_p = params.top_p;
    }
    const body = {
        model: params.model,
        messages: params.messages,
        stream: true
    };
    if (Object.keys(options).length > 0) {
        body.options = options;
    }
    let response;
    try {
        response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
    }
    catch (err) {
        throw new Error(`Failed to connect to Ollama at ${host}`);
    }
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama error ${response.status}: ${errorText.trim()}`);
    }
    if (!response.body) {
        throw new Error('Ollama response missing body');
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let full = '';
    while (true) {
        const { value, done } = await reader.read();
        if (done)
            break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed)
                continue;
            const chunk = parseChunk(trimmed);
            if (chunk.error) {
                throw new Error(`Ollama error: ${chunk.error}`);
            }
            const content = chunk.message?.content ?? '';
            if (content) {
                full += content;
                if (onToken)
                    onToken(content);
            }
            if (chunk.done) {
                return full;
            }
        }
    }
    const leftover = buffer.trim();
    if (leftover) {
        const chunk = parseChunk(leftover);
        const content = chunk.message?.content ?? '';
        if (content) {
            full += content;
            if (onToken)
                onToken(content);
        }
    }
    return full;
}
function parseChunk(line) {
    try {
        return JSON.parse(line);
    }
    catch {
        throw new Error('Invalid JSON from Ollama stream');
    }
}
function normalizeHost(host) {
    if (!host)
        return 'http://localhost:11434';
    if (host.startsWith('http://') || host.startsWith('https://')) {
        return host;
    }
    return `http://${host}`;
}
//# sourceMappingURL=ollama.js.map