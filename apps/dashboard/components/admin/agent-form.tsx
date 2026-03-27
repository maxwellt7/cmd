"use client";

import { cn } from "@cmd/ui";
import { addAgent, updateAgent } from "../../app/actions/admin";
import { useState, useTransition } from "react";
import type { AgentConfig } from "@cmd/types";

const MODEL_OPTIONS = [
  "gpt-4o",
  "gpt-4o-mini",
  "claude-sonnet-4-20250514",
  "claude-opus-4-20250514",
  "claude-3-5-haiku-20241022",
  "gemini-2.0-flash",
  "gemini-2.0-pro",
];

type AgentWithOpenclawId = AgentConfig & { openclawId: string };

interface AgentFormProps {
  agent: AgentWithOpenclawId | null;
  onClose: () => void;
}

export function AgentForm({ agent, onClose }: AgentFormProps) {
  const isEditing = !!agent;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(agent?.name ?? "");
  const [emoji, setEmoji] = useState(agent?.emoji ?? "");
  const [openclawId, setOpenclawId] = useState(agent?.openclawId ?? "");
  const [description, setDescription] = useState(agent?.description ?? "");
  const [model, setModel] = useState(agent?.model ?? MODEL_OPTIONS[0]!);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !emoji.trim() || !openclawId.trim()) {
      setError("Name, emoji, and OpenClaw ID are required.");
      return;
    }

    startTransition(async () => {
      try {
        if (isEditing) {
          await updateAgent(agent.id, {
            name: name.trim(),
            emoji: emoji.trim(),
            openclawId: openclawId.trim(),
            description: description.trim(),
            model,
          });
        } else {
          await addAgent({
            name: name.trim(),
            emoji: emoji.trim(),
            openclawId: openclawId.trim(),
            description: description.trim(),
            model,
          });
        }
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-50">
            {isEditing ? "Edit Agent" : "Add Agent"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="w-20">
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                Emoji
              </label>
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                placeholder="🤖"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-center text-lg text-zinc-50 placeholder:text-zinc-700 focus:border-zinc-600 focus:outline-none"
                maxLength={4}
              />
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Agent name"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-700 focus:border-zinc-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              OpenClaw ID
            </label>
            <input
              type="text"
              value={openclawId}
              onChange={(e) => setOpenclawId(e.target.value)}
              placeholder="e.g. agent-abc123"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-700 focus:border-zinc-600 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this agent do?"
              rows={3}
              className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-700 focus:border-zinc-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 focus:border-zinc-600 focus:outline-none"
            >
              {MODEL_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={cn(
                "rounded-lg bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200",
                isPending && "opacity-60"
              )}
            >
              {isPending
                ? "Saving..."
                : isEditing
                  ? "Update Agent"
                  : "Create Agent"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
