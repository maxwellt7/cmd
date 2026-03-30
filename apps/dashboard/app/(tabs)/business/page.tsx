import { getBusinessData } from "./data";
import { RockList } from "./rock-list";
import { TodoList } from "./todo-list";
import { ScorecardSection } from "./scorecard-section";
import { IssuesSection } from "./issues-section";
import { AddRockForm } from "./add-rock-form";
import { AddTodoForm } from "./add-todo-form";

export default async function BusinessPage() {
  const data = await getBusinessData();

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Business</h1>
        <span className="rounded bg-zinc-800 px-2 py-0.5 text-sm text-zinc-400">
          {data.quarter}
        </span>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-500">
          Rocks
        </h2>
        <AddRockForm />
        <RockList rocks={data.rocks} />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-500">
          Scorecard
        </h2>
        <ScorecardSection kpis={data.kpis} entries={data.scorecardEntries} />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-500">
          To-dos
        </h2>
        <AddTodoForm />
        <TodoList todos={data.todos} />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-zinc-500">
          Issues
        </h2>
        <IssuesSection issues={data.issues} />
      </section>
    </div>
  );
}
