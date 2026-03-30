// ---------------------------------------------------------------------------
// Companies
// ---------------------------------------------------------------------------

export interface Company {
  id: string;
  name: string;
  parentCompanyId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CompanyMemberRole = "superadmin" | "admin" | "member" | "viewer";

export interface CompanyMember {
  id: string;
  companyId: string;
  userId: string;
  role: CompanyMemberRole;
  createdAt: Date;
}

export interface CompanyInvite {
  id: string;
  companyId: string;
  email: string;
  role: CompanyMemberRole;
  invitedBy: string | null;
  status: "pending" | "accepted" | "expired";
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// Scorecard
// ---------------------------------------------------------------------------

export interface ScorecardKpi {
  id: string;
  companyId: string | null;
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

// ---------------------------------------------------------------------------
// Rocks
// ---------------------------------------------------------------------------

export type RockStatus = "on_track" | "off_track" | "done";

export interface Rock {
  id: string;
  companyId: string | null;
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
  dueDate: string | null;
  completed: boolean;
  sortOrder: number;
}

// ---------------------------------------------------------------------------
// Issues
// ---------------------------------------------------------------------------

export type IssueCategory = "short_term" | "long_term";
export type IssuePhase = "identify" | "discuss" | "solve" | "resolved";

export interface Issue {
  id: string;
  companyId: string | null;
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

// ---------------------------------------------------------------------------
// Todos
// ---------------------------------------------------------------------------

export interface Todo {
  id: string;
  companyId: string | null;
  title: string;
  ownerId: string;
  ownerName: string;
  dueDate: string | null;
  completed: boolean;
  sourceType: "issue" | "meeting" | "manual";
  sourceId: string | null;
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// V/TO
// ---------------------------------------------------------------------------

export interface VtoSection {
  id: string;
  companyId: string | null;
  sectionKey: string;
  content: string;
  version: number;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Meetings
// ---------------------------------------------------------------------------

export type MeetingType = "level_10" | "quarterly" | "annual" | "focus_day" | "vision_building" | "custom";

export type MeetingSegment =
  | "segue"
  | "scorecard"
  | "rocks"
  | "headlines"
  | "todos"
  | "ids"
  | "conclude";

export interface MeetingTemplate {
  id: string;
  companyId: string | null;
  name: string;
  meetingType: MeetingType;
  segments: string; // comma-separated segment names
  segmentDurations: string; // comma-separated minutes
  createdAt: Date;
  updatedAt: Date;
}

export interface Meeting {
  id: string;
  companyId: string | null;
  templateId: string | null;
  meetingType: MeetingType;
  date: string;
  status: "scheduled" | "in_progress" | "completed";
  currentSegment: MeetingSegment | null;
  segmentStartedAt: Date | null;
  rating: number | null;
  notes: string;
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// Seats
// ---------------------------------------------------------------------------

export type GwcRating = "yes" | "no" | "maybe";

export interface Seat {
  id: string;
  companyId: string | null;
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

// ---------------------------------------------------------------------------
// Resources
// ---------------------------------------------------------------------------

export type ResourceType = "training" | "lesson" | "document" | "link" | "video";

export interface Resource {
  id: string;
  companyId: string | null;
  title: string;
  description: string;
  type: ResourceType;
  content: string;
  attachmentUrl: string | null;
  attachmentName: string | null;
  category: string | null;
  sortOrder: number;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}
