"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface StepNode {
  id: string;
  stepNumber: number;
  label: string;
  subLabel: string;
  type: "course" | "practical" | "milestone" | "goal";
  phase: number;
  weeksDuration: number;
  provider?: string;
  cost?: number;
  sfcSubsidy?: number;
  duration?: string;
  hoursPerWeek?: number;
  syllabusHighlights: string[];
  skillsUnlocked: string[];
  calendarTitle?: string;
  calendarDescription?: string;
  icon: string;
}

export default function IllustratedLatticeRoadmap() {
  const router = useRouter();
  const [completedStepIds, setCompletedStepIds] = useState<string[]>([]);
  const [activeDetail, setActiveDetail] = useState<StepNode | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [lockedIn, setLockedIn] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const targetRoleTitle = "Tech Consultant";
  const userHoursPerWeek = 8;

  const steps: StepNode[] = [
    {
      id: "step-1",
      stepNumber: 1,
      label: "Consulting Communication Foundations",
      subLabel: "NTUC LearningHub • SFC Subsidized",
      type: "course",
      phase: 1,
      weeksDuration: 4,
      provider: "NTUC LearningHub",
      cost: 750,
      sfcSubsidy: 500,
      duration: "4 weeks",
      hoursPerWeek: 6,
      icon: "💬",
      syllabusHighlights: [
        "Executive presentation frameworks & deck structuring",
        "Managing enterprise client expectations & scope creep",
        "Business storytelling for non-technical stakeholders",
      ],
      skillsUnlocked: ["Stakeholder Management", "Executive Pitching"],
      calendarTitle: "Study: NTUC Executive Tech Communication",
      calendarDescription: "Weekly study block for NTUC Consulting Communication course.",
    },
    {
      id: "step-2",
      stepNumber: 2,
      label: "Requirements & Scope Framing",
      subLabel: "Deliverable: Business Scoping Doc",
      type: "practical",
      phase: 1,
      weeksDuration: 2,
      icon: "📋",
      syllabusHighlights: [
        "Drafting comprehensive functional & non-functional requirements",
        "User story mapping and acceptance criteria drafting",
        "Simulated client sign-off presentation",
      ],
      skillsUnlocked: ["Requirements Scoping", "User Story Mapping"],
      calendarTitle: "Project: Business Scoping Document",
      calendarDescription: "Draft enterprise business architecture deliverable.",
    },
    {
      id: "step-3",
      stepNumber: 3,
      label: "Foundation Checkpoint",
      subLabel: "Advisory Readiness Verified",
      type: "milestone",
      phase: 1,
      weeksDuration: 1,
      icon: "🎓",
      syllabusHighlights: [
        "Peer review of stakeholder communication skills",
        "Oral presentation defense of business scoping case",
      ],
      skillsUnlocked: ["Client Presentation", "Sign-Off Scoping"],
    },
    {
      id: "step-4",
      stepNumber: 4,
      label: "AWS Solutions Architecture",
      subLabel: "General Assembly SG • Industry Accredited",
      type: "course",
      phase: 2,
      weeksDuration: 4,
      provider: "General Assembly SG",
      cost: 1200,
      sfcSubsidy: 300,
      duration: "4 weeks",
      hoursPerWeek: 8,
      icon: "☁️",
      syllabusHighlights: [
        "High availability, fault tolerance, and multi-tier architectures",
        "IAM policy governance, encryption, and network security",
        "Migration pathways and cost estimation with AWS Pricing Calculator",
      ],
      skillsUnlocked: ["Cloud Architecture (AWS)", "Multi-Tenant Security"],
      calendarTitle: "Study: General Assembly AWS Cloud Architect",
      calendarDescription: "Weekly AWS Solutions Architecture lecture and lab session.",
    },
    {
      id: "step-5",
      stepNumber: 5,
      label: "Enterprise Migration Architecture",
      subLabel: "Deliverable: Cloud RFP Assessment",
      type: "practical",
      phase: 2,
      weeksDuration: 2,
      icon: "📐",
      syllabusHighlights: [
        "Analyzing real-world RFP technical requirements",
        "Drafting vendor evaluation matrices & migration risk assessments",
      ],
      skillsUnlocked: ["Vendor Evaluation", "ERP Systems Integration"],
      calendarTitle: "Portfolio: Cloud RFP Assessment",
      calendarDescription: "Hands-on cloud evaluation sprint.",
    },
    {
      id: "step-6",
      stepNumber: 6,
      label: "Cloud Readiness Checkpoint",
      subLabel: "AWS Associate Exam Readiness",
      type: "milestone",
      phase: 2,
      weeksDuration: 1,
      icon: "💡",
      syllabusHighlights: [
        "Comprehensive architectural design review",
        "Practice examination score verification (>80% benchmark)",
      ],
      skillsUnlocked: ["Cloud Cost Optimization", "Infrastructure Planning"],
    },
    {
      id: "step-7",
      stepNumber: 7,
      label: "Digital Transformation & Advisory",
      subLabel: "SMU Academy • Advanced Certificate",
      type: "course",
      phase: 3,
      weeksDuration: 4,
      provider: "SMU Academy",
      cost: 1450,
      sfcSubsidy: 0,
      duration: "4 weeks",
      hoursPerWeek: 10,
      icon: "🏛️",
      syllabusHighlights: [
        "Enterprise agility and operating model transformation",
        "IT governance, risk frameworks, and regulatory compliance",
        "Leading change management in complex corporate reorganizations",
      ],
      skillsUnlocked: ["Digital Governance", "Enterprise Agile Delivery"],
      calendarTitle: "Study: SMU Digital Transformation Advisory",
      calendarDescription: "SMU Academy executive digital delivery module.",
    },
    {
      id: "step-8",
      stepNumber: 8,
      label: "Client Advisory Simulation",
      subLabel: "Mock Enterprise C-Suite Defense",
      type: "practical",
      phase: 3,
      weeksDuration: 2,
      icon: "🤝",
      syllabusHighlights: [
        "Live 30-minute C-level presentation simulation",
        "Navigating aggressive executive pushback and budget constraints",
      ],
      skillsUnlocked: ["Change Management", "Steering Committee Reporting"],
      calendarTitle: "Practicum: Mock C-Suite Defense",
      calendarDescription: "Prepare simulated presentation deck and defense.",
    },
    {
      id: "step-9",
      stepNumber: 9,
      label: "Target Role: Tech Consultant",
      subLabel: "Ready for Market Application",
      type: "goal",
      phase: 3,
      weeksDuration: 0,
      icon: "🏆",
      syllabusHighlights: [
        "Portfolio packaging with end-to-end consulting deliverables",
        "Targeted submission to accredited partner employer pools",
      ],
      skillsUnlocked: ["Full Strategic Consulting Readiness"],
    },
  ];

  // Wide snake node positions across the canvas (Bottom to Top)
  const nodePositions = [
    { x: 32, y: 90 },
    { x: 74, y: 80 },
    { x: 24, y: 70 },
    { x: 80, y: 59 },
    { x: 48, y: 50 },
    { x: 18, y: 40 },
    { x: 62, y: 31 },
    { x: 82, y: 21 },
    { x: 50, y: 9 },
  ];

  const toggleStep = (id: string) => {
    if (completedStepIds.includes(id)) {
      setCompletedStepIds(completedStepIds.filter((s) => s !== id));
      triggerToast("Milestone marked incomplete.");
    } else {
      const nextCompleted = [...completedStepIds, id];
      setCompletedStepIds(nextCompleted);
      const newPercent = Math.round((nextCompleted.length / steps.length) * 100);
      triggerToast(`Milestone Reached! Readiness is now ${newPercent}%`);
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const progressPercent = Math.round((completedStepIds.length / steps.length) * 100);
  const totalWeeks = steps.reduce((sum, s) => sum + s.weeksDuration, 0);
  const completedWeeks = steps
    .filter((s) => completedStepIds.includes(s.id))
    .reduce((sum, s) => sum + s.weeksDuration, 0);
  const remainingWeeks = Math.max(0, totalWeeks - completedWeeks);

  const activeStepIndex = Math.min(
    steps.length - 1,
    steps.findIndex((s) => !completedStepIds.includes(s.id)) === -1
      ? steps.length - 1
      : steps.findIndex((s) => !completedStepIds.includes(s.id))
  );
  const activePos = nodePositions[activeStepIndex];

  const openGoogleCalendar = (step: StepNode) => {
    const title = encodeURIComponent(step.calendarTitle || `Study: ${step.label}`);
    const details = encodeURIComponent(
      `${step.calendarDescription || step.subLabel}\nSkills: ${step.skillsUnlocked.join(", ")}`
    );
    const location = encodeURIComponent(step.provider || "Singapore / Online");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startIso = tomorrow.toISOString().replace(/-|:|\.\d\d\d/g, "").slice(0, 15) + "Z";
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${startIso}/${startIso}`;
    window.open(url, "_blank");
  };

  const downloadIcsFile = () => {
    const calendarEvents = steps
      .filter((s) => s.type === "course" || s.type === "practical")
      .map((s, idx) => {
        const start = new Date();
        start.setDate(start.getDate() + idx * 7);
        const dateStr = start.toISOString().replace(/-|:|\.\d\d\d/g, "").slice(0, 8);
        return `BEGIN:VEVENT\nSUMMARY:${s.label} (${s.provider || "Practical Block"})\nDESCRIPTION:${s.subLabel}\nSTATUS:CONFIRMED\nDTSTART:${dateStr}T110000Z\nDTEND:${dateStr}T130000Z\nEND:VEVENT`;
      })
      .join("\n");

    const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Lattice//Career Roadmap//EN\nCALSCALE:GREGORIAN\n${calendarEvents}\nEND:VCALENDAR`;
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Lattice-${targetRoleTitle.replace(/\s+/g, "_")}-Roadmap.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F9FD] text-slate-800 flex flex-col items-center p-3 sm:p-6 font-sans relative">
      {/* Encouragement Toast */}
      {toastMessage && (
        <div className="fixed top-5 z-50 animate-bounce duration-300">
          <div className="bg-[#6C72B9] text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg border border-indigo-300 flex items-center gap-2">
            <span>✨</span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-indigo-100/40 border border-slate-100 overflow-hidden flex flex-col">
        {/* Navigation Header */}
        <header className="px-6 pt-5 pb-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold transition"
            >
              ←
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#6C72B9]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6C72B9]">
                  Lattice Roadmap
                </span>
              </div>
              <h1 className="text-lg font-bold text-slate-900">{targetRoleTitle}</h1>
            </div>
          </div>

          <button
            onClick={() => setShowShareModal(true)}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full font-semibold transition"
          >
            Share ↗
          </button>
        </header>

        {/* Readiness Meter & Estimated Timeline */}
        <div className="mx-6 mt-4 p-4 rounded-2xl bg-gradient-to-r from-[#F0F2F9] to-[#E9EDF9] border border-[#DDE3F5]">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-slate-800 flex items-center gap-1.5 font-bold">
              <span>🎯</span> Readiness Score
            </span>
            <span className="text-[#6C72B9] font-black font-mono">
              {progressPercent}% Complete
            </span>
          </div>

          <div className="w-full h-3 bg-slate-200/80 rounded-full overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#8E94D3] to-[#6C72B9] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-500 block text-[10px] font-semibold uppercase">Estimated Time:</span>
              <strong className="text-slate-800">
                {remainingWeeks === 0 ? "Goal Reached!" : `~${remainingWeeks} Weeks to Target`}
              </strong>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-[10px] font-semibold uppercase">Paced Bandwidth:</span>
              <strong className="text-[#6C72B9] font-mono">{userHoursPerWeek} hrs/week</strong>
            </div>
          </div>
        </div>

        {/* Wide Snake Perspective Highway Canvas */}
        <div className="relative mx-6 my-4 h-[760px] rounded-3xl bg-gradient-to-b from-[#BEE3F8] via-[#E2E8F0] to-[#CBD5E1] border border-slate-200/80 shadow-inner overflow-hidden">
          {/* Sky Clouds */}
          <div className="absolute top-4 left-6 text-2xl opacity-40 select-none">☁️</div>
          <div className="absolute top-10 right-8 text-3xl opacity-30 select-none">☁️</div>

          {/* Hexagonal Lattice Background */}
          <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="road-lattice" width="40" height="69.282" patternUnits="userSpaceOnUse">
                <path
                  d="M 40 0 L 20 11.547 L 0 0 L 0 23.094 L 20 34.641 L 40 23.094 Z M 0 34.641 L 20 46.188 L 0 57.735 L 0 69.282 L 40 69.282 L 40 57.735 L 20 46.188 Z"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="0.75"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#road-lattice)" />
          </svg>

          {/* S-Curve Highway SVG */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path
              d="M 50 97 C 38 94, 20 93, 32 90 C 52 86, 90 85, 74 80 C 55 75, 12 75, 24 70 C 38 65, 95 65, 80 59 C 68 54, 35 54, 48 50 C 60 46, 6 45, 18 40 C 30 35, 75 35, 62 31 C 50 27, 95 25, 82 21 C 70 17, 54 13, 50 9"
              fill="none"
              stroke="#1E293B"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M 50 97 C 38 94, 20 93, 32 90 C 52 86, 90 85, 74 80 C 55 75, 12 75, 24 70 C 38 65, 95 65, 80 59 C 68 54, 35 54, 48 50 C 60 46, 6 45, 18 40 C 30 35, 75 35, 62 31 C 50 27, 95 25, 82 21 C 70 17, 54 13, 50 9"
              fill="none"
              stroke="#334155"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <path
              d="M 50 97 C 38 94, 20 93, 32 90 C 52 86, 90 85, 74 80 C 55 75, 12 75, 24 70 C 38 65, 95 65, 80 59 C 68 54, 35 54, 48 50 C 60 46, 6 45, 18 40 C 30 35, 75 35, 62 31 C 50 27, 95 25, 82 21 C 70 17, 54 13, 50 9"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.0"
              strokeDasharray="2, 2.5"
              strokeLinecap="round"
            />
          </svg>

          {/* Goal & Origin Badges */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] bg-[#6C72B9] text-white px-3 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm z-10">
            Target Goal
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] bg-slate-800 text-white px-3 py-0.5 rounded-full font-bold uppercase tracking-wider z-10 shadow-sm">
            Start Here
          </div>

          {/* Animated Businessman Runner Sprite */}
          <div
            style={{ left: `${activePos.x}%`, top: `${activePos.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-12 transition-all duration-700 ease-out z-30 pointer-events-none flex flex-col items-center"
          >
            <div className="relative flex items-center justify-center animate-bounce">
              <svg width="40" height="40" viewBox="0 0 64 64" fill="none">
                <rect x="38" y="34" width="16" height="12" rx="2" fill="#78350F" />
                <path d="M43 34 V30 H49 V34" stroke="#78350F" strokeWidth="2" fill="none" />
                <circle cx="28" cy="14" r="7" fill="#FBBF24" />
                <path d="M22 23 L28 42 L34 23 Z" fill="#2563EB" />
                <path d="M27 24 L29 24 L30 31 L28 34 L26 31 Z" fill="#F97316" />
                <path d="M25 40 L16 54 M31 40 L38 52" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
                <path d="M22 26 L12 28 M32 26 L42 36" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <span className="bg-[#6C72B9] text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow whitespace-nowrap uppercase">
              Current Stage
            </span>
          </div>

          {/* Teardrop Markers */}
          {steps.map((step, idx) => {
            const isDone = completedStepIds.includes(step.id);
            const pos = nodePositions[idx];
            const isGoal = step.type === "goal";
            const isCurrent = activeStepIndex === idx;

            return (
              <div
                key={step.id}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center group cursor-pointer z-20"
                onClick={() => setActiveDetail(step)}
              >
                <div
                  className={`relative flex items-center justify-center transition-all duration-300 transform group-hover:scale-125 active:scale-95 filter drop-shadow-md ${
                    isGoal ? "w-11 h-13" : "w-9 h-11"
                  }`}
                >
                  <svg viewBox="0 0 32 42" className="w-full h-full">
                    <path
                      d="M16 0 C7.16 0 0 7.16 0 16 C0 26 16 42 16 42 C16 42 32 26 32 16 C32 7.16 24.84 0 16 0 Z"
                      fill={
                        isDone
                          ? "#10B981"
                          : isGoal
                          ? "#F59E0B"
                          : isCurrent
                          ? "#6C72B9"
                          : "#EF4444"
                      }
                    />
                    <circle cx="16" cy="16" r="9" fill="#FFFFFF" />
                  </svg>

                  <div className="absolute top-1.5 flex items-center justify-center w-6 h-6">
                    {isDone ? (
                      <span className="text-emerald-600 font-black text-xs">✓</span>
                    ) : isGoal ? (
                      <span className="text-xs">🏆</span>
                    ) : (
                      <span className="text-[10px] font-extrabold text-slate-800">
                        {step.stepNumber}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-0.5 px-2 py-0.5 bg-white/95 rounded-md border border-slate-300 shadow-sm text-[9px] font-bold text-slate-800 max-w-[95px] truncate text-center transition group-hover:bg-[#6C72B9] group-hover:text-white group-hover:border-[#6C72B9]">
                  {step.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Checklist Section */}
        <div className="px-6 py-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Stages to Complete
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              {completedStepIds.length} of {steps.length} Reached
            </span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {steps.map((st) => {
              const isDone = completedStepIds.includes(st.id);
              return (
                <div
                  key={st.id}
                  className={`p-3 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                    isDone
                      ? "bg-teal-50/60 border-teal-200/90 text-teal-950"
                      : "bg-slate-50 border-slate-200/80 hover:border-slate-300 text-slate-700"
                  }`}
                >
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStep(st.id);
                    }}
                    className="flex items-center gap-3 flex-1"
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition transform active:scale-90 ${
                        isDone
                          ? "bg-teal-500 text-white shadow-sm"
                          : "border border-slate-300 bg-white text-transparent hover:border-slate-400"
                      }`}
                    >
                      ✓
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{st.label}</h4>
                      <p className="text-[11px] text-slate-500 truncate max-w-[190px] sm:max-w-[210px]">
                        {st.subLabel}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveDetail(st)}
                    className="ml-2 text-[10px] font-semibold text-[#6C72B9] bg-[#6C72B9]/10 hover:bg-[#6C72B9]/20 px-2.5 py-1 rounded-lg transition"
                  >
                    Details
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Calendar Sync Bar */}
        <div className="px-6 py-2">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col gap-2">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <span>📅</span> Calendar & Schedule Integration
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => openGoogleCalendar(steps[0])}
                className="py-2 px-3 bg-white border border-slate-200 hover:border-[#6C72B9] text-[#6C72B9] rounded-xl text-xs font-bold transition text-center shadow-sm"
              >
                + Google Calendar
              </button>
              <button
                type="button"
                onClick={downloadIcsFile}
                className="py-2 px-3 bg-white border border-slate-200 hover:border-[#6C72B9] text-slate-700 rounded-xl text-xs font-bold transition text-center shadow-sm"
              >
                Download .ICS File
              </button>
            </div>
          </div>
        </div>

        {/* Commitment Button & Cross Navigation */}
        <div className="px-6 py-3 space-y-2">
          <button
            type="button"
            onClick={() => setLockedIn(!lockedIn)}
            className={`w-full py-3 rounded-2xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-2 ${
              lockedIn
                ? "bg-teal-500 text-white shadow-teal-100"
                : "bg-[#6C72B9] hover:bg-[#5b61a3] text-white shadow-indigo-100"
            }`}
          >
            <span>{lockedIn ? "✓ Target Locked In #truelove" : "Commit: Lock In #truelove"}</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/"
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-semibold text-center transition"
            >
              ← Back to Swiping
            </Link>
            <Link
              href="/"
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-semibold text-center transition"
            >
              See Other Roles
            </Link>
          </div>
        </div>

        {/* Detailed Modal Drawer */}
        {activeDetail && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in slide-in-from-bottom duration-200 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6C72B9]">
                  Step {activeDetail.stepNumber} • Phase {activeDetail.phase}
                </span>
                <button
                  onClick={() => setActiveDetail(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 text-xs flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{activeDetail.icon}</span>
                  <h3 className="text-base font-bold text-slate-900">{activeDetail.label}</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{activeDetail.subLabel}</p>

                {activeDetail.cost !== undefined && (
                  <div className="mt-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-500">
                      <span>Provider:</span>
                      <span className="font-semibold text-slate-800">{activeDetail.provider}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Effort:</span>
                      <span className="font-semibold text-slate-800">
                        {activeDetail.duration} • {activeDetail.hoursPerWeek}h/wk
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Standard Cost:</span>
                      <span className="text-slate-800">S${activeDetail.cost}</span>
                    </div>
                    <div className="flex justify-between text-teal-600 font-semibold">
                      <span>SFC Credit Subsidy:</span>
                      <span>-S${activeDetail.sfcSubsidy}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t border-slate-200 pt-1 text-slate-900">
                      <span>Net Out-of-Pocket:</span>
                      <span>S${Math.max(0, activeDetail.cost - (activeDetail.sfcSubsidy || 0))}</span>
                    </div>
                  </div>
                )}

                <div className="mt-3.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    What You Will Master:
                  </span>
                  <ul className="space-y-1 text-xs text-slate-600">
                    {activeDetail.syllabusHighlights.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-teal-500 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => openGoogleCalendar(activeDetail)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold transition text-center"
                  >
                    📅 Add to Google Cal
                  </button>
                </div>

                <div className="mt-3.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Skills Unlocked:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {activeDetail.skillsUnlocked.map((s) => (
                      <span key={s} className="bg-indigo-50 text-[#6C72B9] text-[10px] font-medium px-2 py-0.5 rounded-md">
                        +{s}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    toggleStep(activeDetail.id);
                    setActiveDetail(null);
                  }}
                  className={`w-full mt-4 py-3 rounded-2xl text-xs font-bold transition ${
                    completedStepIds.includes(activeDetail.id)
                      ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      : "bg-[#6C72B9] hover:bg-[#5b61a3] text-white shadow-md shadow-indigo-100"
                  }`}
                >
                  {completedStepIds.includes(activeDetail.id)
                    ? "Mark as Incomplete"
                    : "✓ Mark Milestone as Complete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xs w-full p-5 shadow-2xl border border-slate-100">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">Share Your Roadmap</span>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-xs flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="mt-3 space-y-2.5">
                <button
                  onClick={handleCopyShareLink}
                  className="w-full py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  {copiedLink ? "✓ Copied to Clipboard!" : "📋 Copy Share Link"}
                </button>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                    typeof window !== "undefined" ? window.location.href : "https://lattice.sg"
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full py-2.5 bg-[#0077B5] text-white rounded-xl text-xs font-semibold text-center transition"
                >
                  Share to LinkedIn
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}