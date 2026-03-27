"use server";

import {
  createDb,
  scorecardKpis,
  scorecardEntries,
  rocks,
  milestones,
  issues,
  todos,
  vtoSections,
  meetings,
  seats,
  eq,
  and,
  desc,
  asc,
} from "@cmd/db";
import { revalidatePath } from "next/cache";

function getDb() {
  return createDb(process.env.DATABASE_URL!);
}

// ---------------------------------------------------------------------------
// Scorecard KPIs
// ---------------------------------------------------------------------------

export async function addKpi(formData: FormData) {
  const db = getDb();
  const name = formData.get("name") as string;
  const ownerName = formData.get("ownerName") as string;
  const goal = formData.get("goal") as string;
  const unit = (formData.get("unit") as string) || "#";
  const quarter = formData.get("quarter") as string;

  await db.insert(scorecardKpis).values({
    name,
    ownerName,
    goal,
    unit,
    quarter,
  });

  revalidatePath("/business/scorecard");
}

export async function updateKpi(formData: FormData) {
  const db = getDb();
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const ownerName = formData.get("ownerName") as string;
  const goal = formData.get("goal") as string;
  const unit = (formData.get("unit") as string) || "#";
  const quarter = formData.get("quarter") as string;

  await db
    .update(scorecardKpis)
    .set({ name, ownerName, goal, unit, quarter })
    .where(eq(scorecardKpis.id, id));

  revalidatePath("/business/scorecard");
}

export async function deleteKpi(formData: FormData) {
  const db = getDb();
  const id = formData.get("id") as string;

  await db.delete(scorecardKpis).where(eq(scorecardKpis.id, id));

  revalidatePath("/business/scorecard");
}

export async function upsertEntry(formData: FormData) {
  const db = getDb();
  const id = formData.get("id") as string | null;
  const kpiId = formData.get("kpiId") as string;
  const weekStart = formData.get("weekStart") as string;
  const goal = formData.get("goal") as string;
  const actual = formData.get("actual") as string | null;

  if (id) {
    await db
      .update(scorecardEntries)
      .set({
        goal,
        actual: actual || null,
        updatedAt: new Date(),
      })
      .where(eq(scorecardEntries.id, id));
  } else {
    await db.insert(scorecardEntries).values({
      kpiId,
      weekStart,
      goal,
      actual: actual || null,
    });
  }

  revalidatePath("/business/scorecard");
}

// ---------------------------------------------------------------------------
// Rocks
// ---------------------------------------------------------------------------

export async function addRock(formData: FormData) {
  const db = getDb();
  const title = formData.get("title") as string;
  const ownerName = formData.get("ownerName") as string;
  const quarter = formData.get("quarter") as string;
  const dueDate = formData.get("dueDate") as string;

  await db.insert(rocks).values({
    title,
    ownerName,
    quarter,
    dueDate,
    status: "on_track",
  });

  revalidatePath("/business/rocks");
}

export async function updateRock(formData: FormData) {
  const db = getDb();
  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const ownerName = formData.get("ownerName") as string;
  const status = formData.get("status") as string;
  const quarter = formData.get("quarter") as string;
  const dueDate = formData.get("dueDate") as string;

  await db
    .update(rocks)
    .set({ title, ownerName, status, quarter, dueDate, updatedAt: new Date() })
    .where(eq(rocks.id, id));

  revalidatePath("/business/rocks");
}

export async function updateRockStatus(formData: FormData) {
  const db = getDb();
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;

  await db
    .update(rocks)
    .set({ status, updatedAt: new Date() })
    .where(eq(rocks.id, id));

  revalidatePath("/business/rocks");
}

export async function deleteRock(formData: FormData) {
  const db = getDb();
  const id = formData.get("id") as string;

  await db.delete(rocks).where(eq(rocks.id, id));

  revalidatePath("/business/rocks");
}

export async function addMilestone(formData: FormData) {
  const db = getDb();
  const rockId = formData.get("rockId") as string;
  const title = formData.get("title") as string;

  await db.insert(milestones).values({ rockId, title });

  revalidatePath("/business/rocks");
}

export async function toggleMilestone(formData: FormData) {
  const db = getDb();
  const id = formData.get("id") as string;
  const completed = formData.get("completed") === "true";

  await db
    .update(milestones)
    .set({ completed: !completed })
    .where(eq(milestones.id, id));

  revalidatePath("/business/rocks");
}

export async function deleteMilestone(formData: FormData) {
  const db = getDb();
  const id = formData.get("id") as string;

  await db.delete(milestones).where(eq(milestones.id, id));

  revalidatePath("/business/rocks");
}

// ---------------------------------------------------------------------------
// Issues
// ---------------------------------------------------------------------------

export async function addIssue(formData: FormData) {
  const db = getDb();
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || "";
  const category = (formData.get("category") as string) || "short_term";
  const ownerName = (formData.get("ownerName") as string) || null;
  const priority = parseInt((formData.get("priority") as string) || "0", 10);

  await db.insert(issues).values({
    title,
    description,
    category,
    phase: "identify",
    ownerName,
    priority,
  });

  revalidatePath("/business/issues");
}

export async function updateIssue(formData: FormData) {
  const db = getDb();
  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || "";
  const category = formData.get("category") as string;
  const ownerName = (formData.get("ownerName") as string) || null;
  const priority = parseInt((formData.get("priority") as string) || "0", 10);

  await db
    .update(issues)
    .set({ title, description, category, ownerName, priority })
    .where(eq(issues.id, id));

  revalidatePath("/business/issues");
}

export async function deleteIssue(formData: FormData) {
  const db = getDb();
  const id = formData.get("id") as string;

  await db.delete(issues).where(eq(issues.id, id));

  revalidatePath("/business/issues");
}

export async function moveIssuePhase(formData: FormData) {
  const db = getDb();
  const id = formData.get("id") as string;
  const phase = formData.get("phase") as string;

  const updates: Record<string, unknown> = { phase };
  if (phase === "resolved") {
    updates.resolvedAt = new Date();
  }

  await db.update(issues).set(updates).where(eq(issues.id, id));

  revalidatePath("/business/issues");
}

// ---------------------------------------------------------------------------
// Todos
// ---------------------------------------------------------------------------

export async function addTodo(formData: FormData) {
  const db = getDb();
  const title = formData.get("title") as string;
  const ownerName = formData.get("ownerName") as string;
  const dueDate = (formData.get("dueDate") as string) || null;
  const sourceType = (formData.get("sourceType") as string) || "manual";
  const sourceId = (formData.get("sourceId") as string) || null;

  await db.insert(todos).values({
    title,
    ownerName,
    dueDate,
    sourceType,
    sourceId,
  });

  revalidatePath("/business/todos");
}

export async function toggleTodo(formData: FormData) {
  const db = getDb();
  const id = formData.get("id") as string;
  const completed = formData.get("completed") === "true";

  await db
    .update(todos)
    .set({ completed: !completed })
    .where(eq(todos.id, id));

  revalidatePath("/business/todos");
}

export async function deleteTodo(formData: FormData) {
  const db = getDb();
  const id = formData.get("id") as string;

  await db.delete(todos).where(eq(todos.id, id));

  revalidatePath("/business/todos");
}

// ---------------------------------------------------------------------------
// VTO
// ---------------------------------------------------------------------------

export async function updateVtoSection(formData: FormData) {
  const db = getDb();
  const sectionKey = formData.get("sectionKey") as string;
  const content = formData.get("content") as string;

  const existing = await db
    .select()
    .from(vtoSections)
    .where(eq(vtoSections.sectionKey, sectionKey))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(vtoSections)
      .set({
        content,
        version: (existing[0].version ?? 0) + 1,
        updatedAt: new Date(),
      })
      .where(eq(vtoSections.sectionKey, sectionKey));
  } else {
    await db.insert(vtoSections).values({
      sectionKey,
      content,
      version: 1,
    });
  }

  revalidatePath("/business/vto");
}

// ---------------------------------------------------------------------------
// Meetings
// ---------------------------------------------------------------------------

export async function createMeeting(formData: FormData) {
  const db = getDb();
  const dateVal = formData.get("date") as string;

  await db.insert(meetings).values({
    date: dateVal,
    status: "scheduled",
  });

  revalidatePath("/business/meetings");
}

export async function updateMeetingStatus(formData: FormData) {
  const db = getDb();
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;

  const updates: Record<string, unknown> = { status };
  if (status === "in_progress") {
    updates.currentSegment = "segue";
    updates.segmentStartedAt = new Date();
  }

  await db.update(meetings).set(updates).where(eq(meetings.id, id));

  revalidatePath("/business/meetings");
}

export async function updateMeetingSegment(formData: FormData) {
  const db = getDb();
  const id = formData.get("id") as string;
  const segment = formData.get("segment") as string;

  await db
    .update(meetings)
    .set({ currentSegment: segment, segmentStartedAt: new Date() })
    .where(eq(meetings.id, id));

  revalidatePath("/business/meetings");
}

export async function rateMeeting(formData: FormData) {
  const db = getDb();
  const id = formData.get("id") as string;
  const rating = parseInt(formData.get("rating") as string, 10);
  const notes = (formData.get("notes") as string) || "";

  await db
    .update(meetings)
    .set({ rating, notes, status: "completed" })
    .where(eq(meetings.id, id));

  revalidatePath("/business/meetings");
}

// ---------------------------------------------------------------------------
// Seats (Accountability Chart)
// ---------------------------------------------------------------------------

export async function addSeat(formData: FormData) {
  const db = getDb();
  const title = formData.get("title") as string;
  const parentSeatId = (formData.get("parentSeatId") as string) || null;
  const personName = (formData.get("personName") as string) || null;
  const rolesRaw = (formData.get("roles") as string) || "";
  const roles = rolesRaw
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);

  await db.insert(seats).values({
    title,
    parentSeatId,
    personName,
    roles,
  });

  revalidatePath("/business/seats");
}

export async function updateSeat(formData: FormData) {
  const db = getDb();
  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const personName = (formData.get("personName") as string) || null;
  const rolesRaw = (formData.get("roles") as string) || "";
  const roles = rolesRaw
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);
  const getsIt = (formData.get("getsIt") as string) || null;
  const wantsIt = (formData.get("wantsIt") as string) || null;
  const capacityForIt = (formData.get("capacityForIt") as string) || null;

  await db
    .update(seats)
    .set({ title, personName, roles, getsIt, wantsIt, capacityForIt })
    .where(eq(seats.id, id));

  revalidatePath("/business/seats");
}

export async function deleteSeat(formData: FormData) {
  const db = getDb();
  const id = formData.get("id") as string;

  const seat = await db
    .select()
    .from(seats)
    .where(eq(seats.id, id))
    .limit(1);

  if (seat.length > 0) {
    await db
      .update(seats)
      .set({ parentSeatId: seat[0].parentSeatId })
      .where(eq(seats.parentSeatId, id));
  }

  await db.delete(seats).where(eq(seats.id, id));

  revalidatePath("/business/seats");
}

export async function moveSeat(formData: FormData) {
  const db = getDb();
  const id = formData.get("id") as string;
  const newParentId = (formData.get("parentSeatId") as string) || null;

  await db
    .update(seats)
    .set({ parentSeatId: newParentId })
    .where(eq(seats.id, id));

  revalidatePath("/business/seats");
}

// ---------------------------------------------------------------------------
// Query helpers (for server component pages)
// ---------------------------------------------------------------------------

export async function getKpisForQuarter(quarter: string) {
  const db = getDb();
  return db
    .select()
    .from(scorecardKpis)
    .where(eq(scorecardKpis.quarter, quarter))
    .orderBy(asc(scorecardKpis.sortOrder));
}

export async function getAllEntries() {
  const db = getDb();
  return db.select().from(scorecardEntries);
}

export async function getRocksForQuarter(quarter: string) {
  const db = getDb();
  return db
    .select()
    .from(rocks)
    .where(eq(rocks.quarter, quarter))
    .orderBy(asc(rocks.sortOrder), desc(rocks.createdAt));
}

export async function getAllMilestones() {
  const db = getDb();
  return db.select().from(milestones).orderBy(asc(milestones.sortOrder));
}

export async function getAllIssues() {
  const db = getDb();
  return db
    .select()
    .from(issues)
    .orderBy(desc(issues.priority), desc(issues.createdAt));
}

export async function getAllTodos() {
  const db = getDb();
  return db.select().from(todos).orderBy(desc(todos.createdAt));
}

export async function getAllVtoSections() {
  const db = getDb();
  return db
    .select()
    .from(vtoSections)
    .orderBy(asc(vtoSections.sectionKey));
}

export async function getAllMeetings() {
  const db = getDb();
  return db.select().from(meetings).orderBy(desc(meetings.date));
}

export async function getAllSeats() {
  const db = getDb();
  return db.select().from(seats).orderBy(asc(seats.sortOrder));
}

export async function getOverviewCounts() {
  const db = getDb();
  const [kpiList, rockList, issueList, todoList, meetingList, seatList] =
    await Promise.all([
      db.select().from(scorecardKpis).limit(100),
      db.select().from(rocks).orderBy(desc(rocks.createdAt)).limit(100),
      db.select().from(issues).where(eq(issues.phase, "identify")).limit(100),
      db
        .select()
        .from(todos)
        .where(eq(todos.completed, false))
        .orderBy(desc(todos.createdAt))
        .limit(100),
      db.select().from(meetings).orderBy(desc(meetings.date)).limit(3),
      db.select().from(seats).limit(100),
    ]);
  return {
    kpiCount: kpiList.length,
    rockCount: rockList.length,
    issueCount: issueList.length,
    todoCount: todoList.length,
    meetingCount: meetingList.length,
    seatCount: seatList.length,
  };
}
