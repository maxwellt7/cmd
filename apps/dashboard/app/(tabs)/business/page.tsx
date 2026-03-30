import Link from "next/link";
import { getOverviewCounts } from "../../actions/eos";

export const dynamic = "force-dynamic";

export default async function BusinessOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string }>;
}) {
  const params = await searchParams;
  const companyId = params.company ?? "";

  if (!companyId) {
    return (
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Business / EOS</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Select a company above to get started, or create one.
          </p>
        </div>
      </div>
    );
  }

  const counts = await getOverviewCounts(companyId);

  const sections = [
    {
      title: "Scorecard",
      href: `/business/scorecard?company=${companyId}`,
      description: "Track weekly KPIs against goals",
      count: counts.kpiCount,
      countLabel: "KPIs",
    },
    {
      title: "Rocks",
      href: `/business/rocks?company=${companyId}`,
      description: "Quarterly priorities and milestones",
      count: counts.rockCount,
      countLabel: "active rocks",
    },
    {
      title: "Issues",
      href: `/business/issues?company=${companyId}`,
      description: "Identify, Discuss, Solve",
      count: counts.issueCount,
      countLabel: "open issues",
    },
    {
      title: "To-Dos",
      href: `/business/todos?company=${companyId}`,
      description: "7-day action items",
      count: counts.todoCount,
      countLabel: "pending",
    },
    {
      title: "V/TO",
      href: `/business/vto?company=${companyId}`,
      description: "Vision/Traction Organizer",
      count: null,
      countLabel: null,
    },
    {
      title: "Meetings",
      href: `/business/meetings?company=${companyId}`,
      description: "Level 10 meeting pulse",
      count: counts.meetingCount,
      countLabel: "recent",
    },
    {
      title: "Seats",
      href: `/business/seats?company=${companyId}`,
      description: "Accountability chart with GWC",
      count: counts.seatCount,
      countLabel: "seats",
    },
    {
      title: "Resources",
      href: `/business/resources?company=${companyId}`,
      description: "Trainings, documents, and reference material",
      count: counts.resourceCount,
      countLabel: "resources",
    },
    {
      title: "Analytics",
      href: `/business/analytics?company=${companyId}`,
      description: "Dashboards and KPI trends",
      count: null,
      countLabel: null,
      badge: "Coming Soon",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Business / EOS
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Entrepreneurial Operating System — manage your business with traction
        </p>
      </div>

      {/* My Dashboard */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 md:p-5 space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-400">
          My Dashboard
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-zinc-800 bg-zinc-950 p-3">
            <p className="text-xs text-zinc-500">Active Rocks</p>
            <p className="mt-1 text-lg font-semibold text-zinc-200">{counts.rockCount}</p>
          </div>
          <div className="rounded-md border border-zinc-800 bg-zinc-950 p-3">
            <p className="text-xs text-zinc-500">Pending To-Dos</p>
            <p className="mt-1 text-lg font-semibold text-zinc-200">{counts.todoCount}</p>
          </div>
          <div className="rounded-md border border-zinc-800 bg-zinc-950 p-3">
            <p className="text-xs text-zinc-500">Open Issues</p>
            <p className="mt-1 text-lg font-semibold text-zinc-200">{counts.issueCount}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group rounded-lg border border-zinc-800 bg-zinc-900 p-5 transition-colors hover:border-zinc-700 hover:bg-zinc-800/80"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-zinc-50 group-hover:text-white">
                {section.title}
              </h2>
              {"badge" in section && section.badge && (
                <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-500">
                  {section.badge}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              {section.description}
            </p>
            {section.count !== null && (
              <p className="mt-3 text-xs text-zinc-600">
                <span className="text-sm font-medium text-zinc-400">
                  {section.count}
                </span>{" "}
                {section.countLabel}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
