"use client";

import { useActionState } from "react";
import { addTodo } from "./actions";

export function AddTodoForm() {
  const [state, formAction] = useActionState(
    async (_: unknown, formData: FormData) => {
      const result = await addTodo(formData);
      return result?.error ?? null;
    },
    null as string | null
  );

  return (
    <form action={formAction} className="mb-4 flex flex-wrap items-end gap-2">
      <input
        type="text"
        name="title"
        placeholder="To-do"
        className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none"
        required
      />
      <input
        type="date"
        name="dueDate"
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
