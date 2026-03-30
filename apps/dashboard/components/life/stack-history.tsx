"use client";

import { cn } from "@cmd/ui";
import { useState } from "react";
import Link from "next/link";

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

interface StackSessionSummary {
  id: string;
  title: string;
  stackType: string;
  core4Domain: string;
  subjectEntity: string | null;
  status: string;
  createdAt: Date;
  questionProgress?: number;
}

interface StackHistoryProps {
  sessions: StackSessionSummary[];
}

// ------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------

const STACK_META: Record<string, { label: string; color: string; bg: string; icon: string; totalQuestions: number }> = {
  gratitude: { label: "Gratitude", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20", icon: "\u2728", totalQuestions: 15 },
  idea: { label: "Idea", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20", icon: "\uD83D\uDCA1", totalQuestions: 25 },
  discover: { label: "Discover", color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/20", icon: "\uD83D\uDD2D", totalQuestions: 14 },
  angry: { label: "Angry", color: "text-red-400", bg: "bg-red-400/10 border-red-400/20", icon: "\uD83D\uDD25", totalQuestions: 22 },
};

const DOMAIN_META: Record<string, { label: string; color: string }> = {
  mind: { label: "Mind", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  body: { label: "Body", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  being: { label: "Being", color: "text-violet-400 bg-violet-400/10 border-violet-400/20" },
  balance: { label: "Balance", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
};

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  in_progress: "bg-amber-400/10 text-amber-400 border-amber-400/20",
};

const FILTER_TABS = [
  { value: "all", label: "All" },
  { value: "gratitude", label: "Gratitude" },
  { value: "idea", label: "Idea" },
  { value: "discover", label: "Discover" },
  { value: "angry", label: "Angry" },
];

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export function StackHistory({ sessions }: StackHistoryProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = sessions.filter((s) => {
    const matchesFilter = filter === "all" || s.stackType === filter;
    const matchesSearch =
      !search ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      (s.subjectEntity?.toLowerCase().includes(search.toLowerCase()) ?? false);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search titles and subjects..."
        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
      />

      {/* Filter tabs */}
      <div className="flex gap-0.5 overflow-x-auto rounded-lg bg-zinc-900 p-0.5 whitespace-nowrap">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              filter === tab.value
                ? "bg-zinc-800 text-zinc-50"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <p className="text-sm text-zinc-500">
            {sessions.length === 0
              ? "No stack sessions yet. Start your first stack!"
              : "No sessions match your search."}
          </p>
          {sessions.length === 0 && (
            <Link
              href="/life/stacks"
              className="mt-3 inline-block text-sm text-zinc-400 transition-colors hover:text-zinc-200"
            >
              Go to Stacks
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((session) => {
            const meta = STACK_META[session.stackType];
            const domainMeta = DOMAIN_META[session.core4Domain];
            const progress = session.questionProgress ?? 0;
            const total = meta?.totalQuestions ?? 0;

            return (
              <div
                key={session.id}
                className={cn(
                  "rounded-xl border p-4 transition-colors",
                  meta?.bg ?? "border-zinc-800 bg-zinc-900"
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">{meta?.icon ?? "\uD83D\uDCCB"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold">{session.title}</h3>
                      <span
                        className={cn(
                          "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                          STATUS_COLORS[session.status] ?? "bg-zinc-800 text-zinc-400 border-zinc-700"
                        )}
                      >
                        {session.status === "completed" ? "Completed" : "In Progress"}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
                      {domainMeta && (
                        <span className={cn("rounded-full border px-1.5 py-0.5 text-[10px] font-medium", domainMeta.color)}>
                          {domainMeta.label}
                        </span>
                      )}
                      {session.subjectEntity && (
                        <span>{session.subjectEntity}</span>
                      )}
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                        <span>&middot;</span>
                        <span className={cn(meta?.color)}>{progress}/{total}</span>
                      </div>
                      <Link
                        href={`/life/stacks/${session.id}`}
                        className={cn(
                          "rounded-lg px-3 py-1 text-xs font-medium transition-colors",
                          session.status === "completed"
                            ? "border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                            : "bg-zinc-700 text-zinc-100 hover:bg-zinc-600"
                        )}
                      >
                        {session.status === "completed" ? "View" : "Continue"}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
