import { env } from '../config/env.js';
import { setupRequired } from '../utils/errors.js';

const PROVIDER_DEFAULTS = {
  openai: 'https://api.openai.com/v1',
  together: 'https://api.together.xyz/v1',
  stability: 'https://api.stability.ai',
};

export const IMAGE_STYLES = [
  'cinematic',
  'photorealistic',
  'digital art',
  'illustration',
  'anime',
  '3d render',
  'holographic',
  'abstract',
];

export const ASPECT_RATIOS = ['1:1', '3:2', '2:3', '16:9', '9:16'];

const RATIO_SIZES = {
  '1:1': { width: 1024, height: 1024 },
  '3:2': { width: 1216, height: 832 },
  '2:3': { width: 832, height: 1216 },
  '16:9': { width: 1344, height: 768 },
  '9:16': { width: 768, height: 1344 },
};

export function imageConfigured() {
  return Boolean(env.image.apiKey);
}

function baseUrl() {
  return (env.image.baseUrl || PROVIDER_DEFAULTS[env.image.provider] || PROVIDER_DEFAULTS.openai).replace(/\/$/, '');
}

function fullPrompt(prompt, style) {
  return style && style !== 'none' ? `${prompt}, ${style} style` : prompt;
}

async function parseProviderResponse(response, provider) {
  const contentType = response.headers.get('content-type') || '';

  if (provider === 'stability') {
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Image provider error: ${text.slice(0, 300)}`);
    }
    const payload = await response.json();
    const base64 = payload?.artifacts?.[0]?.base64;
    if (!base64) throw new Error('The image provider returned no image data.');
    return { buffer: Buffer.from(base64, 'base64'), mimeType: 'image/png' };
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    let message = `The image provider returned ${response.status}.`;
    try {
      const parsed = JSON.parse(text);
      message = parsed?.error?.message || parsed?.message || message;
    } catch {
      /* non-JSON error */
    }
    throw new Error(`Image provider error: ${message}`.slice(0, 400));
  }

  if (contentType.includes('image/')) {
    return { buffer: Buffer.from(await response.arrayBuffer()), mimeType: contentType.split(';')[0] };
  }

  const payload = await response.json();
  const item = payload?.data?.[0] || payload?.images?.[0] || payload;
  if (item?.b64_json || item?.base64) {
    return {
      buffer: Buffer.from(item.b64_json || item.base64, 'base64'),
      mimeType: 'image/png',
    };
  }
  if (item?.url) {
    const imageResponse = await fetch(item.url);
    if (!imageResponse.ok) throw new Error('Could not download the generated image.');
    return {
      buffer: Buffer.from(await imageResponse.arrayBuffer()),
      mimeType: imageResponse.headers.get('content-type')?.split(';')[0] || 'image/png',
    };
  }
  throw new Error('The image provider returned an unsupported response.');
}

export async function generateImage({ prompt, style, aspectRatio }) {
  if (!imageConfigured()) {
    throw setupRequired(
      'Image generation is not configured yet. Add IMAGE_API_KEY and IMAGE_PROVIDER to server/.env, then restart the server.',
      'IMAGE_NOT_CONFIGURED',
    );
  }

  const provider = env.image.provider;
  const finalPrompt = fullPrompt(prompt, style);
  const size = RATIO_SIZES[aspectRatio] || RATIO_SIZES['1:1'];
  const model = env.image.model;

  let response;

  if (provider === 'stability') {
    response = await fetch(`${baseUrl()}/v1/generation/${encodeURIComponent(model)}/text-to-image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.image.apiKey}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text_prompts: [{ text: finalPrompt, weight: 1 }],
        width: size.width,
        height: size.height,
        samples: 1,
        cfg_scale: 7,
        steps: 30,
      }),
    });
  } else if (provider === 'together') {
    response = await fetch(`${baseUrl()}/images/generations`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.image.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt: finalPrompt,
        width: size.width,
        height: size.height,
        n: 1,
      }),
    });
  } else {
    const openAiSize = model.includes('dall-e')
      ? aspectRatio === '16:9' || aspectRatio === '3:2'
        ? '1792x1024'
        : aspectRatio === '9:16' || aspectRatio === '2:3'
          ? '1024x1792'
          : '1024x1024'
      : aspectRatio === '16:9' || aspectRatio === '3:2'
        ? '1536x1024'
        : aspectRatio === '9:16' || aspectRatio === '2:3'
          ? '1024x1536'
          : '1024x1024';

    const body = { model, prompt: finalPrompt, n: 1, size: openAiSize };
    if (model.includes('dall-e')) body.response_format = 'b64_json';

    response = await fetch(`${baseUrl()}/images/generations`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.image.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  }

  const { buffer, mimeType } = await parseProviderResponse(response, provider);
  return { buffer, mimeType, model, provider };
}
