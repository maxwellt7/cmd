import { cn } from "@cmd/ui";
import type { IntegrationStatus } from "@cmd/types";

interface IntegrationCardProps {
  integration: IntegrationStatus;
}

export function IntegrationCard({ integration }: IntegrationCardProps) {
  function formatTime(date: Date | null) {
    if (!date) return "Never";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="flex flex-col gap-2 md:gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-3 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-zinc-50 break-words">{integration.name}</h3>
        <span
          className={cn(
            "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
            integration.connected
              ? "bg-emerald-500/15 text-emerald-400"
              : "bg-red-500/10 text-red-400"
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              integration.connected ? "bg-emerald-400" : "bg-red-400"
            )}
          />
          {integration.connected ? "Connected" : "Disconnected"}
        </span>
      </div>

      <div className="flex flex-col gap-1 text-xs text-zinc-500">
        <span>Last sync: {formatTime(integration.lastSyncAt)}</span>
        {integration.error && (
          <span className="text-red-400/80">{integration.error}</span>
        )}
      </div>
    </div>
  );
}
