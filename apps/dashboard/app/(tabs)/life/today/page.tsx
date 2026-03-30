import { createDb, priorities, pipelineEntries, eq, and, asc, lte, gte } from "@cmd/db";
import { TodayView } from "../../../../components/life/today-view";

export const dynamic = "force-dynamic";

function getTodayEST(): string {
  // Use America/New_York to get correct EST/EDT date
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
}

export default async function TodayPage(props: {
  searchParams: Promise<{ date?: string }>;
}) {
  const searchParams = await props.searchParams;
  const date = searchParams.date ?? getTodayEST();
  const db = createDb(process.env.DATABASE_URL!);

  // Fetch priorities for the date
  const items = await db
    .select()
    .from(priorities)
    .where(eq(priorities.date, date))
    .orderBy(asc(priorities.sortOrder));

  // Fetch daily actions from pipeline that span this date
  const dailyActions = await db
    .select()
    .from(pipelineEntries)
    .where(
      and(
        eq(pipelineEntries.level, "daily_action"),
        lte(pipelineEntries.startDate, date),
        gte(pipelineEntries.endDate, date),
      )
    )
    .orderBy(asc(pipelineEntries.createdAt));

  const serialized = items.map((p) => ({
    id: p.id,
    title: p.title,
    pillar: p.pillar,
    date: p.date,
    completed: p.completed,
    sortOrder: p.sortOrder,
  }));

  const serializedActions = dailyActions.map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    progress: a.progress,
    startDate: a.startDate,
    endDate: a.endDate,
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-xl md:text-2xl font-bold">Today&apos;s Priorities</h1>
      <TodayView priorities={serialized} dailyActions={serializedActions} currentDate={date} />
    </div>
  );
}
