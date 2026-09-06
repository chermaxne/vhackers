"use client";

import ScreenShell from "../ScreenShell";
import type { SkillGap } from "@/lib/roadmap";

// Irrelevant, generic, or non-actionable keywords to filter out
const EXCLUDED_KEYWORDS = new Set([
  "physical fitness",
  "fitness",
  "smartphones",
  "smartphone",
  "driving license",
  "general",
  "communication",
  "teamwork",
  "punctual",
  "hardworking",
  "microsoft",
  "office",
  "tools",
]);

function tierFor(index: number): { dot: string; badge: string; label: string } {
  if (index === 0) return { dot: "bg-rose-500", badge: "bg-rose-50 text-rose-700 border-rose-200", label: "High Priority" };
  if (index <= 2) return { dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border-amber-200", label: "Core Gap" };
  return { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Bonus Lift" };
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
  // 1. Filter out noise & junk skills
  // 2. Limit to top 5 highest-impact gaps to prevent cognitive overload
  const cleanGaps = skillGaps
    .filter((g) => !EXCLUDED_KEYWORDS.has(g.skill.toLowerCase().trim()))
    .slice(0, 5);

  return (
    <ScreenShell
      title="High-Impact Skill Gaps"
      subtitle="Prioritized based on frequency across your shortlisted roles"
      onBack={onBack}
    >
      {cleanGaps.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
          <p className="text-sm font-medium text-slate-500">
            No significant skill gaps detected. You already qualify for foundational roles!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Top {cleanGaps.length} Critical Competencies to Close
          </p>

          <ul className="space-y-2.5">
            {cleanGaps.map((gap, i) => {
              const tier = tierFor(i);
              return (
                <li
                  key={gap.skill}
                  className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition hover:border-[#6C72B9]/60"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${tier.dot}`} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">{gap.skill}</p>
                      <p className="truncate text-xs text-slate-500">
                        Required by:{" "}
                        <span className="font-semibold text-slate-700">
                          {gap.roles.length > 0 ? gap.roles.join(", ") : "Shortlisted roles"}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 pl-3">
                    <span
                      className={`rounded-lg border px-2 py-0.5 text-[10px] font-extrabold uppercase ${tier.badge}`}
                    >
                      {tier.label}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-400">
                      {gap.count} {gap.count === 1 ? "role" : "roles"}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <button
        onClick={onContinue}
        className="mt-6 w-full rounded-2xl bg-[#6C72B9] py-3.5 text-center font-display text-xs font-bold text-white shadow-md shadow-indigo-100 transition hover:bg-[#5b61a3] active:scale-[0.99]"
      >
        What closing these unlocks →
      </button>
    </ScreenShell>
  );
}
