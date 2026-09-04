import { getAnthropicClient, BEDROCK_MODEL } from "./client";

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

const SKILL_MATCH_SCHEMA = {
  type: "object",
  additionalProperties: {
    type: "object",
    properties: {
      matchedTransferableSkills: { type: "array", items: { type: "string" } },
      matchedSkillsRequired: { type: "array", items: { type: "string" } },
    },
    required: ["matchedTransferableSkills", "matchedSkillsRequired"],
    additionalProperties: false,
  },
} as const;

async function matchWithClaude(
  userSkills: string[],
  jobs: SkillMatchJob[]
): Promise<Record<string, SkillMatchResult>> {
  const client = getAnthropicClient();
  const jobsDescription = jobs
    .map(
      (job) =>
        `- Job: "${job.title}" (ID: ${job.uuid})\n  Transferable Skills: [${job.transferableSkills.join(", ")}]\n  Required Skills: [${job.skillsRequired.join(", ")}]`
    )
    .join("\n");

  const response = await client.messages.create({
    model: BEDROCK_MODEL.sonnet5,
    max_tokens: 2000,
    output_config: { format: { type: "json_schema", schema: SKILL_MATCH_SCHEMA } },
    messages: [
      {
        role: "user",
        content:
          `A job seeker has these skills: [${userSkills.join(", ")}].\n\nJobs:\n${jobsDescription}\n\n` +
          "For each job (keyed by its ID), identify which of the seeker's skills are relevant to that job's " +
          "transferable skills or required skills — match on semantic similarity and career relevance, not " +
          "just exact string overlap.",
      },
    ],
  });

  const block = response.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") throw new Error("No text content in Claude response");
  return JSON.parse(block.text);
}

function fuzzyOverlap(userSkill: string, jobSkill: string): boolean {
  const u = userSkill.trim().toLowerCase();
  const j = jobSkill.trim().toLowerCase();
  return j.includes(u) || u.includes(j);
}

// Deterministic stand-in — same auto-fallback pattern as
// lib/llm/extractResume.ts and summarizeInterests.ts. Matches by substring
// overlap rather than Claude's semantic judgment, so it catches "SQL" but
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
    return await matchWithClaude(userSkills, jobs);
  } catch {
    return matchHeuristic(userSkills, jobs);
  }
}
