const STORAGE_PREFIX = "lattice-roadmap-budget:";

export interface StepBudgetEntry {
  estimatedCostSgd: number | null;
  /** null = not yet checked — there's no real course-eligibility API to check this automatically, so it's self-reported. */
  sfcEligible: boolean | null;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Same key-derivation approach as lib/roadmapProgress.ts — content-derived, client-side only, kept separate since cost/eligibility is a different concern from completion. */
export function getBudgetKey(targetLabel: string, stepIds: string[]): string {
  return `${STORAGE_PREFIX}${slugify(targetLabel)}:${[...stepIds].sort().join(",")}`;
}

export function loadBudget(key: string): Record<string, StepBudgetEntry> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Record<string, StepBudgetEntry>) : {};
  } catch {
    return {};
  }
}

export function saveBudget(key: string, budget: Record<string, StepBudgetEntry>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(budget));
  } catch {
    // Storage full/unavailable — budget tracking is a nice-to-have, fail silently.
  }
}
