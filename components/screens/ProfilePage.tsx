"use client";

import { useState } from "react";
import { STUDY_HOURS_OPTIONS, URGENCY_OPTIONS, type Urgency } from "@/lib/constraints";
import { computeCandidacyScore } from "@/lib/candidacyScore";
import { encodeRoadmapExport } from "@/lib/roadmapExport";
import { buildSkillsFutureSearchUrl } from "@/lib/skillsfuture";
import type { FlowState } from "@/lib/flowState";

export interface ProfileEdits {
  currentRole: string;
  yearsExperience: string;
  skillsText: string;
  studyHoursPerWeek: number;
  budgetSgd: string;
  skillsFutureCreditSgd: string;
  urgency: Urgency;
  remotePreference: string;
}

export default function ProfilePage({
  flow,
  onRerunAnalysis,
  onViewInJourney,
}: {
  flow: FlowState;
  onRerunAnalysis: (edits: ProfileEdits) => Promise<void>;
  onViewInJourney: () => void;
}) {
  const [currentRole, setCurrentRole] = useState(flow.resumeFields?.currentRole ?? "");
  const [yearsExperience, setYearsExperience] = useState(
    flow.resumeFields?.yearsExperience != null ? String(flow.resumeFields.yearsExperience) : ""
  );
  const [skillsText, setSkillsText] = useState(flow.userSkills.join(", "));
  const [studyHoursPerWeek, setStudyHoursPerWeek] = useState(flow.constraints?.studyHoursPerWeek ?? 3.5);
  const [budgetSgd, setBudgetSgd] = useState(flow.constraints?.budgetSgd != null ? String(flow.constraints.budgetSgd) : "");
  const [skillsFutureCreditSgd, setSkillsFutureCreditSgd] = useState(
    flow.constraints?.skillsFutureCreditSgd != null ? String(flow.constraints.skillsFutureCreditSgd) : ""
  );
  const [urgency, setUrgency] = useState<Urgency>(flow.constraints?.urgency ?? "few_months");
  const [remotePreference, setRemotePreference] = useState(flow.constraints?.remotePreference ?? "No preference");
  const [isRerunning, setIsRerunning] = useState(false);
  const [shareState, setShareState] = useState<"idle" | "copied">("idle");

  const candidacy =
    flow.roadmap && flow.roadmap.skillGaps.length > 0
      ? computeCandidacyScore(flow.roadmap.skillGaps, flow.userSkills, flow.roadmap.market)
      : null;

  async function handleRerun() {
    setIsRerunning(true);
    try {
      await onRerunAnalysis({
        currentRole,
        yearsExperience,
        skillsText,
        studyHoursPerWeek,
        budgetSgd,
        skillsFutureCreditSgd,
        urgency,
        remotePreference,
      });
    } finally {
      setIsRerunning(false);
    }
  }

  function handleShareRoadmap() {
    if (!flow.roadmap) return;
    const payload = encodeRoadmapExport({
      targetRole: flow.roadmap.targetLabel,
      candidacy: candidacy ? { score: candidacy.score, band: candidacy.band, bandLabel: candidacy.bandLabel } : null,
      skillGapList: flow.roadmap.skillGaps.map((g) => g.skill),
      roadmapSteps: flow.roadmap.skillGaps.map((g) => ({ skill: g.skill, courseLink: buildSkillsFutureSearchUrl(g.skill) })),
      introCopy: flow.roadmap.unlocks.headline,
    });
    const url = `${window.location.origin}/roadmap/view?data=${payload}`;
    navigator.clipboard.writeText(url).then(() => {
      setShareState("copied");
      setTimeout(() => setShareState("idle"), 2000);
    });
  }

  return (
    <div className="mx-auto w-full max-w-md flex-1 px-4 py-10">
      <div className="mb-6 text-center">
        <p className="font-display text-xs font-bold uppercase tracking-wide text-primary">Profile</p>
        <h1 className="font-display text-2xl font-extrabold text-ink">Your details</h1>
      </div>

      {!flow.resumeFields && flow.userSkills.length === 0 && !flow.constraints ? (
        <div className="rounded-[2rem] border border-primary-pale bg-surface p-6 text-center shadow-[0_20px_45px_-25px_rgba(91,101,168,0.45)]">
          <p className="text-sm text-ink-muted">
            Nothing to show yet — head to the Journey tab and get started to build your profile.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <section className="rounded-[2rem] border border-primary-pale bg-surface p-5 shadow-[0_20px_45px_-25px_rgba(91,101,168,0.45)]">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-ink-muted">Resume snapshot</p>
            <label className="block">
              <span className="mb-1 block text-xs text-ink-muted">Current role</span>
              <input
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
                className="w-full rounded-xl border-2 border-primary-pale bg-primary-pale/30 px-3 py-2 text-sm text-ink outline-none focus:border-primary"
              />
            </label>
            <label className="mt-3 block">
              <span className="mb-1 block text-xs text-ink-muted">Years of experience</span>
              <input
                type="number"
                min={0}
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                className="w-full rounded-xl border-2 border-primary-pale bg-primary-pale/30 px-3 py-2 text-sm text-ink outline-none focus:border-primary"
              />
            </label>
            <label className="mt-3 block">
              <span className="mb-1 block text-xs text-ink-muted">Skills (comma-separated)</span>
              <textarea
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
                rows={2}
                className="w-full resize-none rounded-xl border-2 border-primary-pale bg-primary-pale/30 px-3 py-2 text-sm text-ink outline-none focus:border-primary"
              />
            </label>
          </section>

          <section className="rounded-[2rem] border border-primary-pale bg-surface p-5 shadow-[0_20px_45px_-25px_rgba(91,101,168,0.45)]">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-ink-muted">Constraints</p>
            <p className="mb-1.5 text-xs text-ink-muted">Study hours per week</p>
            <div className="mb-3 flex flex-wrap gap-2">
              {STUDY_HOURS_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setStudyHoursPerWeek(opt.value)}
                  className={`rounded-full border-2 px-3 py-1.5 text-xs font-bold transition ${
                    studyHoursPerWeek === opt.value
                      ? "border-primary bg-primary text-white"
                      : "border-primary-pale bg-primary-pale/30 text-ink hover:bg-primary-pale/60"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="mb-1.5 text-xs text-ink-muted">Urgency</p>
            <div className="mb-3 flex flex-wrap gap-2">
              {URGENCY_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setUrgency(opt.value)}
                  className={`rounded-full border-2 px-3 py-1.5 text-xs font-bold transition ${
                    urgency === opt.value
                      ? "border-primary bg-primary text-white"
                      : "border-primary-pale bg-primary-pale/30 text-ink hover:bg-primary-pale/60"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-xs text-ink-muted">Course budget (SGD)</span>
                <input
                  type="number"
                  min={0}
                  value={budgetSgd}
                  onChange={(e) => setBudgetSgd(e.target.value)}
                  className="w-full rounded-xl border-2 border-primary-pale bg-primary-pale/30 px-3 py-2 text-sm text-ink outline-none focus:border-primary"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-ink-muted">SkillsFuture Credit</span>
                <input
                  type="number"
                  min={0}
                  value={skillsFutureCreditSgd}
                  onChange={(e) => setSkillsFutureCreditSgd(e.target.value)}
                  className="w-full rounded-xl border-2 border-primary-pale bg-primary-pale/30 px-3 py-2 text-sm text-ink outline-none focus:border-primary"
                />
              </label>
            </div>
            <label className="mt-3 block">
              <span className="mb-1 block text-xs text-ink-muted">Remote preference</span>
              <input
                value={remotePreference}
                onChange={(e) => setRemotePreference(e.target.value)}
                className="w-full rounded-xl border-2 border-primary-pale bg-primary-pale/30 px-3 py-2 text-sm text-ink outline-none focus:border-primary"
              />
            </label>
          </section>

          {flow.roadmap && (
            <section className="rounded-[2rem] border border-primary-pale bg-surface p-5 shadow-[0_20px_45px_-25px_rgba(91,101,168,0.45)]">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">Target role</p>
              <button onClick={onViewInJourney} className="text-left">
                <p className="font-display text-sm font-extrabold text-primary-dark underline decoration-primary-light underline-offset-2">
                  {flow.roadmap.targetLabel} ↗
                </p>
              </button>
              {candidacy && (
                <p className="mt-1.5 text-xs text-ink-muted">
                  Candidacy: {candidacy.score}/100 · {candidacy.bandLabel}
                </p>
              )}
              <button
                onClick={handleShareRoadmap}
                className="mt-3 w-full rounded-full border-2 border-primary-pale bg-white px-4 py-2.5 font-display text-xs font-bold text-primary-dark transition hover:bg-primary-pale/40"
              >
                {shareState === "copied" ? "Link copied ✓" : "Copy shareable roadmap link"}
              </button>
            </section>
          )}

          <button
            onClick={handleRerun}
            disabled={isRerunning}
            className="w-full rounded-full bg-primary px-4 py-3.5 font-display text-sm font-bold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRerunning ? "Re-running…" : "Re-run analysis"}
          </button>
          <p className="text-center text-[11px] text-ink-muted">
            Applies any edits above and rebuilds your roadmap and skill gaps from scratch.
          </p>
        </div>
      )}
    </div>
  );
}
