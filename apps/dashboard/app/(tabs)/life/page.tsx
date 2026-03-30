import { getLifeData } from "./data";
import { PillarsSection } from "./pillars-section";
import { PipelineSection } from "./pipeline-section";
import { AddPipelineForm } from "./add-pipeline-form";
import { PrioritiesSection } from "./priorities-section";
import { JournalSection } from "./journal-section";

export default async function LifePage() {
  const data = await getLifeData();

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Life</h1>
        <span className="rounded bg-zinc-800 px-2 py-0.5 text-sm text-zinc-400">
          Week of {data.weekStart}
        </span>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-500">
          Pillars
        </h2>
        <PillarsSection scores={data.pillarScores} weekStart={data.weekStart} />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-500">
          Pipeline
        </h2>
        <AddPipelineForm />
        <PipelineSection
          pipelineByLevel={data.pipelineByLevel}
          pipelineLevels={data.pipelineLevels}
        />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-500">
          Today — Priorities
        </h2>
        <PrioritiesSection priorities={data.priorities} today={data.today} />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-500">
          Today — Journal
        </h2>
        <JournalSection entries={data.journalEntries} today={data.today} />
      </section>
    </div>
  );
}
