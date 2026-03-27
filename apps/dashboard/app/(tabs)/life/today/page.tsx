import { createDb, priorities, eq, asc } from "@cmd/db";
import { TodayView } from "../../../../components/life/today-view";

export const dynamic = "force-dynamic";

function getTodayString(): string {
  return new Date().toISOString().split("T")[0]!;
}

export default async function TodayPage(props: {
  searchParams: Promise<{ date?: string }>;
}) {
  const searchParams = await props.searchParams;
  const date = searchParams.date ?? getTodayString();
  const db = createDb(process.env.DATABASE_URL!);

  const items = await db
    .select()
    .from(priorities)
    .where(eq(priorities.date, date))
    .orderBy(asc(priorities.sortOrder));

  const serialized = items.map((p) => ({
    id: p.id,
    title: p.title,
    pillar: p.pillar,
    date: p.date,
    completed: p.completed,
    sortOrder: p.sortOrder,
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Today&apos;s Priorities</h1>
      <TodayView priorities={serialized} currentDate={date} />
    </div>
  );
}
