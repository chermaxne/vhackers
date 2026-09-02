export interface JobCard {
  uuid: string;
  title: string;
  company: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryType: string | null;
  jobUrl: string;
  transferableSkills: string[];
  skillsRequired: string[];
  dayToDay: string;
  careerProgression: string;
}

export function formatSalaryRange(job: Pick<JobCard, "salaryMin" | "salaryMax" | "salaryType">): string {
  if (job.salaryMin == null && job.salaryMax == null) return "Not specified";
  const period = job.salaryType ? ` / ${job.salaryType.toLowerCase()}` : "";
  if (job.salaryMin != null && job.salaryMax != null) {
    return `SGD ${job.salaryMin.toLocaleString()}–${job.salaryMax.toLocaleString()}${period}`;
  }
  return `SGD ${(job.salaryMin ?? job.salaryMax)!.toLocaleString()}${period}`;
}

// Static placeholder deck — no live API, no LLM call. Swap SAMPLE_JOBS for a
// real data source later; every consumer just expects JobCard[].
export const SAMPLE_JOBS: JobCard[] = [
  {
    uuid: "sample-1",
    title: "Data Analyst",
    company: "Fictional Retail Group",
    salaryMin: 3800,
    salaryMax: 5200,
    salaryType: "Monthly",
    jobUrl: "",
    transferableSkills: ["Structured problem-solving", "Stakeholder reporting", "Attention to detail"],
    skillsRequired: ["SQL", "Excel / spreadsheets", "Data visualization", "Basic statistics"],
    dayToDay:
      "Pull sales and operations data, build dashboards, and present findings to category managers each week.",
    careerProgression: "Senior Analyst → Analytics Lead → Data/Insights Manager within 3-4 years.",
  },
  {
    uuid: "sample-2",
    title: "Customer Success Executive",
    company: "Fictional SaaS Co",
    salaryMin: 3200,
    salaryMax: 4500,
    salaryType: "Monthly",
    jobUrl: "",
    transferableSkills: ["Client communication", "Conflict resolution", "Process documentation"],
    skillsRequired: ["CRM tools", "Onboarding workflows", "Written communication"],
    dayToDay:
      "Onboard new clients, answer product questions, and flag renewal risk to the account management team.",
    careerProgression: "Senior CS Executive → Account Manager → Customer Success Lead.",
  },
  {
    uuid: "sample-3",
    title: "Junior UX Designer",
    company: "Fictional Digital Studio",
    salaryMin: 3500,
    salaryMax: 4800,
    salaryType: "Monthly",
    jobUrl: "",
    transferableSkills: ["User empathy", "Visual communication", "Iterative feedback"],
    skillsRequired: ["Figma", "Wireframing", "Basic user research"],
    dayToDay: "Sketch flows, build clickable prototypes, and sit in on user interviews with the product team.",
    careerProgression: "UX Designer → Senior Designer → Design Lead / Product Design Manager.",
  },
  {
    uuid: "sample-4",
    title: "Logistics Coordinator",
    company: "Fictional Freight Pte Ltd",
    salaryMin: 2900,
    salaryMax: 3900,
    salaryType: "Monthly",
    jobUrl: "",
    transferableSkills: ["Vendor coordination", "Time-critical planning", "Process troubleshooting"],
    skillsRequired: ["Inventory systems", "Excel", "Basic supply chain knowledge"],
    dayToDay: "Track shipments, coordinate with warehouse and drivers, and resolve delivery exceptions daily.",
    careerProgression: "Logistics Coordinator → Operations Executive → Supply Chain Manager.",
  },
  {
    uuid: "sample-5",
    title: "Community Health Educator",
    company: "Fictional Wellness Network",
    salaryMin: 3000,
    salaryMax: 4000,
    salaryType: "Monthly",
    jobUrl: "",
    transferableSkills: ["Public speaking", "Cross-cultural communication", "Program coordination"],
    skillsRequired: ["Workshop facilitation", "Basic health literacy", "Community outreach"],
    dayToDay: "Run community health workshops, prepare materials, and coordinate with volunteer facilitators.",
    careerProgression: "Senior Educator → Programme Coordinator → Community Programmes Manager.",
  },
  {
    uuid: "sample-6",
    title: "Junior Financial Analyst",
    company: "Fictional Capital Advisory",
    salaryMin: 3600,
    salaryMax: 5000,
    salaryType: "Monthly",
    jobUrl: "",
    transferableSkills: ["Quantitative reasoning", "Report writing", "Working under deadlines"],
    skillsRequired: ["Excel modeling", "Financial statement analysis", "PowerPoint"],
    dayToDay: "Build financial models, update reporting decks, and support senior analysts on client reviews.",
    careerProgression: "Analyst → Senior Analyst → Associate within 3-5 years.",
  },
];
