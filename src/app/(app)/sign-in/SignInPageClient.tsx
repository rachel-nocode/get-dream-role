"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConvexAuth, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Mail, ShieldCheck } from "lucide-react";
import { api } from "@convex/_generated/api";

export default function SignInPageClient({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const upsertProfile = useMutation(api.profiles.upsertDefaultProfile);
  const [email, setEmail] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    void upsertProfile({})
      .catch(() => undefined)
      .finally(() => router.replace(nextPath));
  }, [isAuthenticated, nextPath, router, upsertProfile]);

  async function sendCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);
      await signIn("resend-otp", formData);
      setCodeSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send that code.");
    } finally {
      setSubmitting(false);
    }
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);
      await signIn("resend-otp", formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That code did not work.");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-20">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
        <section>
          <Link href="/" className="mb-10 inline-flex items-center gap-2 font-display text-lg font-bold">
            <span className="text-forge-accent text-sm">&#9632;</span>
            <span>GetDreamRole</span>
          </Link>
          <h1 className="max-w-2xl font-display text-4xl font-bold tracking-tight text-forge-text sm:text-5xl">
            Sign in and start shipping stronger applications.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-forge-muted">
            Email OTP only. No password pileup, no mystery account system.
          </p>
        </section>

        <section className="rounded-lg border border-forge-border bg-forge-surface p-6 shadow-2xl shadow-black/20">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-forge-accent-dim text-forge-accent">
            {codeSent ? <ShieldCheck className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
          </div>
          <h2 className="font-display text-2xl font-semibold">
            {codeSent ? "Enter your code" : "Get your code"}
          </h2>

          {!codeSent ? (
            <form onSubmit={sendCode} className="mt-6 space-y-4">
              <label className="block text-sm font-semibold text-forge-muted" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-12 w-full rounded-lg border border-forge-border bg-forge-bg px-4 text-sm text-forge-text outline-none focus:border-forge-accent"
                placeholder="you@example.com"
                required
              />
              <button
                type="submit"
                disabled={submitting || isLoading}
                className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-forge-accent px-5 text-sm font-semibold text-forge-bg hover:bg-forge-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Sending..." : "Send code"}
              </button>
            </form>
          ) : (
            <form onSubmit={verifyCode} className="mt-6 space-y-4">
              <input type="hidden" name="email" value={email} />
              <label className="block text-sm font-semibold text-forge-muted" htmlFor="code">
                Code
              </label>
              <input
                id="code"
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className="h-12 w-full rounded-lg border border-forge-border bg-forge-bg px-4 text-sm text-forge-text outline-none focus:border-forge-accent"
                placeholder="8 digit code"
                required
              />
              <button
                type="submit"
                disabled={submitting || isLoading}
                className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-forge-accent px-5 text-sm font-semibold text-forge-bg hover:bg-forge-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Checking..." : "Continue"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCodeSent(false);
                  setCode("");
                }}
                className="text-sm text-forge-muted hover:text-forge-text"
              >
                Use a different email
              </button>
            </form>
          )}

          {error ? (
            <p className="mt-4 rounded-lg border border-forge-danger/30 bg-forge-danger/10 px-4 py-3 text-sm text-forge-danger">
              {error}
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
