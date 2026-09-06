"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SAMPLE_JOBS, type JobCard as JobCardData } from "@/lib/jobs";
import JobCard from "./JobCard";
import { IconBackArrow } from "./icons/LatticeIcons";

const SWIPE_THRESHOLD_PX = 120;
const EXIT_ANIMATION_MS = 220;

type Direction = "left" | "right";

export default function SwipeDeck({
  jobs,
  onComplete,
  onBack,
  userSkills,
}: {
  // Industry-scoped live roles from the guided-discovery flow; falls back
  // to the static sample deck if empty (live fetch failed/too sparse) or
  // omitted entirely (e.g. re-entering from "explore other roles").
  jobs?: JobCardData[];
  onComplete: (liked: JobCardData[]) => void;
  onBack?: () => void;
  userSkills?: string[];
}) {
  const cards = jobs && jobs.length > 0 ? jobs : SAMPLE_JOBS;
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState<JobCardData[]>([]);
  const [matchedSkills, setMatchedSkills] = useState<
    Record<
      string,
      {
        matchedTransferableSkills: string[];
        matchedSkillsRequired: string[];
      }
    >
  >({});
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);

  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [exiting, setExiting] = useState<Direction | null>(null);
  const dragStartX = useRef(0);

  // Fetch skill matches from LLM when component mounts and user has skills
  useEffect(() => {
    if (!userSkills || userSkills.length === 0) return;

    const fetchMatches = async () => {
      setIsLoadingMatches(true);
      try {
        const response = await fetch("/api/match-skills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userSkills,
            jobs: cards.map((job) => ({
              uuid: job.uuid,
              title: job.title,
              transferableSkills: job.transferableSkills,
              skillsRequired: job.skillsRequired,
            })),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setMatchedSkills(data.matches || {});
        } else {
          const errorBody = await response.json().catch(() => null);
          console.error("Failed to fetch skill matches:", response.status, errorBody?.error ?? "(no error body)");
        }
      } catch (error) {
        console.error("Error fetching skill matches:", error);
      } finally {
        setIsLoadingMatches(false);
      }
    };

    fetchMatches();
  }, [userSkills, cards]);

  const commit = useCallback(
    (direction: Direction) => {
      if (exiting) return;
      setExiting(direction);
      const swiped = cards[index];
      window.setTimeout(() => {
        if (direction === "right") {
          setLiked((prev) => [...prev, swiped]);
        }
        setIndex((prev) => prev + 1);
        setExiting(null);
        setDragX(0);
      }, EXIT_ANIMATION_MS);
    },
    [index, exiting, cards]
  );

  function onPointerDown(e: React.PointerEvent) {
    if (exiting) return;
    dragStartX.current = e.clientX;
    setDragging(true);
    (e.target as Element).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    setDragX(e.clientX - dragStartX.current);
  }

  function onPointerUp() {
    if (!dragging) return;
    setDragging(false);
    if (dragX > SWIPE_THRESHOLD_PX) {
      commit("right");
    } else if (dragX < -SWIPE_THRESHOLD_PX) {
      commit("left");
    } else {
      setDragX(0);
    }
  }

  const current = cards[index];
  const next = cards[index + 1];
  const done = index >= cards.length;

  if (done) {
    return (
      <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-[2rem] border border-primary-pale bg-surface p-6 pt-12 text-center shadow-xl">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="absolute left-0 top-0 z-10 flex h-12 w-12 items-start justify-start rounded-br-[1.5rem] bg-primary p-2.5 text-white transition hover:bg-primary-dark"
          >
            <IconBackArrow className="h-5 w-5" />
          </button>
        )}
        <h2 className="font-display text-xl font-extrabold text-ink">That&apos;s the deck</h2>
        <p className="mt-2 text-sm text-ink-muted">
          You liked {liked.length} of {cards.length} roles.
        </p>
        {liked.length > 0 && (
          <ul className="mt-4 space-y-1.5 text-left">
            {liked.map((job) => (
              <li
                key={job.uuid}
                className="rounded-full bg-accent-amber-pale px-4 py-2 text-sm font-semibold text-amber-900"
              >
                {job.title}
              </li>
            ))}
          </ul>
        )}
        <button
          onClick={() => onComplete(liked)}
          className="mt-6 w-full rounded-full bg-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-primary-dark"
        >
          See what this says about me
        </button>
      </div>
    );
  }

  const rotation = Math.max(-15, Math.min(15, dragX / 12));
  const exitTransform =
    exiting === "right" ? "translateX(140%) rotate(20deg)" : exiting === "left" ? "translateX(-140%) rotate(-20deg)" : undefined;

  return (
    <div className="relative mx-auto flex w-full max-w-sm flex-col items-center gap-8 pt-4">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="absolute left-0 top-0 z-10 flex h-12 w-12 items-start justify-start rounded-br-[1.5rem] bg-primary p-2.5 text-white transition hover:bg-primary-dark"
        >
          <IconBackArrow className="h-5 w-5" />
        </button>
      )}
      <p className="font-display text-sm font-bold text-primary">
        {index + 1} / {cards.length}
      </p>

      <div className="relative h-[580px] w-full max-w-sm">
        {/* Decorative stacked-card peeks */}
        <div className="absolute inset-0 translate-x-3 translate-y-3 rotate-3 rounded-[2rem] bg-accent-amber/70" />
        <div className="absolute inset-0 -translate-x-2 translate-y-4 -rotate-2 rounded-[2rem] bg-accent-green/60" />

        {next && (
          <div className="absolute inset-0 scale-95 opacity-80">
            <JobCard 
              job={next} 
              matchedSkills={matchedSkills[next.uuid]} 
              themeIndex={index + 1} 
            />
          </div>
        )}
        <div
          className="absolute inset-0 touch-none"
          style={{
            transform: exitTransform ?? `translateX(${dragX}px) rotate(${rotation}deg)`,
            transition: dragging ? "none" : "transform 220ms ease",
            cursor: dragging ? "grabbing" : "grab",
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <JobCard 
            job={current} 
            matchedSkills={matchedSkills[current.uuid]} 
            themeIndex={index} 
          />
          {dragX > 40 && (
            <div className="pointer-events-none absolute left-6 top-6 rotate-[-12deg] rounded-xl border-4 border-accent-green bg-white px-3 py-1 font-display text-xl font-extrabold text-accent-green">
              INTERESTED
            </div>
          )}
          {dragX < -40 && (
            <div className="pointer-events-none absolute right-6 top-6 rotate-[12deg] rounded-xl border-4 border-accent-coral bg-white px-3 py-1 font-display text-xl font-extrabold text-accent-coral">
              PASS
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-6">
        <button
          onClick={() => commit("left")}
          aria-label="Pass on this role"
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-accent-coral/40 bg-white text-2xl text-accent-coral shadow-md transition hover:scale-105 hover:bg-accent-coral-pale"
        >
          ✕
        </button>
        <button
          onClick={() => commit("right")}
          aria-label="Interested in this role"
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary/40 bg-white text-2xl text-primary shadow-md transition hover:scale-105 hover:bg-primary-pale"
        >
          ♥
        </button>
      </div>
    </div>
  );
}