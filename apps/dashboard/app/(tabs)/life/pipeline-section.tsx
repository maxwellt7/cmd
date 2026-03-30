"use client";

import { updatePipelineProgress } from "./actions";
import { cn } from "@cmd/ui";

const LEVEL_LABELS: Record<string, string> = {
  life_goal: "Life goal",
  annual_aim: "Annual aim",
  quarterly_objective: "Quarterly objective",
  monthly_sprint: "Monthly sprint",
  weekly_focus: "Weekly focus",
  daily_action: "Daily action",
};

type Entry = {
  id: string;
  level: string;
  title: string;
  description: string;
  progress: number;
  startDate: string;
  endDate: string;
};

export function PipelineSection({
  pipelineByLevel,
  pipelineLevels,
}: {
  pipelineByLevel: Record<string, Entry[]>;
  pipelineLevels: readonly string[];
}) {
  return (
    <div className="space-y-6">
      {pipelineLevels.map((level) => {
        const entries = pipelineByLevel[level] ?? [];
        if (entries.length === 0) return null;
        return (
          <div key={level}>
            <h3 className="mb-2 text-sm font-medium text-zinc-400">
              {LEVEL_LABELS[level] ?? level}
            </h3>
            <ul className="space-y-2">
              {entries.map((entry) => (
                <PipelineEntryRow key={entry.id} entry={entry} />
              ))}
            </ul>
          </div>
        );
      })}
      {pipelineLevels.every((l) => (pipelineByLevel[l] ?? []).length === 0) && (
        <p className="rounded border border-dashed border-zinc-700 bg-zinc-900/50 px-4 py-6 text-center text-sm text-zinc-500">
          No pipeline entries yet. Add one below.
        </p>
      )}
    </div>
  );
}

function PipelineEntryRow({ entry }: { entry: Entry }) {
  return (
    <li className="flex items-center gap-4 rounded border border-zinc-800 bg-zinc-900/50 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-zinc-100">{entry.title}</p>
        {entry.description && (
          <p className="mt-0.5 text-sm text-zinc-500 line-clamp-1">{entry.description}</p>
        )}
        <p className="mt-1 text-xs text-zinc-500">
          {entry.startDate} → {entry.endDate}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="text-xs text-zinc-500">{entry.progress}%</span>
        <div className="flex gap-1">
          {[0, 25, 50, 75, 100].map((p) => (
            <form
              key={p}
              action={updatePipelineProgress.bind(null, entry.id, p)}
            >
              <button
                type="submit"
                className={cn(
                  "rounded px-2 py-0.5 text-xs font-medium",
                  entry.progress === p
                    ? "bg-zinc-600 text-zinc-100"
                    : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                )}
              >
                {p}%
              </button>
            </form>
          ))}
        </div>
      </div>
    </li>
  );
}
