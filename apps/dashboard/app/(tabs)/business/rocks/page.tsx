import { getRocksForQuarter, getAllMilestones } from "../../../actions/eos";
import { AddRockForm, RockCard } from "../../../../components/eos/rock-forms";

export const dynamic = "force-dynamic";

export default async function RocksPage() {
  const quarter = `${new Date().getFullYear()}-Q${Math.ceil((new Date().getMonth() + 1) / 3)}`;

  const rockList = await getRocksForQuarter(quarter);

  const milestoneList =
    rockList.length > 0 ? await getAllMilestones() : [];

  // Group milestones by rockId
  const milestonesByRock = new Map<string, typeof milestoneList>();
  for (const ms of milestoneList) {
    const existing = milestonesByRock.get(ms.rockId) ?? [];
    existing.push(ms);
    milestonesByRock.set(ms.rockId, existing);
  }

  const onTrack = rockList.filter((r) => r.status === "on_track");
  const offTrack = rockList.filter((r) => r.status === "off_track");
  const done = rockList.filter((r) => r.status === "done");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Rocks</h1>
          <p className="text-sm text-zinc-500">
            Quarterly priorities for {quarter}
          </p>
        </div>
        <AddRockForm quarter={quarter} />
      </div>

      {rockList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 py-16">
          <p className="text-zinc-500">No rocks for {quarter}</p>
          <p className="mt-1 text-xs text-zinc-600">
            Add quarterly priorities to keep your team focused
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {onTrack.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium uppercase tracking-wider text-emerald-400/80">
                On Track ({onTrack.length})
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {onTrack.map((rock) => (
                  <RockCard
                    key={rock.id}
                    rock={{
                      id: rock.id,
                      title: rock.title,
                      ownerName: rock.ownerName,
                      status: rock.status,
                      quarter: rock.quarter,
                      dueDate: rock.dueDate,
                    }}
                    milestoneList={(milestonesByRock.get(rock.id) ?? []).map((m) => ({
                      id: m.id,
                      title: m.title,
                      completed: m.completed,
                      sortOrder: m.sortOrder,
                    }))}
                  />
                ))}
              </div>
            </div>
          )}
          {offTrack.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium uppercase tracking-wider text-red-400/80">
                Off Track ({offTrack.length})
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {offTrack.map((rock) => (
                  <RockCard
                    key={rock.id}
                    rock={{
                      id: rock.id,
                      title: rock.title,
                      ownerName: rock.ownerName,
                      status: rock.status,
                      quarter: rock.quarter,
                      dueDate: rock.dueDate,
                    }}
                    milestoneList={(milestonesByRock.get(rock.id) ?? []).map((m) => ({
                      id: m.id,
                      title: m.title,
                      completed: m.completed,
                      sortOrder: m.sortOrder,
                    }))}
                  />
                ))}
              </div>
            </div>
          )}
          {done.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">
                Done ({done.length})
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {done.map((rock) => (
                  <RockCard
                    key={rock.id}
                    rock={{
                      id: rock.id,
                      title: rock.title,
                      ownerName: rock.ownerName,
                      status: rock.status,
                      quarter: rock.quarter,
                      dueDate: rock.dueDate,
                    }}
                    milestoneList={(milestonesByRock.get(rock.id) ?? []).map((m) => ({
                      id: m.id,
                      title: m.title,
                      completed: m.completed,
                      sortOrder: m.sortOrder,
                    }))}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
