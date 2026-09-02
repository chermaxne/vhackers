"use client";

import ScreenShell from "../ScreenShell";
import type { Roadmap } from "@/lib/roadmap";

export default function WhatThisUnlocks({
  unlocks,
  onContinue,
  onBack,
}: {
  unlocks: Roadmap["unlocks"];
  onContinue: () => void;
  onBack?: () => void;
}) {
  return (
    <ScreenShell title="What this unlocks" subtitle="Reframing the gaps as opportunity, not deficiency" onBack={onBack}>
      <div className="rounded-[1.5rem] bg-gradient-to-br from-accent-amber-pale to-primary-pale p-5">
        <p className="text-sm font-bold text-ink">{unlocks.headline}</p>
      </div>

      {unlocks.roles.length > 0 && (
        <div className="mt-5">
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-ink-muted">Roles this opens up</p>
          <div className="flex flex-wrap gap-1.5">
            {unlocks.roles.map((role) => (
              <span
                key={role}
                className="rounded-full border border-accent-amber/40 bg-accent-amber-pale px-2.5 py-1 text-xs font-semibold text-amber-900"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onContinue}
        className="mt-6 w-full rounded-full bg-primary px-4 py-3.5 font-display text-sm font-bold text-white transition hover:bg-primary-dark"
      >
        Unlock my roadmap
      </button>
    </ScreenShell>
  );
}
