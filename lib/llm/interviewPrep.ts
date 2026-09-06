import { converseJson } from "./client";

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
  source: "model" | "heuristic";
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
  "never generic advice.";

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
          suggested_talking_point: {
            type: "string",
            description:
              "A 3-4 sentence structured answer outline, not a one-liner: open with the specific " +
              "situation/context from their real background, name the concrete action they took, state " +
              "the outcome or measurable result, then explicitly connect it to why it matters for the " +
              "target role. Every sentence must be grounded in the person's actual listed experience — " +
              "no generic interview-coaching filler.",
          },
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

async function generateWithModel(input: InterviewPrepInput): Promise<InterviewPrepResult> {
  const parsed = await converseJson<{
    questions: {
      category: InterviewQuestionCategory;
      question: string;
      why_asked: string;
      suggested_talking_point: string;
      source_bullet: string | null;
    }[];
  }>(
    `Current role: ${input.currentRole ?? "not specified"}\n` +
      `Years of experience: ${input.yearsExperience ?? "not specified"}\n` +
      `Skills: ${input.skills.join(", ") || "none listed"}\n\n` +
      `Target role: ${input.targetRole}\n` +
      `Target role required skills: ${input.jdRequiredSkills.join(", ") || "none listed"}\n` +
      `Identified skill gaps: ${input.skillGaps.join(", ") || "none"}\n` +
      `Transferable skills flagged as relevant: ${input.transferableSkills.join(", ") || "none"}\n\n` +
      "Generate 6-8 questions spanning all three categories (career transition story, " +
      "behavioral, role-specific/technical). Every suggested_talking_point must be a full 3-4 " +
      "sentence structured answer outline (situation → action → outcome → why it matters for the " +
      "target role) referencing a specific transferable skill or piece of experience listed above — " +
      "not a one-line tip and not generic advice.",
    QUESTION_SCHEMA,
    { system: SYSTEM_PROMPT, maxTokens: 3500 }
  );

  return {
    source: "model",
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
      suggestedTalkingPoint:
        `Start with a specific moment in your current work where ${topTransferable} made a real difference — ` +
        `describe the situation briefly, then what you actually did. Name the outcome, even roughly (time saved, ` +
        `a problem avoided, a person helped). Then say directly why that same strength is exactly what a ` +
        `${input.targetRole} needs day to day — don't leave the interviewer to make that connection themselves.`,
      sourceBullet: null,
    },
    {
      category: "Career transition story",
      question: `What do you think will be the hardest part of this transition?`,
      whyAsked: "Tests self-awareness about the real gap, not just enthusiasm for the new field.",
      suggestedTalkingPoint:
        `Name ${topGap} honestly as the real gap — don't minimize it or claim you're already there. Describe the ` +
        `concrete plan you're already executing to close it (a specific course, a project, hours per week), and ` +
        `give a rough timeline. Close by reframing this as evidence of how you approach unfamiliar problems in general.`,
      sourceBullet: null,
    },
    {
      category: "Behavioral",
      question: `Tell me about a time you used ${topTransferable} to solve a problem.`,
      whyAsked: "Behavioral questions probe for evidence, not claims — they want a specific story, not a trait list.",
      suggestedTalkingPoint:
        `Pick one real, specific episode from your time as ${input.currentRole ?? "your current role"} — set up ` +
        `the situation in a sentence, then what you personally did (not what your team did). State the concrete ` +
        `result. Finish by translating that result into language a ${input.targetRole} hiring manager would ` +
        `recognize as directly relevant to their day-to-day.`,
      sourceBullet: null,
    },
    {
      category: "Behavioral",
      question: "Describe a time you had to learn something completely new under time pressure.",
      whyAsked: `Since ${topGap} is a real gap, they're checking how you actually close skill gaps in practice.`,
      suggestedTalkingPoint:
        `Choose a genuine example of learning fast under a real deadline — what forced the urgency, what your ` +
        `first move was, and how you validated you'd actually learned it (not just read about it). The specific ` +
        `topic matters less than showing a repeatable process, since that's what reassures them about ${topGap}.`,
      sourceBullet: null,
    },
    {
      category: "Role-specific",
      question: `How comfortable are you with ${topGap}? What's your plan to build that up?`,
      whyAsked: "Directly probes the biggest gap between your background and the role's requirements.",
      suggestedTalkingPoint:
        `Be honest about your current level rather than overstating it — vague confidence reads worse than a ` +
        `clear plan. Name the specific roadmap step (course, project, practice routine) already targeting this, ` +
        `plus a rough timeline for when you'd expect to be job-ready on it, so the answer feels concrete, not aspirational.`,
      sourceBullet: null,
    },
    {
      category: "Role-specific",
      question: `What about your background as ${input.currentRole ?? "your current background"} do you think most people would overlook as relevant here?`,
      whyAsked: "Gives you room to reframe experience that looks unrelated on paper as genuinely transferable.",
      suggestedTalkingPoint:
        `Lead with ${topTransferable} and a concrete instance of using it. Explain why someone hiring purely ` +
        `from inside the ${input.targetRole} pipeline likely wouldn't have built this same strength, since it came ` +
        `from a different kind of pressure or environment. That contrast is your actual edge — name it explicitly rather than implying it.`,
      sourceBullet: null,
    },
  ];

  return { questions, source: "heuristic" };
}

export async function generateInterviewQuestions(input: InterviewPrepInput): Promise<InterviewPrepResult> {
  try {
    return await generateWithModel(input);
  } catch {
    return generateHeuristic(input);
  }
}
