"use client";

import { cn } from "@cmd/ui";
import { toggleAgentOnline, deleteAgent } from "../../app/actions/admin";
import { useTransition, useState } from "react";
import type { AgentConfig } from "@cmd/types";

interface AgentCardProps {
  agent: AgentConfig & { openclawId: string };
  onEdit: (agent: AgentConfig & { openclawId: string }) => void;
}

export function AgentCard({ agent, onEdit }: AgentCardProps) {
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function handleToggle() {
    startTransition(async () => {
      await toggleAgentOnline(agent.id, !agent.isOnline);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteAgent(agent.id);
      setShowDeleteConfirm(false);
    });
  }

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
    <div
      className={cn(
        "group relative flex flex-col gap-2 md:gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-3 md:p-5 transition-colors hover:border-zinc-700",
        isPending && "pointer-events-none opacity-60"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{agent.emoji}</span>
          <div>
            <h3 className="font-semibold text-zinc-50">{agent.name}</h3>
            <p className="font-mono text-xs text-zinc-500">{agent.model}</p>
          </div>
        </div>
        <button
          onClick={handleToggle}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
            agent.isOnline
              ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
              : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700"
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              agent.isOnline ? "bg-emerald-400" : "bg-zinc-600"
            )}
          />
          {agent.isOnline ? "Online" : "Offline"}
        </button>
      </div>

      {agent.description && (
        <p className="text-sm text-zinc-400 line-clamp-2">{agent.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs text-zinc-500">
        <span>Messages today: {agent.messagesToday}</span>
        <span>Last active: {formatTime(agent.lastActiveAt)}</span>
      </div>

      <div className="flex items-center gap-2 border-t border-zinc-800 pt-3">
        <button
          onClick={() => onEdit(agent)}
          className="rounded-md px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
        >
          Edit
        </button>
        {showDeleteConfirm ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-400">Delete?</span>
            <button
              onClick={handleDelete}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/15"
            >
              Confirm
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
