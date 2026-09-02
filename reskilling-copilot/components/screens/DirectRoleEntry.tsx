"use client";

import { useState } from "react";
import ScreenShell from "../ScreenShell";
import { SAMPLE_JOBS } from "@/lib/jobs";

export default function DirectRoleEntry({
  onSubmit,
  onBack,
}: {
  onSubmit: (role: string) => void;
  onBack?: () => void;
}) {
  const [role, setRole] = useState("");

  return (
    <ScreenShell title="What role are you aiming for?" subtitle="We'll build your roadmap right away." onBack={onBack}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (role.trim()) onSubmit(role.trim());
        }}
      >
        <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">Desired role</label>
        <div className="mt-2 flex items-center gap-2 rounded-full border-2 border-primary-pale bg-primary-pale/30 py-1 pl-5 pr-1.5 transition focus-within:border-primary">
          <input
            autoFocus
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Search your role, e.g. Data Analyst"
            className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-ink outline-none placeholder:text-ink-muted"
          />
          <button
            type="submit"
            disabled={!role.trim()}
            aria-label="Build my roadmap"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            →
          </button>
        </div>
        <p className="mt-3 text-xs text-ink-muted">
          Try one of: {SAMPLE_JOBS.map((j) => j.title).join(", ")} — this demo only has skills data for a
          handful of sample roles.
        </p>
      </form>
    </ScreenShell>
  );
}
