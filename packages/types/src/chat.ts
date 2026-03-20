export interface AgentChannel {
  id: string;
  agentId: string;
  agentName: string;
  agentEmoji: string;
  isGeneral: boolean;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  role: "user" | "assistant";
  agentId: string | null;
  agentName: string | null;
  content: string;
  createdAt: Date;
}

export type RelayStatus = "connected" | "reconnecting" | "offline";
