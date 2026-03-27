"use server";

import { createDb } from "@cmd/db";
import { agents, messageQueue } from "@cmd/db";
import { eq, desc, sql } from "@cmd/db";
import { revalidatePath } from "next/cache";

function getDb() {
  return createDb(process.env.DATABASE_URL!);
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export async function getAdminStats() {
  const db = getDb();

  const [agentRows] = await db
    .select({
      total: sql<number>`count(*)`,
      online: sql<number>`count(*) filter (where ${agents.isOnline} = true)`,
      messagesToday: sql<number>`coalesce(sum(${agents.messagesToday}), 0)`,
    })
    .from(agents);

  const [queueRow] = await db
    .select({
      pending: sql<number>`count(*) filter (where ${messageQueue.status} = 'pending')`,
    })
    .from(messageQueue);

  return {
    totalAgents: Number(agentRows?.total ?? 0),
    onlineAgents: Number(agentRows?.online ?? 0),
    messagesToday: Number(agentRows?.messagesToday ?? 0),
    pendingQueue: Number(queueRow?.pending ?? 0),
  };
}

// ─── Agents ───────────────────────────────────────────────────────────────────

export async function getAgents() {
  const db = getDb();
  return db.select().from(agents).orderBy(desc(agents.updatedAt));
}

export async function addAgent(data: {
  name: string;
  emoji: string;
  openclawId: string;
  description: string;
  model: string;
}) {
  const db = getDb();
  const [created] = await db
    .insert(agents)
    .values({
      name: data.name,
      emoji: data.emoji,
      openclawId: data.openclawId,
      description: data.description,
      model: data.model,
      isOnline: false,
      messagesToday: 0,
    })
    .returning();

  revalidatePath("/admin");
  return created;
}

export async function updateAgent(
  id: string,
  data: {
    name: string;
    emoji: string;
    openclawId: string;
    description: string;
    model: string;
  }
) {
  const db = getDb();
  const [updated] = await db
    .update(agents)
    .set({
      name: data.name,
      emoji: data.emoji,
      openclawId: data.openclawId,
      description: data.description,
      model: data.model,
      updatedAt: new Date(),
    })
    .where(eq(agents.id, id))
    .returning();

  revalidatePath("/admin");
  return updated;
}

export async function deleteAgent(id: string) {
  const db = getDb();
  await db.delete(agents).where(eq(agents.id, id));
  revalidatePath("/admin");
}

export async function toggleAgentOnline(id: string, isOnline: boolean) {
  const db = getDb();
  await db
    .update(agents)
    .set({ isOnline, updatedAt: new Date() })
    .where(eq(agents.id, id));
  revalidatePath("/admin");
}

// ─── Queue ────────────────────────────────────────────────────────────────────

export async function getQueueEntries(statusFilter?: string) {
  const db = getDb();

  if (statusFilter && statusFilter !== "all") {
    return db
      .select()
      .from(messageQueue)
      .where(eq(messageQueue.status, statusFilter))
      .orderBy(desc(messageQueue.createdAt))
      .limit(100);
  }

  return db
    .select()
    .from(messageQueue)
    .orderBy(desc(messageQueue.createdAt))
    .limit(100);
}

export async function retryQueueEntry(id: string) {
  const db = getDb();
  await db
    .update(messageQueue)
    .set({ status: "pending", deliveredAt: null })
    .where(eq(messageQueue.id, id));
  revalidatePath("/admin/queue");
}

export async function clearDelivered() {
  const db = getDb();
  await db.delete(messageQueue).where(eq(messageQueue.status, "delivered"));
  revalidatePath("/admin/queue");
}

// ─── Integrations ─────────────────────────────────────────────────────────────

export async function getIntegrationStatuses() {
  const integrations = [
    {
      name: "OpenClaw Relay",
      envKey: "RELAY_URL",
      connected: !!process.env.RELAY_URL,
      lastSyncAt: null as Date | null,
      error: process.env.RELAY_URL ? null : "RELAY_URL not configured",
    },
    {
      name: "Notion Sync",
      envKey: "NOTION_API_KEY",
      connected: !!process.env.NOTION_API_KEY,
      lastSyncAt: null as Date | null,
      error: process.env.NOTION_API_KEY ? null : "NOTION_API_KEY not configured",
    },
    {
      name: "Database",
      envKey: "DATABASE_URL",
      connected: !!process.env.DATABASE_URL,
      lastSyncAt: null as Date | null,
      error: process.env.DATABASE_URL ? null : "DATABASE_URL not configured",
    },
  ];

  // For the DB integration, try a quick health check
  if (process.env.DATABASE_URL) {
    try {
      const db = getDb();
      await db.select({ v: sql`1` }).from(agents).limit(1);
      integrations[2]!.lastSyncAt = new Date();
    } catch (e) {
      integrations[2]!.connected = false;
      integrations[2]!.error = e instanceof Error ? e.message : "Connection failed";
    }
  }

  return integrations;
}

// ─── Recent Activity ──────────────────────────────────────────────────────────

export async function getRecentActivity() {
  const db = getDb();

  const recentAgents = await db
    .select({
      id: agents.id,
      name: agents.name,
      emoji: agents.emoji,
      isOnline: agents.isOnline,
      lastActiveAt: agents.lastActiveAt,
      updatedAt: agents.updatedAt,
    })
    .from(agents)
    .orderBy(desc(agents.updatedAt))
    .limit(5);

  const recentQueue = await db
    .select()
    .from(messageQueue)
    .orderBy(desc(messageQueue.createdAt))
    .limit(5);

  return { recentAgents, recentQueue };
}
