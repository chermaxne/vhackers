export type Urgency = "asap" | "few_months" | "no_rush";

export interface Constraints {
  remotePreference: string;
  studyHoursPerWeek: number;
  budgetSgd: number | null;
  skillsFutureCreditSgd: number | null;
  urgency: Urgency;
  /** Free-text accessibility/scheduling accommodations, e.g. "need screen-reader-compatible courses". Optional — most consumers don't need to branch on it. */
  accommodations?: string;
}

export const STUDY_HOURS_OPTIONS = [
  { label: "< 2 hrs", value: 1 },
  { label: "2–5 hrs", value: 3.5 },
  { label: "5–10 hrs", value: 7.5 },
  { label: "10+ hrs", value: 12 },
] as const;

export const URGENCY_OPTIONS: { label: string; value: Urgency }[] = [
  { label: "ASAP", value: "asap" },
  { label: "Within 3 months", value: "few_months" },
  { label: "No rush", value: "no_rush" },
];

/** Rough weeks-to-complete estimate for a phase, given a study pace. Skill count * 2.5 hrs/skill is a placeholder ratio — tune once real course durations are wired in. */
export function estimatePhaseWeeks(skillCount: number, studyHoursPerWeek: number): number {
  if (studyHoursPerWeek <= 0) return Infinity;
  const HOURS_PER_SKILL = 2.5;
  return Math.max(1, Math.ceil((skillCount * HOURS_PER_SKILL) / studyHoursPerWeek));
}
