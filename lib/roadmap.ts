import { SAMPLE_JOBS, type JobCard } from "./jobs";

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
}

// NOTE: everything in this file is deterministic (frequency counts + array
// chunking), not an LLM call. The product doc calls for Claude to do this
// analysis, but that path needs Anthropic API credits, which this account
// doesn't currently have. This keeps the flow fully demoable without that
// dependency. Swap `aggregateSkillGaps`/`phaseSkillGaps` for a Claude call
// (see git history — components/JobCard.tsx used the same pattern) once
// credits are sorted.

export function aggregateSkillGaps(jobs: JobCard[]): SkillGap[] {
  const bySkill = new Map<string, SkillGap>();
  for (const job of jobs) {
    for (const skill of job.skillsRequired) {
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

export function phaseSkillGaps(gaps: SkillGap[]): RoadmapPhase[] {
  if (gaps.length === 0) return [];
  const skills = gaps.map((g) => g.skill);
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
  };
}

/** Direct Role Entry path — best-effort match against the sample dataset since there's no live role/skills database wired up yet. */
export function buildRoadmapForRole(roleName: string): Roadmap {
  const trimmed = roleName.trim();
  const normalized = trimmed.toLowerCase();
  const match = SAMPLE_JOBS.find(
    (job) => job.title.toLowerCase().includes(normalized) || normalized.includes(job.title.toLowerCase())
  );

  if (!match) {
    return {
      targetLabel: trimmed,
      skillGaps: [],
      phases: [],
      unlocks: {
        headline: `We don't have skills data for "${trimmed}" yet — this demo only knows the roles in the sample deck. Try "Explore other roles" below instead.`,
        roles: [],
      },
    };
  }

  const skillGaps: SkillGap[] = match.skillsRequired.map((skill) => ({
    skill,
    count: 1,
    roles: [match.title],
  }));

  return {
    targetLabel: match.title,
    skillGaps,
    phases: phaseSkillGaps(skillGaps),
    unlocks: {
      headline: `Closing these gaps sets you up for ${match.title} and similar roles.`,
      roles: [match.title],
    },
  };
}
