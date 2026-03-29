"use client";

import { useState } from "react";
import { cn } from "@cmd/ui";
import {
  createMeeting,
  updateMeetingStatus,
  updateMeetingSegment,
  rateMeeting,
} from "../../app/actions/eos";

const SEGMENTS = [
  { key: "segue", label: "Segue", description: "Share good news — personal and professional", duration: "5 min" },
  { key: "scorecard", label: "Scorecard", description: "Review weekly KPI numbers", duration: "5 min" },
  { key: "rocks", label: "Rock Review", description: "Check rock status on/off track", duration: "5 min" },
  { key: "headlines", label: "Headlines", description: "Customer/employee headlines", duration: "5 min" },
  { key: "todos", label: "To-Do Review", description: "Review last week's to-dos", duration: "5 min" },
  { key: "ids", label: "IDS", description: "Identify, Discuss, Solve issues", duration: "60 min" },
  { key: "conclude", label: "Conclude", description: "Recap to-dos, rate the meeting", duration: "5 min" },
] as const;

interface MeetingData {
  id: string;
  date: string;
  status: string;
  currentSegment: string | null;
  segmentStartedAt: string | null;
  rating: number | null;
  notes: string;
  createdAt: string;
}

export function MeetingManager({ meetings }: { meetings: MeetingData[] }) {
  const [showCreate, setShowCreate] = useState(false);

  const scheduled = meetings.filter((m) => m.status === "scheduled");
  const inProgress = meetings.filter((m) => m.status === "in_progress");
  const completed = meetings.filter((m) => m.status === "completed");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Meetings</h1>
          <p className="text-sm text-zinc-500">Level 10 Meeting Pulse</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(!showCreate)}
          className="rounded-md border border-dashed border-zinc-700 px-4 py-2 text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-300"
        >
          {showCreate ? "Cancel" : "+ Schedule Meeting"}
        </button>
      </div>

      {showCreate && (
        <form
          action={async (formData) => {
            await createMeeting(formData);
            setShowCreate(false);
          }}
          className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-3"
        >
          <div>
            <label className="mb-1 block text-xs text-zinc-500">Date</label>
            <input
              name="date"
              type="date"
              required
              defaultValue={new Date().toISOString().split("T")[0]}
              className="w-full max-w-xs rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-50 focus:border-zinc-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-zinc-50 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-200"
          >
            Schedule
          </button>
        </form>
      )}

      {meetings.length === 0 && !showCreate ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 py-16">
          <p className="text-zinc-500">No meetings yet</p>
          <p className="mt-1 text-xs text-zinc-600">
            Schedule your first Level 10 meeting
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* In Progress */}
          {inProgress.map((meeting) => (
            <ActiveMeeting key={meeting.id} meeting={meeting} />
          ))}

          {/* Scheduled */}
          {scheduled.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">
                Scheduled
              </h2>
              {scheduled.map((meeting) => (
                <div
                  key={meeting.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-200">
                      {new Date(meeting.date + "T00:00:00").toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-zinc-500">Scheduled</p>
                  </div>
                  <form action={updateMeetingStatus}>
                    <input type="hidden" name="id" value={meeting.id} />
                    <input type="hidden" name="status" value="in_progress" />
                    <button
                      type="submit"
                      className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500"
                    >
                      Start Meeting
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-600">
                Completed
              </h2>
              {completed.map((meeting) => (
                <div
                  key={meeting.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-800/50 bg-zinc-900/50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm text-zinc-400">
                      {new Date(meeting.date + "T00:00:00").toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    {meeting.notes && (
                      <p className="mt-0.5 text-xs text-zinc-600 line-clamp-1">
                        {meeting.notes}
                      </p>
                    )}
                  </div>
                  {meeting.rating != null && (
                    <div className="flex items-center gap-1">
                      <span className="text-sm tabular-nums text-zinc-400">
                        {meeting.rating}/10
                      </span>
                      <div className="h-2 w-16 rounded-full bg-zinc-800">
                        <div
                          className="h-2 rounded-full bg-emerald-500"
                          style={{ width: `${(meeting.rating / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Active Meeting Runner
// ---------------------------------------------------------------------------

function ActiveMeeting({ meeting }: { meeting: MeetingData }) {
  const [showRating, setShowRating] = useState(false);
  const currentIdx = SEGMENTS.findIndex(
    (s) => s.key === meeting.currentSegment
  );

  return (
    <div className="rounded-lg border border-emerald-500/20 bg-zinc-900 p-3 md:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-400">
            Meeting In Progress
          </p>
          <p className="text-xs text-zinc-500">
            {new Date(meeting.date + "T00:00:00").toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        {!showRating && (
          <button
            type="button"
            onClick={() => setShowRating(true)}
            className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 hover:border-zinc-500 hover:text-zinc-300"
          >
            End Meeting
          </button>
        )}
      </div>

      {/* Segment progress */}
      <div className="flex gap-1">
        {SEGMENTS.map((seg, idx) => (
          <div
            key={seg.key}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              idx < currentIdx
                ? "bg-emerald-500"
                : idx === currentIdx
                  ? "bg-emerald-400 animate-pulse"
                  : "bg-zinc-800"
            )}
          />
        ))}
      </div>

      {/* Segment cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {SEGMENTS.map((seg, idx) => {
          const isCurrent = seg.key === meeting.currentSegment;
          const isPast = idx < currentIdx;
          return (
            <div
              key={seg.key}
              className={cn(
                "rounded-lg border p-2 md:p-2.5 text-center transition-colors overflow-hidden",
                isCurrent
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : isPast
                    ? "border-zinc-800/50 bg-zinc-900/50"
                    : "border-zinc-800 bg-zinc-950"
              )}
            >
              <p
                className={cn(
                  "text-xs font-medium",
                  isCurrent
                    ? "text-emerald-400"
                    : isPast
                      ? "text-zinc-600"
                      : "text-zinc-500"
                )}
              >
                {seg.label}
              </p>
              <p className="mt-0.5 text-[10px] text-zinc-600">{seg.duration}</p>
              {!isPast && !isCurrent && idx === currentIdx + 1 && (
                <form action={updateMeetingSegment} className="mt-1.5">
                  <input type="hidden" name="id" value={meeting.id} />
                  <input type="hidden" name="segment" value={seg.key} />
                  <button
                    type="submit"
                    className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400 hover:bg-zinc-700"
                  >
                    Next
                  </button>
                </form>
              )}
              {isCurrent && (
                <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </div>
          );
        })}
      </div>

      {/* Current segment detail */}
      {meeting.currentSegment && (
        <div className="rounded-lg bg-zinc-950 p-4">
          <h3 className="text-sm font-medium text-zinc-200">
            {SEGMENTS.find((s) => s.key === meeting.currentSegment)?.label}
          </h3>
          <p className="mt-0.5 text-xs text-zinc-500">
            {SEGMENTS.find((s) => s.key === meeting.currentSegment)?.description}
          </p>
        </div>
      )}

      {/* Rating form */}
      {showRating && (
        <form
          action={rateMeeting}
          className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 space-y-3"
        >
          <input type="hidden" name="id" value={meeting.id} />
          <div>
            <label className="mb-1 block text-xs text-zinc-500">
              Rate this meeting (1-10)
            </label>
            <input
              name="rating"
              type="number"
              min="1"
              max="10"
              required
              className="w-24 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-50 focus:border-zinc-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-500">Notes</label>
            <textarea
              name="notes"
              rows={2}
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-50 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
              placeholder="Meeting notes..."
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-md bg-zinc-50 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-200"
            >
              Complete Meeting
            </button>
            <button
              type="button"
              onClick={() => setShowRating(false)}
              className="rounded-md px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
