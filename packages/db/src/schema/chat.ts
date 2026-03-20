import { pgTable, text, varchar, boolean, timestamp } from "drizzle-orm/pg-core";

export const agentChannels = pgTable("agent_channels", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  agentId: varchar("agent_id", { length: 255 }).notNull(),
  agentName: varchar("agent_name", { length: 255 }).notNull(),
  agentEmoji: varchar("agent_emoji", { length: 10 }).notNull(),
  isGeneral: boolean("is_general").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  channelId: text("channel_id").notNull().references(() => agentChannels.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).notNull(),
  agentId: varchar("agent_id", { length: 255 }),
  agentName: varchar("agent_name", { length: 255 }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const messageQueue = pgTable("message_queue", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  channelId: text("channel_id").notNull(),
  content: text("content").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  deliveredAt: timestamp("delivered_at"),
});
