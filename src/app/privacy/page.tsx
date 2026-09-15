import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "Privacy policy for GetDreamRole resume optimization, payments, analytics, and resume processing.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-forge-muted hover:text-forge-text transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      <h1 className="font-display text-3xl font-bold text-forge-text mb-2">
        Privacy Policy
      </h1>
      <p className="text-forge-muted text-sm mb-10">Last updated: April 2, 2026</p>

      <div className="prose prose-sm max-w-none space-y-8 text-forge-muted leading-relaxed">
        <section>
          <h2 className="font-display text-lg font-semibold text-forge-text mb-3">1. Information We Collect</h2>
          <p>
            GetDreamRole collects only the information necessary to provide our resume optimization service:
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-1">
            <li>Resume text you upload to the free checker (processed in memory, not stored)</li>
            <li>If you sign in and build a master profile: the resume text you paste, the facts parsed from it, your job preferences, screening answers, watched job boards, and the applications you track, stored in your account until you delete them</li>
            <li>AI provider keys you add, encrypted at rest and decrypted only inside the backend call that uses them</li>
            <li>Job descriptions you paste into the tool</li>
            <li>Payment information processed securely through Stripe — we never see or store your card details</li>
            <li>Browser storage data (localStorage/sessionStorage) used to persist your session on your device</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-forge-text mb-3">2. How We Use Your Information</h2>
          <p>Your data is used solely to:</p>
          <ul className="list-disc pl-5 mt-3 space-y-1">
            <li>Generate resume analysis and AI-powered optimization suggestions</li>
            <li>Process your one-time payment</li>
            <li>Maintain your access status on your current device</li>
          </ul>
          <p className="mt-3">
            We do not sell, rent, or share your personal information or resume content with any third party for marketing purposes.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-forge-text mb-3">3. Data Retention</h2>
          <p>
            The free checker processes resume content and job descriptions in real time and does not keep them; its results are held in your browser&apos;s sessionStorage and cleared when you close the tab. A signed-in master profile, the apply kits generated from it, and your application tracker are stored in your account so the agent can cite your own facts, and they stay until you delete them. You can delete your profile, including the stored resume text, from the Profile page at any time.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-forge-text mb-3">4. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul className="list-disc pl-5 mt-3 space-y-1">
            <li><strong className="text-forge-text">Stripe</strong> — payment processing. Subject to <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-forge-accent hover:underline">Stripe&apos;s Privacy Policy</a>.</li>
            <li><strong className="text-forge-text">Groq</strong> — AI language model for resume analysis. Resume content is sent to Groq&apos;s API for processing.</li>
            <li><strong className="text-forge-text">DataFast</strong> — website analytics and revenue attribution.</li>
            <li><strong className="text-forge-text">Vercel</strong> — analytics, speed insights, and hosting infrastructure.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-forge-text mb-3">5. Cookies & Local Storage</h2>
          <p>
            We use browser localStorage to store your payment status on your device. DataFast uses first-party analytics cookies to connect visits with purchases for revenue attribution. We do not use advertising trackers.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-forge-text mb-3">6. Your Rights</h2>
          <p>
            If you use the free checker without signing in, your resume data lives only in your browser session and there is nothing stored for us to access or delete. If you sign in, you can view and edit everything stored about you on the Profile, Jobs and Applications pages, remove any AI key from Settings, and delete your profile with its resume text from the Profile page. Email us to have the rest of your account removed.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-forge-text mb-3">7. Contact</h2>
          <p>
            Questions about this policy? Reach out at{" "}
            <a href="mailto:witchaudiostudios@gmail.com" className="text-forge-accent hover:underline">
              witchaudiostudios@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
