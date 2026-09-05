"use client";

import { useEffect, useState } from "react";
import ScreenShell from "../ScreenShell";
import type { Roadmap } from "@/lib/roadmap";
import { buildSkillsFutureSearchUrl } from "@/lib/skillsfuture";
import { estimatePhaseWeeks, type Constraints } from "@/lib/constraints";
import { buildFirstStudyBlock, buildGoogleCalendarUrl, downloadIcs } from "@/lib/calendar";
import { computeCandidacyScore, type CandidacyScore } from "@/lib/candidacyScore";
import { encodeRoadmapExport } from "@/lib/roadmapExport";

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

const BAND_STYLES: Record<CandidacyScore["band"], { ring: string; chip: string }> = {
  strong: { ring: "text-accent-green", chip: "bg-accent-green-pale text-green-900" },
  building: { ring: "text-accent-olive", chip: "bg-accent-olive-pale text-ink" },
  early: { ring: "text-accent-coral", chip: "bg-accent-coral-pale text-red-900" },
};

export default function RoadmapUnlocked({
  roadmap,
  constraints,
  resumeText,
  userSkills,
  onExploreOtherRoles,
  onTailorResume,
  onPrepareInterview,
  onRestart,
  onBack,
}: {
  roadmap: Roadmap;
  constraints?: Constraints | null;
  resumeText?: string | null;
  userSkills?: string[];
  onExploreOtherRoles?: () => void;
  onTailorResume?: () => void;
  onPrepareInterview?: () => void;
  onRestart: () => void;
  onBack?: () => void;
}) {
  const studyBlock = buildFirstStudyBlock(roadmap, constraints?.studyHoursPerWeek);
  const candidacy =
    roadmap.skillGaps.length > 0 ? computeCandidacyScore(roadmap.skillGaps, userSkills ?? [], roadmap.market) : null;

  const [rationale, setRationale] = useState<string | null>(null);
  const [shareState, setShareState] = useState<"idle" | "copied">("idle");

  useEffect(() => {
    if (!candidacy) return;
    let cancelled = false;
    fetch("/api/candidacy-rationale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidacy, targetRole: roadmap.targetLabel, postingsCount: roadmap.market?.postings.length ?? 0 }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled && json.status === "ok") setRationale(json.data.sentence as string);
      })
      .catch(() => {
        // Rationale is a nice-to-have — the score/band chip already carries the signal.
      });
    return () => {
      cancelled = true;
    };
    // candidacy/roadmap are derived fresh from flow state each time this screen mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleShare() {
    const payload = encodeRoadmapExport({
      targetRole: roadmap.targetLabel,
      candidacy: candidacy ? { score: candidacy.score, band: candidacy.band, bandLabel: candidacy.bandLabel } : null,
      skillGapList: roadmap.skillGaps.map((g) => g.skill),
      roadmapSteps: roadmap.skillGaps.map((g) => ({ skill: g.skill, courseLink: buildSkillsFutureSearchUrl(g.skill) })),
      introCopy: roadmap.unlocks.headline,
    });
    const url = `${window.location.origin}/roadmap/view?data=${payload}`;
    navigator.clipboard.writeText(url).then(() => {
      setShareState("copied");
      setTimeout(() => setShareState("idle"), 2000);
    });
  }

  return (
    <ScreenShell title="Your roadmap" subtitle={`Toward: ${roadmap.targetLabel}`} onBack={onBack}>
      {candidacy && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border-2 border-primary-pale bg-white p-4">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 font-display text-sm font-extrabold ${BAND_STYLES[candidacy.band].ring} border-current`}
          >
            {candidacy.score}
          </div>
          <div className="min-w-0">
            <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${BAND_STYLES[candidacy.band].chip}`}>
              {candidacy.bandLabel}
            </span>
            <p className="mt-1 text-xs leading-snug text-ink-muted">
              {rationale ?? `${candidacy.skillCoveragePct}% skill coverage against live demand for ${roadmap.targetLabel}.`}
            </p>
          </div>
        </div>
      )}

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
        {roadmap.phases.length > 0 && (
          <button
            onClick={handleShare}
            className="w-full rounded-full border-2 border-primary-pale bg-white px-4 py-3.5 font-display text-sm font-bold text-primary-dark transition hover:bg-primary-pale/40"
          >
            {shareState === "copied" ? "Link copied ✓" : "Share my roadmap ↗"}
          </button>
        )}
        {onPrepareInterview && (
          <button
            onClick={onPrepareInterview}
            className="w-full rounded-full bg-primary px-4 py-3.5 font-display text-sm font-bold text-white transition hover:bg-primary-dark"
          >
            Prepare for interviews
          </button>
        )}
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
