"use client";

import ScreenShell from "../ScreenShell";
import type { SkillGap } from "@/lib/roadmap";

function tierFor(index: number, total: number): { dot: string; badge: string } {
  const fraction = total <= 1 ? 0 : index / (total - 1);
  if (fraction < 1 / 3) return { dot: "bg-accent-coral", badge: "bg-accent-coral-pale text-red-900" };
  if (fraction < 2 / 3) return { dot: "bg-accent-amber", badge: "bg-accent-amber-pale text-amber-900" };
  return { dot: "bg-accent-green", badge: "bg-accent-green-pale text-green-900" };
}

export default function SkillGapScreen({
  skillGaps,
  onContinue,
  onBack,
}: {
  skillGaps: SkillGap[];
  onContinue: () => void;
  onBack?: () => void;
}) {
  return (
    <ScreenShell title="Your skill gaps" subtitle="Ranked by how many of your liked roles ask for them" onBack={onBack}>
      {skillGaps.length === 0 ? (
        <p className="text-sm text-ink-muted">No gaps to show — go back and like a role first.</p>
      ) : (
        <ul className="space-y-2">
          {skillGaps.map((gap, i) => {
            const tier = tierFor(i, skillGaps.length);
            return (
              <li
                key={gap.skill}
                className="flex items-center gap-3 rounded-full border-2 border-primary-pale bg-white py-2.5 pl-2 pr-4"
              >
                <span className={`h-3 w-3 shrink-0 rounded-full ${tier.dot}`} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink">{gap.skill}</p>
                  <p className="truncate text-xs text-ink-muted">Needed for: {gap.roles.join(", ")}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${tier.badge}`}>
                  {gap.count}
                </span>
              </li>
            );
          })}
        </ul>
      )}
      <button
        onClick={onContinue}
        className="mt-6 w-full rounded-full bg-primary px-4 py-3.5 font-display text-sm font-bold text-white transition hover:bg-primary-dark"
      >
        What does closing these unlock?
      </button>
    </ScreenShell>
  );
}
