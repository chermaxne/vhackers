"use client";

import React, { useState } from "react";

export interface GuidedConstraints {
  workArrangements: string[];
  targetIndustries: string[];
  blacklistedIndustries: string[];
  maxHoursPerWeek: number;
  sfcBalance: number;
  accommodations: string;
}

interface Props {
  onSubmit: (constraints: any, jobs: any[]) => void;
  onBack?: () => void;
}

export default function GuidedDiscoveryIntro({ onSubmit, onBack }: Props) {
  const [workArrangements, setWorkArrangements] = useState<string[]>([
    "Hybrid (2-3 days remote)",
  ]);
  const [showOtherWork, setShowOtherWork] = useState(false);
  const [otherWorkText, setOtherWorkText] = useState("");

  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([
    "Enterprise SaaS",
    "FinTech & Banking",
  ]);
  const [showOtherIndustry, setShowOtherIndustry] = useState(false);
  const [otherIndustryText, setOtherIndustryText] = useState("");

  const [hoursPerWeek, setHoursPerWeek] = useState<number>(8);
  const [sfcBalance, setSfcBalance] = useState<number>(500);
  const [hasAccommodation, setHasAccommodation] = useState(false);
  const [accommodationNotes, setAccommodationNotes] = useState("");

  const workOptions = [
    "Hybrid (2-3 days remote)",
    "Fully Remote",
    "On-Site / Office-First",
    "Flexible Hours / Asynchronous",
  ];

  const industryOptions = [
    "Enterprise SaaS",
    "FinTech & Banking",
    "Healthcare & Biotech",
    "Public Sector & GovTech",
    "E-Commerce & Retail",
    "Green Tech & Sustainability",
  ];

  const toggleItem = (item: string, list: string[], setList: (l: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const activeIndustries = [
      ...selectedIndustries,
      ...(showOtherIndustry && otherIndustryText.trim() ? [otherIndustryText.trim()] : []),
    ];

    const constraints = {
      workArrangements: [
        ...workArrangements,
        ...(showOtherWork && otherWorkText.trim() ? [otherWorkText.trim()] : []),
      ],
      targetIndustries: activeIndustries,
      maxHoursPerWeek: hoursPerWeek,
      sfcBalance,
      accommodations: hasAccommodation ? accommodationNotes : "",
    };

    onSubmit(constraints, []);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-indigo-100/50 border border-slate-100 p-6 font-sans">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#6C72B9]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6C72B9]">
              Perceive Constraints
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-0.5">
            Preferences & Safeguards
          </h2>
        </div>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-slate-500 hover:text-slate-800 bg-slate-100 px-3 py-1.5 rounded-full"
          >
            Back
          </button>
        )}
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-5">
        {/* Work Arrangement Multi-select */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Work Arrangement Preference (Multi-select)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {workOptions.map((opt) => {
              const active = workArrangements.includes(opt);
              return (
                <button
                  type="button"
                  key={opt}
                  onClick={() => toggleItem(opt, workArrangements, setWorkArrangements)}
                  className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition ${
                    active
                      ? "bg-[#6C72B9] border-[#6C72B9] text-white shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {active ? "✓ " : "+ "}
                  {opt}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setShowOtherWork(!showOtherWork)}
              className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition ${
                showOtherWork
                  ? "bg-[#6C72B9]/15 border-[#6C72B9] text-[#6C72B9]"
                  : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
              }`}
            >
              {showOtherWork ? "✕ Cancel" : "+ Others"}
            </button>
          </div>

          {showOtherWork && (
            <input
              type="text"
              value={otherWorkText}
              onChange={(e) => setOtherWorkText(e.target.value)}
              placeholder="e.g. 4-day work week, shift-based"
              className="mt-2 w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6C72B9]"
            />
          )}
        </div>

        {/* Target Industries Whitelist */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Target Industries of Interest (Multi-select)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {industryOptions.map((ind) => {
              const active = selectedIndustries.includes(ind);
              return (
                <button
                  type="button"
                  key={ind}
                  onClick={() => toggleItem(ind, selectedIndustries, setSelectedIndustries)}
                  className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition ${
                    active
                      ? "bg-[#6C72B9] border-[#6C72B9] text-white shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {active ? "✓ " : "+ "}
                  {ind}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setShowOtherIndustry(!showOtherIndustry)}
              className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition ${
                showOtherIndustry
                  ? "bg-[#6C72B9]/15 border-[#6C72B9] text-[#6C72B9]"
                  : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
              }`}
            >
              {showOtherIndustry ? "✕ Cancel" : "+ Others"}
            </button>
          </div>

          {showOtherIndustry && (
            <input
              type="text"
              value={otherIndustryText}
              onChange={(e) => setOtherIndustryText(e.target.value)}
              placeholder="e.g. Clean Energy, Maritime, Aviation"
              className="mt-2 w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6C72B9]"
            />
          )}
        </div>

        {/* Study Hours & SFC Credit */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] font-semibold text-slate-600">Weekly Effort</span>
              <span className="text-xs font-bold text-[#6C72B9]">{hoursPerWeek}h/wk</span>
            </div>
            <input
              type="range"
              min={4}
              max={20}
              step={2}
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(Number(e.target.value))}
              className="w-full accent-[#6C72B9] cursor-pointer"
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-600 block mb-1">
              SFC Credit Balance[cite: 1, 4]
            </span>
            <div className="relative flex items-center">
              <span className="absolute left-2.5 text-xs text-slate-400">S$</span>
              <input
                type="number"
                value={sfcBalance}
                onChange={(e) => setSfcBalance(Number(e.target.value))}
                className="w-full text-xs font-bold pl-7 pr-2 py-1 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#6C72B9]"
              />
            </div>
          </div>
        </div>

        {/* Accessibility Accommodation Toggle */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={hasAccommodation}
              onChange={(e) => setHasAccommodation(e.target.checked)}
              className="w-4 h-4 accent-[#6C72B9] rounded"
            />
            <span className="text-xs font-semibold text-slate-700">
              Require accessibility or ergonomic accommodations[cite: 1]
            </span>
          </label>
          {hasAccommodation && (
            <input
              type="text"
              value={accommodationNotes}
              onChange={(e) => setAccommodationNotes(e.target.value)}
              placeholder="e.g. Screen reader compatible, ergonomic desk setup"
              className="mt-2 w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#6C72B9]"
            />
          )}
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-[#6C72B9] hover:bg-[#5b61a3] text-white font-bold rounded-2xl text-xs transition shadow-md shadow-indigo-100 flex items-center justify-center gap-2"
        >
          <span>Find Matching Roles</span>
          <span>→</span>
        </button>
      </form>
    </div>
  );
}
