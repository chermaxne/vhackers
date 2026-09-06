"use client";

import { useState } from "react";
import ScreenShell from "../ScreenShell";
import { STUDY_HOURS_OPTIONS, URGENCY_OPTIONS, type Constraints, type Urgency } from "@/lib/constraints";
import { INDUSTRIES } from "@/lib/industries";
import type { JobCard } from "@/lib/jobs";

// Swipe deck is for exploring the space, not browsing the whole market —
// keep it short regardless of how many industries got selected.
const SWIPE_DECK_TARGET_SIZE = 8;

// Richer, multi-select set merged in from a teammate's parallel take on this
// screen — worth keeping over the original single-select four options.
const WORK_OPTIONS = [
  "Hybrid (2-3 days remote)",
  "Fully Remote",
  "On-Site / Office-First",
  "Flexible Hours / Asynchronous",
] as const;

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

function MultiChipGroup({
  options,
  selected,
  onToggle,
}: {
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={`rounded-full border-2 px-4 py-2 text-sm font-bold transition ${
              active
                ? "border-primary bg-primary text-white"
                : "border-primary-pale bg-primary-pale/30 text-ink hover:bg-primary-pale/60"
            }`}
          >
            {active ? "✓ " : ""}
            {option}
          </button>
        );
      })}
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
  const [workArrangements, setWorkArrangements] = useState<string[]>([]);
  const [showOtherWork, setShowOtherWork] = useState(false);
  const [otherWorkText, setOtherWorkText] = useState("");
  const [studyHoursPerWeek, setStudyHoursPerWeek] = useState<number | null>(null);
  const [urgency, setUrgency] = useState<Urgency | null>(null);
  const [budgetInput, setBudgetInput] = useState("");
  const [creditInput, setCreditInput] = useState("");
  const [accommodations, setAccommodations] = useState("");
  const [industryIds, setIndustryIds] = useState<string[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const activeWorkArrangements = [
    ...workArrangements,
    ...(showOtherWork && otherWorkText.trim() ? [otherWorkText.trim()] : []),
  ];

  const canSubmit =
    activeWorkArrangements.length > 0 && studyHoursPerWeek !== null && urgency !== null && industryIds.length > 0;

  function toggleWorkArrangement(option: string) {
    setWorkArrangements((prev) => (prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]));
  }

  function toggleIndustry(id: string) {
    setIndustryIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }

  async function handleSubmit() {
    if (!canSubmit || isLoadingRoles) return;
    setIsLoadingRoles(true);
    setLoadError(null);

    const constraints: Constraints = {
      remotePreference: activeWorkArrangements.join(", "),
      studyHoursPerWeek: studyHoursPerWeek!,
      urgency: urgency!,
      budgetSgd: budgetInput.trim() ? Number(budgetInput) : null,
      skillsFutureCreditSgd: creditInput.trim() ? Number(creditInput) : null,
      accommodations: accommodations.trim() || undefined,
    };

    try {
      // Deck is exploration-only, not exhaustive — keep it to a short swipe
      // regardless of how many industries are selected, splitting the target
      // across them rather than fetching full decks and discarding most of it.
      const perIndustryLimit = Math.max(1, Math.ceil(SWIPE_DECK_TARGET_SIZE / industryIds.length));

      const results = await Promise.allSettled(
        industryIds.map(async (industryId) => {
          const response = await fetch("/api/industry-roles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ industryId, limit: perIndustryLimit }),
          });
          if (!response.ok) throw new Error(`Request failed (${response.status})`);
          const data = await response.json();
          return data.cards as JobCard[];
        })
      );

      const allCards = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
      if (allCards.length === 0) throw new Error("No live roles across any selected industry");

      // Same industry's live pull can occasionally overlap with another's — dedupe by title.
      const seenTitles = new Set<string>();
      const merged = allCards.filter((card) => {
        const key = card.title.trim().toLowerCase();
        if (seenTitles.has(key)) return false;
        seenTitles.add(key);
        return true;
      });

      onSubmit(constraints, merged.slice(0, SWIPE_DECK_TARGET_SIZE));
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
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">
            Which industries interest you? (select all that apply)
          </p>
          <div className="flex flex-wrap gap-2">
            {INDUSTRIES.map((industry) => {
              const active = industryIds.includes(industry.id);
              return (
                <button
                  key={industry.id}
                  type="button"
                  onClick={() => toggleIndustry(industry.id)}
                  className={`rounded-full border-2 px-4 py-2 text-sm font-bold transition ${
                    active
                      ? "border-primary bg-primary text-white"
                      : "border-primary-pale bg-primary-pale/30 text-ink hover:bg-primary-pale/60"
                  }`}
                >
                  {active ? "✓ " : ""}
                  {industry.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">Work setup (select all that apply)</p>
          <div className="flex flex-wrap gap-2">
            <MultiChipGroup options={WORK_OPTIONS} selected={workArrangements} onToggle={toggleWorkArrangement} />
            <button
              type="button"
              onClick={() => setShowOtherWork((v) => !v)}
              className={`rounded-full border-2 px-4 py-2 text-sm font-bold transition ${
                showOtherWork
                  ? "border-primary bg-primary-pale/60 text-primary-dark"
                  : "border-primary-pale bg-primary-pale/30 text-ink-muted hover:bg-primary-pale/60"
              }`}
            >
              {showOtherWork ? "✕ Cancel" : "+ Other"}
            </button>
          </div>
          {showOtherWork && (
            <input
              type="text"
              value={otherWorkText}
              onChange={(e) => setOtherWorkText(e.target.value)}
              placeholder="e.g. 4-day work week, shift-based"
              className="mt-2 w-full rounded-xl border-2 border-primary-pale bg-primary-pale/30 px-3 py-2.5 text-sm text-ink outline-none transition focus:border-primary"
            />
          )}
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

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">Accommodations (optional)</p>
          <input
            type="text"
            value={accommodations}
            onChange={(e) => setAccommodations(e.target.value)}
            placeholder="e.g. need screen-reader-compatible courses, caregiving hours to work around"
            className="w-full rounded-xl border-2 border-primary-pale bg-primary-pale/30 px-3 py-2.5 text-sm text-ink outline-none transition focus:border-primary"
          />
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
