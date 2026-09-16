/**
 * Turning an apply kit into files the user can attach.
 *
 * The tailored resume is stored as plain text with known section headings, a
 * `Title — Company` line per role and `- ` bullets, so the Markdown version is
 * a deterministic pass over that shape rather than a second rendering path.
 */

const SECTION_HEADINGS = new Set([
  "SUMMARY",
  "EXPERIENCE",
  "SKILLS",
  "EDUCATION",
  "CERTIFICATIONS",
  "PROJECTS",
]);

export function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug.length > 0 ? slug : "application";
}

export function fileNameFor(company: string, part: string, extension: string): string {
  return `getdreamrole-${slugify(company)}-${part}.${extension}`;
}

function titleCase(heading: string): string {
  return heading.charAt(0) + heading.slice(1).toLowerCase();
}

/** Headings per experience and `- ` bullets, from the stored plain text. */
export function resumeToMarkdown(resumeText: string): string {
  const lines = resumeText.split("\n");
  const out: string[] = [];
  let inExperience = false;
  let startOfBlock = true;
  let nameWritten = false;

  for (const raw of lines) {
    const line = raw.trim();

    if (line.length === 0) {
      out.push("");
      startOfBlock = true;
      continue;
    }

    if (SECTION_HEADINGS.has(line)) {
      inExperience = line === "EXPERIENCE";
      out.push(`## ${titleCase(line)}`);
      startOfBlock = true;
      continue;
    }

    if (!nameWritten) {
      out.push(`# ${line}`);
      nameWritten = true;
      startOfBlock = false;
      continue;
    }

    if (line.startsWith("- ")) {
      out.push(line);
      startOfBlock = false;
      continue;
    }

    // Inside EXPERIENCE the first line of a block is the role itself; the one
    // under it is the location and dates, which stay as plain text.
    out.push(inExperience && startOfBlock ? `### ${line}` : line);
    startOfBlock = false;
  }

  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function downloadTextFile(fileName: string, content: string, mimeType: string): void {
  const href = URL.createObjectURL(new Blob([content], { type: `${mimeType};charset=utf-8` }));
  const link = document.createElement("a");
  link.href = href;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(href);
}
