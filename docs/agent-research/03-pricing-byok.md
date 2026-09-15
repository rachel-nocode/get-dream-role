# Cheap-LLM landscape for BYOK job agent (Sept 2026) — key points

## Pricing ($/1M tok in/out)
- Anthropic claude-haiku-4-5: 1.00/5.00, 200K ctx, structured outputs via output_config.format, cache min 4096 (won't trigger at our prompt size)
- Anthropic claude-sonnet-5: 2.00/10.00, 1M ctx
- Anthropic claude-opus-5: 5.00/25.00, 1M ctx
- OpenAI gpt-5-nano: 0.05/0.40 ; gpt-5.4-nano: 0.20/1.25 ; gpt-5-mini: 0.25/2.00 ; gpt-5.4-mini: 0.75/4.50 — strict json_schema
- Google gemini-3.1-flash-lite: 0.25/1.50, free tier ~10-15 RPM / ~250-1500 RPD (prompts used for training); gemini-3.5-flash-lite 0.30/2.50
- Groq openai/gpt-oss-20b 0.075/0.30 ; openai/gpt-oss-120b 0.15/0.60 ; free tier ~30 RPM 1K RPD no card
- Groq llama-3.3-70b-versatile: DEPRECATED on free/dev tiers 17 Jun 2026 — do not ship as default (current codebase uses it!)
- DeepSeek deepseek-v4-flash 0.30/1.20 (json_object only)
- Mistral mistral-small-latest 0.15/0.60 (json_schema)
- xAI grok-4.1-fast 0.20/0.50 (strict json_schema)
- OpenRouter :free models 20 RPM / 50 RPD; BYOK fee 5%

## Cost per full application (4 calls ~12K in / 3.5K out)
gpt-5-nano $0.002 | groq gpt-oss-120b $0.004 | gpt-5.4-nano $0.007 | gemini 3.1 flash-lite $0.008 | gpt-5-mini $0.01 | haiku 4.5 $0.03 | sonnet 5 ~$0.06-0.08 | opus 5 ~$0.15-0.19
=> 100 applications on best tier < $20; output tokens dominate.

## Recommended tiers
- Free: gemini-3.1-flash-lite (AI Studio key); fallback Groq openai/gpt-oss-120b
- Cheap: gpt-5.4-nano or gpt-5-mini
- Best: claude-sonnet-5 default, claude-opus-5 premium toggle

## Endpoints (OpenAI-compatible chat completions)
- OpenAI https://api.openai.com/v1 (json_schema strict)
- Google https://generativelanguage.googleapis.com/v1beta/openai/ (json_schema ok; Bearer key)
- Groq https://api.groq.com/openai/v1 (json_schema on supported, else json_object)
- DeepSeek https://api.deepseek.com/v1 (json_object only)
- Mistral https://api.mistral.ai/v1 ; xAI https://api.x.ai/v1 ; OpenRouter https://openrouter.ai/api/v1 (vendor/model IDs)
- Anthropic: use native Messages API via @anthropic-ai/sdk (compat endpoint ignores response_format/strict)
- Key validation ping: GET /v1/models (OpenAI, Groq, Mistral, xAI, DeepSeek, Anthropic w/ headers); Gemini GET /v1beta/models?key=; OpenRouter GET /api/v1/key. 401/403 invalid; 429 valid-but-throttled.
- Key format hints: sk-ant-, sk-, gsk_, xai-, AIza

## Caching
Helpful but ≤10-20% savings here. Order prompts system → resume → JD → task.

## Key storage (Convex)
- AES-256-GCM, random 12-byte IV per write, KEK from Convex env var BYOK_MASTER_KEY (32 random bytes b64), AAD = `${userId}:${provider}`
- Store {userId, provider, ciphertext, iv, keyVersion, last4, createdAt, lastValidatedAt}
- Decrypt only inside the action that calls the provider (crypto.subtle available). Queries return only provider/last4/lastValidatedAt. Never log plaintext; redact provider error bodies.
- Validate with /models ping before storing.
- Per-user rate limits (@convex-dev/rate-limiter or simple usageEvents), per-call max_tokens cap ~2500, daily token budget.
