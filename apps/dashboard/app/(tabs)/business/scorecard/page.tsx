import { getKpisForQuarter, getAllEntries } from "../../../actions/eos";
import {
  AddKpiForm,
  EntryEditor,
  DeleteKpiButton,
} from "../../../../components/eos/scorecard-forms";

export const dynamic = "force-dynamic";

function getWeekStarts(count: number): string[] {
  const weeks: string[] = [];
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(monday);
    d.setDate(monday.getDate() - i * 7);
    weeks.push(d.toISOString().split("T")[0]);
  }
  return weeks;
}

function formatWeek(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function ScorecardPage() {
  const quarter = `${new Date().getFullYear()}-Q${Math.ceil((new Date().getMonth() + 1) / 3)}`;
  const weeks = getWeekStarts(13);

  const kpis = await getKpisForQuarter(quarter);

  const entries = kpis.length > 0 ? await getAllEntries() : [];

  // Index entries by kpiId + weekStart
  const entryMap = new Map<string, (typeof entries)[number]>();
  for (const entry of entries) {
    entryMap.set(`${entry.kpiId}:${entry.weekStart}`, entry);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Scorecard</h1>
          <p className="text-sm text-zinc-500">
            Weekly KPI tracking for {quarter}
          </p>
        </div>
        <AddKpiForm quarter={quarter} />
      </div>

      {kpis.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 py-16">
          <p className="text-zinc-500">No KPIs defined for {quarter}</p>
          <p className="mt-1 text-xs text-zinc-600">
            Add your first KPI to start tracking
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full text-xs md:text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/80">
                <th className="sticky left-0 z-10 bg-zinc-900/80 px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  KPI
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Owner
                </th>
                <th className="px-3 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Goal
                </th>
                {weeks.map((w, idx) => (
                  <th
                    key={w}
                    className={`px-2 py-2.5 text-right text-xs font-medium text-zinc-600${idx < weeks.length - 4 ? " hidden lg:table-cell" : ""}`}
                  >
                    {formatWeek(w)}
                  </th>
                ))}
                <th className="px-3 py-2.5 text-right text-xs font-medium text-zinc-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {kpis.map((kpi) => (
                <tr
                  key={kpi.id}
                  className="border-b border-zinc-800/50 hover:bg-zinc-900/50"
                >
                  <td className="sticky left-0 z-10 bg-[#0a0a0a] px-4 py-2 font-medium text-zinc-200">
                    <span className="mr-1.5 text-xs text-zinc-600">
                      {kpi.unit}
                    </span>
                    {kpi.name}
                  </td>
                  <td className="px-3 py-2 text-zinc-400">{kpi.ownerName}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-zinc-300">
                    {kpi.goal}
                  </td>
                  {weeks.map((w, idx) => {
                    const entry = entryMap.get(`${kpi.id}:${w}`);
                    return (
                      <td key={w} className={`px-1 py-1${idx < weeks.length - 4 ? " hidden lg:table-cell" : ""}`}>
                        <EntryEditor
                          kpiId={kpi.id}
                          entryId={entry?.id ?? null}
                          weekStart={w}
                          currentGoal={String(kpi.goal)}
                          currentActual={
                            entry?.actual != null ? String(entry.actual) : null
                          }
                        />
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-right">
                    <DeleteKpiButton id={kpi.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
