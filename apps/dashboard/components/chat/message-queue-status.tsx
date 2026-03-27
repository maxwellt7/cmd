"use client";

import { cn } from "@cmd/ui";
import { useEffect, useState, useTransition } from "react";
import { getQueueStatus } from "../../app/actions/chat";

interface MessageQueueStatusProps {
  channelId?: string;
}

export function MessageQueueStatus({ channelId }: MessageQueueStatusProps) {
  const [status, setStatus] = useState<{ pending: number; delivered: number } | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();

  function refresh() {
    startTransition(async () => {
      const result = await getQueueStatus(channelId);
      setStatus(result);
    });
  }

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId]);

  if (!status) return null;

  return (
    <div className="border-t border-zinc-800 bg-zinc-950/80">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-5 py-1.5 text-[11px] text-zinc-600 transition-colors hover:text-zinc-400"
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span
              className={cn(
                "inline-block h-1.5 w-1.5 rounded-full",
                status.pending > 0 ? "bg-amber-500" : "bg-zinc-700"
              )}
            />
            {status.pending} pending
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-600" />
            {status.delivered} delivered
          </span>
        </div>
        <span className={cn("transition-transform", expanded && "rotate-180")}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {expanded && (
        <div className="border-t border-zinc-800/50 px-5 py-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
              <p className="text-xs font-medium text-zinc-500">Pending</p>
              <p className="mt-1 text-xl font-bold text-amber-400">{status.pending}</p>
              <p className="mt-0.5 text-[10px] text-zinc-600">Awaiting relay delivery</p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
              <p className="text-xs font-medium text-zinc-500">Delivered</p>
              <p className="mt-1 text-xl font-bold text-green-400">{status.delivered}</p>
              <p className="mt-0.5 text-[10px] text-zinc-600">Successfully sent</p>
            </div>
          </div>
          <button
            onClick={refresh}
            disabled={isPending}
            className="mt-3 text-[11px] text-zinc-600 transition-colors hover:text-zinc-400 disabled:opacity-50"
          >
            {isPending ? "Refreshing..." : "Refresh status"}
          </button>
        </div>
      )}
    </div>
  );
}
