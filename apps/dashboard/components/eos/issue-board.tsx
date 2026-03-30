"use client";

import { useState } from "react";
import { cn } from "@cmd/ui";
import { addIssue, updateIssue, deleteIssue, moveIssuePhase } from "../../app/actions/eos";

const PHASES = [
  { key: "identify", label: "Identify", color: "border-t-amber-500" },
  { key: "discuss", label: "Discuss", color: "border-t-blue-500" },
  { key: "solve", label: "Solve", color: "border-t-emerald-500" },
  { key: "resolved", label: "Resolved", color: "border-t-zinc-600" },
] as const;

type Phase = (typeof PHASES)[number]["key"];

interface IssueItem {
  id: string;
  title: string;
  description: string;
  category: string;
  phase: string;
  ownerName: string | null;
  priority: number;
  createdAt: string;
}

export function IssueBoard({
  issues,
  companyId,
}: {
  issues: IssueItem[];
  companyId: string;
}) {
  const [showAddForm, setShowAddForm] = useState(false);

  const byPhase = (phase: string) =>
    issues
      .filter((i) => i.phase === phase)
      .sort((a, b) => b.priority - a.priority);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Issues</h1>
          <p className="text-sm text-zinc-500">
            Identify, Discuss, Solve
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="rounded-md border border-dashed border-zinc-700 px-4 py-2 text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-300"
        >
          {showAddForm ? "Cancel" : "+ Add Issue"}
        </button>
      </div>

      {showAddForm && (
        <form
          action={async (formData) => {
            await addIssue(formData);
            setShowAddForm(false);
          }}
          className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 md:p-4 space-y-3"
        >
          <input type="hidden" name="companyId" value={companyId} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="mb-1 block text-xs text-zinc-500">Title</label>
              <input
                name="title"
                required
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-50 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
                placeholder="What's the issue?"
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-xs text-zinc-500">
                Description
              </label>
              <textarea
                name="description"
                rows={2}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-50 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
                placeholder="Details..."
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Owner</label>
              <input
                name="ownerName"
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-50 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
                placeholder="Name"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">
                Category
              </label>
              <select
                name="category"
                defaultValue="short_term"
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-50 focus:border-zinc-500 focus:outline-none"
              >
                <option value="short_term">Short Term</option>
                <option value="long_term">Long Term</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">
                Priority (0-10)
              </label>
              <input
                name="priority"
                type="number"
                min="0"
                max="10"
                defaultValue="0"
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-50 focus:border-zinc-500 focus:outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            className="rounded-md bg-zinc-50 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-200"
          >
            Create Issue
          </button>
        </form>
      )}

      {issues.length === 0 && !showAddForm ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 py-16">
          <p className="text-zinc-500">No issues yet</p>
          <p className="mt-1 text-xs text-zinc-600">
            Create issues to track problems through the IDS process
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {PHASES.map((phase) => {
            const phaseIssues = byPhase(phase.key);
            return (
              <div key={phase.key} className="space-y-2">
                <div
                  className={cn(
                    "rounded-t-lg border-t-2 bg-zinc-900/50 px-3 py-2",
                    phase.color
                  )}
                >
                  <h3 className="text-sm font-medium text-zinc-300">
                    {phase.label}{" "}
                    <span className="text-zinc-600">({phaseIssues.length})</span>
                  </h3>
                </div>
                <div className="space-y-2">
                  {phaseIssues.map((issue) => (
                    <IssueCard
                      key={issue.id}
                      issue={issue}
                      currentPhase={phase.key}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Issue Card — expandable / editable
// ---------------------------------------------------------------------------

function IssueCard({
  issue,
  currentPhase,
}: {
  issue: IssueItem;
  currentPhase: Phase;
}) {
  const [expanded, setExpanded] = useState(false);
  const phaseOrder: Phase[] = ["identify", "discuss", "solve", "resolved"];
  const idx = phaseOrder.indexOf(currentPhase);
  const nextPhase = idx < phaseOrder.length - 1 ? phaseOrder[idx + 1] : null;
  const prevPhase = idx > 0 ? phaseOrder[idx - 1] : null;

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 md:p-3 space-y-2">
      {/* Collapsed header — click to expand */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start justify-between gap-2 text-left"
      >
        <h4 className="text-sm font-medium text-zinc-200">{issue.title}</h4>
        <div className="flex shrink-0 items-center gap-1.5">
          {issue.priority > 0 && (
            <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs tabular-nums text-zinc-400">
              P{issue.priority}
            </span>
          )}
          <svg
            className={cn("h-3 w-3 text-zinc-600 transition-transform", expanded && "rotate-180")}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Collapsed preview */}
      {!expanded && issue.description && (
        <p className="text-xs text-zinc-500 line-clamp-2">{issue.description}</p>
      )}

      {/* Expanded edit form */}
      {expanded && (
        <form
          action={async (formData) => {
            await updateIssue(formData);
            setExpanded(false);
          }}
          className="space-y-2 pt-1"
        >
          <input type="hidden" name="id" value={issue.id} />
          <div>
            <label className="mb-1 block text-xs text-zinc-500">Title</label>
            <input
              name="title"
              defaultValue={issue.title}
              required
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-sm text-zinc-50 focus:border-zinc-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-500">Description</label>
            <textarea
              name="description"
              defaultValue={issue.description}
              rows={3}
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-sm text-zinc-50 focus:border-zinc-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Owner</label>
              <input
                name="ownerName"
                defaultValue={issue.ownerName ?? ""}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-sm text-zinc-50 focus:border-zinc-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Category</label>
              <select
                name="category"
                defaultValue={issue.category}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-sm text-zinc-50 focus:border-zinc-500 focus:outline-none"
              >
                <option value="short_term">Short Term</option>
                <option value="long_term">Long Term</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-500">Priority (0-10)</label>
            <input
              name="priority"
              type="number"
              min="0"
              max="10"
              defaultValue={issue.priority}
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-sm text-zinc-50 focus:border-zinc-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="rounded-md bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-900 hover:bg-zinc-200"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="rounded-md px-3 py-1 text-xs text-zinc-500 hover:text-zinc-300"
            >
              Close
            </button>
          </div>
        </form>
      )}

      {/* Footer: owner, category, phase controls */}
      {!expanded && (
        <>
          <div className="flex items-center justify-between text-xs text-zinc-600">
            <span>{issue.ownerName ?? "Unassigned"}</span>
            <span
              className={cn(
                "rounded px-1.5 py-0.5",
                issue.category === "long_term"
                  ? "bg-purple-500/10 text-purple-400"
                  : "bg-zinc-800 text-zinc-400"
              )}
            >
              {issue.category === "long_term" ? "Long" : "Short"}
            </span>
          </div>
          <div className="flex items-center gap-1 pt-1">
            {prevPhase && (
              <form action={moveIssuePhase}>
                <input type="hidden" name="id" value={issue.id} />
                <input type="hidden" name="phase" value={prevPhase} />
                <button
                  type="submit"
                  className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300"
                >
                  &larr;
                </button>
              </form>
            )}
            {nextPhase && (
              <form action={moveIssuePhase}>
                <input type="hidden" name="id" value={issue.id} />
                <input type="hidden" name="phase" value={nextPhase} />
                <button
                  type="submit"
                  className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300"
                >
                  &rarr;
                </button>
              </form>
            )}
            <form action={deleteIssue} className="ml-auto">
              <input type="hidden" name="id" value={issue.id} />
              <button
                type="submit"
                className="text-xs text-zinc-700 hover:text-red-400"
              >
                Delete
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
