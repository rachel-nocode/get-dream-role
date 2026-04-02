import { AnalysisResult } from "./types";

export const DEMO_RESULT: AnalysisResult = {
  atsScore: 87,
  matchScore: 72,
  atsTarget: "greenhouse",
  targetName: "Greenhouse",
  missingKeywords: [
    "CI/CD",
    "agile methodology",
    "cross-functional collaboration",
    "system design",
    "microservices",
    "TypeScript",
    "cloud infrastructure",
    "mentoring",
  ],
  presentKeywords: [
    "JavaScript",
    "React",
    "Node.js",
    "Python",
    "SQL",
    "Git",
    "HTML",
    "CSS",
  ],
  suggestedKeywords: [
    "REST APIs",
    "performance optimization",
    "technical leadership",
    "data modeling",
    "test-driven development",
  ],
  sectionFeedback: [
    {
      section: "Summary",
      score: 45,
      feedback:
        "Too generic. Lacks quantifiable achievements, specific technologies, and role-level positioning. ATS systems weight the summary heavily for keyword density.",
      suggestions: [
        "Lead with years of experience and primary tech stack",
        "Include 2-3 measurable achievements",
        "Mirror the target role's core requirements",
        "Remove vague descriptors like 'good at problem solving'",
      ],
    },
    {
      section: "Experience — TechCorp Inc.",
      score: 52,
      feedback:
        "Bullet points are too vague and action-weak. No metrics, no scope indicators, no technical specifics. ATS parsers can't extract skill signals from generic language.",
      suggestions: [
        "Quantify every bullet: users served, performance gains, team size",
        "Start each bullet with a strong action verb",
        "Name specific technologies and frameworks used",
        "Describe the impact, not just the task",
      ],
    },
    {
      section: "Experience — StartupXYZ",
      score: 48,
      feedback:
        "Junior role bullets read like task lists rather than achievements. Even early-career work should demonstrate growth and measurable contribution.",
      suggestions: [
        "Reframe 'helped with' as 'contributed to' with specifics",
        "Add metrics even if approximate: pages built, test coverage improved",
        "Highlight any ownership or initiative taken",
      ],
    },
    {
      section: "Skills",
      score: 65,
      feedback:
        "Good baseline skills listed but missing several high-value keywords from the job description. Skills section is a primary ATS scanning target.",
      suggestions: [
        "Add TypeScript, CI/CD, cloud platforms (AWS/GCP)",
        "Group skills by category for readability",
        "Include soft skills that map to job requirements",
      ],
    },
  ],
  bulletRewrites: [
    {
      original: "Built features for the main product",
      rewritten:
        "Architected and shipped 12+ customer-facing features for the core SaaS platform, serving 50K+ monthly active users across React and Node.js",
      improvement:
        "Added specifics: feature count, user base, tech stack. Transformed vague action into quantified achievement.",
    },
    {
      original: "Worked with the team on various projects",
      rewritten:
        "Led cross-functional collaboration with 3 engineering squads on platform migration, reducing deployment time by 40% through CI/CD pipeline optimization",
      improvement:
        "Replaced passive language with leadership framing. Added metrics and specific technical outcome.",
    },
    {
      original: "Fixed bugs and improved performance",
      rewritten:
        "Identified and resolved 200+ production issues, improving application load time by 35% through code splitting, lazy loading, and database query optimization",
      improvement:
        "Quantified bug resolution volume and performance gains. Named specific optimization techniques.",
    },
    {
      original: "Participated in code reviews",
      rewritten:
        "Conducted 500+ code reviews across the engineering org, establishing TypeScript best practices that reduced type-related bugs by 60%",
      improvement:
        "Elevated from participation to leadership. Added measurable impact of the code review practice.",
    },
    {
      original: "Developed web pages using HTML, CSS, JavaScript",
      rewritten:
        "Built and maintained 15+ responsive web interfaces using modern JavaScript (ES6+), CSS Grid/Flexbox, achieving 95+ Lighthouse performance scores",
      improvement:
        "Added scope, modern tech specifics, and measurable quality metric.",
    },
    {
      original: "Helped with backend development",
      rewritten:
        "Contributed to RESTful API development in Node.js, implementing 8 new endpoints serving 10K+ daily requests with 99.9% uptime",
      improvement:
        "Replaced vague 'helped' with specific contribution, tech stack, and reliability metrics.",
    },
  ],
  optimizedResume: `ALEX CHEN
Senior Software Engineer | San Francisco, CA
alex.chen@email.com | linkedin.com/in/alexchen

SUMMARY
Senior Software Engineer with 6+ years of experience building scalable web applications using React, Node.js, TypeScript, and Python. Delivered 12+ customer-facing features serving 50K+ MAU. Proven track record in performance optimization (35% load time improvement), cross-functional team leadership, and establishing engineering best practices that reduced production bugs by 60%.

EXPERIENCE

Software Engineer, TechCorp Inc. — 2021–Present
• Architected and shipped 12+ customer-facing features for the core SaaS platform, serving 50K+ monthly active users across React and Node.js
• Led cross-functional collaboration with 3 engineering squads on platform migration, reducing deployment time by 40% through CI/CD pipeline optimization
• Identified and resolved 200+ production issues, improving application load time by 35% through code splitting, lazy loading, and database query optimization
• Conducted 500+ code reviews across the engineering org, establishing TypeScript best practices that reduced type-related bugs by 60%

Junior Developer, StartupXYZ — 2018–2021
• Built and maintained 15+ responsive web interfaces using modern JavaScript (ES6+), CSS Grid/Flexbox, achieving 95+ Lighthouse performance scores
• Contributed to RESTful API development in Node.js, implementing 8 new endpoints serving 10K+ daily requests with 99.9% uptime
• Authored 150+ unit and integration tests using Jest, improving codebase test coverage from 40% to 78%
• Drove adoption of agile methodology within the team, facilitating sprint planning and retrospectives for a 6-person squad

EDUCATION
B.S. Computer Science, State University — 2018

SKILLS
Languages: JavaScript, TypeScript, Python, SQL, HTML, CSS
Frameworks: React, Node.js, Express, Next.js
Tools: Git, CI/CD (GitHub Actions), Docker, AWS (S3, Lambda), PostgreSQL
Practices: Agile/Scrum, Test-Driven Development, Code Review, System Design`,
  summary:
    "Your resume has a strong technical foundation but relies too heavily on generic language. The biggest opportunities are in the Summary section (currently 45/100) and Experience bullets, where adding metrics, specific technologies, and outcome-driven language will significantly improve ATS pass rates. Skills section needs expansion to include high-demand keywords from the job description.",
  atsInsights: [
    "Greenhouse prioritizes keyword density in the Summary and Skills sections — these are parsed first",
    "Your current keyword match rate of 72% is below the typical 80%+ threshold for auto-advancement",
    "Adding TypeScript, CI/CD, and cloud infrastructure terms would push your match score above 85%",
    "Greenhouse's parser handles standard section headers well — your formatting is compatible",
    "Consider grouping skills by category (Languages, Frameworks, Tools) for better parsing accuracy",
  ],
};
