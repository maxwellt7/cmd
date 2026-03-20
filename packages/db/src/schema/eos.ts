import {
  pgTable, text, varchar, integer, numeric, boolean,
  timestamp, date,
} from "drizzle-orm/pg-core";
import { users } from "./auth";

export const scorecardKpis = pgTable("scorecard_kpis", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  ownerId: text("owner_id").references(() => users.id),
  ownerName: varchar("owner_name", { length: 255 }).notNull(),
  goal: numeric("goal").notNull(),
  unit: varchar("unit", { length: 10 }).notNull().default("#"),
  quarter: varchar("quarter", { length: 10 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const scorecardEntries = pgTable("scorecard_entries", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  kpiId: text("kpi_id").notNull().references(() => scorecardKpis.id, { onDelete: "cascade" }),
  weekStart: date("week_start").notNull(),
  goal: numeric("goal").notNull(),
  actual: numeric("actual"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const rocks = pgTable("rocks", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: varchar("title", { length: 500 }).notNull(),
  ownerId: text("owner_id").references(() => users.id),
  ownerName: varchar("owner_name", { length: 255 }).notNull(),
  quarter: varchar("quarter", { length: 10 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("on_track"),
  dueDate: date("due_date").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const milestones = pgTable("milestones", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  rockId: text("rock_id").notNull().references(() => rocks.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }).notNull(),
  completed: boolean("completed").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const issues = pgTable("issues", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").notNull().default(""),
  category: varchar("category", { length: 20 }).notNull().default("short_term"),
  phase: varchar("phase", { length: 20 }).notNull().default("identify"),
  ownerId: text("owner_id").references(() => users.id),
  ownerName: varchar("owner_name", { length: 255 }),
  priority: integer("priority").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const todos = pgTable("todos", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: varchar("title", { length: 500 }).notNull(),
  ownerId: text("owner_id").references(() => users.id),
  ownerName: varchar("owner_name", { length: 255 }).notNull(),
  dueDate: date("due_date"),
  completed: boolean("completed").notNull().default(false),
  sourceType: varchar("source_type", { length: 20 }),
  sourceId: text("source_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const vtoSections = pgTable("vto_sections", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  sectionKey: varchar("section_key", { length: 50 }).notNull().unique(),
  content: text("content").notNull().default(""),
  version: integer("version").notNull().default(1),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const meetings = pgTable("meetings", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  date: date("date").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("scheduled"),
  currentSegment: varchar("current_segment", { length: 20 }),
  segmentStartedAt: timestamp("segment_started_at"),
  rating: integer("rating"),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const seats = pgTable("seats", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: varchar("title", { length: 255 }).notNull(),
  parentSeatId: text("parent_seat_id"),
  personId: text("person_id").references(() => users.id),
  personName: varchar("person_name", { length: 255 }),
  roles: text("roles").array().notNull().default([]),
  getsIt: varchar("gets_it", { length: 10 }),
  wantsIt: varchar("wants_it", { length: 10 }),
  capacityForIt: varchar("capacity_for_it", { length: 10 }),
  sortOrder: integer("sort_order").notNull().default(0),
});
