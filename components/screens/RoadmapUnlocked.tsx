"use client";

import { useEffect, useState } from "react";
import ScreenShell from "../ScreenShell";
import CourseRoadmap from "./CourseRoadmap";
import type { Roadmap } from "@/lib/roadmap";
import { estimatePhaseWeeks, type Constraints } from "@/lib/constraints";
import { buildFirstStudyBlock, buildGoogleCalendarUrl, downloadIcs } from "@/lib/calendar";
import { computeCandidacyScore, type CandidacyScore } from "@/lib/candidacyScore";
import { encodeRoadmapExport } from "@/lib/roadmapExport";
import { buildSkillsFutureSearchUrl } from "@/lib/skillsfuture";
import { flattenRoadmapSteps } from "@/lib/roadmapVisual";
import { getRoadmapProgressKey, loadRoadmapProgress, saveRoadmapProgress } from "@/lib/roadmapProgress";
import { getBudgetKey, loadBudget, saveBudget, type StepBudgetEntry } from "@/lib/roadmapBudget";

const URGENCY_LABELS: Record<Constraints["urgency"], string> = {
  asap: "ASAP",
  few_months: "Within 3 months",
  no_rush: "No rush",
};

const BAND_STYLES: Record<CandidacyScore["band"], { ring: string; chip: string }> = {
  strong: { ring: "text-accent-green", chip: "bg-accent-green-pale text-green-900" },
  building: { ring: "text-accent-olive", chip: "bg-accent-olive-pale text-ink" },
  early: { ring: "text-accent-coral", chip: "bg-accent-coral-pale text-red-900" },
};

export default function RoadmapUnlocked({
  roadmap,
  constraints,
  userSkills,
  onExploreOtherRoles,
  onPrepareInterview,
  onRestart,
  onBack,
}: {
  roadmap: Roadmap;
  constraints?: Constraints | null;
  userSkills?: string[];
  onExploreOtherRoles?: () => void;
  onPrepareInterview?: () => void;
  onRestart: () => void;
  onBack?: () => void;
}) {
  const studyBlock = buildFirstStudyBlock(roadmap, constraints?.studyHoursPerWeek);
  const candidacy =
    roadmap.skillGaps.length > 0 ? computeCandidacyScore(roadmap.skillGaps, userSkills ?? [], roadmap.market) : null;

  const [rationale, setRationale] = useState<string | null>(null);
  const [shareState, setShareState] = useState<"idle" | "copied">("idle");
  const steps = flattenRoadmapSteps(roadmap);
  const progressKey = getRoadmapProgressKey(
    roadmap.targetLabel,
    steps.map((s) => s.id)
  );
  // Lazy initializer, not an effect — this component remounts per roadmap
  // (JourneyFlow only ever renders one at a time), so reading localStorage
  // once at mount is enough; no need to re-sync on every render.
  const [completed, setCompleted] = useState<Record<string, boolean>>(() => loadRoadmapProgress(progressKey));

  function toggleStepCompletion(stepId: string) {
    setCompleted((prev) => {
      const next = { ...prev, [stepId]: !prev[stepId] };
      saveRoadmapProgress(progressKey, next);
      return next;
    });
  }

  const budgetKey = getBudgetKey(
    roadmap.targetLabel,
    steps.map((s) => s.id)
  );
  const [budget, setBudget] = useState<Record<string, StepBudgetEntry>>(() => loadBudget(budgetKey));

  function updateStepBudget(stepId: string, entry: StepBudgetEntry) {
    setBudget((prev) => {
      const next = { ...prev, [stepId]: entry };
      saveBudget(budgetKey, next);
      return next;
    });
  }

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
        <>
          <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1">
            {roadmap.phases.map((phase, i) => (
              <p key={phase.name} className="text-xs text-ink-muted">
                <span className="font-bold text-ink">
                  {i + 1}. {phase.name}
                </span>
                {constraints && <> · ~{estimatePhaseWeeks(phase.skills.length, constraints.studyHoursPerWeek)} wks</>}
              </p>
            ))}
          </div>
          <CourseRoadmap
            roadmap={roadmap}
            completed={completed}
            onToggle={toggleStepCompletion}
            budget={budget}
            onBudgetChange={updateStepBudget}
            skillsFutureCreditSgd={constraints?.skillsFutureCreditSgd}
          />
        </>
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
          <p className="mt-3 flex items-start gap-1.5 text-[11px] font-semibold text-ink-muted">
            <span>👁</span>
            <span>Both open a draft for you to review — nothing is added to your calendar until you confirm it yourself.</span>
          </p>
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
