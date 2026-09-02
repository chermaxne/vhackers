"use client";

import { useState } from "react";
import ScreenShell from "../ScreenShell";
import { IconUploadDocument } from "../icons/LatticeIcons";
import type { ResumeFields } from "@/lib/llm/extractResume";

type UploadState = "idle" | "parsing" | "done" | "error";

export default function ProfileCreation({
  onDone,
  onBack,
}: {
  onDone: (input: {
    resumeFileName: string | null;
    resumeFields: ResumeFields | null;
    resumeText: string | null;
    knowsTargetRole: boolean;
  }) => void;
  onBack?: () => void;
}) {
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [resumeFields, setResumeFields] = useState<ResumeFields | null>(null);
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setResumeFileName(file.name);
    setResumeFields(null);
    setResumeText(null);
    setError(null);

    if (!/\.(pdf|docx)$/i.test(file.name)) {
      setUploadState("error");
      setError("Only PDF or .docx files are supported right now (not the older .doc format).");
      return;
    }

    setUploadState("parsing");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/resume/parse", { method: "POST", body: formData });
      const json = await res.json();
      if (json.status !== "ok") throw new Error(json.error ?? "Parsing failed");
      const { fields, resumeText: parsedText } = json.data as { fields: ResumeFields; resumeText: string };
      setResumeFields(fields);
      setResumeText(parsedText);
      setUploadState("done");
    } catch (err) {
      setUploadState("error");
      setError(err instanceof Error ? err.message : "Couldn't parse that file.");
    }
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
            {uploadState === "parsing" ? (
              <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary-pale border-t-primary" />
            ) : (
              <IconUploadDocument className="h-8 w-8 text-primary" />
            )}
            <span className="text-sm font-bold text-ink">
              {uploadState === "parsing" ? "Reading your resume…" : resumeFileName ?? "Click to upload"}
            </span>
            <span className="text-xs text-ink-muted">
              {uploadState === "parsing"
                ? "Extracting role, experience, and skills"
                : resumeFileName
                  ? "Change file"
                  : "PDF or DOCX — skips repeat data entry later"}
            </span>
          </span>
          <input
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>

        {uploadState === "error" && error && <p className="mt-2 text-xs font-semibold text-accent-coral">{error}</p>}

        {uploadState === "done" && resumeFields && (
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
                Keyword-matched for now — swaps to full Claude extraction automatically once API credits are
                available.
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
            onClick={() => onDone({ resumeFileName, resumeFields, resumeText, knowsTargetRole: true })}
            className="flex-1 rounded-2xl bg-primary px-4 py-4 font-display text-sm font-bold text-white transition hover:bg-primary-dark"
          >
            Yes, I know
          </button>
          <button
            onClick={() => onDone({ resumeFileName, resumeFields, resumeText, knowsTargetRole: false })}
            className="flex-1 rounded-2xl bg-primary-light px-4 py-4 font-display text-sm font-bold text-white transition hover:bg-primary"
          >
            Not yet
          </button>
        </div>
      </div>
    </ScreenShell>
  );
}
