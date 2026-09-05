"use client";

import { useState } from "react";
import ScreenShell from "../ScreenShell";
import { STUDY_HOURS_OPTIONS, URGENCY_OPTIONS, type Constraints, type Urgency } from "@/lib/constraints";
import { INDUSTRIES } from "@/lib/industries";
import type { JobCard } from "@/lib/jobs";

const REMOTE_OPTIONS = ["Remote only", "Hybrid", "On-site is fine", "No preference"] as const;

function ChipGroup<T extends string | number>({
  options,
  selected,
  onSelect,
}: {
  options: { label: string; value: T }[];
  selected: T | null;
  onSelect: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.label}
          type="button"
          onClick={() => onSelect(option.value)}
          className={`rounded-full border-2 px-4 py-2 text-sm font-bold transition ${
            selected === option.value
              ? "border-primary bg-primary text-white"
              : "border-primary-pale bg-primary-pale/30 text-ink hover:bg-primary-pale/60"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default function GuidedDiscoveryIntro({
  onSubmit,
  onBack,
}: {
  onSubmit: (constraints: Constraints, jobs: JobCard[]) => void;
  onBack?: () => void;
}) {
  const [remotePreference, setRemotePreference] = useState<string | null>(null);
  const [studyHoursPerWeek, setStudyHoursPerWeek] = useState<number | null>(null);
  const [urgency, setUrgency] = useState<Urgency | null>(null);
  const [budgetInput, setBudgetInput] = useState("");
  const [creditInput, setCreditInput] = useState("");
  const [industryId, setIndustryId] = useState<string | null>(null);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const canSubmit = remotePreference !== null && studyHoursPerWeek !== null && urgency !== null && industryId !== null;

  async function handleSubmit() {
    if (!canSubmit || isLoadingRoles) return;
    setIsLoadingRoles(true);
    setLoadError(null);

    const constraints: Constraints = {
      remotePreference: remotePreference!,
      studyHoursPerWeek: studyHoursPerWeek!,
      urgency: urgency!,
      budgetSgd: budgetInput.trim() ? Number(budgetInput) : null,
      skillsFutureCreditSgd: creditInput.trim() ? Number(creditInput) : null,
    };

    try {
      const response = await fetch("/api/industry-roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industryId }),
      });
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      const data = await response.json();
      onSubmit(constraints, data.cards as JobCard[]);
    } catch {
      setLoadError("Couldn't pull live roles right now — showing a sample deck instead.");
      onSubmit(constraints, []);
    } finally {
      setIsLoadingRoles(false);
    }
  }

  return (
    <ScreenShell
      title="A few quick constraints"
      subtitle="So the roadmap we build actually fits your life — everything else you tell us by swiping."
      onBack={onBack}
    >
      <div className="space-y-6">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">Which industry interests you?</p>
          <ChipGroup
            options={INDUSTRIES.map((i) => ({ label: i.label, value: i.id }))}
            selected={industryId}
            onSelect={setIndustryId}
          />
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">Work setup</p>
          <ChipGroup options={REMOTE_OPTIONS.map((o) => ({ label: o, value: o }))} selected={remotePreference} onSelect={setRemotePreference} />
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">Study time per week</p>
          <ChipGroup options={[...STUDY_HOURS_OPTIONS]} selected={studyHoursPerWeek} onSelect={setStudyHoursPerWeek} />
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">How urgent is this?</p>
          <ChipGroup options={URGENCY_OPTIONS} selected={urgency} onSelect={setUrgency} />
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">Budget (optional)</p>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs text-ink-muted">Course budget (SGD)</span>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                placeholder="e.g. 300"
                className="w-full rounded-xl border-2 border-primary-pale bg-primary-pale/30 px-3 py-2.5 text-sm text-ink outline-none transition focus:border-primary"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-ink-muted">SkillsFuture Credit</span>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={creditInput}
                onChange={(e) => setCreditInput(e.target.value)}
                placeholder="e.g. 500"
                className="w-full rounded-xl border-2 border-primary-pale bg-primary-pale/30 px-3 py-2.5 text-sm text-ink outline-none transition focus:border-primary"
              />
            </label>
          </div>
          <p className="mt-1.5 text-xs text-ink-muted">
            Leave blank if you&apos;re not sure — you can check your balance on the SkillsFuture portal.
          </p>
        </div>
      </div>

      {loadError && <p className="mt-4 text-center text-xs font-semibold text-accent-coral">{loadError}</p>}

      <button
        onClick={handleSubmit}
        disabled={!canSubmit || isLoadingRoles}
        className="mt-6 w-full rounded-full bg-primary px-4 py-3.5 font-display text-sm font-bold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isLoadingRoles ? "Pulling live roles…" : "Show me roles"}
      </button>
    </ScreenShell>
  );
}
