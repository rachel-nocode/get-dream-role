/**
 * One entry point for structured LLM generation across every supported provider.
 *
 * Anthropic goes through the official SDK (native Messages API). Every other
 * provider speaks the OpenAI-compatible chat completions protocol. Callers get
 * parsed JSON plus token usage and an estimated cost.
 *
 * Because this module imports the Anthropic SDK it must only be used from a
 * `"use node"` Convex action file.
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  completionTokenLimit,
  shouldFallbackToJsonObject,
  usesGptOssReasoning,
} from "./limits";
import {
  PROVIDERS,
  estimateCostUsd,
  findModel,
  type JsonMode,
  type ProviderId,
  type ProviderInfo,
} from "./providers";

export { completionTokenLimit, shouldFallbackToJsonObject } from "./limits";

export type AiErrorKind = "auth" | "rate_limit" | "provider" | "parse";

/** Error with a user-safe message. Provider response bodies never reach it. */
export class AiError extends Error {
  readonly kind: AiErrorKind;

  constructor(kind: AiErrorKind, message: string) {
    super(scrubSecrets(message));
    this.name = "AiError";
    this.kind = kind;
  }
}

export type JsonSchema = Record<string, unknown>;

export type GenerateJsonOptions = {
  provider: ProviderId;
  model: string;
  apiKey: string;
  system: string;
  user: string;
  schema: JsonSchema;
  schemaName: string;
  maxTokens?: number;
  temperature?: number;
};

export type GenerateJsonResult<T> = {
  data: T;
  usage: { inputTokens: number; outputTokens: number };
  costUsd: number;
  provider: ProviderId;
  model: string;
};

const DEFAULT_MAX_TOKENS = 2_500;
const ANTHROPIC_VERSION = "2023-06-01";

export async function generateJson<T>(
  options: GenerateJsonOptions,
): Promise<GenerateJsonResult<T>> {
  const schema = normalizeJsonSchema(options.schema);
  const maxTokens = options.maxTokens ?? DEFAULT_MAX_TOKENS;

  const raw =
    options.provider === "anthropic"
      ? await callAnthropic({ ...options, schema, maxTokens })
      : await callOpenAiCompatible({ ...options, schema, maxTokens });

  const data = parseJsonPayload<T>(raw.text, PROVIDERS[options.provider]);
  const model = findModel(options.provider, options.model);

  return {
    data,
    usage: raw.usage,
    costUsd: model ? estimateCostUsd(model, raw.usage.inputTokens, raw.usage.outputTokens) : 0,
    provider: options.provider,
    model: options.model,
  };
}

/**
 * Pings the provider's cheap `/models` style endpoint to check a key.
 * Returns `{ throttled: true }` when the key is valid but currently limited.
 */
export async function validateApiKey(
  provider: ProviderId,
  apiKey: string,
): Promise<{ throttled: boolean }> {
  const config = PROVIDERS[provider];
  const url =
    config.validateAuth === "query"
      ? `${config.validateUrl}?key=${encodeURIComponent(apiKey)}`
      : config.validateUrl;

  let response: Response;
  try {
    response = await fetch(url, { method: "GET", headers: validateHeaders(config, apiKey) });
  } catch {
    throw new AiError("provider", `Could not reach ${config.label}. Try again in a minute.`);
  }

  if (response.status === 401 || response.status === 403) {
    throw new AiError("auth", `${config.label} rejected that API key.`);
  }
  if (response.status === 429) {
    return { throttled: true };
  }
  if (!response.ok) {
    throw new AiError(
      "provider",
      `${config.label} could not verify the key right now (status ${response.status}).`,
    );
  }

  return { throttled: false };
}

/** Structured output needs `additionalProperties: false` and full `required`. */
export function normalizeJsonSchema(schema: JsonSchema): JsonSchema {
  return normalizeNode(schema) as JsonSchema;
}

type ProviderCall = GenerateJsonOptions & { schema: JsonSchema; maxTokens: number };

type RawCompletion = {
  text: string;
  usage: { inputTokens: number; outputTokens: number };
};

async function callAnthropic(call: ProviderCall): Promise<RawCompletion> {
  const client = new Anthropic({ apiKey: call.apiKey });

  try {
    // Temperature is intentionally omitted: it is not supported here.
    const message = await client.messages.create({
      model: call.model,
      max_tokens: call.maxTokens,
      system: call.system,
      messages: [{ role: "user", content: call.user }],
      output_config: { format: { type: "json_schema", schema: call.schema } },
    });

    const text = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");

    return {
      text,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      },
    };
  } catch (error) {
    throw toAnthropicAiError(error);
  }
}

function toAnthropicAiError(error: unknown): AiError {
  const label = PROVIDERS.anthropic.label;
  if (
    error instanceof Anthropic.AuthenticationError ||
    error instanceof Anthropic.PermissionDeniedError
  ) {
    return new AiError("auth", `${label} rejected your API key. Update it in Settings -> AI.`);
  }
  if (error instanceof Anthropic.RateLimitError) {
    return new AiError("rate_limit", `${label} is rate limiting your key. Try again shortly.`);
  }
  if (error instanceof Anthropic.APIError) {
    return new AiError(
      "provider",
      `${label} could not complete the request (status ${error.status ?? "unknown"}).`,
    );
  }
  return new AiError("provider", `Could not reach ${label}. Try again in a minute.`);
}

async function callOpenAiCompatible(call: ProviderCall): Promise<RawCompletion> {
  const config = PROVIDERS[call.provider];
  const wantsSchema = config.jsonMode === "json_schema";

  let attempt = await postChatCompletion(call, config, wantsSchema ? "json_schema" : "json_object");

  // Schema 400s are not always worded as a response_format problem (Groq).
  if (shouldFallbackToJsonObject(attempt.status, wantsSchema)) {
    attempt = await postChatCompletion(call, config, "json_object");
  }

  if (attempt.status === 401 || attempt.status === 403) {
    throw new AiError("auth", `${config.label} rejected your API key. Update it in Settings -> AI.`);
  }
  if (attempt.status === 429) {
    throw new AiError("rate_limit", `${config.label} is rate limiting your key. Try again shortly.`);
  }
  if (attempt.status >= 400) {
    throw new AiError(
      "provider",
      `${config.label} could not complete the request (status ${attempt.status}).`,
    );
  }

  let body: ChatCompletionResponse;
  try {
    body = JSON.parse(attempt.bodyText) as ChatCompletionResponse;
  } catch {
    throw new AiError("parse", `${config.label} returned a response we could not read.`);
  }

  return {
    // parseJsonPayload rejects an empty or unparseable body.
    text: body.choices?.[0]?.message?.content ?? "",
    usage: {
      inputTokens: Math.max(0, Math.round(body.usage?.prompt_tokens ?? 0)),
      outputTokens: Math.max(0, Math.round(body.usage?.completion_tokens ?? 0)),
    },
  };
}

type ChatCompletionResponse = {
  choices?: Array<{ message?: { content?: string | null } }>;
  usage?: { prompt_tokens?: number; completion_tokens?: number };
};

async function postChatCompletion(
  call: ProviderCall,
  config: ProviderInfo,
  mode: JsonMode,
): Promise<{ status: number; bodyText: string }> {
  const system =
    mode === "json_object"
      ? `${call.system}\n\nReturn ONLY a single valid JSON object matching this JSON schema (no markdown fences):\n${JSON.stringify(call.schema)}`
      : call.system;

  const body: Record<string, unknown> = {
    model: call.model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: call.user },
    ],
    response_format:
      mode === "json_schema"
        ? {
            type: "json_schema",
            json_schema: { name: call.schemaName, schema: call.schema, strict: true },
          }
        : { type: "json_object" },
    // GPT-5 era OpenAI models renamed this field; everyone else kept max_tokens.
    [call.provider === "openai" ? "max_completion_tokens" : "max_tokens"]:
      completionTokenLimit(call.provider, call.maxTokens),
  };

  // OpenAI's current models only accept the default temperature.
  if (call.temperature !== undefined && call.provider !== "openai") {
    body.temperature = call.temperature;
  }

  // Default medium reasoning eats the JSON budget on extract/cover/score.
  if (usesGptOssReasoning(call.provider, call.model)) {
    body.reasoning_effort = "low";
  }

  let response: Response;
  try {
    response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json", ...authHeaders(config, call.apiKey) },
      body: JSON.stringify(body),
    });
  } catch {
    throw new AiError("provider", `Could not reach ${config.label}. Try again in a minute.`);
  }

  return { status: response.status, bodyText: await response.text() };
}

/** Headers for a chat completions call: Google accepts a bearer token here. */
function authHeaders(config: ProviderInfo, apiKey: string): Record<string, string> {
  return config.validateAuth === "anthropic-header"
    ? { "x-api-key": apiKey, "anthropic-version": ANTHROPIC_VERSION }
    : { authorization: `Bearer ${apiKey}` };
}

/** Headers for the validation ping: providers keyed by query string send none. */
function validateHeaders(config: ProviderInfo, apiKey: string): Record<string, string> {
  return config.validateAuth === "query" ? {} : authHeaders(config, apiKey);
}

function parseJsonPayload<T>(text: string, config: ProviderInfo): T {
  const cleaned = stripCodeFences(text).trim();
  if (cleaned.length === 0) {
    throw new AiError("provider", `${config.label} returned an empty response.`);
  }

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new AiError("parse", `${config.label} returned output that was not valid JSON.`);
  }
}

function stripCodeFences(text: string): string {
  const fenced = text.trim().match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1] : text;
}

function normalizeNode(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(normalizeNode);
  if (!isPlainObject(node)) return node;

  const result: Record<string, unknown> = { ...node };
  const properties = node.properties;

  if (isPlainObject(properties)) {
    const normalized: Record<string, unknown> = {};
    for (const [name, value] of Object.entries(properties)) {
      normalized[name] = normalizeNode(value);
    }
    result.properties = normalized;
    result.additionalProperties = false;
    result.required = Object.keys(normalized);
  }

  if (node.items !== undefined) {
    result.items = normalizeNode(node.items);
  }

  for (const key of ["anyOf", "oneOf", "allOf"] as const) {
    const branch = node[key];
    if (Array.isArray(branch)) {
      result[key] = branch.map(normalizeNode);
    }
  }

  return result;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Defence in depth: never let anything key-shaped reach a user-facing string. */
function scrubSecrets(message: string): string {
  return message.replace(/(sk-ant-|sk-or-|sk-|gsk_|AIza|xai-)[A-Za-z0-9_-]{8,}/g, "[redacted]");
}
