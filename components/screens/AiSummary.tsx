"use client";

import ScreenShell from "../ScreenShell";
import type { JobCard } from "@/lib/jobs";

function topTransferableSkills(jobs: JobCard[], limit = 4): string[] {
  const counts = new Map<string, number>();
  for (const job of jobs) {
    for (const skill of job.transferableSkills) {
      counts.set(skill, (counts.get(skill) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([skill]) => skill).slice(0, limit);
}

export default function AiSummary({
  likedJobs,
  onContinue,
  onBack,
}: {
  likedJobs: JobCard[];
  onContinue: () => void;
  onBack?: () => void;
}) {
  const commonThreads = topTransferableSkills(likedJobs);

  return (
    <ScreenShell
      title="What you're drawn to"
      subtitle={`Based on the ${likedJobs.length} roles you liked`}
      eyebrow={
        <>
          AI Summary <span aria-hidden>✨</span>
        </>
      }
      onBack={onBack}
    >
      {likedJobs.length === 0 ? (
        <p className="text-sm text-ink-muted">
          You didn&apos;t like any roles this round — go back and swipe right on a few to get a summary.
        </p>
      ) : (
        <>
          <ul className="space-y-1.5">
            {likedJobs.map((job) => (
              <li
                key={job.uuid}
                className="rounded-full bg-accent-amber-pale px-4 py-2 text-sm font-semibold text-amber-900"
              >
                {job.title}
              </li>
            ))}
          </ul>

          {commonThreads.length > 0 && (
            <div className="mt-5">
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-ink-muted">
                Common thread across your picks
              </p>
              <div className="flex flex-wrap gap-1.5">
                {commonThreads.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-primary-light bg-primary-pale px-2.5 py-1 text-xs font-semibold text-primary-dark"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="mt-5 text-xs text-ink-muted">
            This summary is computed from your picks directly (most frequent transferable skills) — it&apos;s
            not an LLM-generated summary yet.
          </p>
        </>
      )}

      <button
        onClick={onContinue}
        className="mt-6 w-full rounded-full bg-primary px-4 py-3.5 font-display text-sm font-bold text-white transition hover:bg-primary-dark"
      >
        See my skill gaps
      </button>
    </ScreenShell>
  );
}
