"use client";

import { cn } from "@cmd/ui";
import { useEffect, useRef, useTransition } from "react";
import { createChannel } from "../../app/actions/chat";
import { useRouter } from "next/navigation";

interface CreateChannelDialogProps {
  onClose: () => void;
}

const EMOJI_SUGGESTIONS = ["\uD83E\uDD16", "\uD83E\uDDE0", "\u26A1", "\uD83D\uDD25", "\uD83D\uDE80", "\uD83C\uDF1F", "\uD83D\uDCAB", "\uD83D\uDC7E", "\uD83C\uDFAF", "\uD83D\uDEE0\uFE0F"];

export function CreateChannelDialog({ onClose }: CreateChannelDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const overlayRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();

    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createChannel(formData);
      if (result.channel) {
        onClose();
        router.push(`/chat/${result.channel.id}`);
      }
    });
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        <h2 className="mb-1 text-lg font-semibold text-zinc-100">Create Channel</h2>
        <p className="mb-5 text-sm text-zinc-500">Add a new agent channel to start chatting.</p>

        <form action={handleSubmit} className="space-y-4">
          {/* Agent Name */}
          <div>
            <label htmlFor="agentName" className="mb-1.5 block text-xs font-medium text-zinc-400">
              Agent Name
            </label>
            <input
              ref={nameRef}
              id="agentName"
              name="agentName"
              type="text"
              required
              placeholder="e.g. Claude Assistant"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
            />
          </div>

          {/* Agent ID */}
          <div>
            <label htmlFor="agentId" className="mb-1.5 block text-xs font-medium text-zinc-400">
              Agent ID
            </label>
            <input
              id="agentId"
              name="agentId"
              type="text"
              required
              placeholder="e.g. claude-3"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
            />
          </div>

          {/* Emoji */}
          <div>
            <label htmlFor="agentEmoji" className="mb-1.5 block text-xs font-medium text-zinc-400">
              Emoji
            </label>
            <input
              id="agentEmoji"
              name="agentEmoji"
              type="text"
              required
              maxLength={10}
              placeholder="Pick an emoji"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {EMOJI_SUGGESTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    const input = document.getElementById("agentEmoji") as HTMLInputElement;
                    if (input) input.value = emoji;
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-base transition-colors hover:bg-zinc-800"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* General toggle */}
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              name="isGeneral"
              value="true"
              className="h-4 w-4 rounded border-zinc-700 bg-zinc-950 text-zinc-100 accent-zinc-100"
            />
            <span className="text-sm text-zinc-400">General channel (pinned to top)</span>
          </label>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                "bg-zinc-100 text-zinc-900 hover:bg-white",
                "disabled:opacity-50"
              )}
            >
              {isPending ? "Creating..." : "Create Channel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
