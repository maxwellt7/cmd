"use client";

import { useState } from "react";
import { cn } from "@cmd/ui";
import type { PillarKey } from "@cmd/types";
import { upsertPillarScore } from "../../app/actions/life";

const PILLAR_STYLES: Record<PillarKey, { label: string; color: string; bg: string; bar: string }> = {
  profit: { label: "Profit", color: "text-emerald-400", bg: "border-emerald-400/20", bar: "bg-emerald-400" },
  power: { label: "Power", color: "text-blue-400", bg: "border-blue-400/20", bar: "bg-blue-400" },
  purpose: { label: "Purpose", color: "text-violet-400", bg: "border-violet-400/20", bar: "bg-violet-400" },
  presence: { label: "Presence", color: "text-amber-400", bg: "border-amber-400/20", bar: "bg-amber-400" },
};

interface PillarCardProps {
  pillar: PillarKey;
  weekStart: string;
  currentScore?: number;
  currentNotes: string;
  history: { weekStart: string; score: number }[];
}

export function PillarCard({ pillar, weekStart, currentScore, currentNotes, history }: PillarCardProps) {
  const style = PILLAR_STYLES[pillar];
  const [score, setScore] = useState(currentScore ?? 5);
  const [notes, setNotes] = useState(currentNotes);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const fd = new FormData();
    fd.set("pillar", pillar);
    fd.set("score", String(score));
    fd.set("weekStart", weekStart);
    fd.set("notes", notes);
    await upsertPillarScore(fd);
    setSaving(false);
  }

  const maxScore = 10;

  return (
    <div className={cn("rounded-xl border bg-zinc-900 p-3 md:p-5", style.bg)}>
      <div className="flex items-center justify-between">
        <h3 className={cn("text-base md:text-lg font-bold uppercase tracking-wide", style.color)}>
          {style.label}
        </h3>
        <span className={cn("text-3xl font-bold", style.color)}>{score}</span>
      </div>

      {/* Score Slider */}
      <div className="mt-4">
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          className="w-full accent-current"
          style={{ color: "inherit" }}
        />
        <div className="flex justify-between text-xs text-zinc-600">
          <span>1</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>

      {/* Notes */}
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes for this week..."
        rows={2}
        className="mt-3 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:border-zinc-700 focus:outline-none"
      />

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className={cn(
          "mt-3 w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors",
          "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-50"
        )}
      >
        {saving ? "Saving..." : currentScore !== undefined ? "Update Score" : "Save Score"}
      </button>

      {/* Sparkline / History */}
      {history.length > 1 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-zinc-500">History</p>
          <div className="flex items-end gap-1" style={{ height: 48 }}>
            {history.map((h, i) => {
              const height = (h.score / maxScore) * 100;
              return (
                <div
                  key={h.weekStart}
                  className="group relative flex-1"
                  style={{ height: "100%" }}
                >
                  <div
                    className={cn("absolute bottom-0 w-full rounded-sm transition-all", style.bar)}
                    style={{ height: `${height}%`, opacity: 0.3 + (i / history.length) * 0.7 }}
                  />
                  <div className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {h.score} - {h.weekStart.slice(5)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
