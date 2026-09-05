"use client";

import { useState } from "react";
import type { Roadmap } from "@/lib/roadmap";
import { buildSkillsFutureSearchUrl } from "@/lib/skillsfuture";
import { flattenRoadmapSteps } from "@/lib/roadmapVisual";
import type { StepBudgetEntry } from "@/lib/roadmapBudget";

// Adapted from a shared design reference (a generic quarterly product
// roadmap — amber/primary/olive/coral "status" pins). We only have 3
// phases, not 4 statuses, so each phase gets one color rather than cycling
// through all four; coral is left unused here (no "exploring/stretch"
// phase exists in this data model).
const PHASE_COLOR = [
  { pin: "bg-accent-amber", pale: "bg-accent-amber-pale", text: "text-amber-900", border: "border-t-accent-amber" },
  { pin: "bg-primary", pale: "bg-primary-pale", text: "text-ink", border: "border-t-primary" },
  { pin: "bg-accent-olive", pale: "bg-accent-olive-pale", text: "text-ink", border: "border-t-accent-olive" },
];

/**
 * The roadmap's course list — numbered, status-colored cards along a
 * decorative winding line, embedded directly under the candidacy score in
 * RoadmapUnlocked (not a separate page — a prior version linked out to one
 * via an "Expand roadmap" button, which just duplicated this same content
 * and overlapped visually with the compact view above it).
 */
export default function CourseRoadmap({
  roadmap,
  completed,
  onToggle,
  budget,
  onBudgetChange,
  skillsFutureCreditSgd,
}: {
  roadmap: Roadmap;
  completed: Record<string, boolean>;
  onToggle: (stepId: string) => void;
  budget: Record<string, StepBudgetEntry>;
  onBudgetChange: (stepId: string, entry: StepBudgetEntry) => void;
  skillsFutureCreditSgd?: number | null;
}) {
  const steps = flattenRoadmapSteps(roadmap);
  const [filter, setFilter] = useState<string>("All");

  const filters = ["All", ...roadmap.phases.map((p) => p.name)];
  const visibleSteps = filter === "All" ? steps : steps.filter((s) => s.phaseName === filter);
  const doneCount = steps.filter((s) => completed[s.id]).length;

  // Self-reported, not automated — there's no real course-cost/eligibility
  // API to check against (MySkillsFuture blocks scripted access), so this
  // nets whatever the person enters themselves against their stated balance.
  const eligibleSpend = steps.reduce((sum, s) => {
    const entry = budget[s.id];
    return entry?.sfcEligible && entry.estimatedCostSgd != null ? sum + entry.estimatedCostSgd : sum;
  }, 0);
  const remaining = skillsFutureCreditSgd != null ? skillsFutureCreditSgd - eligibleSpend : null;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-bold text-ink-muted">
          {doneCount} / {steps.length} done
        </p>
      </div>

      {skillsFutureCreditSgd != null && (
        <div className="mb-4 rounded-2xl border-2 border-primary-pale bg-primary-pale/20 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-primary-dark">SkillsFuture Credit tracker</p>
          <p className="mt-1 text-xs text-ink-muted">
            Est. ${eligibleSpend} of ${skillsFutureCreditSgd} used on courses you&apos;ve marked as SFC-eligible below
            {remaining != null && (remaining < 0 ? ` — over by $${Math.abs(remaining)}` : ` — $${remaining} left`)}.
          </p>
          <p className="mt-1 text-[10px] text-ink-muted">
            Self-reported — mark eligibility yourself per course; there&apos;s no automated eligibility check.
          </p>
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
              filter === f ? "bg-primary text-white" : "bg-primary-pale/40 text-ink-muted hover:bg-primary-pale/70"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="relative pl-2">
        <svg
          viewBox={`0 0 40 ${Math.max(1, visibleSteps.length) * 96}`}
          preserveAspectRatio="none"
          className="pointer-events-none absolute left-0 top-1 h-full w-10"
        >
          <path
            d={buildDecorativeWave(visibleSteps.length)}
            fill="none"
            stroke="var(--primary-pale)"
            strokeWidth="10"
            strokeLinecap="round"
          />
        </svg>

        <div className="relative space-y-5 pl-11">
          {visibleSteps.map((step, i) => {
            const phaseIndex = roadmap.phases.findIndex((p) => p.name === step.phaseName);
            const color = PHASE_COLOR[phaseIndex % PHASE_COLOR.length];
            const phase = roadmap.phases[phaseIndex];
            const isDone = Boolean(completed[step.id]);
            return (
              <div key={step.id} className="relative flex gap-3">
                <div className="absolute -left-11 top-0 flex flex-col items-center">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full font-display text-sm font-extrabold text-white shadow-md ${color.pin}`}
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {isDone ? "✓" : String(i + 1).padStart(2, "0")}
                  </div>
                </div>
                <div
                  className={`min-w-0 flex-1 rounded-2xl border-t-[3px] bg-surface p-4 shadow-[0_6px_16px_-8px_rgba(61,67,114,0.25)] transition ${
                    isDone ? "border-t-primary-pale opacity-70" : color.border
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span
                      className="font-display text-[11px] font-bold uppercase tracking-wide text-primary"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      Step {i + 1} of {visibleSteps.length}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${color.pale} ${color.text}`}>{step.phaseName}</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <button
                      type="button"
                      onClick={() => onToggle(step.id)}
                      aria-label={isDone ? `Mark ${step.title} as not done` : `Mark ${step.title} as done`}
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold transition ${
                        isDone ? "border-primary-dark bg-primary-dark text-white" : "border-primary-light bg-white text-transparent"
                      }`}
                    >
                      ✓
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className={`font-display text-base font-bold leading-tight ${isDone ? "text-ink-muted line-through" : "text-ink"}`}>
                        {step.title}
                      </p>
                      {phase && <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">{phase.description}</p>}
                      <a
                        href={buildSkillsFutureSearchUrl(step.title)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-block text-xs font-bold text-primary-dark underline decoration-primary-light underline-offset-2 hover:text-primary"
                      >
                        Find a course ↗
                      </a>

                      {skillsFutureCreditSgd != null && (
                        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-primary-pale/60 pt-2.5">
                          <label className="flex items-center gap-1.5 text-[11px] text-ink-muted">
                            Est. cost
                            <span className="flex items-center rounded-lg border border-primary-pale bg-white px-1.5">
                              $
                              <input
                                type="number"
                                min={0}
                                value={budget[step.id]?.estimatedCostSgd ?? ""}
                                onChange={(e) =>
                                  onBudgetChange(step.id, {
                                    sfcEligible: budget[step.id]?.sfcEligible ?? null,
                                    estimatedCostSgd: e.target.value ? Number(e.target.value) : null,
                                  })
                                }
                                className="w-14 py-1 text-[11px] text-ink outline-none"
                              />
                            </span>
                          </label>
                          <div className="flex items-center gap-1 text-[11px] text-ink-muted">
                            SFC eligible?
                            {(["Yes", "No", "Unsure"] as const).map((opt) => {
                              const value = opt === "Yes" ? true : opt === "No" ? false : null;
                              const active = (budget[step.id]?.sfcEligible ?? null) === value;
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() =>
                                    onBudgetChange(step.id, { estimatedCostSgd: budget[step.id]?.estimatedCostSgd ?? null, sfcEligible: value })
                                  }
                                  className={`rounded-full px-2 py-0.5 font-bold transition ${
                                    active ? "bg-primary text-white" : "bg-primary-pale/40 hover:bg-primary-pale/70"
                                  }`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Purely decorative winding line behind the pin column — one gentle S-bend
 * per row, repeated down the whole length (the same cubic-bezier shape the
 * design reference uses, generalized from its fixed 4 stops to however many
 * steps are actually visible). No relation to the pins' exact positions.
 */
function buildDecorativeWave(stepCount: number): string {
  const rowHeight = 96;
  const rows = Math.max(1, stepCount);
  let d = "M 20 0";
  for (let i = 0; i < rows; i++) {
    const y0 = i * rowHeight;
    const c1y = y0 + rowHeight * 0.35;
    const c2y = y0 + rowHeight * 0.59;
    const y1 = y0 + rowHeight;
    d += ` C 34 ${c1y} 6 ${c2y} 20 ${y1}`;
  }
  return d;
}
