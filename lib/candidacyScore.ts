import type { SkillGap } from "./roadmap";
import type { MarketSnapshot } from "./mycareersfuture";

export type CandidacyBand = "strong" | "building" | "early";

export interface CandidacyScore {
  score: number; // 0-100
  band: CandidacyBand;
  bandLabel: string;
  skillCoveragePct: number;
  marketDemandIndex: number;
  coveredSkills: string[];
  gapSkills: string[];
}

const BAND_LABELS: Record<CandidacyBand, string> = {
  strong: "Strong fit",
  building: "Building",
  early: "Early stage",
};

function bandFor(score: number): CandidacyBand {
  if (score >= 70) return "strong";
  if (score >= 40) return "building";
  return "early";
}

function fuzzyOverlap(a: string, b: string): boolean {
  const x = a.trim().toLowerCase();
  const y = b.trim().toLowerCase();
  return x.includes(y) || y.includes(x);
}

/** 0-5 postings -> low (~20), 6-15 -> medium (~60), 16+ -> high (~100). */
function marketDemandIndex(postingsCount: number): number {
  if (postingsCount >= 16) return 100;
  if (postingsCount >= 6) return 60;
  if (postingsCount >= 1) return 20;
  return 0;
}

/**
 * Deterministic formula, not an LLM call — fast, explainable to judges, and
 * stable across demo runs. Reuses skill gaps (already merged target +
 * adjacent-role requirements) and the market snapshot's posting count.
 * Transferable-skill matches count at full weight, same as a direct skill
 * match — matchSkillsToJobs already treats them the same way.
 */
export function computeCandidacyScore(
  skillGaps: SkillGap[],
  userSkills: string[],
  market: MarketSnapshot | null
): CandidacyScore {
  const covered = skillGaps.filter((gap) => userSkills.some((skill) => fuzzyOverlap(skill, gap.skill)));
  const skillCoveragePct = skillGaps.length > 0 ? Math.round((covered.length / skillGaps.length) * 100) : 0;
  const demandIndex = marketDemandIndex(market?.postings.length ?? 0);

  const score = Math.round(0.7 * skillCoveragePct + 0.3 * demandIndex);
  const band = bandFor(score);

  return {
    score,
    band,
    bandLabel: BAND_LABELS[band],
    skillCoveragePct,
    marketDemandIndex: demandIndex,
    coveredSkills: covered.map((g) => g.skill),
    gapSkills: skillGaps.filter((g) => !covered.includes(g)).map((g) => g.skill),
  };
}
