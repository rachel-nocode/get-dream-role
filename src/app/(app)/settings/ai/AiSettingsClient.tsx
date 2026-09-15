"use client";

import { useMemo, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { Sparkles } from "lucide-react";
import clsx from "clsx";
import AppShell from "@/components/app/AppShell";
import { api } from "@convex/_generated/api";
import {
  HOUSE_MODEL,
  HOUSE_PROVIDER,
  PRESETS,
  PROVIDERS,
  PROVIDER_LIST,
  costPerApplicationFor,
  estimateCostPerApplication,
  findModel,
  formatUsd,
  type ModelInfo,
  type ModelTier,
  type ProviderId,
} from "@convex/ai/providers";
import ProviderKeyCard from "./ProviderKeyCard";

const tierLabels: Record<ModelTier, string> = {
  free: "Free tier",
  cheap: "Cheap",
  value: "Best value",
  best: "Best quality",
};

const tierStyles: Record<ModelTier, string> = {
  free: "border-forge-success/40 bg-forge-success/10 text-forge-success",
  cheap: "border-forge-border-bright bg-forge-elevated text-forge-muted",
  value: "border-forge-accent/40 bg-forge-accent-dim text-forge-accent",
  best: "border-forge-warning/40 bg-forge-warning/10 text-forge-warning",
};

type ModelOption = {
  provider: ProviderId;
  model: ModelInfo;
  house: boolean;
};

function TierBadge({ tier }: { tier: ModelTier }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        tierStyles[tier],
      )}
    >
      {tierLabels[tier]}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-forge-accent">
      {children}
    </p>
  );
}

export default function AiSettingsClient() {
  const keys = useQuery(api.apiKeys.list);
  const settings = useQuery(api.aiSettings.get);
  const usage = useQuery(api.aiSettings.usageThisMonth);
  const saveApiKey = useAction(api.ai.actions.saveApiKey);
  const testConnection = useAction(api.ai.actions.testConnection);
  const removeKey = useMutation(api.apiKeys.remove);
  const updateSettings = useMutation(api.aiSettings.update);

  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [savingRails, setSavingRails] = useState(false);

  const keysLoaded = keys !== undefined;
  const savedProviders = useMemo(
    () => new Set((keys ?? []).map((key) => key.provider)),
    [keys],
  );

  const modelOptions = useMemo<ModelOption[]>(() => {
    const options: ModelOption[] = [];
    const houseModel = findModel(HOUSE_PROVIDER, HOUSE_MODEL);
    if (houseModel && !savedProviders.has(HOUSE_PROVIDER)) {
      options.push({ provider: HOUSE_PROVIDER, model: houseModel, house: true });
    }
    for (const provider of PROVIDER_LIST) {
      if (!savedProviders.has(provider.id)) continue;
      for (const model of provider.models) {
        options.push({ provider: provider.id, model, house: false });
      }
    }
    return options;
  }, [savedProviders]);

  const activeCost = settings
    ? costPerApplicationFor(settings.provider, settings.model)
    : null;
  const fallbackInUse =
    keysLoaded && settings !== undefined && !savedProviders.has(settings.provider);

  async function guard(task: () => Promise<string>) {
    setNotice("");
    setError("");
    try {
      setNotice(await task());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  async function selectModel(provider: ProviderId, model: string) {
    await guard(async () => {
      await updateSettings({ provider, model });
      return `Now generating with ${PROVIDERS[provider].label} ${
        findModel(provider, model)?.label ?? model
      }.`;
    });
  }

  async function saveRails(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSavingRails(true);
    await guard(async () => {
      await updateSettings({
        dailySubmitCap: Number(form.get("dailySubmitCap")),
        dailyScoringBudgetUsd: Number(form.get("dailyScoringBudgetUsd")),
      });
      return "Rails updated.";
    });
    setSavingRails(false);
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <section>
          <SectionLabel>Settings</SectionLabel>
          <h1 className="mt-3 font-display text-4xl font-bold">AI provider and keys</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-forge-muted">
            Bring your own key and pay the model provider directly. Keys are encrypted before
            they are stored and are only decrypted inside the backend call that uses them.
          </p>
        </section>

        {error ? (
          <p className="rounded-lg border border-forge-danger/30 bg-forge-danger/10 px-4 py-3 text-sm text-forge-danger">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p className="rounded-lg border border-forge-success/30 bg-forge-success/10 px-4 py-3 text-sm text-forge-success">
            {notice}
          </p>
        ) : null}

        <section className="flex flex-col gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold">Presets</h2>
            <p className="mt-2 text-sm text-forge-muted">
              Estimated on a full application: score, resume, cover letter and answers.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {PRESETS.map((preset) => {
              const provider = PROVIDERS[preset.provider];
              const model = findModel(preset.provider, preset.model);
              const hasKey = savedProviders.has(preset.provider);
              const active =
                settings?.provider === preset.provider && settings?.model === preset.model;

              return (
                <div
                  key={preset.id}
                  className={clsx(
                    "flex flex-col gap-3 rounded-lg border bg-forge-surface p-5",
                    active ? "border-forge-accent/40" : "border-forge-border",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-lg font-semibold">{preset.label}</h3>
                    {model ? <TierBadge tier={model.tier} /> : null}
                  </div>
                  <p className="text-sm text-forge-muted">
                    {provider.label} · {model?.label ?? preset.model}
                  </p>
                  <p className="text-sm text-forge-muted">{preset.description}</p>
                  <p className="font-display text-xl font-bold">
                    {model ? `≈ ${formatUsd(estimateCostPerApplication(model))}` : "—"}
                    <span className="ml-1 text-sm font-normal text-forge-muted">
                      per application
                    </span>
                  </p>
                  <button
                    type="button"
                    disabled={!keysLoaded || !hasKey || active}
                    onClick={() => selectModel(preset.provider, preset.model)}
                    className="mt-auto inline-flex h-10 items-center justify-center rounded-lg bg-forge-accent px-4 text-sm font-semibold text-forge-bg hover:bg-forge-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {!keysLoaded
                      ? "Loading..."
                      : active
                        ? "In use"
                        : hasKey
                          ? "Use preset"
                          : `Add a ${provider.label} key`}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold">Provider keys</h2>
            <p className="mt-2 text-sm text-forge-muted">
              Add a key for any provider you want to use. Remove it and generation falls back
              to the shared trial key.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {PROVIDER_LIST.map((provider) => {
              const saved = (keys ?? []).find((key) => key.provider === provider.id);

              return (
                <ProviderKeyCard
                  key={provider.id}
                  provider={provider}
                  isActive={settings?.provider === provider.id}
                  saved={
                    saved
                      ? {
                          last4: saved.last4,
                          label: saved.label,
                          lastValidatedAt: saved.lastValidatedAt,
                        }
                      : undefined
                  }
                  onSave={async (apiKey, label) => {
                    const result = await saveApiKey({
                      provider: provider.id,
                      apiKey,
                      label: label.length > 0 ? label : undefined,
                    });
                    return [
                      `Key ending ${result.last4} saved.`,
                      result.throttled ? "The provider is rate limiting right now." : "",
                      result.warning ?? "",
                    ]
                      .filter(Boolean)
                      .join(" ");
                  }}
                  onTest={async () => {
                    const result = await testConnection({ provider: provider.id });
                    return result.throttled
                      ? "Key is valid but currently rate limited."
                      : "Connection looks good.";
                  }}
                  onRemove={async () => {
                    await removeKey({ provider: provider.id });
                    return "Key removed.";
                  }}
                />
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold">Model</h2>
            <p className="mt-2 text-sm text-forge-muted">
              {settings
                ? `Using ${PROVIDERS[settings.provider].label} ${
                    findModel(settings.provider, settings.model)?.label ?? settings.model
                  }${activeCost === null ? "" : ` · ≈ ${formatUsd(activeCost)} per application`}`
                : "Loading your current model..."}
            </p>
            {fallbackInUse ? (
              <p className="mt-2 text-sm text-forge-muted">
                No key saved for that provider yet, so generation uses the shared trial key on{" "}
                {PROVIDERS[HOUSE_PROVIDER].label}.
              </p>
            ) : null}
          </div>
          {keysLoaded ? null : (
            <p className="text-sm text-forge-muted">Loading available models...</p>
          )}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(keysLoaded ? modelOptions : []).map((option) => {
              const active =
                settings?.provider === option.provider && settings?.model === option.model.id;

              return (
                <button
                  key={`${option.provider}:${option.model.id}`}
                  type="button"
                  onClick={() => selectModel(option.provider, option.model.id)}
                  className={clsx(
                    "flex flex-col gap-2 rounded-lg border bg-forge-surface p-5 text-left transition-colors hover:bg-forge-elevated",
                    active ? "border-forge-accent/40" : "border-forge-border",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold">{option.model.label}</span>
                    <TierBadge tier={option.model.tier} />
                  </div>
                  <span className="text-sm text-forge-muted">
                    {PROVIDERS[option.provider].label}
                    {option.house ? " · shared trial key" : ""} · {option.model.contextK}K context
                  </span>
                  <span className="text-sm text-forge-muted">
                    ≈ {formatUsd(estimateCostPerApplication(option.model))} per application
                  </span>
                  {active ? (
                    <span className="inline-flex items-center gap-1 text-sm text-forge-accent">
                      <Sparkles className="h-4 w-4" />
                      In use
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-forge-border bg-forge-surface p-5">
            <h2 className="font-display text-2xl font-semibold">Rails</h2>
            <p className="mt-2 text-sm text-forge-muted">
              Hard limits so a bad day cannot turn into a big bill or a spray of applications.
            </p>
            <form
              // Remounts with fresh defaults whenever the saved rails change.
              key={`${settings?.dailySubmitCap ?? "-"}:${settings?.dailyScoringBudgetUsd ?? "-"}`}
              onSubmit={saveRails}
            >
              <div className="mt-5 flex flex-col gap-4 sm:flex-row">
                <label className="flex flex-1 flex-col gap-2 text-sm">
                  <span className="text-forge-muted">Daily submit cap (1-30)</span>
                  <input
                    type="number"
                    name="dailySubmitCap"
                    min={1}
                    max={30}
                    step={1}
                    defaultValue={settings?.dailySubmitCap ?? 10}
                    className="h-11 rounded-lg border border-forge-border bg-forge-bg px-3 text-sm text-forge-text"
                  />
                </label>
                <label className="flex flex-1 flex-col gap-2 text-sm">
                  <span className="text-forge-muted">Daily scoring budget (USD)</span>
                  <input
                    type="number"
                    name="dailyScoringBudgetUsd"
                    min={0.05}
                    max={25}
                    step={0.05}
                    defaultValue={(settings?.dailyScoringBudgetUsd ?? 0.5).toFixed(2)}
                    className="h-11 rounded-lg border border-forge-border bg-forge-bg px-3 text-sm text-forge-text"
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={savingRails}
                className="mt-5 inline-flex h-11 items-center justify-center rounded-lg border border-forge-border px-5 text-sm font-semibold text-forge-text hover:bg-forge-elevated disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingRails ? "Saving..." : "Save rails"}
              </button>
            </form>
          </div>

          <div className="rounded-lg border border-forge-border bg-forge-surface p-5">
            <h2 className="font-display text-2xl font-semibold">Usage this month</h2>
            <p className="mt-2 text-sm text-forge-muted">
              {usage ? `Billing period ${usage.periodKey}` : "Loading usage..."}
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {[
                ["Calls", usage ? String(usage.calls) : "-"],
                [
                  "Tokens",
                  usage
                    ? (usage.inputTokens + usage.outputTokens).toLocaleString("en-US")
                    : "-",
                ],
                ["Spend", usage ? formatUsd(usage.costUsd) : "-"],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-sm text-forge-muted">{label}</p>
                  <p className="mt-1 font-display text-2xl font-bold">{value}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs text-forge-muted">
              Costs are estimated from provider list prices and the tokens each call reported.
            </p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
