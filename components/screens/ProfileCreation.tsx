"use client";

import { useState } from "react";
import ScreenShell from "../ScreenShell";
import { IconUploadDocument } from "../icons/LatticeIcons";
import type { ResumeFields } from "@/lib/llm/extractResume";

export default function ProfileCreation({
  onDone,
  onBack,
}: {
  onDone: (input: {
    resumeFileName: string | null;
    resumeFields: ResumeFields | null;
    resumeText: string | null;
    userSkills: string[];
    knowsTargetRole: boolean;
  }) => void;
  onBack?: () => void;
}) {
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeFields, setResumeFields] = useState<ResumeFields | null>(null);
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  async function extractFromResume(file: File): Promise<{ fields: ResumeFields; resumeText: string } | null> {
    setIsExtracting(true);
    setExtractionError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/resume/parse", { method: "POST", body: formData });
      const json = await res.json();
      if (json.status !== "ok") throw new Error(json.error ?? "Failed to extract skills from resume");
      const result = json.data as { fields: ResumeFields; resumeText: string };
      setResumeFields(result.fields);
      setResumeText(result.resumeText);
      return result;
    } catch (error) {
      console.error("Error extracting skills:", error);
      setExtractionError(error instanceof Error ? error.message : "Failed to extract skills from resume");
      return null;
      // Continue anyway — skills extraction is optional for reaching the next screen.
    } finally {
      setIsExtracting(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeFileName(file.name);
    setResumeFile(file);
    setResumeFields(null);
    setResumeText(null);
    setExtractionError(null);

    if (!/\.(pdf|docx)$/i.test(file.name)) {
      setExtractionError("Only PDF or .docx files are supported right now (not the older .doc format).");
      return;
    }

    await extractFromResume(file);
  }

  async function handleContinue(knowsTargetRole: boolean) {
    let fields = resumeFields;
    let text = resumeText;

    // If we have a file but haven't extracted yet (or it failed), try once more.
    if (resumeFile && !fields && !isExtracting) {
      const result = await extractFromResume(resumeFile);
      if (result) {
        fields = result.fields;
        text = result.resumeText;
      }
    }

    onDone({
      resumeFileName,
      resumeFields: fields,
      resumeText: text,
      userSkills: fields?.skills ?? [],
      knowsTargetRole,
    });
  }

  return (
    <ScreenShell
      title="Let's set up your profile"
      subtitle="Upload your resume so we know your starting point, then tell us where you're headed."
      onBack={onBack}
    >
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">Resume</p>
        <label
          data-watermark="RESUME"
          className="watermark-bg flex cursor-pointer flex-col items-center gap-2 rounded-[1.5rem] border-2 border-dashed border-primary-light bg-primary-pale/30 px-4 py-10 text-center transition hover:border-primary hover:bg-primary-pale/60"
        >
          <span className="relative flex flex-col items-center gap-2 rounded-full bg-white px-6 py-5 shadow-sm">
            {isExtracting ? (
              <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary-pale border-t-primary" />
            ) : (
              <IconUploadDocument className="h-8 w-8 text-primary" />
            )}
            <span className="text-sm font-bold text-ink">
              {isExtracting ? "Analyzing resume..." : resumeFileName ?? "Click to upload"}
            </span>
            <span className="text-xs text-ink-muted">
              {resumeFileName ? (isExtracting ? "Extracting skills..." : "Change file") : "PDF or DOCX — skips repeat data entry later"}
            </span>
          </span>
          <input
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={handleFileChange}
            disabled={isExtracting}
          />
        </label>

        {extractionError && <p className="mt-2 text-xs text-accent-coral">{extractionError} (continuing anyway)</p>}

        {resumeFields && (
          <div className="mt-3 rounded-2xl border-2 border-primary-pale bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">We picked up</p>
            <p className="mt-1.5 text-sm text-ink">
              <span className="font-semibold">{resumeFields.currentRole ?? "Role not detected"}</span>
              {resumeFields.yearsExperience != null && <> · {resumeFields.yearsExperience} yrs experience</>}
            </p>
            {resumeFields.skills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {resumeFields.skills.slice(0, 8).map((skill) => (
                  <span key={skill} className="rounded-full bg-primary-pale px-2.5 py-1 text-xs font-semibold text-primary-dark">
                    {skill}
                  </span>
                ))}
              </div>
            )}
            {resumeFields.source === "heuristic" && (
              <p className="mt-2 text-[11px] text-ink-muted">
                Keyword-matched for now — swaps to full Claude extraction automatically once Bedrock credentials are
                live.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-8">
        <p className="mb-3 text-center text-sm font-bold text-ink">
          Do you know what role or industry you want to move into?
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => handleContinue(true)}
            disabled={isExtracting}
            className="flex-1 rounded-2xl bg-primary px-4 py-4 font-display text-sm font-bold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            Yes, I know
          </button>
          <button
            onClick={() => handleContinue(false)}
            disabled={isExtracting}
            className="flex-1 rounded-2xl bg-primary-light px-4 py-4 font-display text-sm font-bold text-white transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            Not yet
          </button>
        </div>
      </div>
    </ScreenShell>
  );
}
