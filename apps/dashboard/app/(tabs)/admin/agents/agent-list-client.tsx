"use client";

import { useState } from "react";
import { AgentCard } from "../../../../components/admin/agent-card";
import { AgentForm } from "../../../../components/admin/agent-form";
import type { AgentConfig } from "@cmd/types";

type AgentWithOpenclawId = AgentConfig & { openclawId: string };

interface AgentListClientProps {
  initialAgents: AgentWithOpenclawId[];
}

export function AgentListClient({ initialAgents }: AgentListClientProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AgentWithOpenclawId | null>(
    null
  );

  function handleEdit(agent: AgentWithOpenclawId) {
    setEditingAgent(agent);
    setShowForm(true);
  }

  function handleClose() {
    setShowForm(false);
    setEditingAgent(null);
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          {initialAgents.length} agent{initialAgents.length !== 1 ? "s" : ""}{" "}
          configured
        </p>
        <button
          onClick={() => {
            setEditingAgent(null);
            setShowForm(true);
          }}
          className="rounded-lg bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200"
        >
          + Add Agent
        </button>
      </div>

      {initialAgents.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-800 py-16">
          <span className="text-4xl">{"\uD83E\uDD16"}</span>
          <p className="text-sm text-zinc-500">No agents yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
          >
            Create your first agent
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {initialAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} onEdit={handleEdit} />
          ))}
        </div>
      )}

      {showForm && (
        <AgentForm agent={editingAgent} onClose={handleClose} />
      )}
    </>
  );
}
