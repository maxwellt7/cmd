"use client";

import { cn } from "@cmd/ui";
import { useState, useTransition, useEffect, useCallback } from "react";
import {
  getQueueEntries,
  retryQueueEntry,
  clearDelivered,
} from "../../app/actions/admin";

interface QueueEntry {
  id: string;
  channelId: string;
  content: string;
  status: string;
  createdAt: Date;
  deliveredAt: Date | null;
}

const STATUS_FILTERS = ["all", "pending", "delivered", "failed"] as const;

export function QueueTable() {
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  const loadEntries = useCallback(() => {
    startTransition(async () => {
      const data = await getQueueEntries(filter);
      setEntries(data);
      setIsLoading(false);
    });
  }, [filter]);

  useEffect(() => {
    loadEntries();
    const interval = setInterval(loadEntries, 10000);
    return () => clearInterval(interval);
  }, [loadEntries]);

  function handleRetry(id: string) {
    startTransition(async () => {
      await retryQueueEntry(id);
      loadEntries();
    });
  }

  function handleClearDelivered() {
    startTransition(async () => {
      await clearDelivered();
      loadEntries();
    });
  }

  function formatTime(date: Date | null) {
    if (!date) return "--";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function truncateId(id: string) {
    return id.length > 8 ? id.slice(0, 8) + "..." : id;
  }

  function truncateContent(content: string) {
    return content.length > 60 ? content.slice(0, 60) + "..." : content;
  }

  const statusColor: Record<string, string> = {
    pending: "bg-amber-500/15 text-amber-400",
    delivered: "bg-emerald-500/15 text-emerald-400",
    failed: "bg-red-500/10 text-red-400",
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 rounded-lg bg-zinc-950 p-1">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                filter === s
                  ? "bg-zinc-800 text-zinc-50"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadEntries}
            disabled={isPending}
            className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
          >
            Refresh
          </button>
          <button
            onClick={handleClearDelivered}
            disabled={isPending}
            className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
          >
            Clear Delivered
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-950/50">
              <th className="px-4 py-3 text-xs font-medium text-zinc-500">
                ID
              </th>
              <th className="px-4 py-3 text-xs font-medium text-zinc-500">
                Channel
              </th>
              <th className="px-4 py-3 text-xs font-medium text-zinc-500">
                Content
              </th>
              <th className="px-4 py-3 text-xs font-medium text-zinc-500">
                Status
              </th>
              <th className="px-4 py-3 text-xs font-medium text-zinc-500">
                Created
              </th>
              <th className="px-4 py-3 text-xs font-medium text-zinc-500">
                Delivered
              </th>
              <th className="px-4 py-3 text-xs font-medium text-zinc-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-zinc-500"
                >
                  Loading...
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-zinc-500"
                >
                  No queue entries found.
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-zinc-800/50 transition-colors hover:bg-zinc-800/30"
                >
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                    {truncateId(entry.id)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                    {truncateId(entry.channelId)}
                  </td>
                  <td className="max-w-[240px] px-4 py-3 text-xs text-zinc-300">
                    {truncateContent(entry.content)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                        statusColor[entry.status] ?? "text-zinc-500"
                      )}
                    >
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {formatTime(entry.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {formatTime(entry.deliveredAt)}
                  </td>
                  <td className="px-4 py-3">
                    {entry.status === "failed" && (
                      <button
                        onClick={() => handleRetry(entry.id)}
                        disabled={isPending}
                        className="rounded-md px-2 py-1 text-xs font-medium text-amber-400 transition-colors hover:bg-amber-500/10"
                      >
                        Retry
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-zinc-600">
        Auto-refreshes every 10 seconds. Showing up to 100 entries.
      </p>
    </div>
  );
}
