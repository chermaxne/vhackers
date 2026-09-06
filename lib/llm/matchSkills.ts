import { converseJson } from "./client";

export interface SkillMatchJob {
  uuid: string;
  title: string;
  transferableSkills: string[];
  skillsRequired: string[];
}

export interface SkillMatchResult {
  matchedTransferableSkills: string[];
  matchedSkillsRequired: string[];
}

// An array keyed by job ID, not an object with dynamic keys — Bedrock's
// tool-use schema validation (Converse API, see lib/llm/client.ts) is much
// more reliably enforced for fixed-shape array items than for
// `additionalProperties`-style dynamic-key objects, which is what
// Anthropic's json_schema mode used previously.
const SKILL_MATCH_SCHEMA = {
  type: "object",
  properties: {
    matches: {
      type: "array",
      items: {
        type: "object",
        properties: {
          jobId: { type: "string" },
          matchedTransferableSkills: { type: "array", items: { type: "string" } },
          matchedSkillsRequired: { type: "array", items: { type: "string" } },
        },
        required: ["jobId", "matchedTransferableSkills", "matchedSkillsRequired"],
        additionalProperties: false,
      },
    },
  },
  required: ["matches"],
  additionalProperties: false,
} as const;

async function matchWithModel(
  userSkills: string[],
  jobs: SkillMatchJob[]
): Promise<Record<string, SkillMatchResult>> {
  const jobsDescription = jobs
    .map(
      (job) =>
        `- Job: "${job.title}" (ID: ${job.uuid})\n  Transferable Skills: [${job.transferableSkills.join(", ")}]\n  Required Skills: [${job.skillsRequired.join(", ")}]`
    )
    .join("\n");

  const parsed = await converseJson<{ matches: (SkillMatchResult & { jobId: string })[] }>(
    `A job seeker has these skills: [${userSkills.join(", ")}].\n\nJobs:\n${jobsDescription}\n\n` +
      "For each job (keyed by its ID as jobId), identify which of the seeker's skills are relevant to that job's " +
      "transferable skills or required skills — match on semantic similarity and career relevance, not " +
      "just exact string overlap.",
    SKILL_MATCH_SCHEMA,
    { maxTokens: 2000 }
  );

  const result: Record<string, SkillMatchResult> = {};
  for (const m of parsed.matches) {
    result[m.jobId] = {
      matchedTransferableSkills: m.matchedTransferableSkills,
      matchedSkillsRequired: m.matchedSkillsRequired,
    };
  }
  return result;
}

function fuzzyOverlap(userSkill: string, jobSkill: string): boolean {
  const u = userSkill.trim().toLowerCase();
  const j = jobSkill.trim().toLowerCase();
  return j.includes(u) || u.includes(j);
}

// Deterministic stand-in — same auto-fallback pattern as
// lib/llm/extractResume.ts and summarizeInterests.ts. Matches by substring
// overlap rather than the model's semantic judgment, so it catches "SQL" but
// not e.g. "database querying" ~ "SQL".
function matchHeuristic(userSkills: string[], jobs: SkillMatchJob[]): Record<string, SkillMatchResult> {
  const matches: Record<string, SkillMatchResult> = {};
  for (const job of jobs) {
    matches[job.uuid] = {
      matchedTransferableSkills: job.transferableSkills.filter((skill) =>
        userSkills.some((u) => fuzzyOverlap(u, skill))
      ),
      matchedSkillsRequired: job.skillsRequired.filter((skill) => userSkills.some((u) => fuzzyOverlap(u, skill))),
    };
  }
  return matches;
}

export async function matchSkillsToJobs(
  userSkills: string[],
  jobs: SkillMatchJob[]
): Promise<Record<string, SkillMatchResult>> {
  try {
    return await matchWithModel(userSkills, jobs);
  } catch {
    return matchHeuristic(userSkills, jobs);
  }
}
