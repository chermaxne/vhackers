import { getAnthropicClient, BEDROCK_MODEL } from "./client";
import { SAMPLE_JOBS } from "../jobs";

export interface ResumeFields {
  currentRole: string | null;
  yearsExperience: number | null;
  skills: string[];
  source: "claude" | "heuristic";
}

/**
 * text: always present (from pdf-parse/mammoth) — used for the heuristic
 * fallback either way, and as Claude's input for DOCX.
 * pdfBase64: present only for PDF uploads. Sent to Claude as a native
 * document block instead of the pre-extracted text, so scanned/image-only
 * PDFs (which pdf-parse returns empty text for) still get read — Claude
 * handles that natively, no separate OCR step needed.
 */
export interface ResumeSource {
  text: string;
  pdfBase64?: string;
}

const RESUME_FIELDS_SCHEMA = {
  type: "object",
  properties: {
    currentRole: {
      type: ["string", "null"],
      description: "The person's current or most recent job title",
    },
    yearsExperience: {
      type: ["number", "null"],
      description: "Total years of professional work experience",
    },
    skills: {
      type: "array",
      items: { type: "string" },
      description: "Concrete skills mentioned in the resume (tools, technical skills, domains)",
    },
  },
  required: ["currentRole", "yearsExperience", "skills"],
  additionalProperties: false,
} as const;

const EXTRACTION_INSTRUCTION =
  "Extract the current/most recent job title, total years of professional experience, " +
  "and a flat list of concrete skills from this resume. If a field can't be determined, " +
  "use null (or an empty array for skills).";

async function extractWithClaude(source: ResumeSource): Promise<ResumeFields> {
  const client = getAnthropicClient();
  const content = source.pdfBase64
    ? [
        { type: "document" as const, source: { type: "base64" as const, media_type: "application/pdf" as const, data: source.pdfBase64 } },
        { type: "text" as const, text: EXTRACTION_INSTRUCTION },
      ]
    : `${EXTRACTION_INSTRUCTION}\n\n---\n${source.text.slice(0, 12000)}`;

  const response = await client.messages.create({
    model: BEDROCK_MODEL.sonnet5,
    max_tokens: 1024,
    output_config: { format: { type: "json_schema", schema: RESUME_FIELDS_SCHEMA } },
    messages: [{ role: "user", content }],
  });
  const block = response.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") throw new Error("No text content in Claude response");
  const parsed = JSON.parse(block.text) as Omit<ResumeFields, "source">;
  return { ...parsed, source: "claude" };
}

// Deterministic stand-in — used automatically whenever the Claude call
// fails (no credits, expired AWS session, etc.), so this feature demos
// today and starts using live extraction the moment Bedrock credentials
// are valid, with no code change required. Only ever sees `text`, so a
// scanned PDF (empty pdf-parse text) degrades honestly to mostly-null
// fields here rather than guessing.
const KNOWN_SKILLS = [...new Set(SAMPLE_JOBS.flatMap((j) => [...j.skillsRequired, ...j.transferableSkills]))];

function extractHeuristic({ text }: ResumeSource): ResumeFields {
  const lower = text.toLowerCase();

  const skills = KNOWN_SKILLS.filter((skill) => lower.includes(skill.toLowerCase()));

  const yearsMatch = text.match(/(\d+)\+?\s*years?\s+(of\s+)?(experience|exp\b)/i);
  const yearsExperience = yearsMatch ? Number(yearsMatch[1]) : null;

  const roleMatch = SAMPLE_JOBS.find((j) => lower.includes(j.title.toLowerCase()));
  const firstLine = text
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.length > 0 && l.length < 80);

  return {
    currentRole: roleMatch?.title ?? firstLine ?? null,
    yearsExperience,
    skills,
    source: "heuristic",
  };
}

export async function extractResumeFields(source: ResumeSource): Promise<ResumeFields> {
  try {
    return await extractWithClaude(source);
  } catch {
    return extractHeuristic(source);
  }
}
