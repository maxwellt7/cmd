import { pgTable, text, varchar, boolean, integer, timestamp } from "drizzle-orm/pg-core";

export const agents = pgTable("agents", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  openclawId: varchar("openclaw_id", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  emoji: varchar("emoji", { length: 10 }).notNull(),
  description: text("description").notNull().default(""),
  model: varchar("model", { length: 100 }).notNull(),
  isOnline: boolean("is_online").notNull().default(false),
  messagesToday: integer("messages_today").notNull().default(0),
  lastActiveAt: timestamp("last_active_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
