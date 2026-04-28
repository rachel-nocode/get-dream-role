"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { CreditCard, Sparkles } from "lucide-react";
import AppShell from "@/components/app/AppShell";
import { api } from "../../../../convex/_generated/api";

export default function BillingClient() {
  const entitlements = useQuery(api.entitlements.getForCurrentUser);
  const [loading, setLoading] = useState<"optimizer" | "apply" | null>(null);
  const [error, setError] = useState("");
  const apply = entitlements?.find((item) => item.kind === "apply_copilot");
  const optimizer = entitlements?.find((item) => item.kind === "optimizer_lifetime");

  async function startCheckout(product: "optimizer" | "apply_copilot") {
    setError("");
    setLoading(product === "optimizer" ? "optimizer" : "apply");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          product,
          returnPath: "/settings/billing",
        }),
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Checkout did not start.");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout did not start.");
      setLoading(null);
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-forge-accent">
            Billing
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold">Plans and access</h1>
        </div>

        {error ? (
          <p className="rounded-lg border border-forge-danger/30 bg-forge-danger/10 px-4 py-3 text-sm text-forge-danger">
            {error}
          </p>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-forge-border bg-forge-surface p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-semibold">Resume Optimizer</h2>
                <p className="mt-2 text-sm text-forge-muted">One-time unlock for the ATS optimizer.</p>
              </div>
              <span className="rounded-full border border-forge-border px-3 py-1 text-xs text-forge-muted">
                $9.99
              </span>
            </div>
            <p className="mt-5 text-sm text-forge-muted">
              Status: {optimizer?.status === "active" ? "active" : "not active"}
            </p>
            <button
              type="button"
              disabled={loading !== null || optimizer?.status === "active"}
              onClick={() => startCheckout("optimizer")}
              className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-forge-border px-5 text-sm font-semibold text-forge-text hover:bg-forge-elevated disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CreditCard className="h-4 w-4" />
              {optimizer?.status === "active"
                ? "Unlocked"
                : loading === "optimizer"
                  ? "Starting..."
                  : "Unlock optimizer"}
            </button>
          </div>

          <div className="rounded-lg border border-forge-accent/30 bg-forge-surface p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-semibold">Apply Copilot Beta</h2>
                <p className="mt-2 text-sm text-forge-muted">50 generated application packs per month.</p>
              </div>
              <span className="rounded-full border border-forge-accent/30 bg-forge-accent-dim px-3 py-1 text-xs text-forge-accent">
                $19/mo
              </span>
            </div>
            <p className="mt-5 text-sm text-forge-muted">
              Status: {apply?.status === "active" ? "active" : "not active"}
            </p>
            <button
              type="button"
              disabled={loading !== null || apply?.status === "active"}
              onClick={() => startCheckout("apply_copilot")}
              className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-forge-accent px-5 text-sm font-semibold text-forge-bg hover:bg-forge-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4" />
              {apply?.status === "active"
                ? "Active"
                : loading === "apply"
                  ? "Starting..."
                  : "Start Apply Copilot"}
            </button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
