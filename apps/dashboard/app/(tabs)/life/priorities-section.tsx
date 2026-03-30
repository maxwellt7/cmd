"use client";

import { useActionState } from "react";
import { addPriority, togglePriorityComplete } from "./actions";
import { cn } from "@cmd/ui";

const PILLARS = [
  { value: "profit", label: "Profit" },
  { value: "power", label: "Power" },
  { value: "purpose", label: "Purpose" },
  { value: "presence", label: "Presence" },
];

type Priority = {
  id: string;
  title: string;
  pillar: string;
  date: string;
  completed: boolean;
  sortOrder: number;
};

export function PrioritiesSection({ priorities, today }: { priorities: Priority[]; today: string }) {
  const [state, formAction] = useActionState(
    async (_: unknown, formData: FormData) => {
      const result = await addPriority(formData);
      return result?.error ?? null;
    },
    null as string | null
  );

  return (
    <div className="space-y-4">
      <p className="text-xs text-zinc-500">Today: {today}</p>
      <form action={formAction} className="mb-4 flex flex-wrap items-end gap-2">
        <input
          type="text"
          name="title"
          placeholder="Priority"
          className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none"
          required
        />
        <select
          name="pillar"
          className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-600 focus:outline-none"
          required
        >
          {PILLARS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-600"
        >
          Add
        </button>
      </form>
      {state && <p className="text-sm text-red-400">{state}</p>}
      {priorities.length === 0 ? (
        <p className="rounded border border-dashed border-zinc-700 bg-zinc-900/50 px-4 py-6 text-center text-sm text-zinc-500">
          No priorities for today.
        </p>
      ) : (
        <ul className="space-y-2">
          {priorities.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-4 rounded border border-zinc-800 bg-zinc-900/50 px-4 py-3"
            >
              <form action={togglePriorityComplete.bind(null, p.id, !p.completed)}>
                <button type="submit" className="flex items-center gap-3 text-left">
                  <span
                    className={cn(
                      "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                      p.completed
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-zinc-600 bg-transparent text-transparent"
                    )}
                  >
                    {p.completed ? "✓" : ""}
                  </span>
                  <span
                    className={cn(
                      "font-medium text-zinc-100",
                      p.completed && "line-through text-zinc-500"
                    )}
                  >
                    {p.title}
                  </span>
                </button>
              </form>
              <span className="text-xs text-zinc-500 capitalize">{p.pillar}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
