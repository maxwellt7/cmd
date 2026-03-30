type Kpi = {
  id: string;
  name: string;
  ownerName: string;
  goal: string;
  unit: string;
  quarter: string;
};

type Entry = {
  id: string;
  kpiId: string;
  weekStart: string;
  goal: string;
  actual: string | null;
};

export function ScorecardSection({
  kpis,
  entries,
}: {
  kpis: Kpi[];
  entries: Entry[];
}) {
  if (kpis.length === 0) {
    return (
      <p className="rounded border border-dashed border-zinc-700 bg-zinc-900/50 px-4 py-6 text-center text-sm text-zinc-500">
        No scorecard KPIs for this quarter yet.
      </p>
    );
  }

  const entryByKpi = Object.fromEntries(entries.map((e) => [e.kpiId, e]));

  return (
    <div className="overflow-x-auto rounded border border-zinc-800">
      <table className="w-full min-w-[400px] text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900/80">
            <th className="px-4 py-3 font-medium text-zinc-400">KPI</th>
            <th className="px-4 py-3 font-medium text-zinc-400">Owner</th>
            <th className="px-4 py-3 font-medium text-zinc-400">Goal</th>
            <th className="px-4 py-3 font-medium text-zinc-400">Actual (this week)</th>
          </tr>
        </thead>
        <tbody>
          {kpis.map((kpi) => {
            const entry = entryByKpi[kpi.id];
            return (
              <tr key={kpi.id} className="border-b border-zinc-800/80">
                <td className="px-4 py-3 font-medium text-zinc-100">{kpi.name}</td>
                <td className="px-4 py-3 text-zinc-400">{kpi.ownerName}</td>
                <td className="px-4 py-3 text-zinc-400">
                  {kpi.goal}
                  {kpi.unit}
                </td>
                <td className="px-4 py-3 text-zinc-100">
                  {entry ? (entry.actual ?? "—") + kpi.unit : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
