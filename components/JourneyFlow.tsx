"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import SwipeDeck from "@/components/SwipeDeck";
import ProfileCreation from "@/components/screens/ProfileCreation";
import DirectRoleEntry from "@/components/screens/DirectRoleEntry";
import GuidedDiscoveryIntro from "@/components/screens/GuidedDiscoveryIntro";
import AiSummary from "@/components/screens/AiSummary";
import SkillGapScreen from "@/components/screens/SkillGapScreen";
import WhatThisUnlocks from "@/components/screens/WhatThisUnlocks";
import RoadmapUnlocked from "@/components/screens/RoadmapUnlocked";
import ResumeTailoring from "@/components/screens/ResumeTailoring";
import InterviewPrep from "@/components/screens/InterviewPrep";
import Welcome from "@/components/screens/Welcome";
import { buildRoadmapForRole, buildRoadmapFromLikedJobs } from "@/lib/roadmap";
import { INITIAL_FLOW_STATE, type FlowState } from "@/lib/flowState";

type Screen =
  | "welcome"
  | "profile"
  | "direct-role"
  | "guided-discovery"
  | "swipe"
  | "summary"
  | "skill-gap"
  | "unlocks"
  | "roadmap"
  | "resume-tailoring"
  | "interview-prep";

const STEP_ORDER: Screen[] = [
  "profile",
  "guided-discovery",
  "swipe",
  "summary",
  "skill-gap",
  "unlocks",
  "roadmap",
];

export default function JourneyFlow({
  flow,
  setFlow,
  onImmersiveChange,
  onRestart,
}: {
  flow: FlowState;
  setFlow: Dispatch<SetStateAction<FlowState>>;
  onImmersiveChange?: (isImmersive: boolean) => void;
  onRestart: () => void;
}) {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [history, setHistory] = useState<Screen[]>([]);

  useEffect(() => {
    onImmersiveChange?.(screen === "swipe");
    // onImmersiveChange is a stable callback from the shell; only the
    // current screen should re-trigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

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
    setFlow(INITIAL_FLOW_STATE);
    setHistory([]);
    setScreen("welcome");
    onRestart();
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

      {screen === "welcome" && <Welcome onGetStarted={() => navigate("profile")} />}

      {screen === "profile" && (
        <ProfileCreation
          onDone={({ resumeFileName, resumeFields, resumeText, knowsTargetRole, userSkills }) => {
            setFlow((prev) => ({ ...prev, resumeFileName, resumeFields, resumeText, userSkills }));
            navigate(knowsTargetRole ? "direct-role" : "guided-discovery");
          }}
          onBack={onBack}
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
          onSubmit={(constraints, jobs) => {
            setFlow((prev) => ({ ...prev, constraints, industryJobs: jobs }));
            navigate("swipe");
          }}
          onBack={onBack}
        />
      )}

      {screen === "swipe" && (
        <SwipeDeck
          jobs={flow.industryJobs}
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
          constraints={flow.constraints}
          resumeText={flow.resumeText}
          userSkills={flow.userSkills}
          onExploreOtherRoles={flow.cameFromDirectEntry ? () => navigate("swipe") : undefined}
          onTailorResume={flow.resumeText ? () => navigate("resume-tailoring") : undefined}
          onPrepareInterview={() => navigate("interview-prep")}
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

      {screen === "interview-prep" && flow.roadmap && (
        <InterviewPrep
          input={{
            currentRole: flow.resumeFields?.currentRole ?? null,
            yearsExperience: flow.resumeFields?.yearsExperience ?? null,
            skills: flow.userSkills,
            targetRole: flow.roadmap.targetLabel,
            jdRequiredSkills: (flow.roadmap.market?.topSkills.map((s) => s.skill) ?? flow.roadmap.skillGaps.map((g) => g.skill)).slice(0, 10),
            skillGaps: flow.roadmap.skillGaps.slice(0, 5).map((g) => g.skill),
            transferableSkills: flow.userSkills,
          }}
          onBack={onBack}
        />
      )}
    </div>
  );
}
