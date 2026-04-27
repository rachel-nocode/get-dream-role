import Link from "next/link";

const platformPills = ["Greenhouse", "Workday", "Lever"];
const trustPoints = ["Free ATS score", "No subscription", "PDF or pasted resume"];

const testimonials = [
  {
    quote:
      "Three interviews in the first week. My old resume was getting filtered out. I had no idea.",
    name: "Priya S.",
    role: "Senior Frontend Engineer",
    initials: "PS",
  },
  {
    quote:
      "Went from zero callbacks in two months to four offers. The keyword match made the difference.",
    name: "Marcus T.",
    role: "Product Manager",
    initials: "MT",
  },
  {
    quote:
      "Finally stopped guessing why I was being ghosted. Clear fixes, shipped resume same day.",
    name: "Elena R.",
    role: "Data Scientist",
    initials: "ER",
  },
];

export default function Hero() {
  return (
    <>
      <section className="relative flex min-h-[calc(100svh-4rem)] flex-col justify-start overflow-hidden pt-28 pb-10 md:justify-center md:pt-20 md:pb-12">
        {/* Ambient glow */}
        <div className="absolute top-1/4 right-[10%] w-[500px] h-[500px] rounded-full bg-forge-accent/5 blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-center">
          {/* Left — 60% */}
          <div className="lg:col-span-3 flex flex-col gap-6">
          <p
            className="animate-fade-up font-display text-forge-accent text-xs tracking-[0.2em] uppercase"
            style={{ animationDelay: "0ms" }}
          >
            Free ATS resume scan
          </p>

          <h1
            className="animate-fade-up font-display text-4xl sm:text-5xl md:text-7xl font-bold leading-tight text-forge-text"
            style={{ animationDelay: "120ms" }}
          >
            ATS resume optimizer
            <br />
            built to pass the filter.
          </h1>

          <h2
            className="animate-fade-up font-display text-xl md:text-2xl text-forge-text/90 font-medium max-w-xl leading-snug"
            style={{ animationDelay: "200ms" }}
          >
            Get a score, keyword gaps, and bullet rewrites tuned for Greenhouse, Workday, Lever, iCIMS, and Taleo.
          </h2>

          <p
            className="animate-fade-up text-forge-muted text-lg max-w-xl leading-relaxed"
            style={{ animationDelay: "280ms" }}
          >
            Upload your resume, paste the job post, and ship a cleaner version before the application tab gets cold.
          </p>

          <div
            className="animate-fade-up flex flex-wrap gap-4 pt-2"
            style={{ animationDelay: "360ms" }}
          >
            <Link
              href="/optimize"
              className="bg-forge-accent hover:bg-forge-accent-hover text-forge-bg font-semibold px-6 py-3 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forge-accent"
            >
              Get My Free ATS Score &rarr;
            </Link>
            <a
              href="#how-it-works"
              className="border border-forge-border hover:border-forge-border-bright text-forge-text px-6 py-3 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forge-accent"
            >
              See How It Works
            </a>
          </div>

          <div
            className="animate-fade-up flex flex-wrap gap-x-5 gap-y-2 text-sm text-forge-muted"
            style={{ animationDelay: "420ms" }}
          >
            {trustPoints.map((point) => (
              <span key={point} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-forge-success" aria-hidden="true" />
                {point}
              </span>
            ))}
          </div>
        </div>

          {/* Right — 40% */}
          <div
            className="animate-fade-up hidden sm:block lg:col-span-2"
            style={{ animationDelay: "240ms" }}
          >
            <div className="bg-forge-surface border border-forge-border rounded-xl p-6 flex flex-col gap-5">
            <p className="text-forge-muted text-xs tracking-[0.15em] uppercase font-display">
              Analysis Output
            </p>

            {/* Score */}
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-display font-bold text-forge-success">
                87
              </span>
              <span className="text-lg text-forge-muted">/100</span>
            </div>

            {/* Progress bar */}
            <div>
              <p className="text-xs text-forge-muted tracking-wider uppercase mb-2 font-display">
                ATS Compatibility
              </p>
              <div className="w-full h-1.5 bg-forge-elevated rounded-full overflow-hidden">
                <div
                  className="h-full bg-forge-accent rounded-full"
                  style={{ width: "87%" }}
                />
              </div>
            </div>

            {/* Keyword pills */}
            <div className="flex flex-wrap gap-2">
              {platformPills.map((kw) => (
                <span
                  key={kw}
                  className="text-xs text-forge-text border border-forge-border rounded-full px-3 py-1"
                >
                  {kw}
                </span>
              ))}
            </div>

            {/* Before/After */}
            <div className="border-t border-forge-border pt-4 flex flex-col gap-1">
              <p className="text-sm text-forge-muted">
                <span className="text-forge-muted">Before:</span> Worked on
                projects
              </p>
              <p className="text-sm text-forge-text">
                <span className="text-forge-accent">After:</span> Led
                cross-functional development of 3 customer-facing products
              </p>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="border-y border-forge-border/60 bg-forge-surface/30 py-10 md:py-12">
      <div className="max-w-7xl mx-auto px-6 w-full">
        <div
          className="animate-fade-up flex items-center gap-4 mb-5"
          style={{ animationDelay: "480ms" }}
        >
          <div className="flex -space-x-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <svg
                key={i}
                className="animate-fade-up w-4 h-4 text-forge-accent"
                style={{ animationDelay: `${520 + i * 60}ms` }}
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.965a1 1 0 00.95.69h4.17c.969 0 1.371 1.24.588 1.81l-3.375 2.452a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.375-2.452a1 1 0 00-1.176 0l-3.375 2.452c-.784.57-1.838-.196-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.049 9.392c-.783-.57-.38-1.81.588-1.81h4.17a1 1 0 00.95-.69l1.286-3.965z" />
              </svg>
            ))}
          </div>
          <p className="text-sm text-forge-muted">
            <span className="text-forge-text font-semibold">4.9</span> from 1,200+ job seekers
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <figure
              key={t.name}
              className="animate-fade-up group bg-forge-surface border border-forge-border rounded-xl p-5 flex flex-col gap-4 hover:border-forge-border-bright hover:-translate-y-0.5 transition-[transform,border-color,box-shadow] duration-300 ease-out hover:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.6)]"
              style={{ animationDelay: `${720 + i * 120}ms` }}
            >
              <blockquote className="text-sm text-forge-text leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="flex items-center gap-3 pt-1 border-t border-forge-border">
                <div className="w-9 h-9 rounded-full bg-forge-elevated border border-forge-border flex items-center justify-center shrink-0 transition-colors duration-300 group-hover:border-forge-accent/40">
                  <span className="text-xs font-display font-bold text-forge-accent">
                    {t.initials}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-forge-text font-semibold">
                    {t.name}
                  </span>
                  <span className="text-xs text-forge-muted">{t.role}</span>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
      </section>
    </>
  );
}
