import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/landing/Navbar";

export const metadata: Metadata = {
  title: "How to Optimize Your Resume for Greenhouse ATS (2026 Guide)",
  description:
    "Greenhouse is used by thousands of tech companies. Here's exactly how it parses your resume, what it scores, and how to make sure you pass the filter.",
};

export default function GreenhouseAtsPost() {
  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-20">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-forge-muted hover:text-forge-text transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All guides
        </Link>

        <div className="mt-10">
          <p className="text-forge-accent text-xs tracking-[0.18em] uppercase font-display">
            ATS Optimization
          </p>
          <h1 className="mt-3 font-display text-3xl md:text-4xl font-bold text-forge-text leading-tight">
            How to Optimize Your Resume for Greenhouse ATS (2026 Guide)
          </h1>
          <div className="mt-4 flex items-center gap-4 text-xs text-forge-muted">
            <span>April 2, 2026</span>
            <span>7 min read</span>
          </div>
        </div>

        <div className="mt-12 space-y-8 text-forge-muted leading-relaxed">
          <p>
            Greenhouse is the ATS behind hiring at thousands of companies —
            Airbnb, Dropbox, HubSpot, and hundreds of high-growth startups all
            run their recruiting pipelines through it. If you&apos;re applying
            to a tech or growth-stage company, there&apos;s a high probability
            your resume is being parsed by Greenhouse before a recruiter ever
            opens it.
          </p>
          <p>
            The good news: Greenhouse is one of the more lenient ATS platforms
            when it comes to PDF parsing. The bad news: its keyword-matching and
            scoring systems are configured by recruiters at each company, which
            means there&apos;s no single formula that works everywhere. Here is
            what you can control.
          </p>

          <section>
            <h2 className="font-display text-xl font-semibold text-forge-text mb-4">
              How Greenhouse actually reads your resume
            </h2>
            <p>
              When you apply through a Greenhouse-powered job page, the system
              parses your PDF into structured fields: name, contact info, work
              history (company, title, dates, description), education, and
              skills. It extracts this into a candidate profile that recruiters
              browse in a structured view — they rarely look at the raw PDF
              first.
            </p>
            <p className="mt-4">
              This matters because <strong className="text-forge-text">formatting that looks great as a PDF can parse
              badly</strong>. Two-column layouts, tables, headers and footers,
              text boxes, and inline graphics frequently cause Greenhouse to
              misplace content — a skill listed in a sidebar might not appear in
              the skills field at all.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-forge-text mb-4">
              Resume formatting rules for Greenhouse
            </h2>
            <ul className="space-y-3 list-none">
              {[
                "Use a single-column layout. Two columns are the most common cause of parsing failures in Greenhouse.",
                "Keep your contact info in plain text at the top — not in a header element or text box.",
                "Use standard section labels: 'Work Experience', 'Education', 'Skills'. Clever labels like 'Where I've Been' confuse the parser.",
                "Standard fonts only (Arial, Calibri, Georgia, Helvetica). Unusual fonts sometimes cause character encoding issues in parsed text.",
                "Export as a standard PDF, not PDF/A. Avoid forms-based PDFs.",
                "No tables. Use bullet points with plain text dashes or the standard bullet character (•).",
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-forge-accent mt-0.5 shrink-0">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-forge-text mb-4">
              Keyword matching in Greenhouse
            </h2>
            <p>
              Greenhouse itself doesn&apos;t automatically score resumes — but
              most companies using it enable one of two things: manual keyword
              scorecards that recruiters fill out, or integrated tools like
              Greenhouse&apos;s own sourcing features or third-party integrations
              that surface candidates by keyword match.
            </p>
            <p className="mt-4">
              Either way, <strong className="text-forge-text">keywords from the job description need to appear in
              your resume</strong>. The closer the match, the more likely you
              surface when a recruiter searches or filters their candidate pool.
            </p>
            <p className="mt-4">
              Specific things to match:
            </p>
            <ul className="mt-3 space-y-3 list-none">
              {[
                "Technology names exactly as written in the job description. If the JD says 'TypeScript', don't write 'Typescript'.",
                "Job title keywords. If applying for 'Senior Software Engineer', having 'Software Engineer' in your most recent role title helps.",
                "Years of experience phrasing. If the JD requires '5+ years of Python', having a clear timeline with Python experience that adds up to that matters.",
                "Soft skills that appear in the JD (cross-functional collaboration, ownership, etc.) — at least one mention in a bullet point.",
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-forge-accent mt-0.5 shrink-0">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-forge-text mb-4">
              The section structure that performs best
            </h2>
            <p>
              For Greenhouse, the most reliably parsed structure is:
            </p>
            <ol className="mt-4 space-y-2 list-decimal list-inside text-forge-muted">
              <li>Contact information (name, email, phone, LinkedIn)</li>
              <li>Brief summary or objective (2-3 sentences, keyword-rich)</li>
              <li>Work experience (reverse chronological, standard labels)</li>
              <li>Skills (flat list, comma-separated or one per line)</li>
              <li>Education</li>
              <li>Certifications (if relevant)</li>
            </ol>
            <p className="mt-4">
              The summary section is particularly valuable for Greenhouse
              candidates because it gives you a place to include high-priority
              keywords early in the document, before the parsed text gets to
              specific job bullets.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-forge-text mb-4">
              Common mistakes that get you filtered out
            </h2>
            <ul className="space-y-3 list-none">
              {[
                "Listing skills only in a graphical skill meter or icon grid. These almost never parse correctly.",
                "Using 'Present' for your current role end date. Some parsers miss this. Write the current month and year.",
                "Dates in non-standard formats (Jan '24 instead of January 2024 or 01/2024). Consistency matters more than format.",
                "Omitting a Skills section. Even if skills appear throughout your bullet points, a dedicated section helps Greenhouse extract them into the skills field.",
                "Resumes over 2 pages. Not a hard rule, but recruiter attention drops sharply on page 2 when reviewing the parsed profile view.",
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-forge-accent mt-0.5 shrink-0">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-forge-text mb-4">
              Skip the manual work
            </h2>
            <p>
              Manually auditing your resume against every Greenhouse job
              description you apply to takes time and is easy to get wrong.
              GetDreamRole does this automatically — upload your resume, paste
              the job description, select Greenhouse as your target ATS, and
              the AI analyzes keyword gaps and rewrites your bullets to
              maximize your match score.
            </p>
            <div className="mt-6">
              <Link
                href="/optimize"
                className="inline-flex items-center gap-2 bg-forge-accent hover:bg-forge-accent-hover text-forge-bg font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
              >
                Optimize my resume for Greenhouse →
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
