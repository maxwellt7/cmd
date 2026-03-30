"use client";

import { toggleTodoComplete } from "./actions";
import { cn } from "@cmd/ui";

type Todo = {
  id: string;
  title: string;
  dueDate: string | null;
  completed: boolean;
  ownerName: string;
};

export function TodoList({ todos }: { todos: Todo[] }) {
  if (todos.length === 0) {
    return (
      <p className="rounded border border-dashed border-zinc-700 bg-zinc-900/50 px-4 py-6 text-center text-sm text-zinc-500">
        No open to-dos. Add one above.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {todos.map((todo) => (
        <li
          key={todo.id}
          className="flex items-center gap-4 rounded border border-zinc-800 bg-zinc-900/50 px-4 py-3"
        >
          <form action={toggleTodoComplete.bind(null, todo.id, !todo.completed)}>
            <button type="submit" className="flex items-center gap-3 text-left">
              <span
                className={cn(
                  "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                  todo.completed
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-zinc-600 bg-transparent text-transparent"
                )}
              >
                {todo.completed ? "✓" : ""}
              </span>
              <span
                className={cn(
                  "font-medium text-zinc-100",
                  todo.completed && "line-through text-zinc-500"
                )}
              >
                {todo.title}
              </span>
            </button>
          </form>
          {todo.dueDate && (
            <span className="text-xs text-zinc-500">{todo.dueDate}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
