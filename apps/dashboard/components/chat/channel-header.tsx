"use client";

import type { AgentChannel } from "@cmd/types";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteChannel } from "../../app/actions/chat";

interface ChannelHeaderProps {
  channel: AgentChannel;
}

export function ChannelHeader({ channel }: ChannelHeaderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Delete channel "${channel.agentName}"? All messages will be lost.`)) return;
    startTransition(async () => {
      await deleteChannel(channel.id);
      router.push("/chat");
    });
  }

  return (
    <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/60 px-5 py-3">
      <div className="flex items-center gap-3">
        <span className="text-xl leading-none">{channel.agentEmoji}</span>
        <div>
          <h1 className="text-sm font-semibold text-zinc-100">{channel.agentName}</h1>
          <p className="text-xs text-zinc-500">Agent ID: {channel.agentId}</p>
        </div>
      </div>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="rounded px-2.5 py-1.5 text-xs text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-red-400 disabled:opacity-50"
      >
        {isPending ? "Deleting..." : "Delete"}
      </button>
    </header>
  );
}
