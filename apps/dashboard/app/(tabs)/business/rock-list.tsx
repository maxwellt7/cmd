"use client";

import { updateRockStatus } from "./actions";
import { cn } from "@cmd/ui";

type Rock = {
  id: string;
  title: string;
  ownerName: string;
  quarter: string;
  status: string;
  dueDate: string;
};

export function RockList({ rocks }: { rocks: Rock[] }) {
  if (rocks.length === 0) {
    return (
      <p className="rounded border border-dashed border-zinc-700 bg-zinc-900/50 px-4 py-6 text-center text-sm text-zinc-500">
        No rocks this quarter. Add one above.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {rocks.map((rock) => (
        <li
          key={rock.id}
          className="flex items-center justify-between gap-4 rounded border border-zinc-800 bg-zinc-900/50 px-4 py-3"
        >
          <div className="min-w-0 flex-1">
            <p className={cn("font-medium text-zinc-100", rock.status === "done" && "line-through text-zinc-500")}>
              {rock.title}
            </p>
            <p className="text-xs text-zinc-500">
              Due {rock.dueDate} · {rock.ownerName}
            </p>
          </div>
          <div className="flex shrink-0 gap-1">
            <form action={updateRockStatus.bind(null, rock.id, "on_track")}>
              <button
                type="submit"
                className={cn(
                  "rounded px-2 py-1 text-xs font-medium",
                  rock.status === "on_track"
                    ? "bg-emerald-900/50 text-emerald-400"
                    : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                )}
              >
                On track
              </button>
            </form>
            <form action={updateRockStatus.bind(null, rock.id, "off_track")}>
              <button
                type="submit"
                className={cn(
                  "rounded px-2 py-1 text-xs font-medium",
                  rock.status === "off_track"
                    ? "bg-amber-900/50 text-amber-400"
                    : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                )}
              >
                Off track
              </button>
            </form>
            <form action={updateRockStatus.bind(null, rock.id, "done")}>
              <button
                type="submit"
                className={cn(
                  "rounded px-2 py-1 text-xs font-medium",
                  rock.status === "done"
                    ? "bg-zinc-700 text-zinc-200"
                    : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                )}
              >
                Done
              </button>
            </form>
          </div>
        </li>
      ))}
    </ul>
  );
}
