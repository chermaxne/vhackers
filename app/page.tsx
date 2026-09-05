"use client";

import { useState } from "react";
import JourneyFlow from "@/components/JourneyFlow";
import ProfilePage, { type ProfileEdits } from "@/components/screens/ProfilePage";
import BottomNav, { type AppTab } from "@/components/BottomNav";
import { buildRoadmapForRole, buildRoadmapFromLikedJobs } from "@/lib/roadmap";
import { INITIAL_FLOW_STATE, type FlowState } from "@/lib/flowState";
import type { ResumeFields } from "@/lib/llm/extractResume";
import type { Constraints } from "@/lib/constraints";

/**
 * App shell — two persistent tabs (Journey / Profile) over a single lifted
 * FlowState. Both tab contents stay mounted (toggled via CSS, not
 * conditional rendering) so switching tabs never resets Journey's
 * in-progress screen/history — only the swipe deck hides the nav, to
 * protect its full-screen one-decision-at-a-time interaction.
 */
export default function Home() {
  const [flow, setFlow] = useState<FlowState>(INITIAL_FLOW_STATE);
  const [activeTab, setActiveTab] = useState<AppTab>("journey");
  const [isImmersive, setIsImmersive] = useState(false);

  async function handleRerunAnalysis(edits: ProfileEdits) {
    const skills = edits.skillsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const updatedFields: ResumeFields | null = flow.resumeFields
      ? {
          ...flow.resumeFields,
          currentRole: edits.currentRole || null,
          yearsExperience: edits.yearsExperience ? Number(edits.yearsExperience) : null,
          skills,
        }
      : flow.resumeFields;

    const updatedConstraints: Constraints | null = flow.constraints
      ? {
          ...flow.constraints,
          studyHoursPerWeek: edits.studyHoursPerWeek,
          budgetSgd: edits.budgetSgd ? Number(edits.budgetSgd) : null,
          skillsFutureCreditSgd: edits.skillsFutureCreditSgd ? Number(edits.skillsFutureCreditSgd) : null,
          urgency: edits.urgency,
          remotePreference: edits.remotePreference,
        }
      : flow.constraints;

    let roadmap = flow.roadmap;
    if (roadmap) {
      roadmap = flow.cameFromDirectEntry
        ? await buildRoadmapForRole(roadmap.targetLabel)
        : buildRoadmapFromLikedJobs(flow.likedJobs);
    }

    setFlow((prev) => ({ ...prev, resumeFields: updatedFields, userSkills: skills, constraints: updatedConstraints, roadmap }));
    setActiveTab("journey");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 flex-col">
        <div className={activeTab === "journey" ? "flex flex-1 flex-col" : "hidden"}>
          <JourneyFlow flow={flow} setFlow={setFlow} onImmersiveChange={setIsImmersive} onRestart={() => setFlow(INITIAL_FLOW_STATE)} />
        </div>
        <div className={activeTab === "profile" ? "flex flex-1 flex-col bg-background" : "hidden"}>
          {/* Stays mounted across tab switches (so a user's in-progress edits
              survive flipping tabs), but remounts — resetting its local form
              state from `flow` — the moment real resume/constraints data
              first arrives, since it can otherwise mount before either does. */}
          <ProfilePage
            key={`${flow.resumeFields !== null}-${flow.constraints !== null}`}
            flow={flow}
            onRerunAnalysis={handleRerunAnalysis}
            onViewInJourney={() => setActiveTab("journey")}
          />
        </div>
      </div>

      {!isImmersive && (
        <div className="pb-4">
          <BottomNav active={activeTab} onChange={setActiveTab} />
        </div>
      )}
    </div>
  );
}
