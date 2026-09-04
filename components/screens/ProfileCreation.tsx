"use client";

import { useState } from "react";
import ScreenShell from "../ScreenShell";
import { IconUploadDocument } from "../icons/LatticeIcons";

export default function ProfileCreation({
  onDone,
  onBack,
}: {
  onDone: (input: { resumeFileName: string | null; userSkills: string[]; knowsTargetRole: boolean }) => void;
  onBack?: () => void;
}) {
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeFileName(file.name);
    setResumeFile(file);
    setExtractionError(null);

    // Extract skills immediately after file selection
    await extractSkillsFromResume(file);
  };

  const extractSkillsFromResume = async (file: File) => {
    setIsExtracting(true);
    setExtractionError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/extract-skills", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to extract skills from resume");
      }

      const data = await response.json();
      // Skills will be extracted and passed to parent on button click
    } catch (error) {
      console.error("Error extracting skills:", error);
      setExtractionError(
        error instanceof Error ? error.message : "Failed to extract skills from resume"
      );
      // Continue anyway - skills extraction is optional
    } finally {
      setIsExtracting(false);
    }
  };

  const handleContinue = async (knowsTargetRole: boolean) => {
    let extractedSkills: string[] = [];

    // If we have a file but haven't extracted yet, extract now
    if (resumeFile && !isExtracting) {
      setIsExtracting(true);
      try {
        const formData = new FormData();
        formData.append("file", resumeFile);

        const response = await fetch("/api/extract-skills", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          extractedSkills = data.skills || [];
        }
      } catch (error) {
        console.error("Error extracting skills:", error);
        // Continue without skills if extraction fails
      } finally {
        setIsExtracting(false);
      }
    }

    onDone({ resumeFileName, userSkills: extractedSkills, knowsTargetRole });
  };

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
            <IconUploadDocument className="h-8 w-8 text-primary" />
            <span className="text-sm font-bold text-ink">
              {isExtracting ? "Analyzing resume..." : resumeFileName ?? "Click to upload"}
            </span>
            <span className="text-xs text-ink-muted">
              {resumeFileName
                ? isExtracting
                  ? "Extracting skills..."
                  : "Change file"
                : "PDF or DOCX — skips repeat data entry later"}
            </span>
          </span>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={handleFileChange}
            disabled={isExtracting}
          />
        </label>
        {extractionError && (
          <p className="mt-2 text-xs text-red-600">{extractionError} (continuing anyway)</p>
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
            className="flex-1 rounded-2xl bg-primary px-4 py-4 font-display text-sm font-bold text-white transition hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Yes, I know
          </button>
          <button
            onClick={() => handleContinue(false)}
            disabled={isExtracting}
            className="flex-1 rounded-2xl bg-primary-light px-4 py-4 font-display text-sm font-bold text-white transition hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Not yet
          </button>
        </div>
      </div>
    </ScreenShell>
  );
}
