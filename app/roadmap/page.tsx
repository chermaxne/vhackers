"use client";

import React, { useState } from "react";
import Link from "next/link";

interface Course {
  title: string;
  provider: string;
  duration: string;
  hoursPerWeek: number;
  originalPrice: number;
  sfcSubsidy: number;
  skillsCovered: string[];
}

interface Phase {
  phaseNumber: number;
  title: string;
  weeks: string;
  effort: "Low" | "Medium" | "High";
  focusSkill: string;
  course: Course;
}

interface RoleData {
  title: string;
  matchScore: number;
  transferableSkills: string[];
  skillGaps: string[];
  phases: Phase[];
}

export default function ReskillingFlowPage() {
  // Step Navigation State
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loadingText, setLoadingText] = useState("Analyzing live MCF postings...");

  // FLOW 1: Perceive Inputs
  const [goalMode, setGoalMode] = useState<"known" | "explore">("known");
  const [targetRoleInput, setTargetRoleInput] = useState("Tech Consultant");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([
    "FinTech",
    "AI/Data",
  ]);
  const [remotePref, setRemotePref] = useState<"Hybrid" | "In-Person" | "Remote">("Hybrid");
  const [accessibilitySupport, setAccessibilitySupport] = useState(false);
  const [currentRole, setCurrentRole] = useState("Software Engineer, 3 years");
  const [sfcBalance, setSfcBalance] = useState(500);

  // FLOW 2: Plan State
  const [activeRoleKey, setActiveRoleKey] = useState<"techConsultant" | "dataAnalyst">("techConsultant");
  const [syncedWeeks, setSyncedWeeks] = useState<{ [key: number]: boolean }>({});
  const [lockedIn, setLockedIn] = useState(false);
  const [calendarPushed, setCalendarPushed] = useState(false);

  // Realistic Pre-calculated Singapore Dataset
  const roleDatasets: Record<"techConsultant" | "dataAnalyst", RoleData> = {
    techConsultant: {
      title: "Tech Consultant",
      matchScore: 74,
      transferableSkills: [
        "Stakeholder Reporting",
        "Excel Modeling",
        "Systems Engineering",
        "Agile Sprints",
      ],
      skillGaps: [
        "Cloud Architecture (AWS)",
        "Client Scoping & Delivery",
        "Enterprise Governance",
      ],
      phases: [
        {
          phaseNumber: 1,
          title: "Executive Scoping & Stakeholder Delivery",
          weeks: "Weeks 1 - 4",
          effort: "Low",
          focusSkill: "Client Delivery & Advisory",
          course: {
            title: "Executive Tech Communication & Client Delivery",
            provider: "NTUC LearningHub",
            duration: "4 weeks",
            hoursPerWeek: 6,
            originalPrice: 750,
            sfcSubsidy: Math.min(sfcBalance, 500),
            skillsCovered: ["Stakeholder Management", "Executive Pitching", "Requirements Scoping"],
          },
        },
        {
          phaseNumber: 2,
          title: "Cloud Infrastructure & Transformation",
          weeks: "Weeks 5 - 8",
          effort: "Medium",
          focusSkill: "Cloud Architecture (AWS)",
          course: {
            title: "AWS Cloud Solutions Architect - Associate",
            provider: "General Assembly SG",
            duration: "4 weeks",
            hoursPerWeek: 8,
            originalPrice: 1200,
            sfcSubsidy: Math.max(0, Math.min(sfcBalance - 500, 500)),
            skillsCovered: ["Cloud Architecture (AWS)", "Vendor Evaluation", "ERP Migration"],
          },
        },
        {
          phaseNumber: 3,
          title: "Strategic Advisory & Digital Governance",
          weeks: "Weeks 9 - 12",
          effort: "High",
          focusSkill: "Enterprise Agile & Governance",
          course: {
            title: "Digital Transformation & Consulting Practicum",
            provider: "SMU Academy",
            duration: "4 weeks",
            hoursPerWeek: 10,
            originalPrice: 1450,
            sfcSubsidy: 0,
            skillsCovered: ["Enterprise Agile", "Change Management", "Digital Governance"],
          },
        },
      ],
    },
    dataAnalyst: {
      title: "Data Analytics Associate",
      matchScore: 82,
      transferableSkills: [
        "Excel Modeling",
        "Stakeholder Reporting",
        "Quantitative Analysis",
        "Requirements Scoping",
      ],
      skillGaps: [
        "Production SQL & DBT",
        "Tableau / PowerBI Dashboards",
        "Python for ETL Pipelines",
      ],
      phases: [
        {
          phaseNumber: 1,
          title: "Modern SQL & Analytics Engineering",
          weeks: "Weeks 1 - 4",
          effort: "Low",
          focusSkill: "Production SQL & DBT",
          course: {
            title: "Applied SQL for Business Intelligence",
            provider: "Vertical Institute SG",
            duration: "4 weeks",
            hoursPerWeek: 6,
            originalPrice: 650,
            sfcSubsidy: Math.min(sfcBalance, 500),
            skillsCovered: ["Window Functions", "DBT Pipelines", "PostgreSQL"],
          },
        },
        {
          phaseNumber: 2,
          title: "Business Intelligence & Executive Storytelling",
          weeks: "Weeks 5 - 8",
          effort: "Medium",
          focusSkill: "Tableau Visualizations",
          course: {
            title: "Data Visualization & Dashboard Design",
            provider: "NTUC LearningHub",
            duration: "4 weeks",
            hoursPerWeek: 8,
            originalPrice: 980,
            sfcSubsidy: Math.max(0, Math.min(sfcBalance - 500, 480)),
            skillsCovered: ["Tableau Desktop", "Executive Storytelling", "DAX Formulas"],
          },
        },
        {
          phaseNumber: 3,
          title: "Automated Data Pipelines with Python",
          weeks: "Weeks 9 - 12",
          effort: "High",
          focusSkill: "Python Data Pipelines",
          course: {
            title: "Python for Data Engineering & Wrangling",
            provider: "NUS SCALE",
            duration: "4 weeks",
            hoursPerWeek: 10,
            originalPrice: 1550,
            sfcSubsidy: 0,
            skillsCovered: ["Pandas", "ETL Automation", "Airflow Foundations"],
          },
        },
      ],
    },
  };

  const currentPlan = roleDatasets[activeRoleKey];

  const handleIndustryToggle = (ind: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(ind) ? prev.filter((i) => i !== ind) : [...prev, ind]
    );
  };

  const triggerGeneration = () => {
    setStep(2);
    setLoadingText("Analyzing live MCF postings for real-time market delta...");

    setTimeout(() => {
      setLoadingText("Computing transferable competencies against target skills...");
    }, 800);

    setTimeout(() => {
      setLoadingText("Sequencing SkillsFuture Credit-eligible courses & study blocks...");
    }, 1600);

    setTimeout(() => {
      setStep(3);
    }, 2400);
  };

  const toggleStudyBlock = (phaseNum: number) => {
    setSyncedWeeks((prev) => ({
      ...prev,
      [phaseNum]: !prev[phaseNum],
    }));
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-10 font-sans selection:bg-teal-500/30">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(20,184,166,0.15),rgba(255,255,255,0))]" />

      <div className="relative max-w-5xl mx-auto">
        {/* Navigation Bar */}
        <header className="flex items-center justify-between border-b border-slate-800/80 pb-5 mb-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center font-bold text-slate-950 text-lg shadow-lg shadow-teal-500/20">
              L
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Lattice</h1>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300">
                  Singapore MVP
                </span>
              </div>
              <p className="text-xs text-slate-400">AI-Powered Reskilling Copilot</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {step === 3 && (
              <button
                onClick={() => setStep(1)}
                className="text-xs text-slate-300 hover:text-white bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg transition"
              >
                ← Edit Preferences
              </button>
            )}
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-slate-200 border border-slate-800 bg-slate-950 px-3 py-1.5 rounded-lg"
            >
              Exit
            </Link>
          </div>
        </header>

        {/* FLOW 1: PERCEIVE (Intake Wizard) */}
        {step === 1 && (
          <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-2xl">
            <div className="border-b border-slate-800/80 pb-4 mb-6">
              <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
                Module 1: Perceive
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">
                Candidate Constraints & Direction Intake
              </h2>
              <p className="text-xs md:text-sm text-slate-400 mt-1">
                Calibrate your target goals, remote allowances, and self-reported SkillsFuture balance for an actionable roadmap.
              </p>
            </div>

            <div className="space-y-6">
              {/* Step 1: Target Goal */}
              <div className="bg-slate-950/60 border border-slate-800/70 p-5 rounded-xl">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                  1. Target Goal & Preference
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setGoalMode("known")}
                    className={`py-3 px-4 text-xs font-medium rounded-xl border transition text-left ${
                      goalMode === "known"
                        ? "bg-teal-500/10 border-teal-400 text-teal-200 shadow-sm shadow-teal-500/10"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="font-semibold text-white mb-0.5">I know my target role</div>
                    Directly define target position (e.g., Jonathan's path)
                  </button>
                  <button
                    type="button"
                    onClick={() => setGoalMode("explore")}
                    className={`py-3 px-4 text-xs font-medium rounded-xl border transition text-left ${
                      goalMode === "explore"
                        ? "bg-teal-500/10 border-teal-400 text-teal-200 shadow-sm shadow-teal-500/10"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="font-semibold text-white mb-0.5">Help me explore / Undecided</div>
                    Discover cross-industry roles (e.g., Samantha's path)
                  </button>
                </div>

                {goalMode === "known" ? (
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">
                      Target Role Title
                    </label>
                    <input
                      type="text"
                      value={targetRoleInput}
                      onChange={(e) => setTargetRoleInput(e.target.value)}
                      placeholder="e.g. Tech Consultant, Cloud Architect"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500 transition"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">
                      Industry Whitelist / Focus Sectors
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {["FinTech", "SaaS", "Healthcare", "Public Sector", "AI/Data"].map((ind) => {
                        const active = selectedIndustries.includes(ind);
                        return (
                          <button
                            key={ind}
                            type="button"
                            onClick={() => handleIndustryToggle(ind)}
                            className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                              active
                                ? "bg-teal-500/20 border-teal-400 text-teal-200"
                                : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                            }`}
                          >
                            {active ? "✓ " : "+ "}
                            {ind}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Work & Accessibility */}
              <div className="bg-slate-950/60 border border-slate-800/70 p-5 rounded-xl">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                  2. Work & Accessibility Constraints
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">
                      Remote Work Preference
                    </label>
                    <select
                      value={remotePref}
                      onChange={(e) => setRemotePref(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500 transition"
                    >
                      <option value="Hybrid">Hybrid (e.g., 2-3 days remote)</option>
                      <option value="In-Person">In-Person / Onsite</option>
                      <option value="Remote">Fully Remote</option>
                    </select>
                  </div>

                  <div className="flex flex-col justify-center pt-2">
                    <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={accessibilitySupport}
                        onChange={(e) => setAccessibilitySupport(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-teal-500 focus:ring-teal-500 focus:ring-offset-slate-900"
                      />
                      Include accessibility / disability support accommodations
                    </label>
                    <p className="text-[11px] text-slate-500 mt-1 pl-6">
                      Filters courses and job recommendations with confirmed physical/digital accessibility accommodations.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3: Skills & Background Context */}
              <div className="bg-slate-950/60 border border-slate-800/70 p-5 rounded-xl">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                  3. Skills & Background Context
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">
                      Current Role & Seniority
                    </label>
                    <input
                      type="text"
                      value={currentRole}
                      onChange={(e) => setCurrentRole(e.target.value)}
                      placeholder="e.g. Operations Analyst, 3 years"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">
                      Self-Reported SkillsFuture Credit (S$ SGD)
                    </label>
                    <input
                      type="number"
                      value={sfcBalance}
                      onChange={(e) => setSfcBalance(Number(e.target.value))}
                      placeholder="500"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={triggerGeneration}
                className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-400 hover:to-teal-300 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg shadow-teal-500/20 active:scale-[0.99]"
              >
                Generate Personalized Roadmap →
              </button>
            </div>
          </div>
        )}

        {/* LOADING STATE */}
        {step === 2 && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-16 text-center backdrop-blur-xl shadow-2xl">
            <div className="inline-block relative mb-6">
              <div className="w-14 h-14 rounded-full border-4 border-slate-800 border-t-teal-400 animate-spin" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">
              Lattice AI Engine Running
            </h3>
            <p className="text-sm text-teal-300 font-mono transition-all duration-300">
              {loadingText}
            </p>
            <p className="text-xs text-slate-500 mt-4">
              Grounding suggestions against MyCareersFuture live competencies and SSG courses
            </p>
          </div>
        )}

        {/* FLOW 2: PLAN (Roadmap Screen) */}
        {step === 3 && (
          <div className="space-y-6">
            {/* Target Role Switcher & Summary Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-5">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-400">
                    Active Target Pathway
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    <h2 className="text-2xl font-bold text-white">{currentPlan.title}</h2>
                    <span className="bg-teal-500/10 border border-teal-500/30 text-teal-300 font-bold px-2.5 py-0.5 rounded-full text-xs">
                      {currentPlan.matchScore}% Transferable Match
                    </span>
                  </div>
                </div>

                {/* Switcher Demo Toggle */}
                <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setActiveRoleKey("techConsultant")}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                      activeRoleKey === "techConsultant"
                        ? "bg-teal-500 text-slate-950 font-semibold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Tech Consultant
                  </button>
                  <button
                    onClick={() => setActiveRoleKey("dataAnalyst")}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                      activeRoleKey === "dataAnalyst"
                        ? "bg-teal-500 text-slate-950 font-semibold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Data Analytics
                  </button>
                </div>
              </div>

              {/* Skills Analysis Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4">
                  <span className="text-xs font-semibold text-teal-400 uppercase tracking-wide block mb-2">
                    ✓ Recognized Transferable Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentPlan.transferableSkills.map((s) => (
                      <span
                        key={s}
                        className="bg-slate-900 border border-slate-700 text-slate-200 text-xs px-2.5 py-1 rounded-lg"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4">
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide block mb-2">
                    ! Critical Skill Gaps to Close
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentPlan.skillGaps.map((g) => (
                      <span
                        key={g}
                        className="bg-amber-950/30 border border-amber-800/50 text-amber-200 text-xs px-2.5 py-1 rounded-lg"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Phased Sequence Cards */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Phased Learning Sequence (Grounded in Singapore Data)
                </h3>
                <span className="text-xs text-slate-500">
                  Applied SkillsFuture Credit: S${sfcBalance}
                </span>
              </div>

              <div className="space-y-4">
                {currentPlan.phases.map((phase) => {
                  const netCost = Math.max(0, phase.course.originalPrice - phase.course.sfcSubsidy);
                  const isBlocked = !!syncedWeeks[phase.phaseNumber];

                  return (
                    <div
                      key={phase.phaseNumber}
                      className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-md hover:border-slate-700/80 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-300 font-bold text-xs flex items-center justify-center">
                            P{phase.phaseNumber}
                          </span>
                          <div>
                            <span className="text-xs text-slate-400">{phase.weeks}</span>
                            <h4 className="text-sm md:text-base font-bold text-white">
                              {phase.title}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">Focus: {phase.focusSkill}</span>
                          <span
                            className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${
                              phase.effort === "Low"
                                ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
                                : phase.effort === "Medium"
                                ? "bg-amber-950/40 border-amber-800 text-amber-300"
                                : "bg-rose-950/40 border-rose-800 text-rose-300"
                            }`}
                          >
                            {phase.effort} Lift
                          </span>
                        </div>
                      </div>

                      <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 mb-3.5 text-xs">
                        <div className="flex flex-col sm:flex-row justify-between gap-1 mb-2">
                          <span className="font-semibold text-slate-200">
                            {phase.course.title}
                          </span>
                          <span className="text-slate-400">
                            Provider: <strong className="text-slate-300">{phase.course.provider}</strong>
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-slate-400 mt-2">
                          <div>
                            Duration: <strong className="text-slate-200">{phase.course.duration} • {phase.course.hoursPerWeek} hrs/week</strong>
                          </div>
                          <div>
                            Fee: <span className="line-through text-slate-500">S${phase.course.originalPrice}</span>
                          </div>
                          <div className="text-teal-400 font-medium">
                            SFC Subsidy: -S${phase.course.sfcSubsidy}
                          </div>
                          <div className="font-bold text-white bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                            Net Out-of-Pocket: S${netCost}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-1.5">
                          {phase.course.skillsCovered.map((item) => (
                            <span
                              key={item}
                              className="text-[10px] bg-slate-800/80 text-slate-400 border border-slate-700/60 px-2 py-0.5 rounded-md"
                            >
                              +{item}
                            </span>
                          ))}
                        </div>

                        <button
                          onClick={() => toggleStudyBlock(phase.phaseNumber)}
                          className={`text-xs px-3.5 py-1.5 rounded-lg border font-medium transition ${
                            isBlocked
                              ? "bg-teal-500/20 border-teal-400 text-teal-200"
                              : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                          }`}
                        >
                          {isBlocked ? "✓ Added to Study Calendar" : "+ Add to Study Calendar"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Toolbar */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setLockedIn(!lockedIn)}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold border transition ${
                    lockedIn
                      ? "bg-teal-500 border-teal-400 text-slate-950 shadow-md shadow-teal-500/20"
                      : "bg-slate-800 border-slate-700 text-white hover:border-slate-600"
                  }`}
                >
                  {lockedIn ? "✓ Target Locked (#truelove)" : "Lock In #truelove"}
                </button>

                <button
                  onClick={() => {
                    setCalendarPushed(true);
                    setTimeout(() => setCalendarPushed(false), 3000);
                  }}
                  className="w-full sm:w-auto text-xs bg-slate-950 border border-slate-700 hover:border-slate-500 text-slate-200 px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <span>🗓</span>
                  <span>{calendarPushed ? "✓ Study Blocks Pushed!" : "Sync to Google Calendar"}</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-400 text-center sm:text-right">
                All course recommendations are accredited under Singapore SkillsFuture frameworks.
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}