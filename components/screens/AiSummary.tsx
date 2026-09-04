"use client";

import { useEffect, useState } from "react";
import ScreenShell from "../ScreenShell";
import type { JobCard } from "@/lib/jobs";
import type { InterestSummary } from "@/lib/llm/summarizeInterests";

function topTransferableSkills(jobs: JobCard[], limit = 4): string[] {
  const counts = new Map<string, number>();
  for (const job of jobs) {
    for (const skill of job.transferableSkills) {
      counts.set(skill, (counts.get(skill) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([skill]) => skill).slice(0, limit);
}

export default function AiSummary({ likedJobs, onContinue, onBack }: { likedJobs: JobCard[]; onContinue: () => void; onBack?: () => void }) {
  const commonThreads = topTransferableSkills(likedJobs);
  const [summary, setSummary] = useState<InterestSummary | null>(null);
  const [loading, setLoading] = useState(likedJobs.length > 0);

  useEffect(() => {
    if (likedJobs.length === 0) return;
    let cancelled = false;
    fetch("/api/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ likedJobs }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled && json.status === "ok") setSummary(json.data as InterestSummary);
      })
      .catch(() => {
        // Network failure — the summary panel just stays hidden; the liked-role
        // list and common-thread chips below already carry the useful info.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // likedJobs is derived fresh from flow state each time this screen mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          {loading && (
            <div className="mb-5 h-16 animate-pulse rounded-2xl bg-primary-pale/40" aria-label="Summarizing…" />
          )}
          {!loading && summary && (
            <div className="mb-5 rounded-2xl bg-gradient-to-br from-primary-pale/60 to-accent-amber-pale/60 p-4">
              <p className="text-sm leading-relaxed text-ink">{summary.narrative}</p>
              {summary.source === "heuristic" && (
                <p className="mt-2 text-[11px] text-ink-muted">
                  Computed directly from your picks — swaps to a live Claude-written summary automatically once API
                  credits are available.
                </p>
              )}
            </div>
          )}

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
