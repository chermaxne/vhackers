import { converseText } from "./client";
import type { CandidacyScore } from "../candidacyScore";

export interface CandidacyRationale {
  sentence: string;
  source: "model" | "heuristic";
}

const SYSTEM_PROMPT =
  "You are writing a one-sentence, plain-language explanation of a career-transition " +
  "candidacy score for a mobile app screen. Be specific and encouraging without " +
  "overstating. Maximum 25 words. Output the sentence only — no preamble, no quotes.";

async function rationaleWithModel(
  candidacy: CandidacyScore,
  targetRole: string,
  postingsCount: number
): Promise<CandidacyRationale> {
  const topSkills = candidacy.coveredSkills.slice(0, 2).join(", ") || "none yet";
  const topGap = candidacy.gapSkills[0] ?? "none";

  const sentence = await converseText(
    `score: ${candidacy.score}\nband: ${candidacy.bandLabel}\n` +
      `skill_coverage_pct: ${candidacy.skillCoveragePct}\nstrongest_transferable_skills: ${topSkills}\n` +
      `top_skill_gap: ${topGap}\ntarget_role: ${targetRole}\nlive_postings_count: ${postingsCount}`,
    { system: SYSTEM_PROMPT, maxTokens: 80 }
  );
  return { sentence, source: "model" };
}

// Deterministic stand-in — same auto-fallback pattern as the rest of lib/llm/*.
function rationaleHeuristic(candidacy: CandidacyScore, targetRole: string): CandidacyRationale {
  const topGap = candidacy.gapSkills[0];
  const sentence =
    candidacy.band === "strong"
      ? `You already cover ${candidacy.skillCoveragePct}% of what ${targetRole} postings ask for — you're in a strong position to apply.`
      : candidacy.band === "building"
        ? `You're partway there for ${targetRole} — closing the gap on ${topGap ?? "a few key skills"} would meaningfully strengthen your candidacy.`
        : `${targetRole} is a stretch right now, but the roadmap below targets exactly the skills — starting with ${topGap ?? "the top gap"} — that would change that.`;
  return { sentence, source: "heuristic" };
}

export async function generateCandidacyRationale(
  candidacy: CandidacyScore,
  targetRole: string,
  postingsCount: number
): Promise<CandidacyRationale> {
  try {
    return await rationaleWithModel(candidacy, targetRole, postingsCount);
  } catch {
    return rationaleHeuristic(candidacy, targetRole);
  }
}
