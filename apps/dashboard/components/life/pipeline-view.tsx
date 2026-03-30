"use client";

import { useState } from "react";
import { cn } from "@cmd/ui";
import type { PipelineLevel } from "@cmd/types";
import {
  addPipelineEntry,
  updatePipelineEntry,
  updateProgress,
  deletePipelineEntry,
} from "../../app/actions/life";

interface Entry {
  id: string;
  level: string;
  title: string;
  description: string;
  progress: number;
  startDate: string;
  endDate: string;
  parentId: string | null;
}

const LEVELS: { key: PipelineLevel; label: string; indent: number }[] = [
  { key: "life_goal", label: "Life Goals", indent: 0 },
  { key: "annual_aim", label: "Annual Aims", indent: 1 },
  { key: "quarterly_objective", label: "Quarterly Objectives", indent: 2 },
  { key: "monthly_sprint", label: "Monthly Sprints", indent: 3 },
  { key: "weekly_focus", label: "Weekly Focuses", indent: 4 },
  { key: "daily_action", label: "Daily Actions", indent: 5 },
];

const LEVEL_COLORS: Record<string, string> = {
  life_goal: "border-violet-500/30 bg-violet-500/5",
  annual_aim: "border-blue-500/30 bg-blue-500/5",
  quarterly_objective: "border-cyan-500/30 bg-cyan-500/5",
  monthly_sprint: "border-emerald-500/30 bg-emerald-500/5",
  weekly_focus: "border-amber-500/30 bg-amber-500/5",
  daily_action: "border-zinc-500/30 bg-zinc-500/5",
};

const LEVEL_BAR: Record<string, string> = {
  life_goal: "bg-violet-500",
  annual_aim: "bg-blue-500",
  quarterly_objective: "bg-cyan-500",
  monthly_sprint: "bg-emerald-500",
  weekly_focus: "bg-amber-500",
  daily_action: "bg-zinc-500",
};

function getTodayString(): string {
  return new Date().toISOString().split("T")[0]!;
}

interface PipelineViewProps {
  entries: Entry[];
}

export function PipelineView({ entries }: PipelineViewProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState<string | null>(null);
  const [addParentId, setAddParentId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function getChildren(parentId: string | null, level: string): Entry[] {
    return entries.filter(
      (e) => e.parentId === parentId && e.level === level
    );
  }

  function buildTree(parentId: string | null, levelIndex: number): Entry[] {
    if (levelIndex >= LEVELS.length) return [];
    return entries.filter(
      (e) => e.parentId === parentId && e.level === LEVELS[levelIndex]!.key
    );
  }

  function renderEntry(entry: Entry, levelIndex: number) {
    const level = LEVELS[levelIndex]!;
    const childLevel = LEVELS[levelIndex + 1];
    const children = childLevel ? buildTree(entry.id, levelIndex + 1) : [];
    const hasChildren = children.length > 0;
    const isExpanded = expandedIds.has(entry.id);

    return (
      <div key={entry.id} className="group">
        <div
          className={cn(
            "flex flex-wrap items-center gap-2 md:gap-3 rounded-lg border p-2 md:p-3 transition-colors",
            LEVEL_COLORS[entry.level] ?? "border-zinc-800 bg-zinc-900"
          )}
        >
          {/* Expand toggle */}
          <button
            onClick={() => toggleExpand(entry.id)}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
          >
            {hasChildren || childLevel ? (isExpanded ? "-" : "+") : " "}
          </button>

          {/* Title & Description */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-zinc-200 truncate">{entry.title}</p>
            {entry.description && (
              <p className="text-xs text-zinc-500 truncate">{entry.description}</p>
            )}
            {/* Dates display */}
            <p className="text-xs text-zinc-600 mt-0.5">
              {entry.startDate} → {entry.endDate}
            </p>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-1.5 w-20 rounded-full bg-zinc-800">
              <div
                className={cn("h-1.5 rounded-full transition-all", LEVEL_BAR[entry.level] ?? "bg-zinc-500")}
                style={{ width: `${entry.progress}%` }}
              />
            </div>
            <span className="w-8 text-right text-xs text-zinc-500">{entry.progress}%</span>
          </div>

          {/* Progress input */}
          <form
            action={updateProgress}
            className="flex items-center gap-1 shrink-0"
          >
            <input type="hidden" name="id" value={entry.id} />
            <input
              type="number"
              name="progress"
              min={0}
              max={100}
              defaultValue={entry.progress}
              className="w-14 rounded border border-zinc-700 bg-zinc-950 px-1.5 py-0.5 text-xs text-zinc-300 focus:border-zinc-600 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
            >
              Set
            </button>
          </form>

          {/* Edit */}
          <button
            type="button"
            onClick={() => setEditingId(editingId === entry.id ? null : entry.id)}
            className="rounded px-1.5 py-0.5 text-xs text-zinc-600 hover:bg-zinc-800 hover:text-zinc-300"
          >
            Edit
          </button>

          {/* Delete */}
          <form action={deletePipelineEntry}>
            <input type="hidden" name="id" value={entry.id} />
            <button
              type="submit"
              className="rounded px-1.5 py-0.5 text-xs text-zinc-600 hover:bg-red-500/10 hover:text-red-400"
            >
              Del
            </button>
          </form>
        </div>

        {/* Inline edit form */}
        {editingId === entry.id && (
          <EditEntryForm entry={entry} onClose={() => setEditingId(null)} />
        )}

        {/* Children */}
        {isExpanded && (
          <div className="ml-3 md:ml-6 mt-1 space-y-1 border-l border-zinc-800 pl-2 md:pl-3">
            {children.map((child) => renderEntry(child, levelIndex + 1))}
            {childLevel && (
              <>
                {showAddForm === `${entry.id}-${childLevel.key}` ? (
                  <AddEntryForm
                    level={childLevel.key}
                    parentId={entry.id}
                    onClose={() => setShowAddForm(null)}
                  />
                ) : (
                  <button
                    onClick={() => setShowAddForm(`${entry.id}-${childLevel.key}`)}
                    className="rounded-lg border border-dashed border-zinc-800 px-3 py-1.5 text-xs text-zinc-600 hover:border-zinc-700 hover:text-zinc-400 transition-colors w-full text-left"
                  >
                    + Add {childLevel.label.slice(0, -1)}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  const topLevel = buildTree(null, 0);

  return (
    <div className="space-y-2">
      {topLevel.map((entry) => renderEntry(entry, 0))}

      {/* Add top-level form */}
      {showAddForm === "top" ? (
        <AddEntryForm
          level="life_goal"
          parentId={null}
          onClose={() => setShowAddForm(null)}
        />
      ) : (
        <button
          onClick={() => setShowAddForm("top")}
          className="w-full rounded-lg border border-dashed border-zinc-800 px-4 py-3 text-sm text-zinc-600 hover:border-zinc-700 hover:text-zinc-400 transition-colors"
        >
          + Add Life Goal
        </button>
      )}
    </div>
  );
}

function EditEntryForm({
  entry,
  onClose,
}: {
  entry: Entry;
  onClose: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);

  return (
    <form
      action={async (formData) => {
        setSubmitting(true);
        await updatePipelineEntry(formData);
        setSubmitting(false);
        onClose();
      }}
      className="mt-1 rounded-lg border border-zinc-700 bg-zinc-900 p-3 space-y-2"
    >
      <input type="hidden" name="id" value={entry.id} />

      <input
        name="title"
        required
        defaultValue={entry.title}
        placeholder="Title"
        className="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-300 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
      />
      <input
        name="description"
        defaultValue={entry.description}
        placeholder="Description (optional)"
        className="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-300 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
      />
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <label className="block text-xs text-zinc-500 mb-1">Start Date</label>
          <input
            type="date"
            name="startDate"
            defaultValue={entry.startDate}
            required
            className="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-300 focus:border-zinc-600 focus:outline-none"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-zinc-500 mb-1">End Date</label>
          <input
            type="date"
            name="endDate"
            defaultValue={entry.endDate}
            required
            className="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-300 focus:border-zinc-600 focus:outline-none"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-zinc-800 px-4 py-1.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700 disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded px-4 py-1.5 text-sm text-zinc-500 hover:text-zinc-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function AddEntryForm({
  level,
  parentId,
  onClose,
}: {
  level: PipelineLevel;
  parentId: string | null;
  onClose: () => void;
}) {
  const today = getTodayString();
  const [submitting, setSubmitting] = useState(false);

  return (
    <form
      action={async (formData) => {
        setSubmitting(true);
        await addPipelineEntry(formData);
        setSubmitting(false);
        onClose();
      }}
      className="rounded-lg border border-zinc-700 bg-zinc-900 p-3 space-y-2"
    >
      <input type="hidden" name="level" value={level} />
      {parentId && <input type="hidden" name="parentId" value={parentId} />}

      <input
        name="title"
        required
        placeholder="Title"
        className="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-300 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
      />
      <input
        name="description"
        placeholder="Description (optional)"
        className="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-300 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
      />
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="date"
          name="startDate"
          defaultValue={today}
          required
          className="flex-1 rounded border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-300 focus:border-zinc-600 focus:outline-none"
        />
        <input
          type="date"
          name="endDate"
          defaultValue={today}
          required
          className="flex-1 rounded border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-300 focus:border-zinc-600 focus:outline-none"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-zinc-800 px-4 py-1.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700 disabled:opacity-50"
        >
          {submitting ? "Adding..." : "Add"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded px-4 py-1.5 text-sm text-zinc-500 hover:text-zinc-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
