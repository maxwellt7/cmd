"use client";

import { useActionState } from "react";
import { addPipelineEntry } from "./actions";

const LEVELS = [
  { value: "daily_action", label: "Daily action" },
  { value: "weekly_focus", label: "Weekly focus" },
  { value: "monthly_sprint", label: "Monthly sprint" },
  { value: "quarterly_objective", label: "Quarterly objective" },
  { value: "annual_aim", label: "Annual aim" },
  { value: "life_goal", label: "Life goal" },
];

const today = new Date().toISOString().slice(0, 10);

export function AddPipelineForm() {
  const [state, formAction] = useActionState(
    async (_: unknown, formData: FormData) => {
      const result = await addPipelineEntry(formData);
      return result?.error ?? null;
    },
    null as string | null
  );

  return (
    <form action={formAction} className="mb-4 flex flex-wrap items-end gap-2">
      <select
        name="level"
        className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-600 focus:outline-none"
        required
      >
        {LEVELS.map((l) => (
          <option key={l.value} value={l.value}>
            {l.label}
          </option>
        ))}
      </select>
      <input
        type="text"
        name="title"
        placeholder="Title"
        className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none"
        required
      />
      <input
        type="text"
        name="description"
        placeholder="Description (optional)"
        className="w-48 rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none"
      />
      <input
        type="date"
        name="startDate"
        defaultValue={today}
        className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-600 focus:outline-none"
      />
      <input
        type="date"
        name="endDate"
        defaultValue={today}
        className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-600 focus:outline-none"
      />
      <button
        type="submit"
        className="rounded bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-600"
      >
        Add
      </button>
      {state && <p className="w-full text-sm text-red-400">{state}</p>}
    </form>
  );
}
