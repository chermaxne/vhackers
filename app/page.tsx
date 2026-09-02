"use client";

import { useState } from "react";
import SwipeDeck from "@/components/SwipeDeck";
import ProfileCreation from "@/components/screens/ProfileCreation";
import DirectRoleEntry from "@/components/screens/DirectRoleEntry";
import GuidedDiscoveryIntro from "@/components/screens/GuidedDiscoveryIntro";
import AiSummary from "@/components/screens/AiSummary";
import SkillGapScreen from "@/components/screens/SkillGapScreen";
import WhatThisUnlocks from "@/components/screens/WhatThisUnlocks";
import RoadmapUnlocked from "@/components/screens/RoadmapUnlocked";
import ResumeTailoring from "@/components/screens/ResumeTailoring";
import type { JobCard } from "@/lib/jobs";
import { buildRoadmapForRole, buildRoadmapFromLikedJobs, type Roadmap } from "@/lib/roadmap";
import type { ResumeFields } from "@/lib/llm/extractResume";
import type { Constraints } from "@/lib/constraints";

type Screen =
  | "profile"
  | "direct-role"
  | "guided-discovery"
  | "swipe"
  | "summary"
  | "skill-gap"
  | "unlocks"
  | "roadmap"
  | "resume-tailoring";

const STEP_ORDER: Screen[] = [
  "profile",
  "guided-discovery",
  "swipe",
  "summary",
  "skill-gap",
  "unlocks",
  "roadmap",
];

interface FlowState {
  resumeFileName: string | null;
  resumeFields: ResumeFields | null;
  resumeText: string | null;
  constraints: Constraints | null;
  cameFromDirectEntry: boolean;
  likedJobs: JobCard[];
  roadmap: Roadmap | null;
}

const INITIAL_STATE: FlowState = {
  resumeFileName: null,
  resumeFields: null,
  resumeText: null,
  constraints: null,
  cameFromDirectEntry: false,
  likedJobs: [],
  roadmap: null,
};

export default function Home() {
  const [screen, setScreen] = useState<Screen>("profile");
  const [history, setHistory] = useState<Screen[]>([]);
  const [flow, setFlow] = useState<FlowState>(INITIAL_STATE);

  function navigate(next: Screen) {
    setHistory((prev) => [...prev, screen]);
    setScreen(next);
  }

  function goBack() {
    if (history.length === 0) return;
    setScreen(history[history.length - 1]);
    setHistory((prev) => prev.slice(0, -1));
  }

  function restart() {
    setFlow(INITIAL_STATE);
    setHistory([]);
    setScreen("profile");
  }

  const onBack = history.length > 0 ? goBack : undefined;
  const stepIndex = STEP_ORDER.indexOf(screen);

  return (
    <div className="flex flex-1 flex-col items-center bg-background px-4 py-10">
      <header className="mb-8 w-full max-w-md text-center">
        <p className="font-display text-xs font-extrabold uppercase tracking-wide text-primary">
          Reskilling Copilot
        </p>
        {stepIndex >= 0 && (
          <div className="mx-auto mt-3 flex max-w-xs gap-1.5">
            {STEP_ORDER.map((s, i) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full ${i <= stepIndex ? "bg-primary" : "bg-primary-pale"}`}
              />
            ))}
          </div>
        )}
      </header>

      {screen === "profile" && (
        <ProfileCreation
          onDone={({ resumeFileName, resumeFields, resumeText, knowsTargetRole }) => {
            setFlow((prev) => ({ ...prev, resumeFileName, resumeFields, resumeText }));
            navigate(knowsTargetRole ? "direct-role" : "guided-discovery");
          }}
        />
      )}

      {screen === "direct-role" && (
        <DirectRoleEntry
          onSubmit={async (role) => {
            const roadmap = await buildRoadmapForRole(role);
            setFlow((prev) => ({ ...prev, cameFromDirectEntry: true, roadmap }));
            navigate("roadmap");
          }}
          onBack={onBack}
        />
      )}

      {screen === "guided-discovery" && (
        <GuidedDiscoveryIntro
          onSubmit={(constraints) => {
            // Constraints aren't wired into deck filtering yet — the
            // sample deck is too small to filter meaningfully — but they
            // do drive the pacing/budget annotations on the final roadmap.
            setFlow((prev) => ({ ...prev, constraints }));
            navigate("swipe");
          }}
          onBack={onBack}
        />
      )}

      {screen === "swipe" && (
        <SwipeDeck
          onComplete={(liked) => {
            setFlow((prev) => ({ ...prev, likedJobs: liked }));
            navigate("summary");
          }}
          onBack={onBack}
        />
      )}

      {screen === "summary" && (
        <AiSummary likedJobs={flow.likedJobs} onContinue={() => navigate("skill-gap")} onBack={onBack} />
      )}

      {screen === "skill-gap" && (
        <SkillGapScreen
          skillGaps={buildRoadmapFromLikedJobs(flow.likedJobs).skillGaps}
          onContinue={() => navigate("unlocks")}
          onBack={onBack}
        />
      )}

      {screen === "unlocks" && (
        <WhatThisUnlocks
          unlocks={buildRoadmapFromLikedJobs(flow.likedJobs).unlocks}
          onContinue={() => {
            setFlow((prev) => ({ ...prev, roadmap: buildRoadmapFromLikedJobs(prev.likedJobs) }));
            navigate("roadmap");
          }}
          onBack={onBack}
        />
      )}

      {screen === "roadmap" && flow.roadmap && (
        <RoadmapUnlocked
          roadmap={flow.roadmap}
          constraints={flow.constraints}
          resumeText={flow.resumeText}
          onExploreOtherRoles={flow.cameFromDirectEntry ? () => navigate("swipe") : undefined}
          onTailorResume={flow.resumeText ? () => navigate("resume-tailoring") : undefined}
          onRestart={restart}
          onBack={onBack}
        />
      )}

      {screen === "resume-tailoring" && flow.resumeText && flow.roadmap && (
        <ResumeTailoring
          resumeText={flow.resumeText}
          targetRole={flow.roadmap.targetLabel}
          emphasizeSkills={flow.roadmap.skillGaps.slice(0, 5).map((g) => g.skill)}
          onBack={onBack}
        />
      )}
    </div>
  );
}
