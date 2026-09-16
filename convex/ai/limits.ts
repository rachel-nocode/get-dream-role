import type { ProviderId } from "./providers";

/**
 * House Groq is gpt-oss, a reasoning model. It spends hundreds of tokens
 * thinking before any JSON. A 600–800 max_tokens budget then returns 400
 * `json_validate_failed` with an empty `failed_generation`.
 */
export const GROQ_REASONING_RESERVE = 2_000;

export const GPT_OSS_PREFIX = "openai/gpt-oss";

/** Groq's json_schema 400s often say `json_validate_failed`, not `response_format`. */
export function shouldFallbackToJsonObject(status: number, wantsSchema: boolean): boolean {
  return status === 400 && wantsSchema;
}

export function completionTokenLimit(provider: ProviderId, maxTokens: number): number {
  return provider === "groq" ? maxTokens + GROQ_REASONING_RESERVE : maxTokens;
}

export function usesGptOssReasoning(provider: ProviderId, model: string): boolean {
  return provider === "groq" && model.startsWith(GPT_OSS_PREFIX);
}
