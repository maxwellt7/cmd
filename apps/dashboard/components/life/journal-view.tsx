"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@cmd/ui";
import {
  addJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
} from "../../app/actions/life";

const STACK_TYPES = [
  {
    key: "sovereign_self",
    label: "Sovereign Self",
    prompt: "Who am I becoming?",
    color: "text-violet-400",
    bg: "bg-violet-400/10 border-violet-400/20",
  },
  {
    key: "gratitude",
    label: "Gratitude",
    prompt: "What am I grateful for?",
    color: "text-amber-400",
    bg: "bg-amber-400/10 border-amber-400/20",
  },
  {
    key: "idea",
    label: "Idea",
    prompt: "What's the idea?",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10 border-cyan-400/20",
  },
  {
    key: "discovery",
    label: "Discovery",
    prompt: "What did I learn?",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10 border-emerald-400/20",
  },
] as const;

const STACK_MAP = new Map<string, (typeof STACK_TYPES)[number]>(STACK_TYPES.map((s) => [s.key, s]));

interface JournalEntryData {
  id: string;
  date: string;
  stackType: string;
  prompt: string;
  content: string;
  createdAt: string;
}

interface JournalViewProps {
  entries: JournalEntryData[];
  filterDate: string | null;
}

export function JournalView({ entries, filterDate }: JournalViewProps) {
  const router = useRouter();
  const [showCompose, setShowCompose] = useState(false);
  const [selectedStack, setSelectedStack] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  function handleDateFilter(date: string) {
    if (date) {
      router.push(`/life/journal?date=${date}`);
    } else {
      router.push("/life/journal");
    }
  }

  async function handleSubmit() {
    if (!selectedStack || !content.trim()) return;
    setSubmitting(true);
    const fd = new FormData();
    fd.set("date", filterDate ?? new Date().toISOString().split("T")[0]!);
    fd.set("stackType", selectedStack);
    fd.set("content", content.trim());
    await addJournalEntry(fd);
    setContent("");
    setSelectedStack(null);
    setShowCompose(false);
    setSubmitting(false);
  }

  async function handleUpdate(id: string) {
    if (!editContent.trim()) return;
    setSubmitting(true);
    const fd = new FormData();
    fd.set("id", id);
    fd.set("content", editContent.trim());
    await updateJournalEntry(fd);
    setEditingId(null);
    setEditContent("");
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    const fd = new FormData();
    fd.set("id", id);
    await deleteJournalEntry(fd);
  }

  return (
    <div className="space-y-4">
      {/* Date filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-3">
        <input
          type="date"
          value={filterDate ?? ""}
          onChange={(e) => handleDateFilter(e.target.value)}
          className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 focus:border-zinc-600 focus:outline-none"
        />
        {filterDate && (
          <button
            onClick={() => handleDateFilter("")}
            className="rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-colors"
          >
            Show all
          </button>
        )}
      </div>

      {/* Compose */}
      {showCompose ? (
        <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-3 md:p-5 space-y-3 md:space-y-4">
          <p className="text-sm font-medium text-zinc-400">Choose a stack type:</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {STACK_TYPES.map((st) => (
              <button
                key={st.key}
                onClick={() => setSelectedStack(st.key)}
                className={cn(
                  "rounded-lg border p-3 text-left transition-colors",
                  selectedStack === st.key
                    ? st.bg
                    : "border-zinc-800 hover:border-zinc-700"
                )}
              >
                <span className={cn("text-sm font-medium", selectedStack === st.key ? st.color : "text-zinc-400")}>
                  {st.label}
                </span>
                <p className="mt-0.5 text-xs text-zinc-600">{st.prompt}</p>
              </button>
            ))}
          </div>

          {selectedStack && (
            <>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                <p className={cn("text-sm font-medium italic", STACK_MAP.get(selectedStack)?.color ?? "text-zinc-400")}>
                  {STACK_MAP.get(selectedStack)?.prompt}
                </p>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your entry..."
                rows={6}
                autoFocus
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-300 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none leading-relaxed"
              />
            </>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={submitting || !selectedStack || !content.trim()}
              className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-700 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save Entry"}
            </button>
            <button
              onClick={() => {
                setShowCompose(false);
                setSelectedStack(null);
                setContent("");
              }}
              className="rounded-lg px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowCompose(true)}
          className="w-full rounded-lg border border-dashed border-zinc-800 px-4 py-3 text-sm text-zinc-600 hover:border-zinc-700 hover:text-zinc-400 transition-colors"
        >
          + New Journal Entry
        </button>
      )}

      {/* Entries list */}
      {entries.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-800 py-8 text-center">
          <p className="text-sm text-zinc-500">
            {filterDate ? "No entries for this date." : "No journal entries yet."}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {entries.map((entry) => {
          const stack = STACK_MAP.get(entry.stackType);
          const isEditing = editingId === entry.id;

          return (
            <div
              key={entry.id}
              className={cn(
                "rounded-xl border p-4 transition-colors",
                stack?.bg ?? "border-zinc-800 bg-zinc-900"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <span className={cn("font-semibold uppercase tracking-wide", stack?.color ?? "text-zinc-500")}>
                    {stack?.label ?? entry.stackType}
                  </span>
                  <span className="text-zinc-600">{entry.date}</span>
                </div>
                <div className="flex gap-1">
                  {!isEditing && (
                    <button
                      onClick={() => {
                        setEditingId(entry.id);
                        setEditContent(entry.content);
                      }}
                      className="rounded px-2 py-0.5 text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="rounded px-2 py-0.5 text-xs text-zinc-600 hover:text-red-400 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className={cn("mt-1 text-xs italic", stack?.color ?? "text-zinc-500")}>
                {entry.prompt}
              </p>

              {isEditing ? (
                <div className="mt-2 space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={4}
                    autoFocus
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 focus:border-zinc-600 focus:outline-none leading-relaxed"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(entry.id)}
                      disabled={submitting}
                      className="rounded bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 disabled:opacity-50"
                    >
                      {submitting ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditContent("");
                      }}
                      className="rounded px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                  {entry.content}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
