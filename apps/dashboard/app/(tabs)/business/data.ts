import { asc, desc, eq, isNull } from "drizzle-orm";
import { getDbOrNull } from "../../../lib/db";
import {
  rocks,
  todos,
  issues,
  scorecardKpis,
  scorecardEntries,
} from "@cmd/db";

function getQuarter() {
  const d = new Date();
  const year = d.getFullYear();
  const month = d.getMonth();
  const q = Math.floor(month / 3) + 1;
  return `${year}-Q${q}`;
}

export async function getBusinessData() {
  const db = getDbOrNull();
  const quarter = getQuarter();

  if (!db) {
    return {
      rocks: [],
      todos: [],
      issues: [],
      kpis: [],
      scorecardEntries: [],
      quarter,
    };
  }

  const [rocksList, todosList, issuesList, kpisList] = await Promise.all([
    db
      .select()
      .from(rocks)
      .where(eq(rocks.quarter, quarter))
      .orderBy(asc(rocks.sortOrder), asc(rocks.dueDate)),
    db
      .select()
      .from(todos)
      .where(eq(todos.completed, false))
      .orderBy(desc(todos.dueDate), desc(todos.createdAt)),
    db
      .select()
      .from(issues)
      .where(isNull(issues.resolvedAt))
      .orderBy(desc(issues.priority), desc(issues.createdAt)),
    db
      .select()
      .from(scorecardKpis)
      .where(eq(scorecardKpis.quarter, quarter))
      .orderBy(scorecardKpis.sortOrder),
  ]);

  // Latest scorecard entry per KPI (this week)
  const thisMonday = getWeekStart(new Date());
  const entries =
    kpisList.length > 0
      ? await db
          .select()
          .from(scorecardEntries)
          .where(eq(scorecardEntries.weekStart, thisMonday))
      : [];

  return {
    rocks: rocksList,
    todos: todosList,
    issues: issuesList,
    kpis: kpisList,
    scorecardEntries: entries,
    quarter,
  };
}

function getWeekStart(d: Date): string {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  return monday.toISOString().slice(0, 10);
}
