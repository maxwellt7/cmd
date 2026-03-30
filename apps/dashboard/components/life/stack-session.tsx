"use client";

import { cn } from "@cmd/ui";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addStackMessage, editStackMessage } from "../../app/actions/stacks";

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

interface StackMessage {
  id: string;
  sessionId: string;
  role: string;
  content: string;
  questionNumber: number | null;
  createdAt: Date;
}

interface StackSessionData {
  id: string;
  title: string;
  stackType: string;
  core4Domain: string;
  subjectEntity: string | null;
  status: string;
  userId: string | null;
  createdAt: Date;
}

interface StackSessionProps {
  session: StackSessionData;
  initialMessages: StackMessage[];
}

// ------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------

const STACK_META: Record<string, { label: string; color: string; bgClass: string; icon: string; totalQuestions: number }> = {
  gratitude: { label: "Gratitude", color: "text-emerald-400", bgClass: "bg-emerald-400/10", icon: "\u2728", totalQuestions: 15 },
  idea: { label: "Idea", color: "text-blue-400", bgClass: "bg-blue-400/10", icon: "\uD83D\uDCA1", totalQuestions: 25 },
  discover: { label: "Discover", color: "text-violet-400", bgClass: "bg-violet-400/10", icon: "\uD83D\uDD2D", totalQuestions: 14 },
  angry: { label: "Angry", color: "text-red-400", bgClass: "bg-red-400/10", icon: "\uD83D\uDD25", totalQuestions: 22 },
};

const DOMAIN_META: Record<string, { label: string; color: string }> = {
  mind: { label: "Mind", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  body: { label: "Body", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  being: { label: "Being", color: "text-violet-400 bg-violet-400/10 border-violet-400/20" },
  balance: { label: "Balance", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
};

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export function StackSession({ session, initialMessages }: StackSessionProps) {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);

  const meta = STACK_META[session.stackType] ?? STACK_META.gratitude!;
  const domainMeta = DOMAIN_META[session.core4Domain];
  const isCompleted = session.status === "completed";

  const lastQuestionNumber = initialMessages
    .filter((m) => m.role === "assistant" && m.questionNumber)
    .reduce((max, m) => Math.max(max, m.questionNumber ?? 0), 0);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [initialMessages.length]);

  // ------------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------------

  function handleSubmit() {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const content = textarea.value.trim();
    if (!content || isCompleted) return;

    const formData = new FormData();
    formData.set("sessionId", session.id);
    formData.set("role", "user");
    formData.set("content", content);
    formData.set("questionNumber", String(lastQuestionNumber));

    textarea.value = "";
    autoResize();

    startTransition(async () => {
      await addStackMessage(formData);
      router.refresh();
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

  function initiateEdit(msgId: string, content: string) {
    // Check if there are messages after this one
    const msgIndex = initialMessages.findIndex((m) => m.id === msgId);
    const hasSubsequent = msgIndex < initialMessages.length - 1;

    if (hasSubsequent) {
      setPendingEditId(msgId);
      setEditContent(content);
      setShowEditConfirm(true);
    } else {
      setEditingId(msgId);
      setEditContent(content);
    }
  }

  function confirmEdit() {
    if (pendingEditId) {
      setEditingId(pendingEditId);
      setShowEditConfirm(false);
      setPendingEditId(null);
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setEditContent("");
    setShowEditConfirm(false);
    setPendingEditId(null);
  }

  function saveEdit() {
    if (!editingId || !editContent.trim()) return;

    const formData = new FormData();
    formData.set("id", editingId);
    formData.set("newContent", editContent.trim());

    startTransition(async () => {
      await editStackMessage(formData);
      setEditingId(null);
      setEditContent("");
      router.refresh();
    });
  }

  function exportConversation() {
    const lines = initialMessages.map((msg) => {
      const label = msg.role === "assistant"
        ? `[Q${msg.questionNumber ?? ""}] Assistant`
        : "You";
      return `${label}:\n${msg.content}\n`;
    });

    const header = `${meta.label} Stack: ${session.title}\nDomain: ${domainMeta?.label ?? session.core4Domain}\nSubject: ${session.subjectEntity ?? "N/A"}\nDate: ${new Date(session.createdAt).toLocaleDateString()}\n${"=".repeat(50)}\n\n`;
    const text = header + lines.join("\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stack-${session.stackType}-${session.id.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <div className="mx-auto flex max-w-3xl flex-col" style={{ height: "calc(100vh - 140px)" }}>
      {/* Header */}
      <div className="shrink-0 space-y-2 pb-4">
        <Link
          href="/life/stacks"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Stacks
        </Link>

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{meta.icon}</span>
            <div>
              <h1 className="text-lg font-bold">{session.title}</h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                <span className={cn(meta.color, "font-medium")}>{meta.label}</span>
                {domainMeta && (
                  <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium", domainMeta.color)}>
                    {domainMeta.label}
                  </span>
                )}
                {session.subjectEntity && (
                  <span>&middot; {session.subjectEntity}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">
              Q {lastQuestionNumber}/{meta.totalQuestions}
            </span>
            <button
              onClick={exportConversation}
              className="rounded-lg border border-zinc-800 px-2.5 py-1.5 text-xs text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-300"
              title="Export conversation"
            >
              Export
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-zinc-800">
          <div
            className={cn(
              "h-1.5 rounded-full transition-all",
              session.stackType === "gratitude" && "bg-emerald-500",
              session.stackType === "idea" && "bg-blue-500",
              session.stackType === "discover" && "bg-violet-500",
              session.stackType === "angry" && "bg-red-500"
            )}
            style={{ width: `${Math.min((lastQuestionNumber / meta.totalQuestions) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-4 md:px-5">
        {initialMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <span className="text-4xl">{meta.icon}</span>
            <p className="text-sm text-zinc-500">Starting your {meta.label} Stack...</p>
          </div>
        ) : (
          <>
            {initialMessages.map((msg) => {
              const isUser = msg.role === "user";
              const isEditing = editingId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={cn("mb-3 flex", isUser ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "group relative max-w-[85%] rounded-lg px-3.5 py-2.5 md:max-w-[70%]",
                      isUser ? "bg-zinc-700 text-zinc-100" : "bg-zinc-800 text-zinc-200"
                    )}
                  >
                    {/* Question number badge for assistant messages */}
                    {!isUser && msg.questionNumber && (
                      <div className="mb-1.5 flex items-center gap-1.5">
                        <span className={cn(
                          "inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                          meta.bgClass, meta.color
                        )}>
                          {msg.questionNumber}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          of {meta.totalQuestions}
                        </span>
                      </div>
                    )}

                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full resize-none rounded border border-zinc-600 bg-zinc-800 px-2 py-1.5 text-sm text-zinc-100 outline-none focus:border-zinc-500"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={saveEdit}
                            disabled={isPending}
                            className="rounded bg-zinc-600 px-3 py-1 text-xs font-medium text-zinc-100 transition-colors hover:bg-zinc-500 disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="rounded px-3 py-1 text-xs text-zinc-400 transition-colors hover:text-zinc-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                        {/* Edit button for user messages */}
                        {isUser && !isCompleted && (
                          <button
                            onClick={() => initiateEdit(msg.id, msg.content)}
                            className="absolute -right-2 -top-2 hidden rounded-full border border-zinc-700 bg-zinc-800 p-1 text-zinc-500 transition-colors hover:text-zinc-300 group-hover:block"
                            title="Edit message"
                          >
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                              <path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Edit Confirmation Dialog */}
      {showEditConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="mx-4 max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <h3 className="text-sm font-semibold">Edit this message?</h3>
            <p className="mt-2 text-xs text-zinc-400">
              Editing this message will delete all subsequent messages in the conversation. This cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={cancelEdit}
                className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmEdit}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-500"
              >
                Edit & Delete Subsequent
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completion Screen */}
      {isCompleted ? (
        <div className="shrink-0 rounded-xl border border-zinc-800 bg-zinc-900 p-5 mt-4 text-center">
          <span className="text-3xl">&#127942;</span>
          <h2 className="mt-2 text-lg font-bold">Stack Complete!</h2>
          <p className="mt-1 text-sm text-zinc-400">
            You&apos;ve completed all {meta.totalQuestions} questions in your {meta.label} Stack.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link
              href="/life/stacks/history"
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              View History
            </Link>
            <Link
              href={`/life/stacks/new?type=${session.stackType}`}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors",
                session.stackType === "gratitude" && "bg-emerald-600 hover:bg-emerald-500",
                session.stackType === "idea" && "bg-blue-600 hover:bg-blue-500",
                session.stackType === "discover" && "bg-violet-600 hover:bg-violet-500",
                session.stackType === "angry" && "bg-red-600 hover:bg-red-500"
              )}
            >
              Start New Stack
            </Link>
          </div>
        </div>
      ) : (
        /* Input Area */
        <div className="shrink-0 pt-3">
          <div className="flex items-end gap-3">
            <textarea
              ref={textareaRef}
              onInput={autoResize}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer... (Enter to send, Shift+Enter for newline)"
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
              aria-label="Send answer"
            >
              {isPending ? (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M14.5 1.5L7 9M14.5 1.5L10 14.5L7 9M14.5 1.5L1.5 6L7 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
