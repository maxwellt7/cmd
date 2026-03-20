"use client";

import { cn } from "@cmd/ui";
import type { RelayStatus as RelayStatusType } from "@cmd/types";

interface RelayStatusProps {
  status: RelayStatusType;
}

const STATUS_CONFIG: Record<RelayStatusType, { color: string; label: string }> = {
  connected: { color: "bg-green-500", label: "connected" },
  reconnecting: { color: "bg-amber-500", label: "reconnecting" },
  offline: { color: "bg-red-500", label: "offline" },
};

export function RelayStatus({ status }: RelayStatusProps) {
  const config = STATUS_CONFIG[status];
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[11px] text-zinc-600">
        relay: {config.label}
      </span>
      <div className={cn("h-2 w-2 rounded-full", config.color)} />
    </div>
  );
}
