import Link from "next/link";
import { getOverviewCounts } from "../../actions/eos";

export const dynamic = "force-dynamic";

export default async function BusinessOverviewPage() {
  const counts = await getOverviewCounts();

  const sections = [
    {
      title: "Scorecard",
      href: "/business/scorecard",
      description: "Track weekly KPIs against goals",
      count: counts.kpiCount,
      countLabel: "KPIs",
    },
    {
      title: "Rocks",
      href: "/business/rocks",
      description: "Quarterly priorities and milestones",
      count: counts.rockCount,
      countLabel: "active rocks",
    },
    {
      title: "Issues",
      href: "/business/issues",
      description: "Identify, Discuss, Solve",
      count: counts.issueCount,
      countLabel: "open issues",
    },
    {
      title: "To-Dos",
      href: "/business/todos",
      description: "7-day action items",
      count: counts.todoCount,
      countLabel: "pending",
    },
    {
      title: "V/TO",
      href: "/business/vto",
      description: "Vision/Traction Organizer",
      count: null,
      countLabel: null,
    },
    {
      title: "Meetings",
      href: "/business/meetings",
      description: "Level 10 meeting pulse",
      count: counts.meetingCount,
      countLabel: "recent",
    },
    {
      title: "Seats",
      href: "/business/seats",
      description: "Accountability chart with GWC",
      count: counts.seatCount,
      countLabel: "seats",
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group rounded-lg border border-zinc-800 bg-zinc-900 p-5 transition-colors hover:border-zinc-700 hover:bg-zinc-800/80"
          >
            <h2 className="text-lg font-semibold text-zinc-50 group-hover:text-white">
              {section.title}
            </h2>
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
