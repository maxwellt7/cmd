import { createDb, pipelineEntries, asc } from "@cmd/db";
import { PipelineView } from "../../../../components/life/pipeline-view";

export const dynamic = "force-dynamic";

const LEVEL_ORDER = [
  "life_goal",
  "annual_aim",
  "quarterly_objective",
  "monthly_sprint",
  "weekly_focus",
  "daily_action",
] as const;

export default async function PipelinePage() {
  const db = createDb(process.env.DATABASE_URL!);

  const entries = await db
    .select()
    .from(pipelineEntries)
    .orderBy(asc(pipelineEntries.createdAt));

  const serialized = entries.map((e) => ({
    id: e.id,
    level: e.level,
    title: e.title,
    description: e.description ?? "",
    progress: e.progress,
    startDate: e.startDate,
    endDate: e.endDate,
    parentId: e.parentId,
  }));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="text-xl md:text-2xl font-bold">Goal Pipeline</h1>
      <p className="text-sm text-zinc-500">
        Hierarchical goals from life-level down to daily actions. Each level feeds into the next.
      </p>
      <PipelineView entries={serialized} />
    </div>
  );
}
