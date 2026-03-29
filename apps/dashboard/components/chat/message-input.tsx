"use client";

import { cn } from "@cmd/ui";
import { useRef, useTransition } from "react";
import { sendMessage } from "../../app/actions/chat";

interface MessageInputProps {
  channelId: string;
}

export function MessageInput({ channelId }: MessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const content = textarea.value.trim();
    if (!content) return;

    const formData = new FormData();
    formData.set("channelId", channelId);
    formData.set("content", content);
    formData.set("role", "user");

    textarea.value = "";
    autoResize();

    startTransition(async () => {
      await sendMessage(formData);
    });
  }

  function autoResize() {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="border-t border-zinc-800 bg-zinc-950/60 px-3 md:px-5 py-3">
      <div className="flex items-end gap-3">
        <textarea
          ref={textareaRef}
          onInput={autoResize}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Enter to send, Shift+Enter for newline)"
          rows={1}
          disabled={isPending}
          className={cn(
            "flex-1 resize-none rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-colors",
            "focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700",
            "disabled:opacity-50"
          )}
        />
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors",
            "bg-zinc-100 text-zinc-900 hover:bg-white",
            "disabled:opacity-50 disabled:hover:bg-zinc-100"
          )}
          aria-label="Send message"
        >
          {isPending ? (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.5 1.5L7 9M14.5 1.5L10 14.5L7 9M14.5 1.5L1.5 6L7 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
