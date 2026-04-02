export type ATSTarget =
  | "greenhouse"
  | "lever"
  | "workday"
  | "taleo"
  | "icims"
  | "generic";

export interface ATSOption {
  id: ATSTarget;
  name: string;
  engine: string;
  description: string;
}

export const ATS_OPTIONS: ATSOption[] = [
  {
    id: "greenhouse",
    name: "Greenhouse",
    engine: "Resume-friendly NLP",
    description:
      "Structured parsing with strong keyword matching. Prioritizes clean formatting and skills alignment.",
  },
  {
    id: "lever",
    name: "Lever",
    engine: "Modern NLP parser",
    description:
      "Recruiter-centric with context-aware matching. Values narrative flow and role relevance.",
  },
  {
    id: "workday",
    name: "Workday",
    engine: "Enterprise NLP + rules",
    description:
      "Strict field-based parsing. Requires exact section headers and keyword density.",
  },
  {
    id: "taleo",
    name: "Taleo",
    engine: "Legacy keyword matcher",
    description:
      "Boolean keyword search with rigid parsing. Demands explicit skill listing and standard formatting.",
  },
  {
    id: "icims",
    name: "iCIMS",
    engine: "Semantic scoring",
    description:
      "AI-assisted ranking with semantic similarity. Rewards contextual keyword usage over stuffing.",
  },
  {
    id: "generic",
    name: "Generic ATS",
    engine: "Broad compatibility",
    description:
      "Optimized for maximum cross-platform compatibility. Safe defaults for unknown systems.",
  },
];

export interface WizardState {
  step: number;
  atsTarget: ATSTarget | null;
  jobTitle: string;
  jobDescription: string;
  resumeFile: File | null;
  resumeFileName: string;
  resumeText: string;
}

export interface Job {
  job_id: string;
  job_title: string;
  employer_name: string;
  employer_logo: string | null;
  job_city: string | null;
  job_state: string | null;
  job_country: string;
  job_employment_type: string | null;
  job_posted_at_datetime_utc: string | null;
  job_description: string;
  job_apply_link: string;
  job_is_remote: boolean;
  job_salary_min: number | null;
  job_salary_max: number | null;
  job_salary_currency: string | null;
}

export interface BulletRewrite {
  original: string;
  rewritten: string;
  improvement: string;
}

export interface SectionFeedback {
  section: string;
  score: number;
  feedback: string;
  suggestions: string[];
}

export interface AnalysisResult {
  atsScore: number;
  matchScore: number;
  atsTarget: string;
  targetName: string;
  missingKeywords: string[];
  presentKeywords: string[];
  suggestedKeywords: string[];
  sectionFeedback: SectionFeedback[];
  bulletRewrites: BulletRewrite[];
  optimizedResume: string;
  summary: string;
  atsInsights: string[];
}
