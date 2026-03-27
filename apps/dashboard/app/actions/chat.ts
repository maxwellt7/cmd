"use server";

import { createDb } from "@cmd/db";
import { agentChannels, chatMessages, messageQueue } from "@cmd/db";
import { eq, and, desc, asc } from "@cmd/db";
import { revalidatePath } from "next/cache";

function getDb() {
  return createDb(process.env.DATABASE_URL!);
}

// ---------------------------------------------------------------------------
// Channels
// ---------------------------------------------------------------------------

export async function getChannels() {
  const db = getDb();
  const channels = await db
    .select()
    .from(agentChannels)
    .orderBy(desc(agentChannels.isGeneral), asc(agentChannels.createdAt));
  return channels;
}

export async function createChannel(formData: FormData) {
  const agentName = formData.get("agentName") as string;
  const agentEmoji = formData.get("agentEmoji") as string;
  const agentId = formData.get("agentId") as string;
  const isGeneral = formData.get("isGeneral") === "true";

  if (!agentName || !agentEmoji || !agentId) {
    return { error: "All fields are required" };
  }

  const db = getDb();
  const [channel] = await db
    .insert(agentChannels)
    .values({
      agentId,
      agentName,
      agentEmoji,
      isGeneral,
    })
    .returning();

  revalidatePath("/(tabs)/chat", "layout");
  return { channel };
}

export async function deleteChannel(channelId: string) {
  const db = getDb();
  await db.delete(agentChannels).where(eq(agentChannels.id, channelId));
  revalidatePath("/(tabs)/chat", "layout");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

export async function getMessages(channelId: string) {
  const db = getDb();
  const messages = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.channelId, channelId))
    .orderBy(asc(chatMessages.createdAt));
  return messages;
}

export async function sendMessage(formData: FormData) {
  const channelId = formData.get("channelId") as string;
  const content = formData.get("content") as string;
  const role = (formData.get("role") as string) || "user";

  if (!channelId || !content) {
    return { error: "Channel and content are required" };
  }

  const db = getDb();

  // Insert the chat message
  const [message] = await db
    .insert(chatMessages)
    .values({
      channelId,
      role,
      content,
      agentId: role === "user" ? null : (formData.get("agentId") as string | null),
      agentName: role === "user" ? null : (formData.get("agentName") as string | null),
    })
    .returning();

  // Also add to message queue for relay delivery
  await db.insert(messageQueue).values({
    channelId,
    content,
    status: "pending",
  });

  revalidatePath(`/(tabs)/chat/${channelId}`, "page");
  return { message };
}

// ---------------------------------------------------------------------------
// Queue
// ---------------------------------------------------------------------------

export async function getQueueStatus(channelId?: string) {
  const db = getDb();

  if (channelId) {
    const pending = await db
      .select()
      .from(messageQueue)
      .where(and(eq(messageQueue.channelId, channelId), eq(messageQueue.status, "pending")));
    const delivered = await db
      .select()
      .from(messageQueue)
      .where(and(eq(messageQueue.channelId, channelId), eq(messageQueue.status, "delivered")));
    return { pending: pending.length, delivered: delivered.length };
  }

  const pending = await db
    .select()
    .from(messageQueue)
    .where(eq(messageQueue.status, "pending"));
  const delivered = await db
    .select()
    .from(messageQueue)
    .where(eq(messageQueue.status, "delivered"));
  return { pending: pending.length, delivered: delivered.length };
}

export async function markDelivered(messageId: string) {
  const db = getDb();
  await db
    .update(messageQueue)
    .set({ status: "delivered", deliveredAt: new Date() })
    .where(eq(messageQueue.id, messageId));
  revalidatePath("/(tabs)/chat", "layout");
  return { success: true };
}
