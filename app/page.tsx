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
import type { JobCard } from "@/lib/jobs";
import { buildRoadmapForRole, buildRoadmapFromLikedJobs, type Roadmap } from "@/lib/roadmap";

type Screen =
  | "profile"
  | "direct-role"
  | "guided-discovery"
  | "swipe"
  | "summary"
  | "skill-gap"
  | "unlocks"
  | "roadmap";

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
  userSkills: string[];
  cameFromDirectEntry: boolean;
  likedJobs: JobCard[];
  roadmap: Roadmap | null;
}

const INITIAL_STATE: FlowState = {
  resumeFileName: null,
  userSkills: [],
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
          onDone={({ resumeFileName, userSkills, knowsTargetRole }) => {
            setFlow((prev) => ({ ...prev, resumeFileName, userSkills }));
            navigate(knowsTargetRole ? "direct-role" : "guided-discovery");
          }}
        />
      )}

      {screen === "direct-role" && (
        <DirectRoleEntry
          onSubmit={(role) => {
            setFlow((prev) => ({ ...prev, cameFromDirectEntry: true, roadmap: buildRoadmapForRole(role) }));
            navigate("roadmap");
          }}
          onBack={onBack}
        />
      )}

      {screen === "guided-discovery" && (
        <GuidedDiscoveryIntro
          onSubmit={() => {
            // Remote-work preference isn't wired into filtering yet — the
            // deck is small sample data, so there's nothing to filter
            // against. Captured here so the state shape is ready when a
            // real dataset lands.
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
          userSkills={flow.userSkills}
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
          onExploreOtherRoles={flow.cameFromDirectEntry ? () => navigate("swipe") : undefined}
          onRestart={restart}
          onBack={onBack}
        />
      )}
    </div>
  );
}
