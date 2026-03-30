"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@cmd/ui";
import {
  addPriority,
  updatePriority,
  togglePriority,
  deletePriority,
} from "../../app/actions/life";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PriorityItem {
  id: string;
  title: string;
  pillar: string;
  date: string;
  completed: boolean;
  sortOrder: number;
  category: string;
  domain: string | null;
  priority: string | null;
  startTime: string | null;
  endTime: string | null;
  notes: string | null;
}

interface WeeklyViewProps {
  priorities: PriorityItem[];
  currentDate: string; // YYYY-MM-DD (Monday of the week)
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DAYS = ["M", "T", "W", "T", "F", "S", "S"] as const;

const DOMAINS = [
  { value: "mind", label: "Mind", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { value: "body", label: "Body", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  { value: "being", label: "Being", color: "bg-violet-500/20 text-violet-400 border-violet-500/30" },
  { value: "balance", label: "Balance", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
] as const;

const PILLARS = [
  { value: "profit", label: "Profit" },
  { value: "power", label: "Power" },
  { value: "purpose", label: "Purpose" },
  { value: "presence", label: "Presence" },
] as const;

const PRIORITY_LEVELS = [
  { value: "urgent_important", label: "Urgent & Important", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  { value: "important", label: "Important", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  { value: "urgent", label: "Urgent", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  { value: "normal", label: "Normal", color: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30" },
] as const;

function getDomainBadge(domain: string | null) {
  const d = DOMAINS.find((x) => x.value === domain);
  if (!d) return null;
  return d;
}

function getPriorityBadge(priority: string | null) {
  const p = PRIORITY_LEVELS.find((x) => x.value === priority);
  if (!p) return null;
  return p;
}

function formatWeekRange(mondayStr: string): string {
  const monday = new Date(mondayStr + "T00:00:00");
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  const fmtM = `${String(monday.getMonth() + 1).padStart(2, "0")}.${String(monday.getDate()).padStart(2, "0")}`;
  const fmtS = `${String(sunday.getMonth() + 1).padStart(2, "0")}.${String(sunday.getDate()).padStart(2, "0")}`;
  return `${fmtM} - ${fmtS}`;
}

function getDateForDay(mondayStr: string, dayIndex: number): string {
  const d = new Date(mondayStr + "T00:00:00");
  d.setDate(d.getDate() + dayIndex);
  return d.toISOString().split("T")[0]!;
}

// ---------------------------------------------------------------------------
// Task Card
// ---------------------------------------------------------------------------

function TaskCard({
  item,
  onExpand,
  isExpanded,
}: {
  item: PriorityItem;
  onExpand: (id: string | null) => void;
  isExpanded: boolean;
}) {
  const domainBadge = getDomainBadge(item.domain);
  const priorityBadge = getPriorityBadge(item.priority);

  return (
    <div
      className={cn(
        "rounded-lg border border-zinc-800 bg-zinc-900 transition-colors hover:border-zinc-700 cursor-pointer",
        isExpanded && "border-zinc-700"
      )}
    >
      <div
        className="px-3 py-2.5"
        onClick={() => onExpand(isExpanded ? null : item.id)}
      >
        <div className="flex items-start gap-2">
          <form
            action={togglePriority}
            onClick={(e) => e.stopPropagation()}
          >
            <input type="hidden" name="id" value={item.id} />
            <input type="hidden" name="completed" value={String(item.completed)} />
            <button
              type="submit"
              className={cn(
                "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                item.completed
                  ? "border-emerald-500 bg-emerald-500 text-zinc-950"
                  : "border-zinc-600 hover:border-zinc-400"
              )}
            >
              {item.completed && (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2.5 6L5 8.5L9.5 3.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </form>
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "text-sm break-words",
                item.completed ? "text-zinc-600 line-through" : "text-zinc-200"
              )}
            >
              {item.title}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {domainBadge && (
                <span
                  className={cn(
                    "inline-flex rounded border px-1.5 py-0.5 text-[10px] font-medium",
                    domainBadge.color
                  )}
                >
                  {domainBadge.label}
                </span>
              )}
              {priorityBadge && (
                <span
                  className={cn(
                    "inline-flex rounded border px-1.5 py-0.5 text-[10px] font-medium",
                    priorityBadge.color
                  )}
                >
                  {priorityBadge.label}
                </span>
              )}
              {item.startTime && (
                <span className="text-[10px] text-zinc-500">
                  {item.startTime}
                  {item.endTime ? ` - ${item.endTime}` : ""}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Task Detail (inline editor)
// ---------------------------------------------------------------------------

function TaskDetail({
  item,
  onClose,
}: {
  item: PriorityItem;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(item.title);
  const [notes, setNotes] = useState(item.notes ?? "");
  const [domain, setDomain] = useState(item.domain ?? "");
  const [pillar, setPillar] = useState(item.pillar);
  const [priorityLevel, setPriorityLevel] = useState(item.priority ?? "");
  const [date, setDate] = useState(item.date);
  const [startTime, setStartTime] = useState(item.startTime ?? "");
  const [endTime, setEndTime] = useState(item.endTime ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const fd = new FormData();
    fd.set("id", item.id);
    fd.set("title", title);
    fd.set("pillar", pillar);
    fd.set("date", date);
    fd.set("category", item.category);
    fd.set("domain", domain);
    fd.set("priority_level", priorityLevel);
    fd.set("startTime", startTime);
    fd.set("endTime", endTime);
    fd.set("notes", notes);
    await updatePriority(fd);
    setSaving(false);
    onClose();
  }

  async function handleDelete() {
    const fd = new FormData();
    fd.set("id", item.id);
    await deletePriority(fd);
    onClose();
  }

  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-3 md:p-4 space-y-3">
      {/* Title */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
        placeholder="Task title..."
      />

      {/* Notes */}
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        className="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none resize-y"
        placeholder="Notes..."
      />

      {/* Domain */}
      <div className="space-y-1">
        <label className="text-xs text-zinc-500">Domain</label>
        <div className="flex flex-wrap gap-1.5">
          {DOMAINS.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => setDomain(domain === d.value ? "" : d.value)}
              className={cn(
                "rounded border px-2.5 py-1 text-xs font-medium transition-colors",
                domain === d.value ? d.color : "border-zinc-800 text-zinc-600 hover:text-zinc-400"
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pillar */}
      <div className="space-y-1">
        <label className="text-xs text-zinc-500">Pillar</label>
        <div className="flex flex-wrap gap-1.5">
          {PILLARS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPillar(p.value)}
              className={cn(
                "rounded border px-2.5 py-1 text-xs font-medium transition-colors",
                pillar === p.value
                  ? "border-zinc-600 bg-zinc-800 text-zinc-200"
                  : "border-zinc-800 text-zinc-600 hover:text-zinc-400"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Priority */}
      <div className="space-y-1">
        <label className="text-xs text-zinc-500">Priority</label>
        <div className="flex flex-wrap gap-1.5">
          {PRIORITY_LEVELS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPriorityLevel(priorityLevel === p.value ? "" : p.value)}
              className={cn(
                "rounded border px-2.5 py-1 text-xs font-medium transition-colors",
                priorityLevel === p.value ? p.color : "border-zinc-800 text-zinc-600 hover:text-zinc-400"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date + Times */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="space-y-1">
          <label className="text-xs text-zinc-500">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-300 focus:border-zinc-600 focus:outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-500">Start Time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full rounded border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-300 focus:border-zinc-600 focus:outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-500">End Time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full rounded border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-300 focus:border-zinc-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleSave}
          disabled={saving || !title.trim()}
          className="rounded bg-zinc-800 px-4 py-1.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={onClose}
          className="rounded px-4 py-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          className="ml-auto rounded px-3 py-1.5 text-sm text-red-500/70 hover:text-red-400 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quick-add form
// ---------------------------------------------------------------------------

function QuickAdd({
  category,
  date,
  onClose,
}: {
  category: "hit_list" | "do_list";
  date: string;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [pillar, setPillar] = useState("profit");
  const [domain, setDomain] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!title.trim()) return;
    setSubmitting(true);
    const fd = new FormData();
    fd.set("title", title.trim());
    fd.set("pillar", pillar);
    fd.set("date", date);
    fd.set("category", category);
    if (domain) fd.set("domain", domain);
    await addPriority(fd);
    setTitle("");
    setSubmitting(false);
    onClose();
  }

  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-3 space-y-2.5">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title..."
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit();
          }
          if (e.key === "Escape") onClose();
        }}
        className="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
      />
      <div className="flex flex-wrap gap-1.5">
        {PILLARS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => setPillar(p.value)}
            className={cn(
              "rounded border px-2 py-0.5 text-xs font-medium transition-colors",
              pillar === p.value
                ? "border-zinc-600 bg-zinc-800 text-zinc-200"
                : "border-zinc-800 text-zinc-600 hover:text-zinc-400"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {DOMAINS.map((d) => (
          <button
            key={d.value}
            type="button"
            onClick={() => setDomain(domain === d.value ? "" : d.value)}
            className={cn(
              "rounded border px-2 py-0.5 text-xs font-medium transition-colors",
              domain === d.value ? d.color : "border-zinc-800 text-zinc-600 hover:text-zinc-400"
            )}
          >
            {d.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={submitting || !title.trim()}
          className="rounded bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? "Adding..." : "Add"}
        </button>
        <button
          onClick={onClose}
          className="rounded px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Column component
// ---------------------------------------------------------------------------

function TaskColumn({
  heading,
  accentClass,
  items,
  expandedId,
  onExpand,
  showAdd,
  category,
  date,
}: {
  heading: string;
  accentClass: string;
  items: PriorityItem[];
  expandedId: string | null;
  onExpand: (id: string | null) => void;
  showAdd?: "hit_list" | "do_list";
  category?: "hit_list" | "do_list";
  date: string;
}) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-2">
        <h3 className={cn("text-xs font-semibold uppercase tracking-wide", accentClass)}>
          {heading}
          <span className="ml-1.5 text-zinc-600">({items.length})</span>
        </h3>
        {showAdd && (
          <button
            onClick={() => setAdding(true)}
            className="rounded p-1 text-zinc-600 hover:text-zinc-300 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      <div className="space-y-2">
        {items.map((item) =>
          expandedId === item.id ? (
            <TaskDetail key={item.id} item={item} onClose={() => onExpand(null)} />
          ) : (
            <TaskCard
              key={item.id}
              item={item}
              onExpand={onExpand}
              isExpanded={false}
            />
          )
        )}

        {items.length === 0 && !adding && (
          <div className="rounded-lg border border-dashed border-zinc-800 py-6 text-center">
            <p className="text-xs text-zinc-600">No tasks</p>
          </div>
        )}

        {adding && showAdd && category && (
          <QuickAdd
            category={category}
            date={date}
            onClose={() => setAdding(false)}
          />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main WeeklyView
// ---------------------------------------------------------------------------

export function WeeklyView({ priorities, currentDate }: WeeklyViewProps) {
  const router = useRouter();
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(() => {
    // Default to today's day-of-week if it falls within this week, otherwise Monday
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
    for (let i = 0; i < 7; i++) {
      if (getDateForDay(currentDate, i) === today) return i;
    }
    return 0;
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const selectedDate = getDateForDay(currentDate, selectedDayIndex);

  // Navigation
  function navigateWeek(direction: -1 | 1) {
    const d = new Date(currentDate + "T00:00:00");
    d.setDate(d.getDate() + direction * 7);
    const newWeek = d.toISOString().split("T")[0]!;
    router.push(`/life/weekly?week=${newWeek}`);
  }

  // Filter priorities for selected day
  const dayPriorities = priorities.filter((p) => p.date === selectedDate);
  const hitList = dayPriorities.filter((p) => p.category === "hit_list" && !p.completed);
  const doList = dayPriorities.filter((p) => p.category === "do_list" && !p.completed);
  const achieved = dayPriorities.filter((p) => p.completed);

  // Day dot counts for the selector
  const dayCounts = DAYS.map((_, i) => {
    const d = getDateForDay(currentDate, i);
    const dayItems = priorities.filter((p) => p.date === d);
    const done = dayItems.filter((p) => p.completed).length;
    return { total: dayItems.length, done };
  });

  return (
    <div className="space-y-4">
      {/* Header: Week range + navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateWeek(-1)}
          className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h2 className="text-base md:text-lg font-bold tracking-wide text-zinc-200">
          {formatWeekRange(currentDate)}
        </h2>
        <button
          onClick={() => navigateWeek(1)}
          className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Day selector */}
      <div className="flex gap-1 md:gap-1.5">
        {DAYS.map((label, i) => {
          const isSelected = i === selectedDayIndex;
          const dateStr = getDateForDay(currentDate, i);
          const dayNum = new Date(dateStr + "T00:00:00").getDate();
          const counts = dayCounts[i]!;

          return (
            <button
              key={i}
              onClick={() => {
                setSelectedDayIndex(i);
                setExpandedId(null);
              }}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-lg py-2 transition-colors",
                isSelected
                  ? "bg-zinc-50 text-zinc-950"
                  : "bg-zinc-900 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
              )}
            >
              <span className="text-[10px] font-semibold uppercase">{label}</span>
              <span className={cn("text-sm font-bold", isSelected ? "text-zinc-950" : "text-zinc-300")}>
                {dayNum}
              </span>
              {counts.total > 0 && (
                <div className="flex gap-0.5">
                  <span
                    className={cn(
                      "h-1 w-1 rounded-full",
                      counts.done === counts.total
                        ? "bg-emerald-500"
                        : counts.done > 0
                        ? "bg-amber-500"
                        : isSelected
                        ? "bg-zinc-400"
                        : "bg-zinc-600"
                    )}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Columns */}
      <div className="flex flex-col gap-4 md:flex-row md:gap-5">
        <TaskColumn
          heading="Hit List"
          accentClass="text-emerald-400"
          items={hitList}
          expandedId={expandedId}
          onExpand={setExpandedId}
          showAdd="hit_list"
          category="hit_list"
          date={selectedDate}
        />
        <TaskColumn
          heading="Do List"
          accentClass="text-blue-400"
          items={doList}
          expandedId={expandedId}
          onExpand={setExpandedId}
          showAdd="do_list"
          category="do_list"
          date={selectedDate}
        />
        <TaskColumn
          heading="Achieved"
          accentClass="text-zinc-400"
          items={achieved}
          expandedId={expandedId}
          onExpand={setExpandedId}
          date={selectedDate}
        />
      </div>
    </div>
  );
}
