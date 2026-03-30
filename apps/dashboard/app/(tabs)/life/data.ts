import { asc, desc, eq } from "drizzle-orm";
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

const PILLARS = ["profit", "power", "purpose", "presence"] as const;
const PIPELINE_LEVEL_ORDER = [
  "life_goal",
  "annual_aim",
  "quarterly_objective",
  "monthly_sprint",
  "weekly_focus",
  "daily_action",
] as const;

export async function getLifeData() {
  const db = getDbOrNull();
  const weekStart = getWeekStart(new Date());
  const today = getToday();

  if (!db) {
    return {
      pillarScores: [],
      pillars: PILLARS,
      weekStart,
      pipelineByLevel: Object.fromEntries(PIPELINE_LEVEL_ORDER.map((l) => [l, []])),
      pipelineLevels: PIPELINE_LEVEL_ORDER,
      priorities: [],
      journalEntries: [],
      today,
    };
  }

  const [scoresList, pipelineList, prioritiesList, journalList] = await Promise.all([
    db
      .select()
      .from(pillarScores)
      .where(eq(pillarScores.weekStart, weekStart))
      .orderBy(asc(pillarScores.pillar)),
    db
      .select()
      .from(pipelineEntries)
      .orderBy(asc(pipelineEntries.level), asc(pipelineEntries.startDate)),
    db
      .select()
      .from(priorities)
      .where(eq(priorities.date, today))
      .orderBy(asc(priorities.sortOrder), asc(priorities.id)),
    db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.date, today))
      .orderBy(desc(journalEntries.createdAt)),
  ]);

  // Group pipeline by level
  const pipelineByLevel: Record<string, typeof pipelineList> = {};
  for (const level of PIPELINE_LEVEL_ORDER) {
    pipelineByLevel[level] = pipelineList.filter((e) => e.level === level);
  }

  return {
    pillarScores: scoresList,
    pillars: PILLARS,
    weekStart,
    pipelineByLevel,
    pipelineLevels: PIPELINE_LEVEL_ORDER,
    priorities: prioritiesList,
    journalEntries: journalList,
    today,
  };
}
