"use client";

import { useActionState } from "react";
import { addRock } from "./actions";

const today = new Date().toISOString().slice(0, 10);

export function AddRockForm() {
  const [state, formAction] = useActionState(
    async (_: unknown, formData: FormData) => {
      const result = await addRock(formData);
      return result.error ?? null;
    },
    null as string | null
  );

  return (
    <form action={formAction} className="mb-4 flex flex-wrap items-end gap-2">
      <input
        type="text"
        name="title"
        placeholder="Rock title"
        className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none"
        required
      />
      <input
        type="date"
        name="dueDate"
        defaultValue={today}
        className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-600 focus:outline-none"
      />
      <button
        type="submit"
        className="rounded bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-600"
      >
        Add Rock
      </button>
      {state && <p className="w-full text-sm text-red-400">{state}</p>}
    </form>
  );
}
