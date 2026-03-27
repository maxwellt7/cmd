import { getAdminStats, getRecentActivity } from "../../actions/admin";

export const dynamic = "force-dynamic";

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

export default async function AdminOverviewPage() {
  const [stats, activity] = await Promise.all([
    getAdminStats(),
    getRecentActivity(),
  ]);

  const statCards = [
    {
      label: "Total Agents",
      value: stats.totalAgents,
      icon: "\uD83E\uDD16",
    },
    {
      label: "Online Now",
      value: stats.onlineAgents,
      icon: "\uD83D\uDFE2",
    },
    {
      label: "Messages Today",
      value: stats.messagesToday,
      icon: "\uD83D\uDCAC",
    },
    {
      label: "Queue Pending",
      value: stats.pendingQueue,
      icon: "\uD83D\uDCE8",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-50">Admin Overview</h1>
        <p className="mt-1 text-sm text-zinc-500">
          System status and recent activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-5"
          >
            <span className="text-2xl">{card.icon}</span>
            <div>
              <p className="text-2xl font-bold text-zinc-50">{card.value}</p>
              <p className="text-xs text-zinc-500">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Agents */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-4 text-sm font-semibold text-zinc-400">
            Recently Updated Agents
          </h2>
          {activity.recentAgents.length === 0 ? (
            <p className="py-4 text-center text-sm text-zinc-600">
              No agents yet
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {activity.recentAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between rounded-lg bg-zinc-950/50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{agent.emoji}</span>
                    <div>
                      <p className="text-sm font-medium text-zinc-200">
                        {agent.name}
                      </p>
                      <p className="text-xs text-zinc-600">
                        Last active: {formatTime(agent.lastActiveAt)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`h-2 w-2 rounded-full ${agent.isOnline ? "bg-emerald-400" : "bg-zinc-600"}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Queue */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-4 text-sm font-semibold text-zinc-400">
            Recent Queue Activity
          </h2>
          {activity.recentQueue.length === 0 ? (
            <p className="py-4 text-center text-sm text-zinc-600">
              No queue entries
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {activity.recentQueue.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg bg-zinc-950/50 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-zinc-300">
                      {entry.content.length > 50
                        ? entry.content.slice(0, 50) + "..."
                        : entry.content}
                    </p>
                    <p className="font-mono text-xs text-zinc-600">
                      {formatTime(entry.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`ml-3 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                      entry.status === "delivered"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : entry.status === "failed"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-amber-500/15 text-amber-400"
                    }`}
                  >
                    {entry.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
