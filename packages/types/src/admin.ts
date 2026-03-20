export interface AgentConfig {
  id: string;
  name: string;
  emoji: string;
  description: string;
  model: string;
  isOnline: boolean;
  messagesToday: number;
  lastActiveAt: Date | null;
}

export interface IntegrationStatus {
  name: string;
  connected: boolean;
  lastSyncAt: Date | null;
  error: string | null;
}
