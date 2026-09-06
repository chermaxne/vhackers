import type { JobCard } from "./jobs";
import type { Roadmap } from "./roadmap";
import type { ResumeFields } from "./llm/extractResume";
import type { Constraints } from "./constraints";

// Lifted above the Journey flow so the Profile tab (App Shell) can read and
// edit it without Journey's own screen/history state — see app/page.tsx.
export interface FlowState {
  resumeFileName: string | null;
  userSkills: string[];
  resumeFields: ResumeFields | null;
  constraints: Constraints | null;
  cameFromDirectEntry: boolean;
  // Live, industry-scoped roles pulled for the current swipe deck — set
  // once guided discovery's industry picker resolves, consumed by SwipeDeck.
  industryJobs: JobCard[];
  likedJobs: JobCard[];
  roadmap: Roadmap | null;
}

export const INITIAL_FLOW_STATE: FlowState = {
  resumeFileName: null,
  userSkills: [],
  resumeFields: null,
  constraints: null,
  cameFromDirectEntry: false,
  industryJobs: [],
  likedJobs: [],
  roadmap: null,
};
