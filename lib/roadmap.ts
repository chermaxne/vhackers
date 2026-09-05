import { SAMPLE_JOBS, type JobCard } from "./jobs";
import type { MarketSnapshot } from "./mycareersfuture";

export interface SkillGap {
  skill: string;
  /** How many of the input roles list this skill. */
  count: number;
  roles: string[];
}

export interface RoadmapPhase {
  name: string;
  description: string;
  skills: string[];
}

export interface Roadmap {
  targetLabel: string;
  skillGaps: SkillGap[];
  phases: RoadmapPhase[];
  unlocks: {
    headline: string;
    roles: string[];
  };
  /** Live postings snapshot, when one was fetched (Direct Role Entry only — see buildRoadmapForRole). */
  market: MarketSnapshot | null;
}

// NOTE: everything in this file is deterministic (frequency counts + array
// chunking), not an LLM call. The product doc calls for Claude to do this
// analysis, but that path needs Anthropic API credits, which this account
// doesn't currently have. This keeps the flow fully demoable without that
// dependency. Swap `aggregateSkillGaps`/`phaseSkillGaps` for a Claude call
// (see git history — components/JobCard.tsx used the same pattern) once
// credits are sorted.

/**
 * MyCareersFuture's own auto-tagged `skills` field mixes real, named
 * skills/tools ("SQL", "Tableau", "Active Directory" — reliably
 * capitalized) with extracted sentence fragments from job-description prose
 * ("shifts schedules", "managing end to end production", "user friendly
 * tools" — reliably all-lowercase, since they're not proper nouns). There's
 * no ground-truth "is this a real skill" source to check against, so this
 * is a heuristic, not a verified filter — it drops the worst offenders
 * without claiming perfect precision.
 */
function isLikelySkill(skill: string): boolean {
  const trimmed = skill.trim();
  if (trimmed.length === 0 || trimmed.length > 45) return false;
  const words = trimmed.split(/\s+/);
  if (words.length > 5) return false;
  const hasAnyCapital = /[A-Z]/.test(trimmed);
  if (words.length >= 2 && !hasAnyCapital) return false;
  return true;
}

export function aggregateSkillGaps(jobs: JobCard[]): SkillGap[] {
  const bySkill = new Map<string, SkillGap>();
  for (const job of jobs) {
    for (const skill of job.skillsRequired) {
      if (!isLikelySkill(skill)) continue;
      const existing = bySkill.get(skill);
      if (existing) {
        existing.count += 1;
        existing.roles.push(job.title);
      } else {
        bySkill.set(skill, { skill, count: 1, roles: [job.title] });
      }
    }
  }
  return [...bySkill.values()].sort((a, b) => b.count - a.count);
}

// Caps the *displayed* roadmap to the highest-signal skills only — gaps are
// already ranked by count (how many roles/postings ask for them) — rather
// than dumping every skill ever mentioned, down to one-off legacy tags, into
// a single course plan. roadmap.skillGaps itself stays uncapped (candidacy
// score / SkillGapScreen need the full picture); only the phase display trims.
const MAX_ROADMAP_SKILLS = 9;

export function phaseSkillGaps(gaps: SkillGap[], maxSkills = MAX_ROADMAP_SKILLS): RoadmapPhase[] {
  if (gaps.length === 0) return [];
  const skills = gaps.slice(0, maxSkills).map((g) => g.skill);
  const chunkSize = Math.ceil(skills.length / 3);
  const phases: RoadmapPhase[] = [
    {
      name: "Foundation",
      description: "Start here — the skills your shortlist asks for most often.",
      skills: skills.slice(0, chunkSize),
    },
    {
      name: "Building",
      description: "Layer these on once the foundation feels solid.",
      skills: skills.slice(chunkSize, chunkSize * 2),
    },
    {
      name: "Specializing",
      description: "Round out your profile with these to stand out.",
      skills: skills.slice(chunkSize * 2),
    },
  ];
  return phases.filter((p) => p.skills.length > 0);
}

export function buildRoadmapFromLikedJobs(likedJobs: JobCard[]): Roadmap {
  const skillGaps = aggregateSkillGaps(likedJobs);
  const phases = phaseSkillGaps(skillGaps);
  const topGaps = skillGaps.slice(0, 3);
  const unlockedRoles =
    topGaps.length > 0
      ? likedJobs.filter((job) => topGaps.some((gap) => job.skillsRequired.includes(gap.skill)))
      : [];

  return {
    targetLabel: "the roles you liked",
    skillGaps,
    phases,
    unlocks: {
      headline:
        topGaps.length > 0
          ? `Closing your top ${topGaps.length} skill gap${topGaps.length > 1 ? "s" : ""} moves you closer to ${unlockedRoles.length} of the ${likedJobs.length} role${likedJobs.length === 1 ? "" : "s"} you liked.`
          : "You already liked roles with no common skill gaps — you're well matched already.",
      roles: unlockedRoles.map((j) => j.title),
    },
    market: null,
  };
}

async function fetchMarketSnapshotSafely(role: string): Promise<MarketSnapshot | null> {
  try {
    const res = await fetch("/api/market", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.status === "ok" ? (json.data as MarketSnapshot) : null;
  } catch {
    return null;
  }
}

function mergeSkillSources(match: JobCard | undefined, market: MarketSnapshot | null): SkillGap[] {
  const bySkill = new Map<string, SkillGap>();

  if (match) {
    for (const skill of match.skillsRequired) {
      if (!isLikelySkill(skill)) continue;
      bySkill.set(skill.toLowerCase(), { skill, count: 1, roles: [match.title] });
    }
  }

  if (market) {
    for (const { skill, count } of market.topSkills) {
      if (!isLikelySkill(skill)) continue;
      const key = skill.toLowerCase();
      const existing = bySkill.get(key);
      if (existing) {
        existing.count += count;
      } else {
        bySkill.set(key, { skill, count, roles: ["Live job postings"] });
      }
    }
  }

  return [...bySkill.values()].sort((a, b) => b.count - a.count);
}

/**
 * Direct Role Entry path. Matches the sample dataset (lib/jobs.ts) for a
 * human-written description of the role, and pulls live MyCareersFuture
 * postings (via /api/market — see lib/mycareersfuture.ts) for the skill
 * ranking itself, so the gaps reflect today's demand rather than the
 * static sample snapshot. Live data is additive: a role with no sample
 * match can still get a full roadmap from live postings alone.
 */
export async function buildRoadmapForRole(roleName: string): Promise<Roadmap> {
  const trimmed = roleName.trim();
  const normalized = trimmed.toLowerCase();
  const match = SAMPLE_JOBS.find(
    (job) => job.title.toLowerCase().includes(normalized) || normalized.includes(job.title.toLowerCase())
  );

  const market = await fetchMarketSnapshotSafely(trimmed);
  const skillGaps = mergeSkillSources(match, market);

  if (skillGaps.length === 0) {
    return {
      targetLabel: trimmed,
      skillGaps: [],
      phases: [],
      unlocks: {
        headline: `We couldn't find skills data for "${trimmed}" — not in our sample deck, and no live postings matched either. Try "Explore other roles" below instead.`,
        roles: [],
      },
      market,
    };
  }

  const label = match?.title ?? trimmed;
  return {
    targetLabel: label,
    skillGaps,
    phases: phaseSkillGaps(skillGaps),
    unlocks: {
      headline:
        market && market.postings.length > 0
          ? `Closing these gaps sets you up for ${label} and similar roles — ranked against ${market.postings.length} live postings across ${market.queriedRoles.length} related role${market.queriedRoles.length === 1 ? "" : "s"}.`
          : `Closing these gaps sets you up for ${label} and similar roles.`,
      roles: [label],
    },
    market,
  };
}
