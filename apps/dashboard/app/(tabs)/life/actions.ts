"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDbOrNull } from "../../../lib/db";
import {
  pillarScores,
  pipelineEntries,
  priorities,
  journalEntries,
} from "@cmd/db";

function getWeekStart(d: Date): string {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  return monday.toISOString().slice(0, 10);
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function upsertPillarScore(
  formData: FormData
): Promise<{ error?: string } | void> {
  const { userId } = await auth();
  if (!userId) return { error: "Not signed in" };
  const pillar = formData.get("pillar") as string;
  const score = formData.get("score") as string;
  const notes = (formData.get("notes") as string) || null;
  if (!pillar || !score) return { error: "Pillar and score required" };
  const scoreNum = parseInt(score, 10);
  if (scoreNum < 1 || scoreNum > 10) return { error: "Score must be 1–10" };
  const db = getDbOrNull();
  if (!db) return { error: "Database not configured. Add DATABASE_URL to apps/dashboard/.env.local" };
  const weekStart = getWeekStart(new Date());
  const existing = await db
    .select()
    .from(pillarScores)
    .where(eq(pillarScores.weekStart, weekStart))
    .then((rows) => rows.find((r) => r.pillar === pillar));
  if (existing) {
    await db
      .update(pillarScores)
      .set({ score: String(scoreNum), notes })
      .where(eq(pillarScores.id, existing.id));
  } else {
    await db.insert(pillarScores).values({
      pillar,
      score: String(scoreNum),
      weekStart,
      notes,
    });
  }
  revalidatePath("/life");
}

export async function addPipelineEntry(
  formData: FormData
): Promise<{ error?: string } | void> {
  const { userId } = await auth();
  if (!userId) return { error: "Not signed in" };
  const level = formData.get("level") as string;
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || "";
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  if (!level?.trim() || !title?.trim() || !startDate || !endDate)
    return { error: "Level, title, and dates required" };
  const db = getDbOrNull();
  if (!db) return { error: "Database not configured. Add DATABASE_URL to apps/dashboard/.env.local" };
  await db.insert(pipelineEntries).values({
    level: level.trim(),
    title: title.trim(),
    description: description.trim(),
    progress: 0,
    startDate,
    endDate,
  });
  revalidatePath("/life");
}

export async function updatePipelineProgress(
  id: string,
  progress: number,
  _formData?: FormData
): Promise<void> {
  await auth();
  const db = getDbOrNull();
  if (!db) return;
  await db
    .update(pipelineEntries)
    .set({ progress, updatedAt: new Date() })
    .where(eq(pipelineEntries.id, id));
  revalidatePath("/life");
}

export async function addPriority(
  formData: FormData
): Promise<{ error?: string } | void> {
  const { userId } = await auth();
  if (!userId) return { error: "Not signed in" };
  const title = formData.get("title") as string;
  const pillar = formData.get("pillar") as string;
  if (!title?.trim() || !pillar) return { error: "Title and pillar required" };
  const db = getDbOrNull();
  if (!db) return { error: "Database not configured. Add DATABASE_URL to apps/dashboard/.env.local" };
  const today = getToday();
  await db.insert(priorities).values({
    title: title.trim(),
    pillar: pillar.trim(),
    date: today,
    completed: false,
  });
  revalidatePath("/life");
}

export async function togglePriorityComplete(
  id: string,
  completed: boolean,
  _formData?: FormData
): Promise<void> {
  await auth();
  const db = getDbOrNull();
  if (!db) return;
  await db.update(priorities).set({ completed }).where(eq(priorities.id, id));
  revalidatePath("/life");
}

export async function addJournalEntry(
  formData: FormData
): Promise<{ error?: string } | void> {
  const { userId } = await auth();
  if (!userId) return { error: "Not signed in" };
  const stackType = formData.get("stackType") as string;
  const prompt = formData.get("prompt") as string;
  const content = formData.get("content") as string;
  if (!stackType?.trim() || !prompt?.trim()) return { error: "Stack type and prompt required" };
  const db = getDbOrNull();
  if (!db) return { error: "Database not configured. Add DATABASE_URL to apps/dashboard/.env.local" };
  const today = getToday();
  await db.insert(journalEntries).values({
    date: today,
    stackType: stackType.trim(),
    prompt: prompt.trim(),
    content: (content || "").trim(),
  });
  revalidatePath("/life");
}
