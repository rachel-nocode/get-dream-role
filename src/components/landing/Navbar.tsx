"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import clsx from "clsx";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-forge-bg/80 backdrop-blur-md border-b border-forge-border"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display font-bold text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forge-accent">
          <span className="text-forge-accent text-sm">&#9632;</span>
          <span className="text-forge-text">GetDreamRole</span>
        </Link>

        <div className="flex items-center gap-8">
          <a
            href="#how-it-works"
            className="hidden md:block text-sm text-forge-muted hover:text-forge-text transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forge-accent"
          >
            How It Works
          </a>
          <Link
            href="/blog"
            className="hidden md:block text-sm text-forge-muted hover:text-forge-text transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forge-accent"
          >
            Guides
          </Link>
          <Link
            href="/payment"
            className="hidden md:block text-sm text-forge-muted hover:text-forge-text transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forge-accent"
          >
            Pricing
          </Link>
          <Link
            href="/optimize"
            className="bg-forge-accent hover:bg-forge-accent-hover text-forge-bg text-sm font-semibold px-5 py-2 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forge-accent"
          >
            Free ATS Score
          </Link>
        </div>
      </div>
    </nav>
  );
}
