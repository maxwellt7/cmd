"use client";

import { useActionState } from "react";
import { upsertPillarScore } from "./actions";
import { cn } from "@cmd/ui";

const PILLARS = [
  { key: "profit", label: "Profit" },
  { key: "power", label: "Power" },
  { key: "purpose", label: "Purpose" },
  { key: "presence", label: "Presence" },
] as const;

type Score = { id: string; pillar: string; score: string; notes: string | null };

export function PillarsSection({
  scores,
  weekStart,
}: {
  scores: Score[];
  weekStart: string;
}) {
  const scoreByPillar = Object.fromEntries(scores.map((s) => [s.pillar, s]));
  const [state, formAction] = useActionState(
    async (_: unknown, formData: FormData) => {
      const result = await upsertPillarScore(formData);
      return result?.error ?? null;
    },
    null as string | null
  );

  return (
    <div className="space-y-4">
      <p className="text-xs text-zinc-500">Week of {weekStart} · Score 1–10</p>
      <form action={formAction} className="flex flex-wrap items-end gap-4">
        {PILLARS.map(({ key, label }) => (
          <div key={key} className="flex flex-col gap-1">
            <label htmlFor={`pillar-${key}`} className="text-xs font-medium text-zinc-400">
              {label}
            </label>
            <input type="hidden" name="pillar" value={key} />
            <input
              id={`pillar-${key}`}
              type="number"
              name="score"
              min={1}
              max={10}
              defaultValue={scoreByPillar[key]?.score ?? ""}
              placeholder="1–10"
              className="w-16 rounded border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none"
            />
          </div>
        ))}
        <div className="flex flex-col gap-1">
          <label htmlFor="pillar-notes" className="text-xs font-medium text-zinc-400">
            Notes
          </label>
          <input
            id="pillar-notes"
            type="text"
            name="notes"
            placeholder="Optional"
            className="w-48 rounded border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-600"
        >
          Save scores
        </button>
      </form>
      {state && <p className="text-sm text-red-400">{state}</p>}
      {scores.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {scores.map((s) => (
            <span
              key={s.id}
              className={cn(
                "rounded px-2 py-0.5 text-xs font-medium",
                Number(s.score) >= 7 && "bg-emerald-900/40 text-emerald-400",
                Number(s.score) >= 4 && Number(s.score) < 7 && "bg-amber-900/40 text-amber-400",
                Number(s.score) < 4 && "bg-red-900/40 text-red-400"
              )}
            >
              {PILLARS.find((p) => p.key === s.pillar)?.label ?? s.pillar}: {s.score}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
