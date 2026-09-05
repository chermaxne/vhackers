"use client";

import { useEffect, useState } from "react";
import ScreenShell from "../ScreenShell";
import type { InterviewPrepInput, InterviewPrepResult } from "@/lib/llm/interviewPrep";

const CATEGORY_STYLES: Record<string, string> = {
  "Career transition story": "bg-primary-pale text-primary-dark",
  Behavioral: "bg-accent-amber-pale text-amber-900",
  "Role-specific": "bg-accent-green-pale text-green-900",
};

export default function InterviewPrep({ input, onBack }: { input: InterviewPrepInput; onBack?: () => void }) {
  const [result, setResult] = useState<InterviewPrepResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/interview-prep", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.status !== "ok") throw new Error(json.error ?? "Couldn't generate interview questions");
        setResult(json.data as InterviewPrepResult);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Couldn't generate interview questions");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // input is derived fresh from flow state each time this screen mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ScreenShell title="Mock interview prep" subtitle={`For: ${input.targetRole}`} onBack={onBack}>
      {loading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-primary-pale/40" />
          ))}
        </div>
      )}

      {!loading && error && <p className="text-sm font-semibold text-accent-coral">{error}</p>}

      {!loading && result && (
        <>
          {result.source === "heuristic" && (
            <p className="mb-3 text-[11px] text-ink-muted">
              Template questions filled in with your own data for now — swaps to fully adaptive questions
              automatically once API credits are available.
            </p>
          )}
          <div className="space-y-3">
            {result.questions.map((q, i) => (
              <div key={i} className="rounded-2xl border-2 border-primary-pale bg-white p-4">
                <span
                  className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${CATEGORY_STYLES[q.category] ?? "bg-primary-pale text-primary-dark"}`}
                >
                  {q.category}
                </span>
                <p className="mt-2 font-display text-sm font-extrabold text-ink">{q.question}</p>
                <p className="mt-1.5 text-xs text-ink-muted">Why they ask this: {q.whyAsked}</p>
                <p className="mt-2 rounded-xl bg-accent-green-pale/60 px-3 py-2 text-xs font-semibold text-ink">
                  💡 {q.suggestedTalkingPoint}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </ScreenShell>
  );
}
