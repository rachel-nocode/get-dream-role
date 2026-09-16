"use node";

import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { ActionCtx, action } from "../_generated/server";
import { validateApiKey } from "./client";
import { decryptSecret, encryptSecret, keyAad, maskKey } from "./crypto";
import { PROVIDERS, defaultModelFor, type ProviderId } from "./providers";
import { aiProvider } from "../validators";

async function requireUserId(ctx: ActionCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("Sign in to manage your API keys.");
  }
  return userId;
}

/** Format hints are advisory: providers rotate prefixes, so we warn only. */
function prefixWarning(provider: ProviderId, apiKey: string): string | undefined {
  const { keyPrefixHint, label } = PROVIDERS[provider];
  if (!keyPrefixHint || apiKey.startsWith(keyPrefixHint)) return undefined;
  return `That key does not start with "${keyPrefixHint}", which is unusual for ${label}. It was still accepted.`;
}

export const saveApiKey = action({
  args: {
    provider: aiProvider,
    apiKey: v.string(),
    label: v.optional(v.string()),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    provider: ProviderId;
    last4: string;
    throttled: boolean;
    warning?: string;
  }> => {
    const userId = await requireUserId(ctx);
    const apiKey = args.apiKey.trim();
    if (apiKey.length === 0) {
      throw new Error("Paste an API key first.");
    }

    const last4 = maskKey(apiKey);
    const warning = prefixWarning(args.provider, apiKey);
    const { throttled } = await validateApiKey(args.provider, apiKey);
    const encrypted = await encryptSecret(apiKey, keyAad(userId, args.provider));

    await ctx.runMutation(internal.apiKeys.store, {
      userId,
      provider: args.provider,
      ciphertext: encrypted.ciphertext,
      iv: encrypted.iv,
      keyVersion: encrypted.keyVersion,
      last4,
      label: args.label?.trim() || undefined,
      lastValidatedAt: Date.now(),
    });

    await ctx.runMutation(internal.aiSettings.initializeForUser, {
      userId,
      provider: args.provider,
      model: defaultModelFor(args.provider).id,
    });

    return { provider: args.provider, last4, throttled, warning };
  },
});

export const testConnection = action({
  args: { provider: aiProvider },
  handler: async (ctx, args): Promise<{ throttled: boolean; testedAt: number }> => {
    const userId = await requireUserId(ctx);
    const stored = await ctx.runQuery(internal.apiKeys.getEncrypted, {
      userId,
      provider: args.provider,
    });

    if (!stored) {
      throw new Error(`No ${PROVIDERS[args.provider].label} key saved yet.`);
    }

    const apiKey = await decryptSecret(
      { ciphertext: stored.ciphertext, iv: stored.iv },
      keyAad(userId, args.provider),
    );

    const { throttled } = await validateApiKey(args.provider, apiKey);
    const testedAt = Date.now();
    await ctx.runMutation(internal.apiKeys.markValidated, {
      userId,
      provider: args.provider,
      validatedAt: testedAt,
    });

    return { throttled, testedAt };
  },
});
