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

        <div className="flex flex-col items-start gap-4 sm:items-end">
          <a
            href="https://tools.launchllama.co?utm_source=badge&utm_medium=referral"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex"
          >
            <img
              src="https://speaktechenglish.com/wp-content/uploads/2026/04/Screenshot_2026-04-09_at_17.40.44-removebg-preview.png"
              alt="Featured on Launch Llama"
              width="200"
              height="50"
              className="h-auto w-[200px]"
            />
          </a>

          <div className="flex items-center gap-6 text-sm text-forge-muted">
            <Link href="/blog" className="hover:text-forge-text transition-colors">
              Guides
            </Link>
            <Link href="/ats" className="hover:text-forge-text transition-colors">
              Platforms
            </Link>
            <Link href="/privacy" className="hover:text-forge-text transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-forge-text transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
