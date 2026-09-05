import type { CandidacyScore } from "./candidacyScore";

export interface RoadmapExportStep {
  skill: string;
  courseLink: string;
}

export interface RoadmapExportPayload {
  targetRole: string;
  candidacy: Pick<CandidacyScore, "score" | "band" | "bandLabel"> | null;
  skillGapList: string[];
  roadmapSteps: RoadmapExportStep[];
  /** Reuses the AI Summary text verbatim where available — no new generation. */
  introCopy: string;
}

// btoa/atob (not Buffer) so this works identically in the browser (the
// "Share my roadmap" button) and in the server component that renders the
// shared link — no backend/database needed, the whole roadmap travels in
// the URL itself.
function toBase64Url(json: string): string {
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(encoded: string): string {
  const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function encodeRoadmapExport(payload: RoadmapExportPayload): string {
  return toBase64Url(JSON.stringify(payload));
}

export function decodeRoadmapExport(encoded: string): RoadmapExportPayload | null {
  try {
    return JSON.parse(fromBase64Url(encoded)) as RoadmapExportPayload;
  } catch {
    return null;
  }
}
