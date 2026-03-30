import {
  pgTable, text, varchar, integer, numeric, boolean,
  timestamp, date, index,
} from "drizzle-orm/pg-core";
import { users } from "./auth";

// ---------------------------------------------------------------------------
// Existing Life tables
// ---------------------------------------------------------------------------

export const pillarScores = pgTable("pillar_scores", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  pillar: varchar("pillar", { length: 20 }).notNull(),
  score: numeric("score").notNull(),
  weekStart: date("week_start").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const pipelineEntries = pgTable("pipeline_entries", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  level: varchar("level", { length: 30 }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").notNull().default(""),
  progress: integer("progress").notNull().default(0),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  parentId: text("parent_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const priorities = pgTable("priorities", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: varchar("title", { length: 500 }).notNull(),
  pillar: varchar("pillar", { length: 20 }).notNull(),
  date: date("date").notNull(),
  completed: boolean("completed").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  // New fields for weekly view
  category: varchar("category", { length: 20 }).notNull().default("hit_list"), // hit_list, do_list
  domain: varchar("domain", { length: 20 }), // mind, body, being, balance
  priority: varchar("priority_level", { length: 30 }), // urgent_important, important, urgent, normal
  startTime: varchar("start_time", { length: 10 }),
  endTime: varchar("end_time", { length: 10 }),
  notes: text("notes"),
});

export const journalEntries = pgTable("journal_entries", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  date: date("date").notNull(),
  stackType: varchar("stack_type", { length: 30 }).notNull(),
  prompt: text("prompt").notNull(),
  content: text("content").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Sovereignty Stack System
// ---------------------------------------------------------------------------

export const stackSessions = pgTable("stack_sessions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  stackType: varchar("stack_type", { length: 20 }).notNull(), // gratitude, idea, discover, angry
  core4Domain: varchar("core4_domain", { length: 20 }).notNull(), // mind, body, being, balance
  status: varchar("status", { length: 20 }).notNull().default("in_progress"),
  currentQuestionIndex: integer("current_question_index").notNull().default(0),
  subjectEntity: text("subject_entity"), // Who/What being stacked
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const stackMessages = pgTable("stack_messages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionId: text("session_id").notNull().references(() => stackSessions.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 10 }).notNull(), // user, assistant
  content: text("content").notNull(),
  questionNumber: integer("question_number"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("idx_stack_messages_session_created").on(table.sessionId, table.createdAt),
]);
