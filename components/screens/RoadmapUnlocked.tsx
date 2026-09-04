"use client";

import ScreenShell from "../ScreenShell";
import type { Roadmap } from "@/lib/roadmap";
import { buildSkillsFutureSearchUrl } from "@/lib/skillsfuture";
import { estimatePhaseWeeks, type Constraints } from "@/lib/constraints";
import { buildFirstStudyBlock, buildGoogleCalendarUrl, downloadIcs } from "@/lib/calendar";

const URGENCY_LABELS: Record<Constraints["urgency"], string> = {
  asap: "ASAP",
  few_months: "Within 3 months",
  no_rush: "No rush",
};

const PHASE_STYLES = [
  { badge: "bg-primary", chip: "border-primary-light bg-primary-pale/50" },
  { badge: "bg-accent-amber", chip: "border-accent-amber/40 bg-accent-amber-pale/60" },
  { badge: "bg-accent-green", chip: "border-accent-green/40 bg-accent-green-pale/60" },
];

export default function RoadmapUnlocked({
  roadmap,
  constraints,
  resumeText,
  onExploreOtherRoles,
  onTailorResume,
  onRestart,
  onBack,
}: {
  roadmap: Roadmap;
  constraints?: Constraints | null;
  resumeText?: string | null;
  onExploreOtherRoles?: () => void;
  onTailorResume?: () => void;
  onRestart: () => void;
  onBack?: () => void;
}) {
  const studyBlock = buildFirstStudyBlock(roadmap, constraints?.studyHoursPerWeek);

  return (
    <ScreenShell title="Your roadmap" subtitle={`Toward: ${roadmap.targetLabel}`} onBack={onBack}>
      {constraints && roadmap.phases.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2 rounded-2xl bg-primary-pale/40 px-4 py-3 text-xs font-semibold text-primary-dark">
          <span>⏱ {constraints.studyHoursPerWeek} hrs/week</span>
          <span>·</span>
          <span>{URGENCY_LABELS[constraints.urgency]}</span>
          {constraints.skillsFutureCreditSgd != null && (
            <>
              <span>·</span>
              <span>${constraints.skillsFutureCreditSgd} SkillsFuture Credit</span>
            </>
          )}
        </div>
      )}
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
                  {constraints && (
                    <span className="text-xs font-semibold text-ink-muted">
                      · ~{estimatePhaseWeeks(phase.skills.length, constraints.studyHoursPerWeek)} wks
                    </span>
                  )}
                </div>
                <p className="ml-9 mt-0.5 text-xs text-ink-muted">{phase.description}</p>
                <ul className="ml-9 mt-2 space-y-1.5">
                  {phase.skills.map((skill) => (
                    <li
                      key={skill}
                      className={`flex items-center justify-between gap-3 rounded-2xl border-2 px-3.5 py-2.5 text-sm ${style.chip}`}
                    >
                      <span className="font-semibold text-ink">{skill}</span>
                      <a
                        href={buildSkillsFutureSearchUrl(skill)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-xs font-semibold text-primary-dark underline decoration-primary-light underline-offset-2 hover:text-primary"
                      >
                        Find a course ↗
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {studyBlock && (
        <div className="mt-6 rounded-2xl border-2 border-primary-pale bg-primary-pale/20 p-4">
          <p className="font-display text-sm font-extrabold text-ink">Lock in your first study block</p>
          <p className="mt-0.5 text-xs text-ink-muted">
            {studyBlock.title} · {studyBlock.durationMinutes / 60} hr on{" "}
            {studyBlock.start.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })} at{" "}
            {studyBlock.start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
          </p>
          <div className="mt-3 flex gap-2">
            <a
              href={buildGoogleCalendarUrl(studyBlock)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-full bg-primary px-3 py-2.5 text-center font-display text-xs font-bold text-white transition hover:bg-primary-dark"
            >
              Add to Google Calendar ↗
            </a>
            <button
              onClick={() => downloadIcs(studyBlock)}
              className="flex-1 rounded-full border-2 border-primary-pale bg-white px-3 py-2.5 font-display text-xs font-bold text-primary-dark transition hover:bg-primary-pale/40"
            >
              Download .ics
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-2">
        {resumeText && onTailorResume && (
          <button
            onClick={onTailorResume}
            className="w-full rounded-full bg-primary px-4 py-3.5 font-display text-sm font-bold text-white transition hover:bg-primary-dark"
          >
            Tailor my resume for this role
          </button>
        )}
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
