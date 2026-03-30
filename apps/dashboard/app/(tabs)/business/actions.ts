"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "../../../lib/db";
import { rocks, todos } from "@cmd/db";

function getQuarter() {
  const d = new Date();
  const year = d.getFullYear();
  const month = d.getMonth();
  const q = Math.floor(month / 3) + 1;
  return `${year}-Q${q}`;
}

export async function addRock(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return { error: "Not signed in" };
  const title = formData.get("title") as string;
  const dueDate = formData.get("dueDate") as string;
  if (!title?.trim() || !dueDate) return { error: "Title and due date required" };
  const db = getDb();
  const quarter = getQuarter();
  await db.insert(rocks).values({
    title: title.trim(),
    ownerId: null,
    ownerName: "Me",
    quarter,
    status: "on_track",
    dueDate,
  });
  revalidatePath("/business");
  return { ok: true };
}

export async function updateRockStatus(
  id: string,
  status: "on_track" | "off_track" | "done",
  _formData?: FormData
): Promise<void> {
  await auth();
  const db = getDb();
  await db.update(rocks).set({ status, updatedAt: new Date() }).where(eq(rocks.id, id));
  revalidatePath("/business");
}

export async function addTodo(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return { error: "Not signed in" };
  const title = formData.get("title") as string;
  if (!title?.trim()) return { error: "Title required" };
  const dueDate = (formData.get("dueDate") as string) || null;
  const db = getDb();
  await db.insert(todos).values({
    title: title.trim(),
    ownerId: null,
    ownerName: "Me",
    dueDate: dueDate || null,
    completed: false,
  });
  revalidatePath("/business");
  return { ok: true };
}

export async function toggleTodoComplete(
  id: string,
  completed: boolean,
  _formData?: FormData
): Promise<void> {
  await auth();
  const db = getDb();
  await db.update(todos).set({ completed }).where(eq(todos.id, id));
  revalidatePath("/business");
}
