"use client";

import { useState } from "react";
import Link from "next/link";
import { useAction, useMutation, useQuery } from "convex/react";
import { CheckCircle2 } from "lucide-react";
import clsx from "clsx";
import AppShell from "@/components/app/AppShell";
import AnswerBank from "@/components/profile/AnswerBank";
import ExperienceEditor from "@/components/profile/ExperienceEditor";
import PreferencesForm from "@/components/profile/PreferencesForm";
import ResumePanel from "@/components/profile/ResumePanel";
import RowListEditor, { type RowValues } from "@/components/profile/RowListEditor";
import VoicePanel from "@/components/profile/VoicePanel";
import { api } from "@convex/_generated/api";
import {
  PROVIDERS,
  estimateParseProfileCost,
  findModel,
  formatUsd,
} from "@convex/ai/providers";
import type { JobPreferences } from "@convex/validators";

function optionalNumber(value: string): number | undefined {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export default function ProfileClient() {
  const profile = useQuery(api.careerProfile.get);
  const legacyProfile = useQuery(api.profiles.getDefaultProfile);
  const model = useQuery(api.aiSettings.resolvedModel);
  const parseResume = useAction(api.ai.profileActions.parseResume);
  const upsert = useMutation(api.careerProfile.upsert);
  const confirmProfile = useMutation(api.careerProfile.confirm);
  const updateAnswer = useMutation(api.careerProfile.updateAnswer);
  const removeProfile = useMutation(api.careerProfile.remove);

  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const loading = profile === undefined || legacyProfile === undefined;
  // Every editor holds its values in the DOM, so a save remounts them with
  // the freshly saved data instead of syncing server state into React state.
  const version = profile ? String(profile.updatedAt) : "empty";
  const confirmed = profile?.confirmedAt !== undefined;
  const changedSinceConfirm =
    profile?.confirmedAt !== undefined && profile.updatedAt > profile.confirmedAt;

  async function guard(task: () => Promise<string>) {
    setNotice("");
    setError("");
    try {
      setNotice(await task());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  function parseCostLine() {
    if (model === undefined) return "Checking which model you are on...";
    const info = findModel(model.provider, model.model);
    const label = `${PROVIDERS[model.provider].label} ${info?.label ?? model.model}`;
    if (!info) return `Runs on ${label}.`;
    return `≈ ${formatUsd(estimateParseProfileCost(info))} on ${label}${
      model.usingHouseKey ? ", the shared trial key" : ""
    }.`;
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-forge-accent">
              Master profile
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold">Your facts, confirmed once</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-forge-muted">
              Everything an application claims about you has to come from this page. Parse your
              resume, correct what is wrong, then confirm it. Discovery and tailoring read it from
              there.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2">
            <span
              className={clsx(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
                confirmed && !changedSinceConfirm
                  ? "border-forge-success/40 bg-forge-success/10 text-forge-success"
                  : "border-forge-warning/40 bg-forge-warning/10 text-forge-warning",
              )}
            >
              <CheckCircle2 className="h-4 w-4" />
              {!confirmed
                ? "Not confirmed yet"
                : changedSinceConfirm
                  ? "Edited since you confirmed"
                  : `Confirmed ${new Date(profile.confirmedAt ?? 0).toLocaleDateString()}`}
            </span>
            <button
              type="button"
              disabled={loading}
              onClick={() =>
                guard(async () => {
                  await confirmProfile({});
                  return "Profile confirmed. Discovery and tailoring can use it now.";
                })
              }
              className="inline-flex h-11 items-center justify-center rounded-lg bg-forge-accent px-5 text-sm font-semibold text-forge-bg hover:bg-forge-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {confirmed ? "Confirm again" : "Confirm profile"}
            </button>
            <Link href="/jobs" className="text-sm text-forge-accent hover:text-forge-accent-hover">
              Go to job discovery
            </Link>
            {profile ? (
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  if (
                    !window.confirm(
                      "Delete your stored profile, including the resume text? Apply kits you already generated keep their own copy.",
                    )
                  ) {
                    return;
                  }
                  void guard(async () => {
                    await removeProfile({});
                    return "Profile deleted. Your resume text is no longer stored.";
                  });
                }}
                className="text-sm text-forge-danger hover:underline disabled:cursor-not-allowed disabled:opacity-60"
              >
                Delete profile
              </button>
            ) : null}
          </div>
        </section>

        {error ? (
          <p className="rounded-lg border border-forge-danger/30 bg-forge-danger/10 px-4 py-3 text-sm text-forge-danger">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p className="rounded-lg border border-forge-success/30 bg-forge-success/10 px-4 py-3 text-sm text-forge-success">
            {notice}
          </p>
        ) : null}

        {loading ? (
          <p className="text-sm text-forge-muted">Loading your profile...</p>
        ) : (
          <>
            <ResumePanel
              // Keyed on whether a profile exists, not on every save, so long
              // pasted text survives saving another section.
              key={`resume-${profile === null ? "empty" : "saved"}`}
              defaultText={profile?.sourceResumeText || legacyProfile?.resumeText || ""}
              costLine={parseCostLine()}
              prefilledFromOldProfile={
                !profile?.sourceResumeText && Boolean(legacyProfile?.resumeText)
              }
              onParse={(resumeText) =>
                guard(async () => {
                  const result = await parseResume({ resumeText });
                  return `Parsed ${result.experiences} role${
                    result.experiences === 1 ? "" : "s"
                  } and ${result.skills} skill${result.skills === 1 ? "" : "s"} for ${formatUsd(
                    result.costUsd,
                  )}. Check it, then confirm.`;
                })
              }
            />

            <ExperienceEditor
              key={`experience-${version}`}
              initialEntries={profile?.experiences ?? []}
              onSave={(experiences) =>
                guard(async () => {
                  await upsert({ experiences });
                  return "Experience saved.";
                })
              }
            />

            <RowListEditor
              key={`skills-${version}`}
              title="Skills"
              description="Only skills your resume names. Years are optional."
              addLabel="Add skill"
              emptyLabel="No skills yet."
              fields={[
                { name: "name", label: "Skill", placeholder: "TypeScript" },
                { name: "category", label: "Category", placeholder: "Languages" },
                { name: "years", label: "Years", placeholder: "5", type: "number" },
              ]}
              initialRows={(profile?.skills ?? []).map((skill) => ({
                id: skill.id,
                name: skill.name,
                category: skill.category ?? "",
                years: skill.years === undefined ? "" : String(skill.years),
              }))}
              onSave={(rows: RowValues[]) =>
                guard(async () => {
                  await upsert({
                    skills: rows.map((row) => ({
                      id: row.id ?? "",
                      name: row.name ?? "",
                      category: row.category ?? "",
                      years: optionalNumber(row.years ?? ""),
                    })),
                  });
                  return "Skills saved.";
                })
              }
            />

            <RowListEditor
              key={`education-${version}`}
              title="Education"
              description="Schools and degrees exactly as they appear on your resume."
              addLabel="Add education"
              emptyLabel="No education entries yet."
              fields={[
                { name: "school", label: "School", placeholder: "TU Berlin" },
                { name: "degree", label: "Degree", placeholder: "BSc" },
                { name: "field", label: "Field", placeholder: "Computer Science" },
                { name: "year", label: "Year", placeholder: "2018" },
              ]}
              initialRows={(profile?.education ?? []).map((entry) => ({
                id: entry.id,
                school: entry.school,
                degree: entry.degree,
                field: entry.field ?? "",
                year: entry.year ?? "",
              }))}
              onSave={(rows: RowValues[]) =>
                guard(async () => {
                  await upsert({
                    education: rows.map((row) => ({
                      id: row.id ?? "",
                      school: row.school ?? "",
                      degree: row.degree ?? "",
                      field: row.field ?? "",
                      year: row.year ?? "",
                    })),
                  });
                  return "Education saved.";
                })
              }
            />

            <RowListEditor
              key={`certifications-${version}`}
              title="Certifications"
              description="Credentials you hold today."
              addLabel="Add certification"
              emptyLabel="No certifications yet."
              fields={[
                { name: "name", label: "Certification", placeholder: "AWS Solutions Architect" },
                { name: "issuer", label: "Issuer", placeholder: "Amazon Web Services" },
                { name: "year", label: "Year", placeholder: "2025" },
              ]}
              initialRows={(profile?.certifications ?? []).map((entry) => ({
                id: entry.id,
                name: entry.name,
                issuer: entry.issuer ?? "",
                year: entry.year ?? "",
              }))}
              onSave={(rows: RowValues[]) =>
                guard(async () => {
                  await upsert({
                    certifications: rows.map((row) => ({
                      id: row.id ?? "",
                      name: row.name ?? "",
                      issuer: row.issuer ?? "",
                      year: row.year ?? "",
                    })),
                  });
                  return "Certifications saved.";
                })
              }
            />

            <RowListEditor
              key={`projects-${version}`}
              title="Projects"
              description="Work you can point at, with a link where there is one."
              addLabel="Add project"
              emptyLabel="No projects yet."
              fields={[
                { name: "name", label: "Project", placeholder: "Release radar" },
                { name: "link", label: "Link", placeholder: "https://github.com/you/project" },
                {
                  name: "description",
                  label: "Description",
                  placeholder: "What it does and what you built",
                  span: 3,
                },
              ]}
              initialRows={(profile?.projects ?? []).map((entry) => ({
                id: entry.id,
                name: entry.name,
                link: entry.link ?? "",
                description: entry.description,
              }))}
              onSave={(rows: RowValues[]) =>
                guard(async () => {
                  await upsert({
                    projects: rows.map((row) => ({
                      id: row.id ?? "",
                      name: row.name ?? "",
                      description: row.description ?? "",
                      link: row.link ?? "",
                    })),
                  });
                  return "Projects saved.";
                })
              }
            />

            <VoicePanel
              key={`voice-${version}`}
              summary={profile?.summary ?? ""}
              writingStyle={profile?.writingStyle ?? ""}
              onSave={(values) =>
                guard(async () => {
                  await upsert(values);
                  return "Summary and voice saved.";
                })
              }
            />

            <PreferencesForm
              key={`preferences-${version}`}
              initial={
                profile?.preferences ?? {
                  targetTitles: [],
                  locations: [],
                  remote: "any",
                  employmentTypes: [],
                  dealBreakers: [],
                  mustHaves: [],
                }
              }
              onSave={(preferences: JobPreferences) =>
                guard(async () => {
                  await upsert({ preferences });
                  return "Preferences saved.";
                })
              }
            />

            {profile ? (
              <AnswerBank
                entries={profile.answerBank}
                onSave={(key, answer) =>
                  guard(async () => {
                    await updateAnswer({ key, answer });
                    return "Answer saved.";
                  })
                }
              />
            ) : null}
          </>
        )}
      </div>
    </AppShell>
  );
}
