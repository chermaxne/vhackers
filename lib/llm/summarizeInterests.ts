import { getAnthropicClient, BEDROCK_MODEL } from "./client";
import type { JobCard } from "../jobs";
import type { SkillGap } from "../roadmap";

export interface InterestSummary {
  narrative: string;
  source: "claude" | "heuristic";
}

async function summarizeWithClaude(
  likedJobs: JobCard[],
  skillGaps: SkillGap[],
  unlockedRoles: string[]
): Promise<InterestSummary> {
  const client = getAnthropicClient();
  const roleList = likedJobs.map((j) => j.title).join(", ");
  const gapList = skillGaps.slice(0, 5).map((g) => g.skill).join(", ");
  const response = await client.messages.create({
    model: BEDROCK_MODEL.opus5,
    max_tokens: 400,
    messages: [
      {
        role: "user",
        content:
          `A job seeker swiped right (interested) on these roles: ${roleList}.\n` +
          `The skills their picks most commonly ask for, that they haven't confirmed having, ` +
          `are: ${gapList || "none"}.\n` +
          `Closing those gaps would also open up: ${unlockedRoles.join(", ") || "no additional roles in this sample"}.\n\n` +
          `Write a short (2-3 sentence), plain-language, encouraging summary of the pattern ` +
          `across their picks, in second person ("you're drawn to..."). No headers, no bullet points, just prose.`,
      },
    ],
  });
  const block = response.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") throw new Error("No text content in Claude response");
  return { narrative: block.text.trim(), source: "claude" };
}

// Deterministic stand-in — used automatically whenever the Claude call
// fails, same swap-in pattern as lib/llm/extractResume.ts.
function summarizeHeuristic(
  likedJobs: JobCard[],
  skillGaps: SkillGap[],
  unlockedRoles: string[]
): InterestSummary {
  if (likedJobs.length === 0) {
    return {
      narrative: "You didn't like any roles this round — go back and swipe right on a few to get a summary.",
      source: "heuristic",
    };
  }

  const threads = new Map<string, number>();
  for (const job of likedJobs) {
    for (const skill of job.transferableSkills) {
      threads.set(skill, (threads.get(skill) ?? 0) + 1);
    }
  }
  const topThreads = [...threads.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([s]) => s);

  const roleList = likedJobs.map((j) => j.title).join(", ");
  const threadClause = topThreads.length > 0 ? ` A common thread across them: ${topThreads.join(", ")}.` : "";
  const gapClause =
    skillGaps.length > 0
      ? ` The skill your picks ask for most is ${skillGaps[0].skill}${
          unlockedRoles.length > 0
            ? ` — closing that gap opens up ${unlockedRoles.length} more role${unlockedRoles.length === 1 ? "" : "s"} from this set`
            : ""
        }.`
      : "";

  return {
    narrative: `You're drawn to ${roleList}.${threadClause}${gapClause}`,
    source: "heuristic",
  };
}

export async function summarizeInterestPattern(
  likedJobs: JobCard[],
  skillGaps: SkillGap[],
  unlockedRoles: string[]
): Promise<InterestSummary> {
  try {
    return await summarizeWithClaude(likedJobs, skillGaps, unlockedRoles);
  } catch {
    return summarizeHeuristic(likedJobs, skillGaps, unlockedRoles);
  }
}
