"use client";

import { useState } from "react";
import { cn } from "@cmd/ui";
import { addTodo, toggleTodo, deleteTodo } from "../../app/actions/eos";

interface TodoItem {
  id: string;
  title: string;
  ownerName: string;
  dueDate: string | null;
  completed: boolean;
  sourceType: string | null;
  sourceId: string | null;
}

type FilterType = "all" | "manual" | "meeting" | "issue";

export function TodoList({ todos }: { todos: TodoItem[] }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered =
    filter === "all"
      ? todos
      : todos.filter((t) => t.sourceType === filter);

  const pending = filtered.filter((t) => !t.completed);
  const completed = filtered.filter((t) => t.completed);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">To-Dos</h1>
          <p className="text-sm text-zinc-500">
            7-day action items
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="rounded-md border border-dashed border-zinc-700 px-4 py-2 text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-300"
        >
          {showAddForm ? "Cancel" : "+ Add To-Do"}
        </button>
      </div>

      {showAddForm && (
        <form
          action={async (formData) => {
            await addTodo(formData);
            setShowAddForm(false);
          }}
          className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 md:p-4 space-y-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="mb-1 block text-xs text-zinc-500">Title</label>
              <input
                name="title"
                required
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-50 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
                placeholder="What needs to be done?"
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
              <label className="mb-1 block text-xs text-zinc-500">
                Due Date
              </label>
              <input
                name="dueDate"
                type="date"
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-50 focus:border-zinc-500 focus:outline-none"
              />
            </div>
          </div>
          <input type="hidden" name="sourceType" value="manual" />
          <button
            type="submit"
            className="rounded-md bg-zinc-50 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-200"
          >
            Add
          </button>
        </form>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1">
        {(["all", "manual", "meeting", "issue"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-medium transition-colors",
              filter === f
                ? "bg-zinc-800 text-zinc-200"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 py-16">
          <p className="text-zinc-500">No to-dos yet</p>
          <p className="mt-1 text-xs text-zinc-600">
            Add action items to track weekly commitments
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <div className="space-y-1">
              <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                Pending ({pending.length})
              </h2>
              {pending.map((todo) => (
                <TodoRow key={todo.id} todo={todo} />
              ))}
            </div>
          )}
          {completed.length > 0 && (
            <div className="space-y-1">
              <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-600">
                Completed ({completed.length})
              </h2>
              {completed.map((todo) => (
                <TodoRow key={todo.id} todo={todo} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TodoRow({ todo }: { todo: TodoItem }) {
  return (
    <div className="flex items-center gap-2 md:gap-3 rounded-lg border border-zinc-800 bg-zinc-900 px-3 md:px-4 py-2.5 md:py-3 transition-colors hover:bg-zinc-800/60">
      <form action={toggleTodo}>
        <input type="hidden" name="id" value={todo.id} />
        <input type="hidden" name="completed" value={String(todo.completed)} />
        <button
          type="submit"
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs transition-colors",
            todo.completed
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-zinc-700 hover:border-zinc-500"
          )}
        >
          {todo.completed ? "\u2713" : ""}
        </button>
      </form>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm break-words",
            todo.completed ? "text-zinc-500 line-through" : "text-zinc-200"
          )}
        >
          {todo.title}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600">
          <span>{todo.ownerName}</span>
          {todo.dueDate && (
            <>
              <span>&middot;</span>
              <span>{todo.dueDate}</span>
            </>
          )}
          {todo.sourceType && todo.sourceType !== "manual" && (
            <>
              <span>&middot;</span>
              <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px]">
                {todo.sourceType}
              </span>
            </>
          )}
        </div>
      </div>
      <form action={deleteTodo}>
        <input type="hidden" name="id" value={todo.id} />
        <button
          type="submit"
          className="text-xs text-zinc-700 hover:text-red-400"
        >
          Delete
        </button>
      </form>
    </div>
  );
}
