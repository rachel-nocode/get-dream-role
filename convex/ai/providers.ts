/**
 * Provider and model registry for bring-your-own-key (BYOK) generation.
 *
 * Plain TypeScript on purpose: this module is imported by Convex functions,
 * by Node-runtime actions, and by the settings UI, so it must not depend on
 * the Convex runtime. It contains public catalogue data only, never secrets.
 */

export type ProviderId =
  | "anthropic"
  | "openai"
  | "google"
  | "groq"
  | "openrouter"
  | "mistral"
  | "deepseek"
  | "xai";

/** How the key is presented when pinging the provider's validation endpoint. */
export type ValidateAuth = "bearer" | "query" | "anthropic-header";

/** Structured-output style the provider's chat completions endpoint accepts. */
export type JsonMode = "json_schema" | "json_object";

export type ModelTier = "free" | "cheap" | "value" | "best";

export type ModelInfo = {
  id: string;
  label: string;
  /** USD per 1M input tokens. */
  inputPerM: number;
  /** USD per 1M output tokens. */
  outputPerM: number;
  /** Context window in thousands of tokens. */
  contextK: number;
  tier: ModelTier;
  recommended?: boolean;
};

export type ProviderInfo = {
  id: ProviderId;
  label: string;
  /** Chat completions base URL (OpenAI compatible for every provider but Anthropic). */
  baseUrl: string;
  /** Prefix a valid key usually starts with, or null when the provider has none. */
  keyPrefixHint: string | null;
  /** Cheap GET endpoint used to check a key before storing it. */
  validateUrl: string;
  validateAuth: ValidateAuth;
  jsonMode: JsonMode;
  /** Where the user creates a key. */
  docsUrl: string;
  models: ModelInfo[];
};

export const PROVIDERS: Record<ProviderId, ProviderInfo> = {
  anthropic: {
    id: "anthropic",
    label: "Anthropic",
    baseUrl: "https://api.anthropic.com/v1",
    keyPrefixHint: "sk-ant-",
    validateUrl: "https://api.anthropic.com/v1/models",
    validateAuth: "anthropic-header",
    jsonMode: "json_schema",
    docsUrl: "https://console.anthropic.com/settings/keys",
    models: [
      {
        id: "claude-opus-5",
        label: "Opus 5",
        inputPerM: 5,
        outputPerM: 25,
        contextK: 1000,
        tier: "best",
      },
      {
        id: "claude-sonnet-5",
        label: "Sonnet 5",
        inputPerM: 2,
        outputPerM: 10,
        contextK: 1000,
        tier: "value",
        recommended: true,
      },
      {
        id: "claude-haiku-4-5",
        label: "Haiku 4.5",
        inputPerM: 1,
        outputPerM: 5,
        contextK: 200,
        tier: "cheap",
      },
    ],
  },
  openai: {
    id: "openai",
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    keyPrefixHint: "sk-",
    validateUrl: "https://api.openai.com/v1/models",
    validateAuth: "bearer",
    jsonMode: "json_schema",
    docsUrl: "https://platform.openai.com/api-keys",
    models: [
      {
        id: "gpt-5-mini",
        label: "GPT-5 mini",
        inputPerM: 0.25,
        outputPerM: 2,
        contextK: 400,
        tier: "value",
        recommended: true,
      },
      {
        id: "gpt-5.4-nano",
        label: "GPT-5.4 nano",
        inputPerM: 0.2,
        outputPerM: 1.25,
        contextK: 400,
        tier: "cheap",
      },
      {
        id: "gpt-5-nano",
        label: "GPT-5 nano",
        inputPerM: 0.05,
        outputPerM: 0.4,
        contextK: 400,
        tier: "cheap",
      },
    ],
  },
  google: {
    id: "google",
    label: "Google AI Studio",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    keyPrefixHint: "AIza",
    validateUrl: "https://generativelanguage.googleapis.com/v1beta/models",
    validateAuth: "query",
    jsonMode: "json_schema",
    docsUrl: "https://aistudio.google.com/app/apikey",
    models: [
      {
        id: "gemini-3.1-flash-lite",
        label: "Gemini 3.1 Flash Lite",
        inputPerM: 0.25,
        outputPerM: 1.5,
        contextK: 1000,
        tier: "free",
        recommended: true,
      },
      {
        id: "gemini-3.5-flash-lite",
        label: "Gemini 3.5 Flash Lite",
        inputPerM: 0.3,
        outputPerM: 2.5,
        contextK: 1000,
        tier: "cheap",
      },
    ],
  },
  groq: {
    id: "groq",
    label: "Groq",
    baseUrl: "https://api.groq.com/openai/v1",
    keyPrefixHint: "gsk_",
    validateUrl: "https://api.groq.com/openai/v1/models",
    validateAuth: "bearer",
    jsonMode: "json_schema",
    docsUrl: "https://console.groq.com/keys",
    models: [
      {
        id: "openai/gpt-oss-120b",
        label: "GPT-OSS 120B",
        inputPerM: 0.15,
        outputPerM: 0.6,
        contextK: 131,
        tier: "free",
        recommended: true,
      },
      {
        id: "openai/gpt-oss-20b",
        label: "GPT-OSS 20B",
        inputPerM: 0.075,
        outputPerM: 0.3,
        contextK: 131,
        tier: "free",
      },
    ],
  },
  openrouter: {
    id: "openrouter",
    label: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    keyPrefixHint: "sk-or-",
    validateUrl: "https://openrouter.ai/api/v1/key",
    validateAuth: "bearer",
    jsonMode: "json_schema",
    docsUrl: "https://openrouter.ai/keys",
    models: [
      {
        id: "anthropic/claude-sonnet-5",
        label: "Sonnet 5 (via OpenRouter)",
        inputPerM: 2,
        outputPerM: 10,
        contextK: 1000,
        tier: "value",
        recommended: true,
      },
      {
        id: "openai/gpt-5-mini",
        label: "GPT-5 mini (via OpenRouter)",
        inputPerM: 0.25,
        outputPerM: 2,
        contextK: 400,
        tier: "cheap",
      },
    ],
  },
  mistral: {
    id: "mistral",
    label: "Mistral",
    baseUrl: "https://api.mistral.ai/v1",
    keyPrefixHint: null,
    validateUrl: "https://api.mistral.ai/v1/models",
    validateAuth: "bearer",
    jsonMode: "json_schema",
    docsUrl: "https://console.mistral.ai/api-keys",
    models: [
      {
        id: "mistral-small-latest",
        label: "Mistral Small",
        inputPerM: 0.15,
        outputPerM: 0.6,
        contextK: 128,
        tier: "cheap",
        recommended: true,
      },
    ],
  },
  deepseek: {
    id: "deepseek",
    label: "DeepSeek",
    baseUrl: "https://api.deepseek.com/v1",
    keyPrefixHint: "sk-",
    validateUrl: "https://api.deepseek.com/v1/models",
    validateAuth: "bearer",
    jsonMode: "json_object",
    docsUrl: "https://platform.deepseek.com/api_keys",
    models: [
      {
        id: "deepseek-v4-flash",
        label: "DeepSeek V4 Flash",
        inputPerM: 0.3,
        outputPerM: 1.2,
        contextK: 128,
        tier: "cheap",
        recommended: true,
      },
    ],
  },
  xai: {
    id: "xai",
    label: "xAI",
    baseUrl: "https://api.x.ai/v1",
    keyPrefixHint: "xai-",
    validateUrl: "https://api.x.ai/v1/models",
    validateAuth: "bearer",
    jsonMode: "json_schema",
    docsUrl: "https://console.x.ai",
    models: [
      {
        id: "grok-4.1-fast",
        label: "Grok 4.1 Fast",
        inputPerM: 0.2,
        outputPerM: 0.5,
        contextK: 2000,
        tier: "cheap",
        recommended: true,
      },
    ],
  },
};

export const PROVIDER_IDS = Object.keys(PROVIDERS) as ProviderId[];

export const PROVIDER_LIST: ProviderInfo[] = PROVIDER_IDS.map((id) => PROVIDERS[id]);

/** Free trial fallback used when a user has not added a key of their own. */
export const HOUSE_PROVIDER: ProviderId = "groq";
export const HOUSE_MODEL = "openai/gpt-oss-120b";

/** Research assumption: one full application is ~4 calls at this size. */
export const APPLICATION_INPUT_TOKENS = 12_000;
export const APPLICATION_OUTPUT_TOKENS = 3_500;

/** One resume parse: the pasted resume in, the fact registry out. */
export const PARSE_PROFILE_INPUT_TOKENS = 2_500;
export const PARSE_PROFILE_OUTPUT_TOKENS = 1_500;

/** One fit score: profile summary plus a trimmed posting in, a verdict out. */
export const SCORE_INPUT_TOKENS = 1_600;
export const SCORE_OUTPUT_TOKENS = 300;

export function isProviderId(value: string): value is ProviderId {
  return Object.prototype.hasOwnProperty.call(PROVIDERS, value);
}

export function findProvider(provider: string): ProviderInfo | null {
  return isProviderId(provider) ? PROVIDERS[provider] : null;
}

export function findModel(provider: string, modelId: string): ModelInfo | null {
  const info = findProvider(provider);
  if (!info) return null;
  return info.models.find((model) => model.id === modelId) ?? null;
}

/** The recommended model for a provider, falling back to its first entry. */
export function defaultModelFor(provider: ProviderId): ModelInfo {
  const models = PROVIDERS[provider].models;
  return models.find((model) => model.recommended) ?? models[0];
}

export function estimateCostUsd(
  model: ModelInfo,
  tokensIn: number,
  tokensOut: number,
): number {
  const input = (Math.max(0, tokensIn) / 1_000_000) * model.inputPerM;
  const output = (Math.max(0, tokensOut) / 1_000_000) * model.outputPerM;
  return roundUsd(input + output);
}

export function estimateCostPerApplication(model: ModelInfo): number {
  return estimateCostUsd(model, APPLICATION_INPUT_TOKENS, APPLICATION_OUTPUT_TOKENS);
}

export function estimateParseProfileCost(model: ModelInfo): number {
  return estimateCostUsd(model, PARSE_PROFILE_INPUT_TOKENS, PARSE_PROFILE_OUTPUT_TOKENS);
}

export function estimateScoringCost(model: ModelInfo, jobs: number): number {
  const count = Math.max(0, Math.round(jobs));
  return estimateCostUsd(model, SCORE_INPUT_TOKENS * count, SCORE_OUTPUT_TOKENS * count);
}

/** Cost per application for a (provider, model) pair, or null when unknown. */
export function costPerApplicationFor(provider: string, modelId: string): number | null {
  const model = findModel(provider, modelId);
  return model ? estimateCostPerApplication(model) : null;
}

export function formatUsd(amount: number): string {
  if (amount === 0) return "$0";
  if (amount < 0.01) return `$${amount.toFixed(4)}`;
  if (amount < 1) return `$${amount.toFixed(3)}`;
  return `$${amount.toFixed(2)}`;
}

function roundUsd(amount: number): number {
  return Math.round(amount * 1_000_000) / 1_000_000;
}

export type PresetId = "free" | "cheap" | "value" | "quality";

export type Preset = {
  id: PresetId;
  label: string;
  description: string;
  provider: ProviderId;
  model: string;
};

export const PRESETS: Preset[] = [
  {
    id: "free",
    label: "Free",
    description: "Generous free tier from Google AI Studio. Groq GPT-OSS 120B is the backup.",
    provider: "google",
    model: "gemini-3.1-flash-lite",
  },
  {
    id: "cheap",
    label: "Cheap",
    description: "Pennies per application with solid structured output.",
    provider: "openai",
    model: "gpt-5-mini",
  },
  {
    id: "value",
    label: "Best value",
    description: "The default once an Anthropic key is added. Strongest writing per dollar.",
    provider: "anthropic",
    model: "claude-sonnet-5",
  },
  {
    id: "quality",
    label: "Best quality",
    description: "Highest quality tailoring when the role really matters.",
    provider: "anthropic",
    model: "claude-opus-5",
  },
];
