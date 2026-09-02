"use client";

import ScreenShell from "../ScreenShell";
import type { Roadmap } from "@/lib/roadmap";

const PHASE_STYLES = [
  { badge: "bg-primary", chip: "border-primary-light bg-primary-pale/50" },
  { badge: "bg-accent-amber", chip: "border-accent-amber/40 bg-accent-amber-pale/60" },
  { badge: "bg-accent-green", chip: "border-accent-green/40 bg-accent-green-pale/60" },
];

export default function RoadmapUnlocked({
  roadmap,
  onExploreOtherRoles,
  onRestart,
  onBack,
}: {
  roadmap: Roadmap;
  onExploreOtherRoles?: () => void;
  onRestart: () => void;
  onBack?: () => void;
}) {
  return (
    <ScreenShell title="Your roadmap" subtitle={`Toward: ${roadmap.targetLabel}`} onBack={onBack}>
      {roadmap.phases.length === 0 ? (
        <p className="text-sm text-ink-muted">{roadmap.unlocks.headline}</p>
      ) : (
        <div className="space-y-5">
          {roadmap.phases.map((phase, i) => {
            const style = PHASE_STYLES[i % PHASE_STYLES.length];
            return (
              <div key={phase.name}>
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full font-display text-xs font-bold text-white ${style.badge}`}
                  >
                    {i + 1}
                  </span>
                  <p className="font-display text-sm font-extrabold text-ink">{phase.name}</p>
                </div>
                <p className="ml-9 mt-0.5 text-xs text-ink-muted">{phase.description}</p>
                <ul className="ml-9 mt-2 space-y-1.5">
                  {phase.skills.map((skill) => (
                    <li
                      key={skill}
                      className={`flex items-center justify-between rounded-2xl border-2 px-3.5 py-2.5 text-sm ${style.chip}`}
                    >
                      <span className="font-semibold text-ink">{skill}</span>
                      <span className="text-xs text-ink-muted">Course: &quot;{skill} Fundamentals&quot;</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-2">
        {onExploreOtherRoles && (
          <button
            onClick={onExploreOtherRoles}
            className="w-full rounded-full bg-accent-amber-pale px-4 py-3.5 font-display text-sm font-bold text-amber-900 transition hover:brightness-95"
          >
            Want to explore other roles too?
          </button>
        )}
        <button
          onClick={onRestart}
          className="w-full rounded-full border-2 border-primary-pale bg-white px-4 py-3.5 font-display text-sm font-bold text-primary-dark transition hover:bg-primary-pale/40"
        >
          Start over
        </button>
      </div>
    </ScreenShell>
  );
}
