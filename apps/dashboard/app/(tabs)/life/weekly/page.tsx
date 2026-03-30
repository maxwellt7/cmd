import { getPrioritiesForWeek } from "../../../actions/life";
import { WeeklyView } from "../../../../components/life/weekly-view";

export const dynamic = "force-dynamic";

function getWeekStartEST(dateStr?: string): string {
  if (dateStr) {
    // Treat supplied date as a Monday already
    const d = new Date(dateStr + "T00:00:00");
    // But ensure it is actually a Monday: snap to the previous Monday if not
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split("T")[0]!;
  }
  // Default: current Monday in America/New_York
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
  );
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  now.setDate(now.getDate() + diff);
  return now.toISOString().split("T")[0]!;
}

export default async function WeeklyPage(props: {
  searchParams: Promise<{ week?: string }>;
}) {
  const searchParams = await props.searchParams;
  const weekStart = getWeekStartEST(searchParams.week);
  const items = await getPrioritiesForWeek(weekStart);

  const serialized = items.map((p) => ({
    id: p.id,
    title: p.title,
    pillar: p.pillar,
    date: p.date,
    completed: p.completed,
    sortOrder: p.sortOrder,
    category: p.category,
    domain: p.domain,
    priority: p.priority,
    startTime: p.startTime,
    endTime: p.endTime,
    notes: p.notes,
  }));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="text-xl md:text-2xl font-bold">Weekly Planner</h1>
      <WeeklyView priorities={serialized} currentDate={weekStart} />
    </div>
  );
}
