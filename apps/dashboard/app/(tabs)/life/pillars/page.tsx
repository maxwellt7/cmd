import { createDb, pillarScores, desc } from "@cmd/db";
import type { PillarKey } from "@cmd/types";
import { PillarCard } from "../../../../components/life/pillar-card";

export const dynamic = "force-dynamic";

const PILLARS: PillarKey[] = ["profit", "power", "purpose", "presence"];

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split("T")[0]!;
}

export default async function PillarsPage() {
  const db = createDb(process.env.DATABASE_URL!);
  const weekStart = getWeekStart();

  const allScores = await db
    .select()
    .from(pillarScores)
    .orderBy(desc(pillarScores.weekStart));

  const scoresByPillar = new Map<string, typeof allScores>();
  for (const s of allScores) {
    const list = scoresByPillar.get(s.pillar) ?? [];
    list.push(s);
    scoresByPillar.set(s.pillar, list);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="text-2xl font-bold">Four Pillars</h1>
      <p className="text-sm text-zinc-500">
        Score each pillar from 1-10 every week. Track your balance across Profit, Power, Purpose, and Presence.
      </p>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {PILLARS.map((pillar) => {
          const history = scoresByPillar.get(pillar) ?? [];
          const current = history.find((s) => s.weekStart === weekStart);
          return (
            <PillarCard
              key={pillar}
              pillar={pillar}
              weekStart={weekStart}
              currentScore={current ? Number(current.score) : undefined}
              currentNotes={current?.notes ?? ""}
              history={history.slice(0, 12).reverse().map((s) => ({
                weekStart: s.weekStart,
                score: Number(s.score),
              }))}
            />
          );
        })}
      </div>
    </div>
  );
}
