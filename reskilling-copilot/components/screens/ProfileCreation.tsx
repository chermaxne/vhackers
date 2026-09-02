"use client";

import { useState } from "react";
import ScreenShell from "../ScreenShell";
import { IconUploadDocument } from "../icons/LatticeIcons";

export default function ProfileCreation({
  onDone,
  onBack,
}: {
  onDone: (input: { resumeFileName: string | null; knowsTargetRole: boolean }) => void;
  onBack?: () => void;
}) {
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);

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
              {resumeFileName ?? "Click to upload"}
            </span>
            <span className="text-xs text-ink-muted">
              {resumeFileName ? "Change file" : "PDF or DOCX — skips repeat data entry later"}
            </span>
          </span>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => setResumeFileName(e.target.files?.[0]?.name ?? null)}
          />
        </label>
      </div>

      <div className="mt-8">
        <p className="mb-3 text-center text-sm font-bold text-ink">
          Do you know what role or industry you want to move into?
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => onDone({ resumeFileName, knowsTargetRole: true })}
            className="flex-1 rounded-2xl bg-primary px-4 py-4 font-display text-sm font-bold text-white transition hover:bg-primary-dark"
          >
            Yes, I know
          </button>
          <button
            onClick={() => onDone({ resumeFileName, knowsTargetRole: false })}
            className="flex-1 rounded-2xl bg-primary-light px-4 py-4 font-display text-sm font-bold text-white transition hover:bg-primary"
          >
            Not yet
          </button>
        </div>
      </div>
    </ScreenShell>
  );
}
