export interface ScorecardKpi {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  goal: number;
  unit: string; // "$", "%", "#", "x"
  quarter: string; // "2026-Q1"
  createdAt: Date;
}

export interface ScorecardEntry {
  id: string;
  kpiId: string;
  weekStart: string; // ISO date of Monday
  goal: number;
  actual: number | null;
  status: "on_track" | "off_track" | "no_data";
}

export type RockStatus = "on_track" | "off_track" | "done";

export interface Rock {
  id: string;
  title: string;
  ownerId: string;
  ownerName: string;
  quarter: string;
  status: RockStatus;
  dueDate: string;
  createdAt: Date;
}

export interface Milestone {
  id: string;
  rockId: string;
  title: string;
  completed: boolean;
  sortOrder: number;
}

export type IssueCategory = "short_term" | "long_term";
export type IssuePhase = "identify" | "discuss" | "solve" | "resolved";

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  phase: IssuePhase;
  ownerId: string | null;
  ownerName: string | null;
  priority: number;
  createdAt: Date;
  resolvedAt: Date | null;
}

export interface Todo {
  id: string;
  title: string;
  ownerId: string;
  ownerName: string;
  dueDate: string | null;
  completed: boolean;
  sourceType: "issue" | "meeting" | "manual";
  sourceId: string | null;
  createdAt: Date;
}

export interface VtoSection {
  id: string;
  sectionKey: string; // "core_values" | "core_focus" | "ten_year_target" | etc.
  content: string; // rich text / markdown
  version: number;
  updatedAt: Date;
}

export type MeetingSegment =
  | "segue"
  | "scorecard"
  | "rocks"
  | "headlines"
  | "todos"
  | "ids"
  | "conclude";

export interface Meeting {
  id: string;
  date: string;
  status: "scheduled" | "in_progress" | "completed";
  currentSegment: MeetingSegment | null;
  segmentStartedAt: Date | null;
  rating: number | null;
  notes: string;
  createdAt: Date;
}

export type GwcRating = "yes" | "no" | "maybe";

export interface Seat {
  id: string;
  title: string;
  parentSeatId: string | null;
  personId: string | null;
  personName: string | null;
  roles: string[]; // up to 5
  getsIt: GwcRating | null;
  wantsIt: GwcRating | null;
  capacityForIt: GwcRating | null;
  sortOrder: number;
}
