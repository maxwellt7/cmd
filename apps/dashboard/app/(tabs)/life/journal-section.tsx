"use client";

import { useActionState } from "react";
import { addJournalEntry } from "./actions";

const STACK_TYPES = [
  { value: "sovereign_self", label: "Sovereign self" },
  { value: "gratitude", label: "Gratitude" },
  { value: "idea", label: "Idea" },
  { value: "discovery", label: "Discovery" },
];

type Entry = {
  id: string;
  date: string;
  stackType: string;
  prompt: string;
  content: string;
  createdAt: Date;
};

export function JournalSection({ entries }: { entries: Entry[]; today: string }) {
  const [state, formAction] = useActionState(
    async (_: unknown, formData: FormData) => {
      const result = await addJournalEntry(formData);
      return result?.error ?? null;
    },
    null as string | null
  );

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-3 rounded border border-zinc-800 bg-zinc-900/50 p-4">
        <div className="flex flex-wrap gap-2">
          <select
            name="stackType"
            className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-600 focus:outline-none"
            required
          >
            {STACK_TYPES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="prompt"
            placeholder="Prompt or question"
            className="min-w-[200px] flex-1 rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none"
            required
          />
        </div>
        <textarea
          name="content"
          placeholder="Your response..."
          rows={3}
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-600"
        >
          Add entry
        </button>
      </form>
      {state && <p className="text-sm text-red-400">{state}</p>}
      {entries.length === 0 ? (
        <p className="rounded border border-dashed border-zinc-700 bg-zinc-900/50 px-4 py-6 text-center text-sm text-zinc-500">
          No journal entries for today.
        </p>
      ) : (
        <ul className="space-y-4">
          {entries.map((e) => (
            <li
              key={e.id}
              className="rounded border border-zinc-800 bg-zinc-900/50 px-4 py-3"
            >
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                {STACK_TYPES.find((s) => s.value === e.stackType)?.label ?? e.stackType}
              </p>
              <p className="mt-1 font-medium text-zinc-200">{e.prompt}</p>
              {e.content && (
                <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-400">{e.content}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
