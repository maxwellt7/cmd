"use server";

import { revalidatePath } from "next/cache";
import { createDb, pillarScores, pipelineEntries, priorities, journalEntries, eq, and, desc, asc } from "@cmd/db";
import type { PillarKey, PipelineLevel } from "@cmd/types";

function getDb() {
  return createDb(process.env.DATABASE_URL!);
}

// --------------- Pillars ---------------

export async function upsertPillarScore(formData: FormData) {
  const db = getDb();
  const pillar = formData.get("pillar") as PillarKey;
  const score = formData.get("score") as string;
  const weekStart = formData.get("weekStart") as string;
  const notes = (formData.get("notes") as string) || null;

  const existing = await db
    .select()
    .from(pillarScores)
    .where(and(eq(pillarScores.pillar, pillar), eq(pillarScores.weekStart, weekStart)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(pillarScores)
      .set({ score, notes })
      .where(eq(pillarScores.id, existing[0]!.id));
  } else {
    await db.insert(pillarScores).values({ pillar, score, weekStart, notes });
  }

  revalidatePath("/life");
  revalidatePath("/life/pillars");
}

export async function getPillarHistory(pillar: PillarKey, limit = 12) {
  const db = getDb();
  const rows = await db
    .select()
    .from(pillarScores)
    .where(eq(pillarScores.pillar, pillar))
    .orderBy(desc(pillarScores.weekStart))
    .limit(limit);
  return rows.reverse();
}

// --------------- Pipeline ---------------

export async function addPipelineEntry(formData: FormData) {
  const db = getDb();
  const level = formData.get("level") as PipelineLevel;
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || "";
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const parentId = (formData.get("parentId") as string) || null;

  await db.insert(pipelineEntries).values({
    level,
    title,
    description,
    progress: 0,
    startDate,
    endDate,
    parentId,
  });

  revalidatePath("/life");
  revalidatePath("/life/pipeline");
}

export async function updatePipelineEntry(formData: FormData) {
  const db = getDb();
  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || "";
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;

  await db
    .update(pipelineEntries)
    .set({ title, description, startDate, endDate, updatedAt: new Date() })
    .where(eq(pipelineEntries.id, id));

  revalidatePath("/life");
  revalidatePath("/life/pipeline");
}

export async function deletePipelineEntry(formData: FormData) {
  const db = getDb();
  const id = formData.get("id") as string;

  await db.delete(pipelineEntries).where(eq(pipelineEntries.id, id));

  revalidatePath("/life");
  revalidatePath("/life/pipeline");
}

export async function updateProgress(formData: FormData) {
  const db = getDb();
  const id = formData.get("id") as string;
  const progress = parseInt(formData.get("progress") as string, 10);

  await db
    .update(pipelineEntries)
    .set({ progress, updatedAt: new Date() })
    .where(eq(pipelineEntries.id, id));

  revalidatePath("/life");
  revalidatePath("/life/pipeline");
}

// --------------- Today (Priorities) ---------------

export async function addPriority(formData: FormData) {
  const db = getDb();
  const title = formData.get("title") as string;
  const pillar = formData.get("pillar") as PillarKey;
  const date = formData.get("date") as string;

  const existing = await db
    .select()
    .from(priorities)
    .where(eq(priorities.date, date))
    .orderBy(desc(priorities.sortOrder))
    .limit(1);

  const nextOrder = existing.length > 0 ? existing[0]!.sortOrder + 1 : 0;

  await db.insert(priorities).values({
    title,
    pillar,
    date,
    completed: false,
    sortOrder: nextOrder,
  });

  revalidatePath("/life");
  revalidatePath("/life/today");
}

export async function togglePriority(formData: FormData) {
  const db = getDb();
  const id = formData.get("id") as string;
  const completed = formData.get("completed") === "true";

  await db
    .update(priorities)
    .set({ completed: !completed })
    .where(eq(priorities.id, id));

  revalidatePath("/life");
  revalidatePath("/life/today");
}

export async function deletePriority(formData: FormData) {
  const db = getDb();
  const id = formData.get("id") as string;

  await db.delete(priorities).where(eq(priorities.id, id));

  revalidatePath("/life");
  revalidatePath("/life/today");
}

export async function reorderPriorities(ids: string[]) {
  const db = getDb();

  await Promise.all(
    ids.map((id, index) =>
      db.update(priorities).set({ sortOrder: index }).where(eq(priorities.id, id))
    )
  );

  revalidatePath("/life/today");
}

// --------------- Journal ---------------

const STACK_PROMPTS: Record<string, string> = {
  sovereign_self: "Who am I becoming?",
  gratitude: "What am I grateful for?",
  idea: "What's the idea?",
  discovery: "What did I learn?",
};

export async function addJournalEntry(formData: FormData) {
  const db = getDb();
  const date = formData.get("date") as string;
  const stackType = formData.get("stackType") as string;
  const content = formData.get("content") as string;
  const prompt = STACK_PROMPTS[stackType] ?? "";

  await db.insert(journalEntries).values({ date, stackType, prompt, content });

  revalidatePath("/life");
  revalidatePath("/life/journal");
}

export async function updateJournalEntry(formData: FormData) {
  const db = getDb();
  const id = formData.get("id") as string;
  const content = formData.get("content") as string;

  await db
    .update(journalEntries)
    .set({ content })
    .where(eq(journalEntries.id, id));

  revalidatePath("/life");
  revalidatePath("/life/journal");
}

export async function deleteJournalEntry(formData: FormData) {
  const db = getDb();
  const id = formData.get("id") as string;

  await db.delete(journalEntries).where(eq(journalEntries.id, id));

  revalidatePath("/life");
  revalidatePath("/life/journal");
}
