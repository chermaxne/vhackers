import { getAnthropicClient, BEDROCK_MODEL } from "./client";

export interface TailoredResume {
  content: string;
  source: "claude" | "heuristic";
}

async function tailorWithClaude(
  resumeText: string,
  targetRole: string,
  emphasizeSkills: string[]
): Promise<TailoredResume> {
  const client = getAnthropicClient();
  const response = await client.messages.create({
    model: BEDROCK_MODEL.opus5,
    max_tokens: 1500,
    messages: [
      {
        role: "user",
        content:
          `Rewrite the bullet points in this resume so they're framed for a "${targetRole}" role — ` +
          `use the language and emphasis that role's hiring manager would care about. Keep every ` +
          `underlying fact and claim truthful; only reframe wording, ordering, and emphasis, never invent ` +
          `experience. Where genuinely relevant, surface these transferable skills: ` +
          `${emphasizeSkills.join(", ") || "none specified"}.\n\n` +
          `Return plain text only: the same resume structure and sections, with rewritten bullet points. ` +
          `No commentary, no markdown formatting, no headers beyond the resume's own section titles.\n\n` +
          `---\n${resumeText.slice(0, 12000)}`,
      },
    ],
  });
  const block = response.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") throw new Error("No text content in Claude response");
  return { content: block.text.trim(), source: "claude" };
}

// Deterministic stand-in — same swap-in pattern as lib/llm/extractResume.ts.
// Rewriting prose without an LLM isn't feasible, so this surfaces the original
// resume with a tailoring header instead of fabricating rewritten bullets.
function tailorHeuristic(resumeText: string, targetRole: string, emphasizeSkills: string[]): TailoredResume {
  const header =
    `TAILORED FOR: ${targetRole}\n` +
    (emphasizeSkills.length > 0
      ? `Look for chances to foreground these transferable skills wherever they show up below: ${emphasizeSkills.join(", ")}\n`
      : "") +
    `${"-".repeat(48)}\n\n`;
  return { content: header + resumeText.trim(), source: "heuristic" };
}

export async function tailorResumeForRole(
  resumeText: string,
  targetRole: string,
  emphasizeSkills: string[]
): Promise<TailoredResume> {
  try {
    return await tailorWithClaude(resumeText, targetRole, emphasizeSkills);
  } catch {
    return tailorHeuristic(resumeText, targetRole, emphasizeSkills);
  }
}
