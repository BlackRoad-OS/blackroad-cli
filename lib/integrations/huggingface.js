/**
 * BlackRoad OS - Hugging Face Integration
 * Full integration for AI models and inference
 */

const HF_API_BASE = 'https://api-inference.huggingface.co';
const HF_HUB_API = 'https://huggingface.co/api';

class HuggingFaceIntegration {
  constructor(token = process.env.HUGGINGFACE_TOKEN) {
    this.token = token;
    this.organization = process.env.HUGGINGFACE_ORG || 'blackroad-os';
  }

  /**
   * Make authenticated request to Hugging Face API
   */
  async request(url, method = 'GET', body = null, isJson = true) {
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    };

    if (isJson) {
      options.headers['Content-Type'] = 'application/json';
    }

    if (body) {
      options.body = isJson ? JSON.stringify(body) : body;
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(`Hugging Face API Error: ${error.error || response.statusText}`);
    }

    return response.json();
  }

  // ============================================================
  // INFERENCE API
  // ============================================================

  /**
   * Text generation (LLMs)
   */
  async generateText(model, prompt, options = {}) {
    const {
      maxNewTokens = 256,
      temperature = 0.7,
      topP = 0.95,
      topK = 50,
      repetitionPenalty = 1.1,
      doSample = true,
      returnFullText = false
    } = options;

    const response = await this.request(
      `${HF_API_BASE}/models/${model}`,
      'POST',
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: maxNewTokens,
          temperature,
          top_p: topP,
          top_k: topK,
          repetition_penalty: repetitionPenalty,
          do_sample: doSample,
          return_full_text: returnFullText
        }
      }
    );

    return response[0]?.generated_text || response;
  }

  /**
   * Chat completion (conversational models)
   */
  async chat(model, messages, options = {}) {
    const {
      maxNewTokens = 512,
      temperature = 0.7,
      topP = 0.95
    } = options;

    // Format messages for chat models
    const prompt = messages.map(m => {
      if (m.role === 'system') return `<|system|>\n${m.content}</s>`;
      if (m.role === 'user') return `<|user|>\n${m.content}</s>`;
      if (m.role === 'assistant') return `<|assistant|>\n${m.content}</s>`;
      return m.content;
    }).join('\n') + '\n<|assistant|>\n';

    return this.generateText(model, prompt, {
      maxNewTokens,
      temperature,
      topP
    });
  }

  /**
   * Text embeddings
   */
  async getEmbeddings(model, texts) {
    const inputs = Array.isArray(texts) ? texts : [texts];

    return this.request(
      `${HF_API_BASE}/models/${model}`,
      'POST',
      { inputs }
    );
  }

  /**
   * Question answering
   */
  async questionAnswering(model, question, context) {
    return this.request(
      `${HF_API_BASE}/models/${model}`,
      'POST',
      {
        inputs: { question, context }
      }
    );
  }

  /**
   * Text classification
   */
  async classify(model, text) {
    return this.request(
      `${HF_API_BASE}/models/${model}`,
      'POST',
      { inputs: text }
    );
  }

  /**
   * Named entity recognition
   */
  async ner(model, text) {
    return this.request(
      `${HF_API_BASE}/models/${model}`,
      'POST',
      { inputs: text }
    );
  }

  /**
   * Summarization
   */
  async summarize(model, text, options = {}) {
    const { maxLength = 130, minLength = 30 } = options;

    return this.request(
      `${HF_API_BASE}/models/${model}`,
      'POST',
      {
        inputs: text,
        parameters: { max_length: maxLength, min_length: minLength }
      }
    );
  }

  /**
   * Translation
   */
  async translate(model, text) {
    return this.request(
      `${HF_API_BASE}/models/${model}`,
      'POST',
      { inputs: text }
    );
  }

  /**
   * Image classification
   */
  async classifyImage(model, imageBuffer) {
    return this.request(
      `${HF_API_BASE}/models/${model}`,
      'POST',
      imageBuffer,
      false
    );
  }

  /**
   * Image generation (Stable Diffusion, etc.)
   */
  async generateImage(model, prompt, options = {}) {
    const { negativePrompt, numInferenceSteps = 50, guidanceScale = 7.5 } = options;

    return this.request(
      `${HF_API_BASE}/models/${model}`,
      'POST',
      {
        inputs: prompt,
        parameters: {
          negative_prompt: negativePrompt,
          num_inference_steps: numInferenceSteps,
          guidance_scale: guidanceScale
        }
      }
    );
  }

  /**
   * Speech to text (Whisper, etc.)
   */
  async transcribeAudio(model, audioBuffer) {
    return this.request(
      `${HF_API_BASE}/models/${model}`,
      'POST',
      audioBuffer,
      false
    );
  }

  // ============================================================
  // HUB API (Model Management)
  // ============================================================

  /**
   * List models
   */
  async listModels(options = {}) {
    const params = new URLSearchParams();
    if (options.search) params.append('search', options.search);
    if (options.author) params.append('author', options.author);
    if (options.filter) params.append('filter', options.filter);
    if (options.sort) params.append('sort', options.sort);
    if (options.direction) params.append('direction', options.direction);
    if (options.limit) params.append('limit', options.limit);

    return this.request(`${HF_HUB_API}/models?${params.toString()}`);
  }

  /**
   * Get model info
   */
  async getModelInfo(modelId) {
    return this.request(`${HF_HUB_API}/models/${modelId}`);
  }

  /**
   * List organization models
   */
  async listOrgModels() {
    return this.listModels({ author: this.organization });
  }

  /**
   * Get model files
   */
  async getModelFiles(modelId) {
    return this.request(`${HF_HUB_API}/models/${modelId}/tree/main`);
  }

  /**
   * List datasets
   */
  async listDatasets(options = {}) {
    const params = new URLSearchParams();
    if (options.search) params.append('search', options.search);
    if (options.author) params.append('author', options.author);
    if (options.limit) params.append('limit', options.limit);

    return this.request(`${HF_HUB_API}/datasets?${params.toString()}`);
  }

  /**
   * Get dataset info
   */
  async getDatasetInfo(datasetId) {
    return this.request(`${HF_HUB_API}/datasets/${datasetId}`);
  }

  /**
   * List spaces
   */
  async listSpaces(options = {}) {
    const params = new URLSearchParams();
    if (options.search) params.append('search', options.search);
    if (options.author) params.append('author', options.author);
    if (options.limit) params.append('limit', options.limit);

    return this.request(`${HF_HUB_API}/spaces?${params.toString()}`);
  }

  /**
   * Get space info
   */
  async getSpaceInfo(spaceId) {
    return this.request(`${HF_HUB_API}/spaces/${spaceId}`);
  }

  // ============================================================
  // INFERENCE ENDPOINTS (Dedicated)
  // ============================================================

  /**
   * Query dedicated inference endpoint
   */
  async queryEndpoint(endpointUrl, inputs, parameters = {}) {
    return this.request(endpointUrl, 'POST', { inputs, parameters });
  }

  // ============================================================
  // BLACKROAD SPECIFIC MODELS
  // ============================================================

  /**
   * Get recommended open source models for BlackRoad
   */
  getRecommendedModels() {
    return {
      llm: [
        {
          id: 'meta-llama/Llama-3.1-70B-Instruct',
          name: 'Llama 3.1 70B',
          description: 'Best open-source general purpose LLM',
          license: 'Llama 3.1 Community',
          auditable: true,
          forkable: true
        },
        {
          id: 'mistralai/Mixtral-8x22B-Instruct-v0.1',
          name: 'Mixtral 8x22B',
          description: 'High-performance MoE model',
          license: 'Apache 2.0',
          auditable: true,
          forkable: true
        },
        {
          id: 'Qwen/Qwen2.5-72B-Instruct',
          name: 'Qwen 2.5 72B',
          description: 'Excellent multilingual model',
          license: 'Apache 2.0',
          auditable: true,
          forkable: true
        },
        {
          id: 'deepseek-ai/DeepSeek-V3',
          name: 'DeepSeek V3',
          description: 'Powerful MoE model',
          license: 'MIT',
          auditable: true,
          forkable: true
        }
      ],
      code: [
        {
          id: 'deepseek-ai/DeepSeek-Coder-V2-Instruct',
          name: 'DeepSeek Coder V2',
          description: 'Best open-source code model',
          license: 'MIT',
          auditable: true,
          forkable: true
        },
        {
          id: 'bigcode/starcoder2-15b-instruct-v0.1',
          name: 'StarCoder2 15B',
          description: 'Excellent code completion',
          license: 'BigCode OpenRAIL-M',
          auditable: true,
          forkable: true
        }
      ],
      embeddings: [
        {
          id: 'BAAI/bge-large-en-v1.5',
          name: 'BGE Large',
          description: 'Best open-source embeddings',
          license: 'MIT',
          auditable: true,
          forkable: true
        },
        {
          id: 'nomic-ai/nomic-embed-text-v1.5',
          name: 'Nomic Embed',
          description: 'Fast, efficient embeddings',
          license: 'Apache 2.0',
          auditable: true,
          forkable: true
        }
      ],
      vision: [
        {
          id: 'liuhaotian/llava-v1.6-34b',
          name: 'LLaVA 1.6 34B',
          description: 'Best open-source vision model',
          license: 'Apache 2.0',
          auditable: true,
          forkable: true
        }
      ],
      audio: [
        {
          id: 'openai/whisper-large-v3',
          name: 'Whisper Large V3',
          description: 'Best speech recognition',
          license: 'MIT',
          auditable: true,
          forkable: true
        }
      ]
    };
  }

  /**
   * Check if model is safe (auditable & forkable)
   */
  async isModelSafe(modelId) {
    try {
      const info = await this.getModelInfo(modelId);

      // Check license
      const safeLicenses = ['mit', 'apache-2.0', 'bsd', 'cc-by', 'openrail'];
      const license = (info.license || '').toLowerCase();
      const hasOpenLicense = safeLicenses.some(l => license.includes(l));

      // Check if code is available
      const hasCode = info.library_name !== null;

      // Check downloads (popularity as proxy for community review)
      const hasReviews = (info.downloads || 0) > 1000;

      return {
        modelId,
        safe: hasOpenLicense && hasCode,
        auditable: hasCode,
        forkable: hasOpenLicense,
        license: info.license,
        downloads: info.downloads,
        warnings: [
          !hasOpenLicense && 'License may restrict usage',
          !hasCode && 'Source code not available',
          !hasReviews && 'Limited community review'
        ].filter(Boolean)
      };
    } catch (error) {
      return {
        modelId,
        safe: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
export const huggingface = new HuggingFaceIntegration();
export default HuggingFaceIntegration;
