"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@cmd/ui";
import type { PillarKey } from "@cmd/types";
import { addPriority, togglePriority, deletePriority } from "../../app/actions/life";

const PILLAR_META: Record<PillarKey, { label: string; color: string; dot: string }> = {
  profit: { label: "Profit", color: "text-emerald-400", dot: "bg-emerald-400" },
  power: { label: "Power", color: "text-blue-400", dot: "bg-blue-400" },
  purpose: { label: "Purpose", color: "text-violet-400", dot: "bg-violet-400" },
  presence: { label: "Presence", color: "text-amber-400", dot: "bg-amber-400" },
};

const ALL_PILLARS: PillarKey[] = ["profit", "power", "purpose", "presence"];

interface PriorityItem {
  id: string;
  title: string;
  pillar: string;
  date: string;
  completed: boolean;
  sortOrder: number;
}

interface DailyAction {
  id: string;
  title: string;
  description: string;
  progress: number;
  startDate: string;
  endDate: string;
}

interface TodayViewProps {
  priorities: PriorityItem[];
  dailyActions?: DailyAction[];
  currentDate: string;
}

export function TodayView({ priorities, dailyActions = [], currentDate }: TodayViewProps) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPillar, setNewPillar] = useState<PillarKey>("profit");
  const [submitting, setSubmitting] = useState(false);

  const completed = priorities.filter((p) => p.completed).length;
  const total = priorities.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Group by pillar
  const grouped = new Map<string, PriorityItem[]>();
  for (const p of priorities) {
    const list = grouped.get(p.pillar) ?? [];
    list.push(p);
    grouped.set(p.pillar, list);
  }

  function handleDateChange(newDate: string) {
    router.push(`/life/today?date=${newDate}`);
  }

  async function handleAdd() {
    if (!newTitle.trim()) return;
    setSubmitting(true);
    const fd = new FormData();
    fd.set("title", newTitle.trim());
    fd.set("pillar", newPillar);
    fd.set("date", currentDate);
    await addPriority(fd);
    setNewTitle("");
    setShowAdd(false);
    setSubmitting(false);
  }

  return (
    <div className="space-y-4">
      {/* Date picker */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-3">
        <input
          type="date"
          value={currentDate}
          onChange={(e) => handleDateChange(e.target.value)}
          className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 focus:border-zinc-600 focus:outline-none"
        />
        <button
          onClick={() => handleDateChange(new Date().toISOString().split("T")[0]!)}
          className="rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-colors"
        >
          Today
        </button>
      </div>

      {/* Completion bar */}
      {total > 0 && (
        <div className="flex items-center gap-2 md:gap-3">
          <div className="h-2.5 flex-1 rounded-full bg-zinc-800">
            <div
              className="h-2.5 rounded-full bg-emerald-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-sm font-medium text-zinc-400">
            {completed}/{total} ({pct}%)
          </span>
        </div>
      )}

      {/* Daily Actions from Pipeline */}
      {dailyActions.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-zinc-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Daily Actions (from Pipeline)
            </h3>
          </div>
          {dailyActions.map((action) => (
            <div
              key={action.id}
              className="flex items-center gap-2 md:gap-3 rounded-lg border border-zinc-800 bg-zinc-900 px-3 md:px-4 py-2.5"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-md border-2 border-zinc-700 shrink-0">
                {action.progress >= 100 && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400" />
                  </svg>
                )}
              </div>
              <span className={cn("flex-1 text-sm", action.progress >= 100 ? "text-zinc-600 line-through" : "text-zinc-200")}>
                {action.title}
              </span>
              <span className="text-xs text-zinc-600">{action.progress}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Priority groups */}
      {ALL_PILLARS.map((pillar) => {
        const items = grouped.get(pillar);
        if (!items || items.length === 0) return null;
        const meta = PILLAR_META[pillar];
        return (
          <div key={pillar} className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full", meta.dot)} />
              <h3 className={cn("text-xs font-semibold uppercase tracking-wide", meta.color)}>
                {meta.label}
              </h3>
            </div>
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 md:gap-3 rounded-lg border border-zinc-800 bg-zinc-900 px-3 md:px-4 py-2.5 group"
              >
                <form action={togglePriority}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="completed" value={String(item.completed)} />
                  <button
                    type="submit"
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-md border-2 transition-colors",
                      item.completed
                        ? "border-emerald-500 bg-emerald-500 text-zinc-950"
                        : "border-zinc-600 hover:border-zinc-400"
                    )}
                  >
                    {item.completed && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                </form>
                <span
                  className={cn(
                    "flex-1 text-sm",
                    item.completed ? "text-zinc-600 line-through" : "text-zinc-200"
                  )}
                >
                  {item.title}
                </span>
                <form action={deletePriority}>
                  <input type="hidden" name="id" value={item.id} />
                  <button
                    type="submit"
                    className="rounded px-1.5 py-0.5 text-xs text-zinc-700 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
                  >
                    Remove
                  </button>
                </form>
              </div>
            ))}
          </div>
        );
      })}

      {/* Ungrouped (if pillar doesn't match known ones) */}
      {priorities.filter((p) => !ALL_PILLARS.includes(p.pillar as PillarKey)).length > 0 && (
        <div className="space-y-1.5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Other</h3>
          {priorities
            .filter((p) => !ALL_PILLARS.includes(p.pillar as PillarKey))
            .map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5"
              >
                <form action={togglePriority}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="completed" value={String(item.completed)} />
                  <button
                    type="submit"
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-md border-2",
                      item.completed
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-zinc-600"
                    )}
                  >
                    {item.completed && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                </form>
                <span className={cn("flex-1 text-sm", item.completed && "text-zinc-600 line-through")}>
                  {item.title}
                </span>
              </div>
            ))}
        </div>
      )}

      {/* Empty state */}
      {total === 0 && !showAdd && (
        <div className="rounded-xl border border-dashed border-zinc-800 py-8 text-center">
          <p className="text-sm text-zinc-500">No priorities for this date.</p>
        </div>
      )}

      {/* Add new */}
      {showAdd ? (
        <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4 space-y-3">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Priority title..."
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
            className="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
          />
          <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-500">Pillar:</label>
            <div className="flex gap-1">
              {ALL_PILLARS.map((p) => {
                const meta = PILLAR_META[p];
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setNewPillar(p)}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                      newPillar === p
                        ? cn(meta.color, "bg-zinc-800")
                        : "text-zinc-600 hover:text-zinc-400"
                    )}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={submitting || !newTitle.trim()}
              className="rounded bg-zinc-800 px-4 py-1.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700 disabled:opacity-50"
            >
              {submitting ? "Adding..." : "Add Priority"}
            </button>
            <button
              onClick={() => {
                setShowAdd(false);
                setNewTitle("");
              }}
              className="rounded px-4 py-1.5 text-sm text-zinc-500 hover:text-zinc-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full rounded-lg border border-dashed border-zinc-800 px-4 py-3 text-sm text-zinc-600 hover:border-zinc-700 hover:text-zinc-400 transition-colors"
        >
          + Add Priority
        </button>
      )}
    </div>
  );
}
