import { getAnthropicClient, BEDROCK_MODEL } from "./client";

export type InterviewQuestionCategory = "Career transition story" | "Behavioral" | "Role-specific";

export interface InterviewQuestion {
  category: InterviewQuestionCategory;
  question: string;
  whyAsked: string;
  suggestedTalkingPoint: string;
  sourceBullet: string | null;
}

export interface InterviewPrepResult {
  questions: InterviewQuestion[];
  source: "claude" | "heuristic";
}

export interface InterviewPrepInput {
  currentRole: string | null;
  yearsExperience: number | null;
  skills: string[];
  targetRole: string;
  jdRequiredSkills: string[];
  skillGaps: string[];
  transferableSkills: string[];
}

const SYSTEM_PROMPT =
  "You are an interview coach helping a mid-career professional prepare for a role " +
  "in a new industry. Using their resume and the target role's requirements, " +
  "generate likely interview questions with grounded, specific talking points — " +
  "never generic advice. Return ONLY valid JSON matching the schema below. " +
  "No preamble, no markdown code fences.\n\n" +
  'Schema:\n{"questions":[{"category":"","question":"","why_asked":"","suggested_talking_point":"","source_bullet":""}]}';

const QUESTION_SCHEMA = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: { type: "string", enum: ["Career transition story", "Behavioral", "Role-specific"] },
          question: { type: "string" },
          why_asked: { type: "string" },
          suggested_talking_point: { type: "string" },
          source_bullet: { type: ["string", "null"] },
        },
        required: ["category", "question", "why_asked", "suggested_talking_point", "source_bullet"],
        additionalProperties: false,
      },
    },
  },
  required: ["questions"],
  additionalProperties: false,
} as const;

async function generateWithClaude(input: InterviewPrepInput): Promise<InterviewPrepResult> {
  const client = getAnthropicClient();
  const response = await client.messages.create({
    model: BEDROCK_MODEL.sonnet5,
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    output_config: { format: { type: "json_schema", schema: QUESTION_SCHEMA } },
    messages: [
      {
        role: "user",
        content:
          `Current role: ${input.currentRole ?? "not specified"}\n` +
          `Years of experience: ${input.yearsExperience ?? "not specified"}\n` +
          `Skills: ${input.skills.join(", ") || "none listed"}\n\n` +
          `Target role: ${input.targetRole}\n` +
          `Target role required skills: ${input.jdRequiredSkills.join(", ") || "none listed"}\n` +
          `Identified skill gaps: ${input.skillGaps.join(", ") || "none"}\n` +
          `Transferable skills flagged as relevant: ${input.transferableSkills.join(", ") || "none"}\n\n` +
          "Generate 6-8 questions spanning all three categories (career transition story, " +
          "behavioral, role-specific/technical). Every suggested_talking_point must reference a " +
          "specific transferable skill or piece of experience listed above — not generic advice.",
      },
    ],
  });

  const block = response.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") throw new Error("No text content in Claude response");
  const parsed = JSON.parse(block.text) as {
    questions: {
      category: InterviewQuestionCategory;
      question: string;
      why_asked: string;
      suggested_talking_point: string;
      source_bullet: string | null;
    }[];
  };

  return {
    source: "claude",
    questions: parsed.questions.map((q) => ({
      category: q.category,
      question: q.question,
      whyAsked: q.why_asked,
      suggestedTalkingPoint: q.suggested_talking_point,
      sourceBullet: q.source_bullet,
    })),
  };
}

// Deterministic stand-in — same auto-fallback pattern as the rest of
// lib/llm/*. Template questions filled in with the person's own data rather
// than a live model reading between the lines, so it's grounded but not
// adaptive.
function generateHeuristic(input: InterviewPrepInput): InterviewPrepResult {
  const topTransferable = input.transferableSkills[0] ?? input.skills[0] ?? "your strongest transferable skill";
  const topGap = input.skillGaps[0] ?? "the top skill this role asks for";
  const roleClause = input.currentRole ? `moving from ${input.currentRole} into ${input.targetRole}` : `moving into ${input.targetRole}`;

  const questions: InterviewQuestion[] = [
    {
      category: "Career transition story",
      question: `What's drawing you to ${roleClause}?`,
      whyAsked: "Interviewers open with this to gauge whether the transition is deliberate and well-reasoned.",
      suggestedTalkingPoint: `Anchor your answer in ${topTransferable} — name a specific time you used it and connect it to why ${input.targetRole} is a natural next step.`,
      sourceBullet: null,
    },
    {
      category: "Career transition story",
      question: `What do you think will be the hardest part of this transition?`,
      whyAsked: "Tests self-awareness about the real gap, not just enthusiasm for the new field.",
      suggestedTalkingPoint: `Name ${topGap} honestly, then describe the concrete plan (courses, practice) you're already following to close it.`,
      sourceBullet: null,
    },
    {
      category: "Behavioral",
      question: `Tell me about a time you used ${topTransferable} to solve a problem.`,
      whyAsked: "Behavioral questions probe for evidence, not claims — they want a specific story, not a trait list.",
      suggestedTalkingPoint: `Use a real example from your work as ${input.currentRole ?? "your current role"}, and explicitly translate the outcome into what it would mean for a ${input.targetRole}.`,
      sourceBullet: null,
    },
    {
      category: "Behavioral",
      question: "Describe a time you had to learn something completely new under time pressure.",
      whyAsked: `Since ${topGap} is a real gap, they're checking how you actually close skill gaps in practice.`,
      suggestedTalkingPoint: "Pick a genuine example of fast learning — the story matters more than the topic.",
      sourceBullet: null,
    },
    {
      category: "Role-specific",
      question: `How comfortable are you with ${topGap}? What's your plan to build that up?`,
      whyAsked: "Directly probes the biggest gap between your background and the role's requirements.",
      suggestedTalkingPoint: `Be honest about your current level, then point to the specific roadmap step (course, project) already targeting this.`,
      sourceBullet: null,
    },
    {
      category: "Role-specific",
      question: `What about your background as ${input.currentRole ?? "your current background"} do you think most people would overlook as relevant here?`,
      whyAsked: "Gives you room to reframe experience that looks unrelated on paper as genuinely transferable.",
      suggestedTalkingPoint: `Lead with ${topTransferable} — most candidates from inside the industry won't have it, which is your edge.`,
      sourceBullet: null,
    },
  ];

  return { questions, source: "heuristic" };
}

export async function generateInterviewQuestions(input: InterviewPrepInput): Promise<InterviewPrepResult> {
  try {
    return await generateWithClaude(input);
  } catch {
    return generateHeuristic(input);
  }
}
