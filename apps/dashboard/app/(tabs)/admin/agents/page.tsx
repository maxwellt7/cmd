import { getAgents } from "../../../actions/admin";
import { AgentListClient } from "./agent-list-client";

export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  const agents = await getAgents();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-50">Agent Management</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Add, edit, and manage your AI agents
        </p>
      </div>

      <AgentListClient
        initialAgents={agents.map((a) => ({
          id: a.id,
          name: a.name,
          emoji: a.emoji,
          description: a.description,
          model: a.model,
          isOnline: a.isOnline,
          messagesToday: a.messagesToday,
          lastActiveAt: a.lastActiveAt,
          openclawId: a.openclawId,
        }))}
      />
    </div>
  );
}
