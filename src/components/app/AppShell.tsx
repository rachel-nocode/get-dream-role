"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AuthLoading, Authenticated, Unauthenticated } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Briefcase, CreditCard, FilePlus2, LayoutDashboard, LogOut } from "lucide-react";
import clsx from "clsx";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs/import", label: "Import", icon: FilePlus2 },
  { href: "/applications", label: "Applications", icon: Briefcase },
  { href: "/settings/billing", label: "Billing", icon: CreditCard },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuthActions();

  return (
    <>
      <AuthLoading>
        <main className="min-h-screen px-6 py-24">
          <div className="mx-auto max-w-6xl text-forge-muted">Loading...</div>
        </main>
      </AuthLoading>
      <Unauthenticated>
        <main className="min-h-screen px-6 py-24">
          <div className="mx-auto max-w-xl rounded-lg border border-forge-border bg-forge-surface p-8">
            <p className="text-sm text-forge-muted">You need to sign in first.</p>
            <Link
              href="/sign-in"
              className="mt-4 inline-flex items-center rounded-lg bg-forge-accent px-5 py-2 text-sm font-semibold text-forge-bg hover:bg-forge-accent-hover"
            >
              Sign in
            </Link>
          </div>
        </main>
      </Unauthenticated>
      <Authenticated>
        <div className="min-h-screen bg-forge-bg">
          <header className="border-b border-forge-border bg-forge-bg/95">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
              <Link href="/dashboard" className="flex items-center gap-2 font-display text-lg font-bold">
                <span className="text-forge-accent text-sm">&#9632;</span>
                <span>GetDreamRole</span>
              </Link>
              <nav className="flex flex-wrap items-center gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={clsx(
                        "inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm transition-colors",
                        active
                          ? "bg-forge-accent text-forge-bg"
                          : "text-forge-muted hover:bg-forge-surface hover:text-forge-text",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
                <button
                  type="button"
                  onClick={async () => {
                    await signOut();
                    router.push("/");
                  }}
                  className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm text-forge-muted hover:bg-forge-surface hover:text-forge-text"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </nav>
            </div>
          </header>
          <main className="mx-auto min-h-screen max-w-7xl px-6 py-10">{children}</main>
        </div>
      </Authenticated>
    </>
  );
}
