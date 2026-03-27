"use client";

import { cn } from "@cmd/ui";
import type { ChatMessage } from "@cmd/types";
import { useEffect, useRef } from "react";

interface MessageListProps {
  messages: ChatMessage[];
  channelEmoji?: string;
}

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(date: Date) {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function shouldShowDateSeparator(current: ChatMessage, previous: ChatMessage | undefined) {
  if (!previous) return true;
  const a = new Date(current.createdAt).toDateString();
  const b = new Date(previous.createdAt).toDateString();
  return a !== b;
}

export function MessageList({ messages, channelEmoji }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <span className="text-4xl">{channelEmoji ?? "\uD83D\uDCAC"}</span>
        <p className="text-sm text-zinc-500">No messages yet. Start the conversation below.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-5 py-4">
      <div className="flex-1" />
      {messages.map((msg, i) => {
        const isUser = msg.role === "user";
        const showDate = shouldShowDateSeparator(msg, messages[i - 1]);

        return (
          <div key={msg.id}>
            {showDate && (
              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-zinc-800" />
                <span className="text-[11px] font-medium text-zinc-600">
                  {formatDate(msg.createdAt)}
                </span>
                <div className="h-px flex-1 bg-zinc-800" />
              </div>
            )}
            <div
              className={cn(
                "mb-3 flex",
                isUser ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[70%] rounded-lg px-3.5 py-2.5",
                  isUser
                    ? "bg-zinc-700 text-zinc-100"
                    : "bg-zinc-800 text-zinc-200"
                )}
              >
                {!isUser && msg.agentName && (
                  <div className="mb-1 flex items-center gap-1.5">
                    <span className="text-xs leading-none">{channelEmoji}</span>
                    <span className="text-xs font-medium text-zinc-400">
                      {msg.agentName}
                    </span>
                  </div>
                )}
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                <p
                  className={cn(
                    "mt-1.5 text-[10px]",
                    isUser ? "text-right text-zinc-400" : "text-zinc-500"
                  )}
                >
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
