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

// ---------------------------------------------------------------------------
// Sovereignty Stack System
// ---------------------------------------------------------------------------

export type StackType = "gratitude" | "idea" | "discover" | "angry";
export type Core4Domain = "mind" | "body" | "being" | "balance";
export type StackStatus = "in_progress" | "completed";

export interface StackSession {
  id: string;
  userId: string | null;
  title: string;
  stackType: StackType;
  core4Domain: Core4Domain;
  status: StackStatus;
  currentQuestionIndex: number;
  subjectEntity: string | null;
  createdAt: Date;
  completedAt: Date | null;
}

export interface StackMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  questionNumber: number | null;
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// Priority enhancements
// ---------------------------------------------------------------------------

export type PriorityCategory = "hit_list" | "do_list";
export type PriorityLevel = "urgent_important" | "important" | "urgent" | "normal";
