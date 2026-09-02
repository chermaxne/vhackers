"use client";

import { useEffect, useState } from "react";
import ScreenShell from "../ScreenShell";
import type { TailoredResume } from "@/lib/llm/tailorResume";

export default function ResumeTailoring({
  resumeText,
  targetRole,
  emphasizeSkills,
  onBack,
}: {
  resumeText: string;
  targetRole: string;
  emphasizeSkills: string[];
  onBack?: () => void;
}) {
  const [tailored, setTailored] = useState<TailoredResume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/resume/tailor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeText, targetRole, emphasizeSkills }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.status !== "ok") throw new Error(json.error ?? "Tailoring failed");
        setTailored(json.data as TailoredResume);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Couldn't tailor your resume.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // resumeText/targetRole/emphasizeSkills are derived fresh from flow state
    // each time this screen mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleCopy() {
    if (!tailored) return;
    navigator.clipboard.writeText(tailored.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownload() {
    if (!tailored) return;
    const blob = new Blob([tailored.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tailored-resume.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <ScreenShell title="Your tailored resume" subtitle={`Reframed for: ${targetRole}`} onBack={onBack}>
      {loading && (
        <div className="space-y-2">
          <div className="h-4 w-3/4 animate-pulse rounded-full bg-primary-pale/40" />
          <div className="h-4 w-full animate-pulse rounded-full bg-primary-pale/40" />
          <div className="h-4 w-5/6 animate-pulse rounded-full bg-primary-pale/40" />
          <div className="h-4 w-2/3 animate-pulse rounded-full bg-primary-pale/40" />
        </div>
      )}

      {!loading && error && <p className="text-sm font-semibold text-accent-coral">{error}</p>}

      {!loading && tailored && (
        <>
          {tailored.source === "heuristic" && (
            <p className="mb-3 text-[11px] text-ink-muted">
              Rewritten bullet points need a live Claude call — showing your original resume with a tailoring
              header for now. Swaps to full rewriting automatically once API credits are available.
            </p>
          )}
          <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-2xl border-2 border-primary-pale bg-white p-4 text-xs leading-relaxed text-ink">
            {tailored.content}
          </pre>
          <p className="mt-3 text-[11px] text-ink-muted">
            This is a quick working draft, not an ATS-formatted export — copy it into your usual resume template
            before sending it anywhere.
          </p>

          <div className="mt-5 flex gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 rounded-full bg-primary px-4 py-3.5 font-display text-sm font-bold text-white transition hover:bg-primary-dark"
            >
              {copied ? "Copied ✓" : "Copy to clipboard"}
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 rounded-full border-2 border-primary-pale bg-white px-4 py-3.5 font-display text-sm font-bold text-primary-dark transition hover:bg-primary-pale/40"
            >
              Download .txt
            </button>
          </div>
        </>
      )}
    </ScreenShell>
  );
}
