import { env } from '../config/env.js';
import { setupRequired } from '../utils/errors.js';

const PROVIDER_DEFAULTS = {
  openai: 'https://api.openai.com/v1',
  groq: 'https://api.groq.com/openai/v1',
  openrouter: 'https://openrouter.ai/api/v1',
  together: 'https://api.together.xyz/v1',
};

export function chatConfigured() {
  return Boolean(env.ai.apiKey);
}

function baseUrl() {
  return (env.ai.baseUrl || PROVIDER_DEFAULTS[env.ai.provider] || PROVIDER_DEFAULTS.openai).replace(/\/$/, '');
}

function extraHeaders() {
  if (env.ai.provider === 'openrouter') {
    return { 'HTTP-Referer': env.clientUrl, 'X-Title': 'AETHRA' };
  }
  return {};
}

export async function streamChatCompletion({ messages, onToken, signal }) {
  if (!chatConfigured()) {
    throw setupRequired(
      'AI chat is not configured yet. Add AI_API_KEY and AI_PROVIDER to server/.env, then restart the server.',
      'AI_NOT_CONFIGURED',
    );
  }

  const response = await fetch(`${baseUrl()}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.ai.apiKey}`,
      ...extraHeaders(),
    },
    body: JSON.stringify({
      model: env.ai.model,
      messages: messages.map(({ role, content }) => ({
        role,
        content: String(content).slice(0, 12_000),
      })),
      temperature: env.ai.temperature,
      max_tokens: env.ai.maxTokens,
      stream: true,
    }),
    signal,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    let message = `The AI provider returned ${response.status}.`;
    try {
      const parsed = JSON.parse(detail);
      message = parsed?.error?.message || parsed?.message || message;
    } catch {
      /* non-JSON error body */
    }
    throw new Error(`AI provider error: ${message}`.slice(0, 400));
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';
  let finished = false;

  while (!finished) {
    const chunk = await reader.read();
    if (chunk.done) break;

    buffer += decoder.decode(chunk.value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line.startsWith('data:')) continue;
      const data = line.slice(5).trim();
      if (data === '[DONE]') {
        finished = true;
        break;
      }
      try {
        const event = JSON.parse(data);
        const token = event.choices?.[0]?.delta?.content;
        if (token) {
          fullText += token;
          onToken?.(token);
        }
      } catch {
        /* skip malformed keep-alive frames */
      }
    }
  }

  if (!fullText.trim()) {
    throw new Error('The AI provider returned an empty response. Please try again.');
  }

  return { text: fullText, model: env.ai.model };
}
