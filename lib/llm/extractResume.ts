import { converseJson } from "./client";
import { SAMPLE_JOBS } from "../jobs";

export interface ResumeFields {
  currentRole: string | null;
  yearsExperience: number | null;
  skills: string[];
  source: "model" | "heuristic";
}

/**
 * text: always present (from pdf-parse/mammoth) — used for both the model
 * call and the heuristic fallback.
 * pdfBase64: present only for PDF uploads, kept for a Claude-era feature
 * that's currently unused — this sandbox's SCP blocks all anthropic.*
 * models, so extraction runs on Amazon Nova Micro instead, which is
 * text-only (no image/document input). A scanned/image-only PDF (empty
 * pdf-parse text) degrades honestly to mostly-null fields rather than
 * being read natively, until either Claude access returns or this moves to
 * a document-capable Nova tier (Lite/Pro).
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

async function extractWithModel(source: ResumeSource): Promise<ResumeFields> {
  const parsed = await converseJson<Omit<ResumeFields, "source">>(
    `${EXTRACTION_INSTRUCTION}\n\n---\n${source.text.slice(0, 12000)}`,
    RESUME_FIELDS_SCHEMA,
    { maxTokens: 1024 }
  );
  return { ...parsed, source: "model" };
}

// Deterministic stand-in — used automatically whenever the model call
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
    return await extractWithModel(source);
  } catch {
    return extractHeuristic(source);
  }
}
