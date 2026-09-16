/**
 * Works out which provider, model and key a generation call should use.
 *
 * Decrypting happens here with `crypto.subtle`, which is available in both
 * Convex runtimes, so this module stays free of Node-only imports. Only the
 * action that calls a provider ever sees the plaintext key.
 */

import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import type { ActionCtx } from "../_generated/server";
import { decryptSecret, keyAad } from "./crypto";
import {
  HOUSE_MODEL,
  HOUSE_PROVIDER,
  defaultModelFor,
  findModel,
  type ProviderId,
} from "./providers";

export type ResolvedModel = {
  provider: ProviderId;
  model: string;
  apiKey: string;
  /** True when we fell back to the shared trial key instead of the user's. */
  usingHouseKey: boolean;
};

export const NO_KEY_MESSAGE =
  "Add an API key in Settings -> AI to generate with your own model.";

export async function resolveUserModel(
  ctx: ActionCtx,
  userId: Id<"users">,
): Promise<ResolvedModel> {
  const settings = await ctx.runQuery(internal.aiSettings.getForUser, { userId });

  if (settings) {
    const provider = settings.provider;
    const stored = await ctx.runQuery(internal.apiKeys.getEncrypted, { userId, provider });

    if (stored) {
      const apiKey = await decryptSecret(
        { ciphertext: stored.ciphertext, iv: stored.iv },
        keyAad(userId, provider),
      );

      return {
        provider,
        model: findModel(provider, settings.model)?.id ?? defaultModelFor(provider).id,
        apiKey,
        usingHouseKey: false,
      };
    }
  }

  const houseKey = process.env.GROQ_API_KEY;
  if (houseKey) {
    return {
      provider: HOUSE_PROVIDER,
      model: HOUSE_MODEL,
      apiKey: houseKey,
      usingHouseKey: true,
    };
  }

  throw new Error(NO_KEY_MESSAGE);
}
