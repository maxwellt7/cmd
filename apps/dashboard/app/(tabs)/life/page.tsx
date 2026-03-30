import { createDb, pillarScores, priorities, journalEntries, eq, desc, and, gte, lte, asc } from "@cmd/db";
import { cn } from "@cmd/ui";
import type { PillarKey } from "@cmd/types";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PILLAR_META: Record<PillarKey, { label: string; color: string; bg: string }> = {
  profit: { label: "Profit", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
  power: { label: "Power", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
  purpose: { label: "Purpose", color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/20" },
  presence: { label: "Presence", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
};

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split("T")[0]!;
}

function getTodayString(): string {
  return new Date().toISOString().split("T")[0]!;
}

export default async function LifeOverview() {
  const db = createDb(process.env.DATABASE_URL!);
  const weekStart = getWeekStart();
  const today = getTodayString();

  // Calculate week end (Sunday)
  const weekEndDate = new Date(weekStart + "T00:00:00");
  weekEndDate.setDate(weekEndDate.getDate() + 6);
  const weekEnd = weekEndDate.toISOString().split("T")[0]!;

  const [currentScores, todayPriorities, recentJournal, weekPriorities] = await Promise.all([
    db
      .select()
      .from(pillarScores)
      .where(eq(pillarScores.weekStart, weekStart)),
    db
      .select()
      .from(priorities)
      .where(eq(priorities.date, today))
      .orderBy(priorities.sortOrder),
    db
      .select()
      .from(journalEntries)
      .orderBy(desc(journalEntries.createdAt))
      .limit(3),
    db
      .select()
      .from(priorities)
      .where(and(gte(priorities.date, weekStart), lte(priorities.date, weekEnd)))
      .orderBy(asc(priorities.date), asc(priorities.sortOrder)),
  ]);

  const scoreMap = new Map(
    currentScores.map((s) => [s.pillar, { score: Number(s.score), notes: s.notes }])
  );

  const completed = todayPriorities.filter((p) => p.completed).length;
  const total = todayPriorities.length;
  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Weekly stats
  const weekTotal = weekPriorities.length;
  const weekCompleted = weekPriorities.filter((p) => p.completed).length;
  const weekPct = weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0;
  const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekDayStats = DAY_LABELS.map((label, i) => {
    const d = new Date(weekStart + "T00:00:00");
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0]!;
    const dayItems = weekPriorities.filter((p) => p.date === dateStr);
    return {
      label,
      total: dayItems.length,
      done: dayItems.filter((p) => p.completed).length,
    };
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="text-xl md:text-2xl font-bold">Life Overview</h1>

      {/* Pillar Score Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(Object.keys(PILLAR_META) as PillarKey[]).map((pillar) => {
          const meta = PILLAR_META[pillar];
          const data = scoreMap.get(pillar);
          return (
            <Link
              key={pillar}
              href="/life/pillars"
              className={cn(
                "rounded-xl border p-4 transition-colors hover:bg-zinc-800/50",
                meta.bg
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn("text-sm font-semibold uppercase tracking-wide", meta.color)}>
                  {meta.label}
                </span>
                <span className={cn("text-2xl font-bold", meta.color)}>
                  {data ? data.score : "--"}
                </span>
              </div>
              {data?.notes && (
                <p className="mt-2 text-xs text-zinc-500 line-clamp-2">{data.notes}</p>
              )}
              {!data && (
                <p className="mt-2 text-xs text-zinc-600">No score this week</p>
              )}
            </Link>
          );
        })}
      </div>

      {/* Today's Priorities Summary */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 md:p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base md:text-lg font-semibold">Today&apos;s Priorities</h2>
          <Link
            href="/life/today"
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            View all
          </Link>
        </div>
        {total === 0 ? (
          <p className="mt-3 text-sm text-zinc-600">No priorities set for today.</p>
        ) : (
          <>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-2 flex-1 rounded-full bg-zinc-800">
                <div
                  className="h-2 rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
              <span className="text-sm font-medium text-zinc-400">
                {completed}/{total} ({completionPct}%)
              </span>
            </div>
            <ul className="mt-3 space-y-1.5">
              {todayPriorities.slice(0, 5).map((p) => (
                <li key={p.id} className="flex items-center gap-2 text-sm">
                  <span
                    className={cn(
                      "inline-block h-3 w-3 rounded-full border-2",
                      p.completed
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-zinc-600 bg-transparent"
                    )}
                  />
                  <span className={cn(p.completed && "text-zinc-600 line-through")}>
                    {p.title}
                  </span>
                  <span
                    className={cn(
                      "ml-auto text-xs",
                      PILLAR_META[p.pillar as PillarKey]?.color ?? "text-zinc-500"
                    )}
                  >
                    {PILLAR_META[p.pillar as PillarKey]?.label ?? p.pillar}
                  </span>
                </li>
              ))}
              {total > 5 && (
                <li className="text-xs text-zinc-600">+{total - 5} more</li>
              )}
            </ul>
          </>
        )}
      </div>

      {/* Weekly Summary */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 md:p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base md:text-lg font-semibold">This Week</h2>
          <Link
            href="/life/weekly"
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            View planner
          </Link>
        </div>
        {weekTotal === 0 ? (
          <p className="mt-3 text-sm text-zinc-600">No tasks planned this week.</p>
        ) : (
          <>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-2 flex-1 rounded-full bg-zinc-800">
                <div
                  className="h-2 rounded-full bg-blue-500 transition-all"
                  style={{ width: `${weekPct}%` }}
                />
              </div>
              <span className="text-sm font-medium text-zinc-400">
                {weekCompleted}/{weekTotal} ({weekPct}%)
              </span>
            </div>
            <div className="mt-3 grid grid-cols-7 gap-1.5">
              {weekDayStats.map((day) => (
                <div key={day.label} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-medium text-zinc-500">{day.label}</span>
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-md text-xs font-bold",
                      day.total === 0
                        ? "bg-zinc-800/50 text-zinc-700"
                        : day.done === day.total
                        ? "bg-emerald-500/20 text-emerald-400"
                        : day.done > 0
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-zinc-800 text-zinc-400"
                    )}
                  >
                    {day.total > 0 ? `${day.done}/${day.total}` : "-"}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Recent Journal */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 md:p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base md:text-lg font-semibold">Recent Journal</h2>
          <Link
            href="/life/journal"
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            View all
          </Link>
        </div>
        {recentJournal.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-600">No journal entries yet.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {recentJournal.map((entry) => (
              <div key={entry.id} className="rounded-lg border border-zinc-800 p-3">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-medium">
                    {entry.stackType.replace("_", " ")}
                  </span>
                  <span>{entry.date}</span>
                </div>
                <p className="mt-1.5 text-sm text-zinc-300 line-clamp-2">{entry.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
