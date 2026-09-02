import type { Roadmap } from "./roadmap";

export interface StudyBlockEvent {
  title: string;
  description: string;
  start: Date;
  durationMinutes: number;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Floating local time, per RFC 5545 — no TZID, matches the device's own clock. */
function formatIcsLocal(date: Date): string {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
}

function formatUtcCompact(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

/** Next occurrence of `hour`:00 local time — today if it hasn't passed yet, otherwise tomorrow. */
export function nextStudySlot(hour = 19): Date {
  const now = new Date();
  const slot = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, 0, 0);
  if (slot.getTime() <= now.getTime()) slot.setDate(slot.getDate() + 1);
  return slot;
}

/**
 * Turns the roadmap's first phase into a single calendar-ready study block —
 * a concrete first step on the person's actual schedule, not just a chip in
 * the app. Session length is capped independent of the weekly-hours target
 * (which can run up to 12 hrs/week) since that's not a realistic single sitting.
 */
export function buildFirstStudyBlock(roadmap: Roadmap, studyHoursPerWeek?: number | null): StudyBlockEvent | null {
  const phase = roadmap.phases[0];
  if (!phase || phase.skills.length === 0) return null;

  const topSkill = phase.skills[0];
  const durationHours = Math.min(2, Math.max(1, studyHoursPerWeek ?? 1.5));

  return {
    title: `Study block: ${topSkill} (toward ${roadmap.targetLabel})`,
    description:
      `First step on your roadmap toward ${roadmap.targetLabel}.\n\n` +
      `Phase: ${phase.name} — ${phase.description}\n` +
      `Focus this session: ${phase.skills.join(", ")}`,
    start: nextStudySlot(19),
    durationMinutes: Math.round(durationHours * 60),
  };
}

/** Opens Google Calendar's prefilled "add event" page — no OAuth, saves a real event on click. */
export function buildGoogleCalendarUrl(event: StudyBlockEvent): string {
  const end = new Date(event.start.getTime() + event.durationMinutes * 60_000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    details: event.description,
    dates: `${formatUtcCompact(event.start)}/${formatUtcCompact(end)}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function escapeIcsText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export function buildIcsContent(event: StudyBlockEvent): string {
  const end = new Date(event.start.getTime() + event.durationMinutes * 60_000);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Reskilling Copilot//Study Block//EN",
    "BEGIN:VEVENT",
    `UID:${crypto.randomUUID()}@reskilling-copilot`,
    `DTSTAMP:${formatUtcCompact(new Date())}`,
    `DTSTART:${formatIcsLocal(event.start)}`,
    `DTEND:${formatIcsLocal(end)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

export function downloadIcs(event: StudyBlockEvent, filename = "study-block.ics") {
  const blob = new Blob([buildIcsContent(event)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
