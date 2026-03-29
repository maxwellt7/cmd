"use client";

import type { AgentChannel } from "@cmd/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreateChannelDialog } from "./create-channel-dialog";

interface MobileChannelListProps {
  channels: AgentChannel[];
}

export function MobileChannelList({ channels }: MobileChannelListProps) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <h2 className="text-sm font-semibold text-zinc-300">Channels</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="flex h-6 w-6 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
          aria-label="Create channel"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Channel list */}
      <nav className="flex-1 overflow-y-auto px-2 py-2" aria-label="Channel list">
        <ul className="space-y-0.5">
          {channels.map((channel) => (
            <li key={channel.id}>
              <button
                onClick={() => router.push(`/chat/${channel.id}`)}
                className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-200"
              >
                <span className="shrink-0 text-base leading-none">{channel.agentEmoji}</span>
                <span className="truncate">{channel.agentName}</span>
                {channel.isGeneral && (
                  <span className="ml-auto shrink-0 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">
                    general
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Create channel dialog */}
      {showCreate && <CreateChannelDialog onClose={() => setShowCreate(false)} />}
    </div>
  );
}
