import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { cn } from "@cmd/ui";
import { getUserByClerkId } from "../../../actions/user";
import { getStackSessions, getStackStats } from "../../../actions/stacks";

export const dynamic = "force-dynamic";

const STACK_TYPES = [
  {
    type: "gratitude",
    label: "Gratitude",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10 border-emerald-400/20",
    btnBg: "bg-emerald-600 hover:bg-emerald-500",
    description: "Cultivate appreciation and recognize positive patterns",
    questionCount: 15,
    icon: "\u2728",
  },
  {
    type: "idea",
    label: "Idea",
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/20",
    btnBg: "bg-blue-600 hover:bg-blue-500",
    description: "Transform insights into actionable plans",
    questionCount: 25,
    icon: "\uD83D\uDCA1",
  },
  {
    type: "discover",
    label: "Discover",
    color: "text-violet-400",
    bg: "bg-violet-400/10 border-violet-400/20",
    btnBg: "bg-violet-600 hover:bg-violet-500",
    description: "Explore transformative lessons from experiences",
    questionCount: 14,
    icon: "\uD83D\uDD2D",
  },
  {
    type: "angry",
    label: "Angry",
    color: "text-red-400",
    bg: "bg-red-400/10 border-red-400/20",
    btnBg: "bg-red-600 hover:bg-red-500",
    description: "Transform anger into empowerment",
    questionCount: 22,
    icon: "\uD83D\uDD25",
  },
] as const;

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  in_progress: "bg-amber-400/10 text-amber-400 border-amber-400/20",
};

function getStackMeta(type: string) {
  return STACK_TYPES.find((s) => s.type === type);
}

export default async function StacksPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const dbUser = await getUserByClerkId(clerkId);
  if (!dbUser) redirect("/sign-in");

  const [stats, sessions] = await Promise.all([
    getStackStats(dbUser.id),
    getStackSessions(dbUser.id),
  ]);

  const recentSessions = sessions.slice(0, 5);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="text-xl font-bold md:text-2xl">Sovereignty Stacks</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-sm text-zinc-500">Total Stacks</p>
          <p className="mt-1 text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-sm text-zinc-500">Completed</p>
          <p className="mt-1 text-2xl font-bold text-emerald-400">{stats.completed}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-sm text-zinc-500">In Progress</p>
          <p className="mt-1 text-2xl font-bold text-amber-400">{stats.inProgress}</p>
        </div>
      </div>

      {/* Stack Type Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {STACK_TYPES.map((stack) => (
          <div
            key={stack.type}
            className={cn(
              "rounded-xl border p-5 transition-colors",
              stack.bg
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{stack.icon}</span>
              <h2 className={cn("text-lg font-semibold", stack.color)}>
                {stack.label}
              </h2>
            </div>
            <p className="mt-2 text-sm text-zinc-400">{stack.description}</p>
            <div className="mt-1 text-xs text-zinc-600">
              {stack.questionCount} questions
            </div>
            <Link
              href={`/life/stacks/new?type=${stack.type}`}
              className={cn(
                "mt-4 inline-block rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors",
                stack.btnBg
              )}
            >
              Start Stack
            </Link>
          </div>
        ))}
      </div>

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 md:p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold md:text-lg">Recent Sessions</h2>
            <Link
              href="/life/stacks/history"
              className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
            >
              View all
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {recentSessions.map((session) => {
              const meta = getStackMeta(session.stackType);
              return (
                <Link
                  key={session.id}
                  href={`/life/stacks/${session.id}`}
                  className="flex items-center gap-3 rounded-lg border border-zinc-800 p-3 transition-colors hover:bg-zinc-800/50"
                >
                  <span className="text-lg">{meta?.icon ?? "\uD83D\uDCCB"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{session.title}</p>
                    <p className="text-xs text-zinc-500">
                      {session.subjectEntity} &middot; {meta?.label ?? session.stackType}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                      STATUS_COLORS[session.status] ?? "bg-zinc-800 text-zinc-400 border-zinc-700"
                    )}
                  >
                    {session.status === "completed" ? "Completed" : "In Progress"}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
