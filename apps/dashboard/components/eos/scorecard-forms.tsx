"use client";

import { useState } from "react";
import { cn } from "@cmd/ui";
import { addKpi, updateKpi, deleteKpi, upsertEntry } from "../../app/actions/eos";

// ---------------------------------------------------------------------------
// Add KPI Form
// ---------------------------------------------------------------------------

export function AddKpiForm({ quarter }: { quarter: string }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-dashed border-zinc-700 px-4 py-2 text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-300"
      >
        + Add KPI
      </button>
    );
  }

  return (
    <form
      action={async (formData) => {
        await addKpi(formData);
        setOpen(false);
      }}
      className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-3"
    >
      <input type="hidden" name="quarter" value={quarter} />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-zinc-500">KPI Name</label>
          <input
            name="name"
            required
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-50 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
            placeholder="Revenue, NPS, etc."
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
          <label className="mb-1 block text-xs text-zinc-500">Goal</label>
          <input
            name="goal"
            type="number"
            step="any"
            required
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-50 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
            placeholder="100"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-zinc-500">Unit</label>
          <select
            name="unit"
            defaultValue="#"
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-50 focus:border-zinc-500 focus:outline-none"
          >
            <option value="#">#</option>
            <option value="$">$</option>
            <option value="%">%</option>
            <option value="x">x</option>
          </select>
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
// Inline Entry Editor
// ---------------------------------------------------------------------------

interface EntryEditorProps {
  kpiId: string;
  entryId: string | null;
  weekStart: string;
  currentGoal: string;
  currentActual: string | null;
}

export function EntryEditor({
  kpiId,
  entryId,
  weekStart,
  currentGoal,
  currentActual,
}: EntryEditorProps) {
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className={cn(
          "w-full px-2 py-1 text-right text-sm tabular-nums transition-colors",
          currentActual === null
            ? "text-zinc-600 hover:text-zinc-400"
            : Number(currentActual) >= Number(currentGoal)
              ? "text-emerald-400"
              : "text-red-400"
        )}
      >
        {currentActual ?? "-"}
      </button>
    );
  }

  return (
    <form
      action={async (formData) => {
        await upsertEntry(formData);
        setEditing(false);
      }}
      className="flex items-center gap-1"
    >
      {entryId && <input type="hidden" name="id" value={entryId} />}
      <input type="hidden" name="kpiId" value={kpiId} />
      <input type="hidden" name="weekStart" value={weekStart} />
      <input type="hidden" name="goal" value={currentGoal} />
      <input
        name="actual"
        type="number"
        step="any"
        defaultValue={currentActual ?? ""}
        autoFocus
        className="w-20 rounded border border-zinc-600 bg-zinc-800 px-2 py-0.5 text-right text-sm text-zinc-50 focus:border-zinc-400 focus:outline-none"
        onBlur={(e) => {
          if (!e.relatedTarget?.closest("form")) setEditing(false);
        }}
      />
      <button
        type="submit"
        className="rounded bg-zinc-700 px-1.5 py-0.5 text-xs text-zinc-300 hover:bg-zinc-600"
      >
        OK
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Delete KPI Button
// ---------------------------------------------------------------------------

export function DeleteKpiButton({ id }: { id: string }) {
  return (
    <form action={deleteKpi}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-xs text-zinc-600 hover:text-red-400 transition-colors"
        title="Delete KPI"
      >
        Delete
      </button>
    </form>
  );
}
