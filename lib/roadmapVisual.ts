import type { Roadmap } from "./roadmap";

export interface RoadmapStep {
  id: string;
  title: string;
  phaseIndex: number;
  phaseName: string;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Flattens the roadmap's phase-grouped skills into one ordered step list — each skill is one step, tagged with which phase it belongs to. */
export function flattenRoadmapSteps(roadmap: Roadmap): RoadmapStep[] {
  const steps: RoadmapStep[] = [];
  roadmap.phases.forEach((phase, phaseIndex) => {
    phase.skills.forEach((skill) => {
      steps.push({ id: `${phaseIndex}-${slugify(skill)}`, title: skill, phaseIndex, phaseName: phase.name });
    });
  });
  return steps;
}
