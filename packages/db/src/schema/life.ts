import {
  pgTable, text, varchar, integer, numeric, boolean,
  timestamp, date,
} from "drizzle-orm/pg-core";

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
});

export const journalEntries = pgTable("journal_entries", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  date: date("date").notNull(),
  stackType: varchar("stack_type", { length: 30 }).notNull(),
  prompt: text("prompt").notNull(),
  content: text("content").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
