"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@cmd/ui";
import {
  createMeeting,
  updateMeetingStatus,
  updateMeetingSegment,
  rateMeeting,
  createMeetingTemplate,
  updateMeetingTemplate,
  deleteMeetingTemplate,
  toggleTodo,
  moveIssuePhase,
} from "../../app/actions/eos";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

const MEETING_TYPES = [
  "Level 10",
  "Quarterly",
  "Annual",
  "Focus Day",
  "Vision Building",
  "Custom",
] as const;

type MeetingType = (typeof MEETING_TYPES)[number];

const DEFAULT_L10_SEGMENTS = [
  "segue",
  "scorecard",
  "rocks",
  "headlines",
  "todos",
  "ids",
  "conclude",
] as const;

const DEFAULT_L10_DURATIONS = [5, 5, 5, 5, 5, 60, 5] as const;

const SEGMENT_META: Record<
  string,
  { label: string; description: string }
> = {
  segue: {
    label: "Segue",
    description: "Share good news — personal and professional",
  },
  scorecard: {
    label: "Scorecard",
    description: "Review weekly KPI numbers",
  },
  rocks: {
    label: "Rock Review",
    description: "Check rock status on/off track",
  },
  headlines: {
    label: "Headlines",
    description: "Customer/employee headlines",
  },
  todos: {
    label: "To-Do Review",
    description: "Review last week's to-dos",
  },
  ids: {
    label: "IDS",
    description: "Identify, Discuss, Solve issues",
  },
  conclude: {
    label: "Conclude",
    description: "Recap to-dos, rate the meeting",
  },
};

interface MeetingData {
  id: string;
  date: string;
  status: string;
  meetingType: string | null;
  currentSegment: string | null;
  segmentStartedAt: string | null;
  rating: number | null;
  notes: string;
  templateId: string | null;
  createdAt: string;
}

interface TemplateData {
  id: string;
  name: string;
  meetingType: string;
  segments: string[];
  segmentDurations: number[];
}

interface KpiData {
  id: string;
  name: string;
  ownerName: string | null;
  goal: string | null;
  unit: string | null;
}

interface KpiEntryData {
  kpiId: string;
  weekStart: string;
  goal: string | null;
  actual: string | null;
}

interface RockData {
  id: string;
  title: string;
  ownerName: string | null;
  status: string;
}

interface TodoData {
  id: string;
  title: string;
  ownerName: string | null;
  completed: boolean;
  dueDate: string | null;
}

interface IssueData {
  id: string;
  title: string;
  description: string | null;
  ownerName: string | null;
  phase: string;
  priority: number;
}

export interface MeetingManagerProps {
  meetings: MeetingData[];
  templates: TemplateData[];
  companyId: string;
  kpis?: KpiData[];
  kpiEntries?: KpiEntryData[];
  rocks?: RockData[];
  todos?: TodoData[];
  issues?: IssueData[];
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function MeetingManager({
  meetings,
  templates,
  companyId,
  kpis = [],
  kpiEntries = [],
  rocks = [],
  todos = [],
  issues = [],
}: MeetingManagerProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const scheduled = meetings.filter((m) => m.status === "scheduled");
  const inProgress = meetings.filter((m) => m.status === "in_progress");
  const completed = meetings.filter((m) => m.status === "completed");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Meetings</h1>
          <p className="text-sm text-zinc-500">EOS Meeting Pulse</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setShowTemplates(!showTemplates);
              if (showCreate) setShowCreate(false);
            }}
            className="rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-300"
          >
            {showTemplates ? "Close Templates" : "Templates"}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowCreate(!showCreate);
              if (showTemplates) setShowTemplates(false);
            }}
            className="rounded-md border border-dashed border-zinc-700 px-4 py-2 text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-300"
          >
            {showCreate ? "Cancel" : "+ Schedule Meeting"}
          </button>
        </div>
      </div>

      {/* Template Manager */}
      {showTemplates && (
        <TemplateManager
          templates={templates}
          companyId={companyId}
        />
      )}

      {/* Create Meeting Form */}
      {showCreate && (
        <CreateMeetingForm
          templates={templates}
          companyId={companyId}
          onCreated={() => setShowCreate(false)}
        />
      )}

      {meetings.length === 0 && !showCreate && !showTemplates ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 py-16">
          <p className="text-zinc-500">No meetings yet</p>
          <p className="mt-1 text-xs text-zinc-600">
            Schedule your first meeting to get started
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* In Progress */}
          {inProgress.map((meeting) => (
            <ActiveMeeting
              key={meeting.id}
              meeting={meeting}
              templates={templates}
              kpis={kpis}
              kpiEntries={kpiEntries}
              rocks={rocks}
              todos={todos}
              issues={issues}
            />
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
                      {new Date(meeting.date + "T00:00:00").toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {meeting.meetingType ?? "Level 10"} — Scheduled
                    </p>
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
                      {new Date(
                        meeting.date + "T00:00:00"
                      ).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-zinc-600">
                      {meeting.meetingType ?? "Level 10"}
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
                          style={{
                            width: `${(meeting.rating / 10) * 100}%`,
                          }}
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
// Create Meeting Form
// ---------------------------------------------------------------------------

function CreateMeetingForm({
  templates,
  companyId,
  onCreated,
}: {
  templates: TemplateData[];
  companyId: string;
  onCreated: () => void;
}) {
  const [meetingType, setMeetingType] = useState<MeetingType>("Level 10");
  const filteredTemplates = templates.filter(
    (t) => t.meetingType === meetingType
  );

  return (
    <form
      action={async (formData) => {
        await createMeeting(formData);
        onCreated();
      }}
      className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-4"
    >
      <input type="hidden" name="companyId" value={companyId} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs text-zinc-500">Date</label>
          <input
            name="date"
            type="date"
            required
            defaultValue={new Date().toISOString().split("T")[0]}
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-50 focus:border-zinc-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-zinc-500">
            Meeting Type
          </label>
          <select
            name="meetingType"
            value={meetingType}
            onChange={(e) => setMeetingType(e.target.value as MeetingType)}
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-50 focus:border-zinc-500 focus:outline-none"
          >
            {MEETING_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-zinc-500">
            Template
          </label>
          <select
            name="templateId"
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-50 focus:border-zinc-500 focus:outline-none"
          >
            <option value="">Default</option>
            {filteredTemplates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="rounded-md bg-zinc-50 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-200"
      >
        Schedule
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Template Manager
// ---------------------------------------------------------------------------

function TemplateManager({
  templates,
  companyId,
}: {
  templates: TemplateData[];
  companyId: string;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-200">
          Meeting Templates
        </h2>
        <button
          type="button"
          onClick={() => setShowAdd(!showAdd)}
          className="text-xs text-zinc-400 hover:text-zinc-300"
        >
          {showAdd ? "Cancel" : "+ Add Template"}
        </button>
      </div>

      {showAdd && (
        <TemplateForm
          companyId={companyId}
          onDone={() => setShowAdd(false)}
        />
      )}

      {templates.length === 0 && !showAdd && (
        <p className="text-xs text-zinc-600">
          No templates yet. The default Level 10 agenda will be used.
        </p>
      )}

      {templates.map((template) =>
        editingId === template.id ? (
          <TemplateForm
            key={template.id}
            companyId={companyId}
            existing={template}
            onDone={() => setEditingId(null)}
          />
        ) : (
          <div
            key={template.id}
            className="flex items-start justify-between rounded-lg border border-zinc-800 bg-zinc-950 p-3"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-zinc-200">
                {template.name}
              </p>
              <p className="text-xs text-zinc-500">
                {template.meetingType}
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {template.segments.map((seg, i) => (
                  <span
                    key={seg}
                    className="inline-flex items-center rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400"
                  >
                    {SEGMENT_META[seg]?.label ?? seg}
                    <span className="ml-1 text-zinc-600">
                      {template.segmentDurations[i]}m
                    </span>
                  </span>
                ))}
              </div>
            </div>
            <div className="ml-2 flex gap-1">
              <button
                type="button"
                onClick={() => setEditingId(template.id)}
                className="rounded px-2 py-1 text-xs text-zinc-500 hover:text-zinc-300"
              >
                Edit
              </button>
              <form action={deleteMeetingTemplate}>
                <input type="hidden" name="id" value={template.id} />
                <button
                  type="submit"
                  className="rounded px-2 py-1 text-xs text-red-500/60 hover:text-red-400"
                >
                  Delete
                </button>
              </form>
            </div>
          </div>
        )
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Template Form (create / edit)
// ---------------------------------------------------------------------------

function TemplateForm({
  companyId,
  existing,
  onDone,
}: {
  companyId: string;
  existing?: TemplateData;
  onDone: () => void;
}) {
  const defaultSegments = existing?.segments ?? [...DEFAULT_L10_SEGMENTS];
  const defaultDurations = existing?.segmentDurations ?? [
    ...DEFAULT_L10_DURATIONS,
  ];

  const [segments, setSegments] = useState<string[]>(defaultSegments);
  const [durations, setDurations] = useState<number[]>(
    defaultDurations.map(Number)
  );
  const [newSegKey, setNewSegKey] = useState("");

  const allSegmentKeys = Object.keys(SEGMENT_META);
  const availableKeys = allSegmentKeys.filter(
    (k) => !segments.includes(k)
  );

  function addSegment() {
    if (newSegKey && !segments.includes(newSegKey)) {
      setSegments([...segments, newSegKey]);
      setDurations([...durations, 5]);
      setNewSegKey("");
    }
  }

  function removeSegment(idx: number) {
    setSegments(segments.filter((_, i) => i !== idx));
    setDurations(durations.filter((_, i) => i !== idx));
  }

  function updateDuration(idx: number, val: number) {
    const next = [...durations];
    next[idx] = val;
    setDurations(next);
  }

  const action = existing ? updateMeetingTemplate : createMeetingTemplate;

  return (
    <form
      action={async (formData) => {
        await action(formData);
        onDone();
      }}
      className="rounded-lg border border-zinc-700 bg-zinc-950 p-3 space-y-3"
    >
      {existing && <input type="hidden" name="id" value={existing.id} />}
      <input type="hidden" name="companyId" value={companyId} />
      <input type="hidden" name="segments" value={JSON.stringify(segments)} />
      <input
        type="hidden"
        name="segmentDurations"
        value={JSON.stringify(durations)}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-zinc-500">
            Template Name
          </label>
          <input
            name="name"
            type="text"
            required
            defaultValue={existing?.name ?? ""}
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-50 focus:border-zinc-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-500">
            Meeting Type
          </label>
          <select
            name="meetingType"
            defaultValue={existing?.meetingType ?? "Level 10"}
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-50 focus:border-zinc-500 focus:outline-none"
          >
            {MEETING_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Segment list */}
      <div className="space-y-1">
        <p className="text-xs text-zinc-500">Segments</p>
        {segments.map((seg, idx) => (
          <div
            key={seg}
            className="flex items-center gap-2 rounded bg-zinc-900 px-2 py-1"
          >
            <span className="text-xs text-zinc-400 flex-1">
              {SEGMENT_META[seg]?.label ?? seg}
            </span>
            <input
              type="number"
              min={1}
              value={durations[idx]}
              onChange={(e) =>
                updateDuration(idx, parseInt(e.target.value, 10) || 1)
              }
              className="w-16 rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-xs text-zinc-50 focus:border-zinc-500 focus:outline-none"
            />
            <span className="text-[10px] text-zinc-600">min</span>
            <button
              type="button"
              onClick={() => removeSegment(idx)}
              className="text-xs text-red-500/60 hover:text-red-400"
            >
              x
            </button>
          </div>
        ))}

        {availableKeys.length > 0 && (
          <div className="flex gap-2 pt-1">
            <select
              value={newSegKey}
              onChange={(e) => setNewSegKey(e.target.value)}
              className="flex-1 rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-50 focus:border-zinc-500 focus:outline-none"
            >
              <option value="">Add segment...</option>
              {availableKeys.map((k) => (
                <option key={k} value={k}>
                  {SEGMENT_META[k]?.label ?? k}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addSegment}
              disabled={!newSegKey}
              className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-700 disabled:opacity-40"
            >
              Add
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-md bg-zinc-50 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-200"
        >
          {existing ? "Update" : "Create"} Template
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-md px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Countdown Timer
// ---------------------------------------------------------------------------

function CountdownTimer({
  segmentStartedAt,
  durationMinutes,
}: {
  segmentStartedAt: string;
  durationMinutes: number;
}) {
  const calcRemaining = useCallback(() => {
    const startMs = new Date(segmentStartedAt).getTime();
    const durationMs = durationMinutes * 60 * 1000;
    const elapsed = Date.now() - startMs;
    return Math.floor((durationMs - elapsed) / 1000);
  }, [segmentStartedAt, durationMinutes]);

  const [remaining, setRemaining] = useState(calcRemaining);

  useEffect(() => {
    setRemaining(calcRemaining());
    const interval = setInterval(() => {
      setRemaining(calcRemaining());
    }, 1000);
    return () => clearInterval(interval);
  }, [calcRemaining]);

  const isOvertime = remaining < 0;
  const isWarning = !isOvertime && remaining <= 60;
  const absSeconds = Math.abs(remaining);
  const mm = String(Math.floor(absSeconds / 60)).padStart(2, "0");
  const ss = String(absSeconds % 60).padStart(2, "0");

  return (
    <div
      className={cn(
        "text-3xl font-mono font-bold tabular-nums tracking-wider",
        isOvertime
          ? "text-red-500"
          : isWarning
            ? "text-yellow-400"
            : "text-emerald-400"
      )}
    >
      {isOvertime ? (
        <span>
          OVERTIME +{mm}:{ss}
        </span>
      ) : (
        <span>
          {mm}:{ss}
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Active Meeting Runner
// ---------------------------------------------------------------------------

function ActiveMeeting({
  meeting,
  templates,
  kpis,
  kpiEntries,
  rocks,
  todos,
  issues,
}: {
  meeting: MeetingData;
  templates: TemplateData[];
  kpis: KpiData[];
  kpiEntries: KpiEntryData[];
  rocks: RockData[];
  todos: TodoData[];
  issues: IssueData[];
}) {
  const [showRating, setShowRating] = useState(false);

  // Resolve template or use default L10
  const template = meeting.templateId
    ? templates.find((t) => t.id === meeting.templateId)
    : null;

  const segments: string[] = template
    ? template.segments
    : [...DEFAULT_L10_SEGMENTS];
  const segmentDurations: number[] = template
    ? template.segmentDurations
    : [...DEFAULT_L10_DURATIONS];

  const currentIdx = segments.findIndex(
    (s) => s === meeting.currentSegment
  );
  const currentSegment = meeting.currentSegment ?? segments[0];
  const currentDuration = currentIdx >= 0 ? segmentDurations[currentIdx] : 5;
  const nextSegment =
    currentIdx >= 0 && currentIdx < segments.length - 1
      ? segments[currentIdx + 1]
      : null;

  return (
    <div className="rounded-lg border border-emerald-500/20 bg-zinc-900 p-3 md:p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-400">
            Meeting In Progress
          </p>
          <p className="text-xs text-zinc-500">
            {meeting.meetingType ?? "Level 10"} —{" "}
            {new Date(meeting.date + "T00:00:00").toLocaleDateString(
              "en-US",
              { weekday: "long", month: "long", day: "numeric" }
            )}
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

      {/* Segment progress bar */}
      <div className="flex gap-1">
        {segments.map((seg, idx) => (
          <div
            key={seg}
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

      {/* Timer */}
      {meeting.segmentStartedAt && currentIdx >= 0 && (
        <div className="flex flex-col items-center gap-1 py-2">
          <p className="text-xs uppercase tracking-wider text-zinc-500">
            {SEGMENT_META[currentSegment]?.label ?? currentSegment}
          </p>
          <CountdownTimer
            segmentStartedAt={meeting.segmentStartedAt}
            durationMinutes={currentDuration}
          />
        </div>
      )}

      {/* Segment cards */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {segments.map((seg, idx) => {
          const isCurrent = seg === meeting.currentSegment;
          const isPast = idx < currentIdx;
          return (
            <div
              key={seg}
              className={cn(
                "flex-shrink-0 rounded-lg border p-2 text-center transition-colors min-w-[5rem]",
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
                {SEGMENT_META[seg]?.label ?? seg}
              </p>
              <p className="mt-0.5 text-[10px] text-zinc-600">
                {segmentDurations[idx]}m
              </p>
              {isCurrent && (
                <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </div>
          );
        })}
      </div>

      {/* Next Segment button */}
      {nextSegment && !showRating && (
        <form action={updateMeetingSegment} className="flex justify-end">
          <input type="hidden" name="id" value={meeting.id} />
          <input type="hidden" name="segment" value={nextSegment} />
          <button
            type="submit"
            className="rounded-md bg-zinc-800 px-4 py-1.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700"
          >
            Next: {SEGMENT_META[nextSegment]?.label ?? nextSegment}
          </button>
        </form>
      )}

      {/* Segment content */}
      {!showRating && currentSegment && (
        <SegmentContent
          segment={currentSegment}
          kpis={kpis}
          kpiEntries={kpiEntries}
          rocks={rocks}
          todos={todos}
          issues={issues}
        />
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
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-50 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none break-words"
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

// ---------------------------------------------------------------------------
// Segment Content — data pull-in per segment
// ---------------------------------------------------------------------------

function SegmentContent({
  segment,
  kpis,
  kpiEntries,
  rocks,
  todos,
  issues,
}: {
  segment: string;
  kpis: KpiData[];
  kpiEntries: KpiEntryData[];
  rocks: RockData[];
  todos: TodoData[];
  issues: IssueData[];
}) {
  switch (segment) {
    case "segue":
      return <SegueSection />;
    case "scorecard":
      return <ScorecardSection kpis={kpis} kpiEntries={kpiEntries} />;
    case "rocks":
      return <RocksSection rocks={rocks} />;
    case "headlines":
      return <HeadlinesSection />;
    case "todos":
      return <TodosSection todos={todos} />;
    case "ids":
      return <IDSSection issues={issues} />;
    case "conclude":
      return (
        <div className="rounded-lg bg-zinc-950 p-4">
          <p className="text-sm text-zinc-400">
            Recap new to-dos, communicate key decisions, and rate the meeting
            using the End Meeting button above.
          </p>
        </div>
      );
    default:
      return (
        <div className="rounded-lg bg-zinc-950 p-4">
          <p className="text-xs text-zinc-500">
            {SEGMENT_META[segment]?.description ?? "Custom segment"}
          </p>
        </div>
      );
  }
}

// ---------------------------------------------------------------------------
// Segment: Segue
// ---------------------------------------------------------------------------

function SegueSection() {
  return (
    <div className="rounded-lg bg-zinc-950 p-4 space-y-2">
      <h3 className="text-sm font-medium text-zinc-200">Segue</h3>
      <p className="text-xs text-zinc-500">
        Share good news — personal and professional bests
      </p>
      <textarea
        rows={3}
        className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none break-words"
        placeholder="Type good news and personal bests here..."
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Segment: Scorecard
// ---------------------------------------------------------------------------

function ScorecardSection({
  kpis,
  kpiEntries,
}: {
  kpis: KpiData[];
  kpiEntries: KpiEntryData[];
}) {
  return (
    <div className="rounded-lg bg-zinc-950 p-4 space-y-2">
      <h3 className="text-sm font-medium text-zinc-200">Scorecard</h3>
      {kpis.length === 0 ? (
        <p className="text-xs text-zinc-600">
          No KPIs found for the current quarter.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-xs text-zinc-500">
                <th className="pb-2 pr-4 font-medium">KPI</th>
                <th className="pb-2 pr-4 font-medium">Owner</th>
                <th className="pb-2 pr-4 font-medium text-right">Goal</th>
                <th className="pb-2 font-medium text-right">Actual</th>
              </tr>
            </thead>
            <tbody>
              {kpis.map((kpi) => {
                const entry = kpiEntries.find((e) => e.kpiId === kpi.id);
                const actual = entry?.actual;
                const goal = entry?.goal ?? kpi.goal;
                const hit =
                  actual != null && goal != null
                    ? Number(actual) >= Number(goal)
                    : null;
                return (
                  <tr
                    key={kpi.id}
                    className="border-b border-zinc-800/50"
                  >
                    <td className="py-2 pr-4 text-zinc-200">{kpi.name}</td>
                    <td className="py-2 pr-4 text-zinc-500">
                      {kpi.ownerName ?? "—"}
                    </td>
                    <td className="py-2 pr-4 text-right tabular-nums text-zinc-400">
                      {goal ?? "—"}
                    </td>
                    <td
                      className={cn(
                        "py-2 text-right tabular-nums",
                        hit === true
                          ? "text-emerald-400"
                          : hit === false
                            ? "text-red-400"
                            : "text-zinc-500"
                      )}
                    >
                      {actual ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Segment: Rocks
// ---------------------------------------------------------------------------

function RocksSection({ rocks }: { rocks: RockData[] }) {
  const statusColors: Record<string, string> = {
    on_track: "bg-emerald-500/20 text-emerald-400",
    off_track: "bg-red-500/20 text-red-400",
    done: "bg-blue-500/20 text-blue-400",
  };

  return (
    <div className="rounded-lg bg-zinc-950 p-4 space-y-2">
      <h3 className="text-sm font-medium text-zinc-200">Rock Review</h3>
      {rocks.length === 0 ? (
        <p className="text-xs text-zinc-600">No rocks for the current quarter.</p>
      ) : (
        <div className="space-y-1">
          {rocks.map((rock) => (
            <div
              key={rock.id}
              className="flex items-center justify-between rounded bg-zinc-900 px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm text-zinc-200 truncate">{rock.title}</p>
                <p className="text-xs text-zinc-500">
                  {rock.ownerName ?? "Unassigned"}
                </p>
              </div>
              <span
                className={cn(
                  "ml-2 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                  statusColors[rock.status] ??
                    "bg-zinc-800 text-zinc-400"
                )}
              >
                {rock.status.replace("_", " ")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Segment: Headlines
// ---------------------------------------------------------------------------

function HeadlinesSection() {
  return (
    <div className="rounded-lg bg-zinc-950 p-4 space-y-2">
      <h3 className="text-sm font-medium text-zinc-200">Headlines</h3>
      <p className="text-xs text-zinc-500">
        Customer and employee headlines — good and bad
      </p>
      <textarea
        rows={4}
        className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none break-words"
        placeholder="Type headlines here..."
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Segment: Todos
// ---------------------------------------------------------------------------

function TodosSection({ todos }: { todos: TodoData[] }) {
  const active = todos.filter((t) => !t.completed);

  return (
    <div className="rounded-lg bg-zinc-950 p-4 space-y-2">
      <h3 className="text-sm font-medium text-zinc-200">To-Do Review</h3>
      {active.length === 0 ? (
        <p className="text-xs text-zinc-600">All to-dos complete.</p>
      ) : (
        <div className="space-y-1">
          {active.map((todo) => (
            <form
              key={todo.id}
              action={toggleTodo}
              className="flex items-center gap-2 rounded bg-zinc-900 px-3 py-2"
            >
              <input type="hidden" name="id" value={todo.id} />
              <input type="hidden" name="completed" value="false" />
              <button
                type="submit"
                className="h-4 w-4 flex-shrink-0 rounded border border-zinc-600 hover:border-zinc-400"
                aria-label={`Complete ${todo.title}`}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-zinc-200 truncate">
                  {todo.title}
                </p>
                <p className="text-xs text-zinc-500">
                  {todo.ownerName ?? "Unassigned"}
                  {todo.dueDate && (
                    <span className="ml-2 text-zinc-600">
                      Due{" "}
                      {new Date(todo.dueDate + "T00:00:00").toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric" }
                      )}
                    </span>
                  )}
                </p>
              </div>
            </form>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Segment: IDS
// ---------------------------------------------------------------------------

const IDS_PHASES = [
  { key: "identify", label: "Identify" },
  { key: "discuss", label: "Discuss" },
  { key: "solve", label: "Solve" },
  { key: "resolved", label: "Resolved" },
] as const;

function IDSSection({ issues }: { issues: IssueData[] }) {
  const identifyIssues = issues.filter((i) => i.phase === "identify");
  const discussIssues = issues.filter((i) => i.phase === "discuss");
  const solveIssues = issues.filter((i) => i.phase === "solve");

  const phaseGroups = [
    { phase: "identify", label: "Identify", items: identifyIssues },
    { phase: "discuss", label: "Discuss", items: discussIssues },
    { phase: "solve", label: "Solve", items: solveIssues },
  ];

  return (
    <div className="rounded-lg bg-zinc-950 p-4 space-y-3">
      <h3 className="text-sm font-medium text-zinc-200">IDS</h3>
      <p className="text-xs text-zinc-500">
        Identify, Discuss, Solve — move issues through each phase
      </p>

      {phaseGroups.map((group) => (
        <div key={group.phase}>
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-500">
            {group.label} ({group.items.length})
          </p>
          {group.items.length === 0 ? (
            <p className="text-xs text-zinc-700 mb-2">None</p>
          ) : (
            <div className="space-y-1 mb-2">
              {group.items.map((issue) => {
                const nextPhases = IDS_PHASES.filter(
                  (p) => p.key !== issue.phase && p.key !== "resolved"
                );
                return (
                  <div
                    key={issue.id}
                    className="flex items-center justify-between rounded bg-zinc-900 px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-zinc-200 truncate">
                        {issue.title}
                      </p>
                      {issue.description && (
                        <p className="text-xs text-zinc-600 truncate">
                          {issue.description}
                        </p>
                      )}
                      <p className="text-xs text-zinc-500">
                        {issue.ownerName ?? "Unassigned"}
                      </p>
                    </div>
                    <div className="ml-2 flex gap-1">
                      {nextPhases.map((p) => (
                        <form key={p.key} action={moveIssuePhase}>
                          <input
                            type="hidden"
                            name="id"
                            value={issue.id}
                          />
                          <input
                            type="hidden"
                            name="phase"
                            value={p.key}
                          />
                          <button
                            type="submit"
                            className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300"
                          >
                            {p.label}
                          </button>
                        </form>
                      ))}
                      <form action={moveIssuePhase}>
                        <input
                          type="hidden"
                          name="id"
                          value={issue.id}
                        />
                        <input
                          type="hidden"
                          name="phase"
                          value="resolved"
                        />
                        <button
                          type="submit"
                          className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400 hover:bg-emerald-500/20"
                        >
                          Resolve
                        </button>
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
