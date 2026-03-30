export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const planned = [
    "Custom dashboards with drag-and-drop widgets",
    "KPI trend lines and historical comparisons",
    "Rock completion rates by quarter",
    "Issue resolution time tracking",
    "Meeting effectiveness scores over time",
    "Team accountability heatmaps",
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Business Analytics
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Coming Soon
        </p>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 md:p-6 space-y-4">
        <p className="text-sm text-zinc-400">
          Pull in the metrics that matter most to your business. Analytics will
          give you a unified view of your EOS data with actionable insights.
        </p>

        <div>
          <h2 className="text-sm font-medium text-zinc-300 mb-3">
            Planned Features
          </h2>
          <ul className="space-y-2">
            {planned.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2 text-sm text-zinc-500"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-700" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
