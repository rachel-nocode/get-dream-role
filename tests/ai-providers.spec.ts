import { expect, test } from "@playwright/test";
import {
  PRESETS,
  PROVIDER_IDS,
  PROVIDERS,
  defaultModelFor,
  estimateCostPerApplication,
  estimateCostUsd,
  findModel,
  isProviderId,
} from "../convex/ai/providers";
import { decryptSecret, encryptSecret, keyAad, maskKey } from "../convex/ai/crypto";

const TEST_MASTER_KEY = Buffer.alloc(32, 7).toString("base64");

test.describe("provider registry", () => {
  test("looks models up by provider and id", () => {
    expect(findModel("anthropic", "claude-sonnet-5")).toMatchObject({
      inputPerM: 2,
      outputPerM: 10,
      tier: "value",
    });
    expect(findModel("anthropic", "gpt-5-mini")).toBeNull();
    expect(findModel("nope", "claude-sonnet-5")).toBeNull();
    expect(isProviderId("groq")).toBe(true);
    expect(isProviderId("nope")).toBe(false);
  });

  test("every provider has a usable default model", () => {
    for (const providerId of PROVIDER_IDS) {
      const model = defaultModelFor(providerId);
      expect(findModel(providerId, model.id)).toEqual(model);
      expect(model.inputPerM).toBeGreaterThan(0);
      expect(model.outputPerM).toBeGreaterThan(0);
    }
  });

  test("presets point at real models", () => {
    for (const preset of PRESETS) {
      expect(findModel(preset.provider, preset.model), preset.id).not.toBeNull();
    }
  });

  test("providers expose a chat base url and a validation endpoint", () => {
    for (const providerId of PROVIDER_IDS) {
      const provider = PROVIDERS[providerId];
      expect(provider.baseUrl.startsWith("https://")).toBe(true);
      expect(provider.baseUrl.endsWith("/")).toBe(false);
      expect(provider.validateUrl.startsWith("https://")).toBe(true);
      expect(provider.docsUrl.startsWith("https://")).toBe(true);
    }
  });

  test("estimates cost from per-million pricing", () => {
    const sonnet = findModel("anthropic", "claude-sonnet-5");
    expect(sonnet).not.toBeNull();
    expect(estimateCostUsd(sonnet!, 1_000_000, 0)).toBeCloseTo(2, 6);
    expect(estimateCostUsd(sonnet!, 0, 1_000_000)).toBeCloseTo(10, 6);
    expect(estimateCostUsd(sonnet!, 500_000, 100_000)).toBeCloseTo(2, 6);
    expect(estimateCostUsd(sonnet!, 0, 0)).toBe(0);
  });

  test("cost per application stays in the researched ranges", () => {
    const sonnet = estimateCostPerApplication(findModel("anthropic", "claude-sonnet-5")!);
    expect(sonnet).toBeGreaterThan(0.04);
    expect(sonnet).toBeLessThan(0.1);

    const nano = estimateCostPerApplication(findModel("openai", "gpt-5-nano")!);
    expect(nano).toBeLessThan(0.01);
    expect(nano).toBeGreaterThan(0);

    const opus = estimateCostPerApplication(findModel("anthropic", "claude-opus-5")!);
    expect(opus).toBeGreaterThan(sonnet);
  });
});

test.describe("api key encryption", () => {
  test.beforeAll(() => {
    process.env.BYOK_MASTER_KEY = TEST_MASTER_KEY;
  });

  test("round trips a secret", async () => {
    const aad = keyAad("user123", "anthropic");
    const secret = "sk-ant-not-a-real-key-0000";

    const encrypted = await encryptSecret(secret, aad);
    expect(encrypted.keyVersion).toBe(1);
    expect(encrypted.ciphertext).not.toContain(secret);
    expect(encrypted.iv.length).toBeGreaterThan(0);

    expect(await decryptSecret(encrypted, aad)).toBe(secret);
  });

  test("uses a fresh iv for every write", async () => {
    const aad = keyAad("user123", "openai");
    const first = await encryptSecret("sk-same-value", aad);
    const second = await encryptSecret("sk-same-value", aad);

    expect(first.iv).not.toBe(second.iv);
    expect(first.ciphertext).not.toBe(second.ciphertext);
  });

  test("refuses to decrypt with the wrong aad", async () => {
    const encrypted = await encryptSecret("sk-scoped-to-one-user", keyAad("user123", "groq"));

    await expect(decryptSecret(encrypted, keyAad("user456", "groq"))).rejects.toThrow(
      /Could not decrypt/,
    );
    await expect(decryptSecret(encrypted, keyAad("user123", "openai"))).rejects.toThrow(
      /Could not decrypt/,
    );
  });

  test("explains a missing or malformed master key", async () => {
    const original = process.env.BYOK_MASTER_KEY;
    try {
      delete process.env.BYOK_MASTER_KEY;
      await expect(encryptSecret("sk-any", keyAad("u", "groq"))).rejects.toThrow(
        /BYOK_MASTER_KEY is not set/,
      );

      process.env.BYOK_MASTER_KEY = Buffer.alloc(16, 3).toString("base64");
      await expect(encryptSecret("sk-any", keyAad("u", "groq"))).rejects.toThrow(
        /32 bytes/,
      );
    } finally {
      process.env.BYOK_MASTER_KEY = original;
    }
  });

  test("masks a key down to its last four characters", () => {
    expect(maskKey("sk-ant-abcdefgh1234")).toBe("1234");
    expect(maskKey("  sk-or-v1-zzzz9876  ")).toBe("9876");
  });
});
