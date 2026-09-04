"use client";

import { useState } from "react";
import ScreenShell from "../ScreenShell";
import { SAMPLE_JOBS } from "@/lib/jobs";

export default function DirectRoleEntry({
  onSubmit,
  onBack,
}: {
  onSubmit: (role: string) => Promise<void> | void;
  onBack?: () => void;
}) {
  const [role, setRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <ScreenShell title="What role are you aiming for?" subtitle="We'll build your roadmap right away." onBack={onBack}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!role.trim() || isSubmitting) return;
          setIsSubmitting(true);
          try {
            await onSubmit(role.trim());
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">Desired role</label>
        <div className="mt-2 flex items-center gap-2 rounded-full border-2 border-primary-pale bg-primary-pale/30 py-1 pl-5 pr-1.5 transition focus-within:border-primary">
          <input
            autoFocus
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Search your role, e.g. Data Analyst"
            disabled={isSubmitting}
            className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-ink outline-none placeholder:text-ink-muted disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!role.trim() || isSubmitting}
            aria-label="Build my roadmap"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSubmitting ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              "→"
            )}
          </button>
        </div>
        <p className="mt-3 text-xs text-ink-muted">
          {isSubmitting
            ? "Pulling live postings from MyCareersFuture…"
            : `Try one of: ${SAMPLE_JOBS.map((j) => j.title).join(", ")} — or any role title, we'll pull live skills data for it.`}
        </p>
      </form>
    </ScreenShell>
  );
}
