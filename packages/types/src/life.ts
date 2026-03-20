export type PillarKey = "profit" | "power" | "purpose" | "presence";

export interface PillarScore {
  id: string;
  pillar: PillarKey;
  score: number; // 1-10
  weekStart: string;
  notes: string | null;
}

export type PipelineLevel =
  | "life_goal"
  | "annual_aim"
  | "quarterly_objective"
  | "monthly_sprint"
  | "weekly_focus"
  | "daily_action";

export interface PipelineEntry {
  id: string;
  level: PipelineLevel;
  title: string;
  description: string;
  progress: number; // 0-100
  startDate: string;
  endDate: string;
  parentId: string | null;
}

export interface Priority {
  id: string;
  title: string;
  pillar: PillarKey;
  date: string;
  completed: boolean;
  sortOrder: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  stackType: string; // "sovereign_self" | "gratitude" | "idea" | "discovery"
  prompt: string;
  content: string;
  createdAt: Date;
}
