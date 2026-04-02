import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-forge-border">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-display text-sm text-forge-muted">
          <span className="text-forge-accent text-xs">&#9632;</span>
          <span>GetDreamRole</span>
          <span className="ml-2">&copy; 2026</span>
        </div>

        <div className="flex items-center gap-6 text-sm text-forge-muted">
          <Link href="/blog" className="hover:text-forge-text transition-colors">
            Guides
          </Link>
          <Link href="/privacy" className="hover:text-forge-text transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-forge-text transition-colors">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
