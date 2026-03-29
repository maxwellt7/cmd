"use client";

import { useState } from "react";
import { cn } from "@cmd/ui";
import {
  addRock,
  updateRockStatus,
  deleteRock,
  addMilestone,
  toggleMilestone,
  deleteMilestone,
} from "../../app/actions/eos";

// ---------------------------------------------------------------------------
// Add Rock Form
// ---------------------------------------------------------------------------

export function AddRockForm({ quarter }: { quarter: string }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-dashed border-zinc-700 px-4 py-2 text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-300"
      >
        + Add Rock
      </button>
    );
  }

  return (
    <form
      action={async (formData) => {
        await addRock(formData);
        setOpen(false);
      }}
      className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-3"
    >
      <input type="hidden" name="quarter" value={quarter} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="mb-1 block text-xs text-zinc-500">Rock Title</label>
          <input
            name="title"
            required
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-50 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
            placeholder="What needs to get done this quarter?"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-500">Owner</label>
          <input
            name="ownerName"
            required
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-50 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
            placeholder="Name"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-500">Due Date</label>
          <input
            name="dueDate"
            type="date"
            required
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-50 focus:border-zinc-500 focus:outline-none"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-md bg-zinc-50 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-200"
        >
          Add
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Rock Status Badge
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<string, string> = {
  on_track: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  off_track: "bg-red-500/10 text-red-400 border-red-500/20",
  done: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

export function RockStatusToggle({
  rockId,
  currentStatus,
}: {
  rockId: string;
  currentStatus: string;
}) {
  const statuses = ["on_track", "off_track", "done"] as const;
  const idx = statuses.indexOf(currentStatus as (typeof statuses)[number]);
  const next = statuses[(idx + 1) % statuses.length];

  return (
    <form action={updateRockStatus}>
      <input type="hidden" name="id" value={rockId} />
      <input type="hidden" name="status" value={next} />
      <button
        type="submit"
        className={cn(
          "rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
          STATUS_COLORS[currentStatus] ?? STATUS_COLORS.on_track
        )}
        title={`Click to change to ${next.replace("_", " ")}`}
      >
        {currentStatus.replace("_", " ")}
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Rock Card (with milestones)
// ---------------------------------------------------------------------------

interface RockCardProps {
  rock: {
    id: string;
    title: string;
    ownerName: string;
    status: string;
    quarter: string;
    dueDate: string;
  };
  milestoneList: {
    id: string;
    title: string;
    completed: boolean;
    sortOrder: number;
  }[];
}

export function RockCard({ rock, milestoneList }: RockCardProps) {
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);

  const completedCount = milestoneList.filter((m) => m.completed).length;
  const progress =
    milestoneList.length > 0
      ? Math.round((completedCount / milestoneList.length) * 100)
      : 0;

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-zinc-100">{rock.title}</h3>
          <p className="mt-0.5 text-xs text-zinc-500">
            {rock.ownerName} &middot; Due {rock.dueDate}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RockStatusToggle rockId={rock.id} currentStatus={rock.status} />
          <form action={deleteRock}>
            <input type="hidden" name="id" value={rock.id} />
            <button
              type="submit"
              className="text-xs text-zinc-600 hover:text-red-400"
            >
              Delete
            </button>
          </form>
        </div>
      </div>

      {/* Progress bar */}
      {milestoneList.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>
              {completedCount}/{milestoneList.length} milestones
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-zinc-800">
            <div
              className="h-1.5 rounded-full bg-emerald-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Milestones */}
      <div className="space-y-1">
        {milestoneList.map((ms) => (
          <div
            key={ms.id}
            className="flex items-center justify-between gap-2 rounded px-2 py-1 hover:bg-zinc-800/50"
          >
            <form action={toggleMilestone} className="flex items-center gap-2 min-w-0 flex-1">
              <input type="hidden" name="id" value={ms.id} />
              <input type="hidden" name="completed" value={String(ms.completed)} />
              <button
                type="submit"
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded border text-xs transition-colors",
                  ms.completed
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-zinc-700 hover:border-zinc-500"
                )}
              >
                {ms.completed ? "\u2713" : ""}
              </button>
              <span
                className={cn(
                  "truncate text-sm",
                  ms.completed ? "text-zinc-500 line-through" : "text-zinc-300"
                )}
              >
                {ms.title}
              </span>
            </form>
            <form action={deleteMilestone}>
              <input type="hidden" name="id" value={ms.id} />
              <button
                type="submit"
                className="text-xs text-zinc-700 hover:text-red-400"
              >
                x
              </button>
            </form>
          </div>
        ))}
      </div>

      {/* Add milestone */}
      {showMilestoneForm ? (
        <form
          action={async (formData) => {
            await addMilestone(formData);
            setShowMilestoneForm(false);
          }}
          className="flex items-center gap-2"
        >
          <input type="hidden" name="rockId" value={rock.id} />
          <input
            name="title"
            required
            autoFocus
            className="flex-1 rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-zinc-50 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
            placeholder="Milestone title"
          />
          <button
            type="submit"
            className="rounded bg-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-600"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setShowMilestoneForm(false)}
            className="text-xs text-zinc-500 hover:text-zinc-300"
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowMilestoneForm(true)}
          className="text-xs text-zinc-600 hover:text-zinc-400"
        >
          + Add milestone
        </button>
      )}
    </div>
  );
}
