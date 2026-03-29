"use client";

import { useState } from "react";
import { cn } from "@cmd/ui";
import { addSeat, updateSeat, deleteSeat } from "../../app/actions/eos";

interface SeatData {
  id: string;
  title: string;
  parentSeatId: string | null;
  personName: string | null;
  roles: string[];
  getsIt: string | null;
  wantsIt: string | null;
  capacityForIt: string | null;
  sortOrder: number;
}

interface SeatNode extends SeatData {
  children: SeatNode[];
}

function buildTree(seats: SeatData[]): SeatNode[] {
  const map = new Map<string, SeatNode>();
  const roots: SeatNode[] = [];

  for (const seat of seats) {
    map.set(seat.id, { ...seat, children: [] });
  }

  for (const seat of seats) {
    const node = map.get(seat.id)!;
    if (seat.parentSeatId && map.has(seat.parentSeatId)) {
      map.get(seat.parentSeatId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

// ---------------------------------------------------------------------------
// GWC Badge
// ---------------------------------------------------------------------------

function GwcBadge({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  const colors: Record<string, string> = {
    yes: "bg-emerald-500/10 text-emerald-400",
    no: "bg-red-500/10 text-red-400",
    maybe: "bg-amber-500/10 text-amber-400",
  };

  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 text-[10px] font-medium",
        value ? colors[value] ?? "bg-zinc-800 text-zinc-500" : "bg-zinc-800 text-zinc-600"
      )}
    >
      {label}: {value ?? "-"}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Seat Card
// ---------------------------------------------------------------------------

function SeatCard({
  node,
  allSeats,
  depth,
}: {
  node: SeatNode;
  allSeats: SeatData[];
  depth: number;
}) {
  const [editing, setEditing] = useState(false);
  const [showAddChild, setShowAddChild] = useState(false);

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "rounded-lg border border-zinc-800 bg-zinc-900 p-3 md:p-4 transition-colors hover:border-zinc-700",
          depth === 0 && "border-zinc-700"
        )}
      >
        {editing ? (
          <form
            action={async (formData) => {
              await updateSeat(formData);
              setEditing(false);
            }}
            className="space-y-3"
          >
            <input type="hidden" name="id" value={node.id} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-[10px] text-zinc-500">
                  Seat Title
                </label>
                <input
                  name="title"
                  defaultValue={node.title}
                  required
                  className="w-full rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-zinc-50 focus:border-zinc-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] text-zinc-500">
                  Person
                </label>
                <input
                  name="personName"
                  defaultValue={node.personName ?? ""}
                  className="w-full rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-zinc-50 focus:border-zinc-500 focus:outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-[10px] text-zinc-500">
                  Roles (comma-separated)
                </label>
                <input
                  name="roles"
                  defaultValue={node.roles.join(", ")}
                  className="w-full rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-zinc-50 focus:border-zinc-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] text-zinc-500">
                  Gets It
                </label>
                <select
                  name="getsIt"
                  defaultValue={node.getsIt ?? ""}
                  className="w-full rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-zinc-50 focus:border-zinc-500 focus:outline-none"
                >
                  <option value="">-</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="maybe">Maybe</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[10px] text-zinc-500">
                  Wants It
                </label>
                <select
                  name="wantsIt"
                  defaultValue={node.wantsIt ?? ""}
                  className="w-full rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-zinc-50 focus:border-zinc-500 focus:outline-none"
                >
                  <option value="">-</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="maybe">Maybe</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[10px] text-zinc-500">
                  Capacity
                </label>
                <select
                  name="capacityForIt"
                  defaultValue={node.capacityForIt ?? ""}
                  className="w-full rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-zinc-50 focus:border-zinc-500 focus:outline-none"
                >
                  <option value="">-</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="maybe">Maybe</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-900 hover:bg-zinc-200"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-xs text-zinc-500 hover:text-zinc-300"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-zinc-200">
                  {node.title}
                </h3>
                <p className="text-xs text-zinc-400">
                  {node.personName ?? "Vacant"}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="rounded px-1.5 py-0.5 text-xs text-zinc-600 hover:text-zinc-400"
                >
                  Edit
                </button>
                <form action={deleteSeat}>
                  <input type="hidden" name="id" value={node.id} />
                  <button
                    type="submit"
                    className="rounded px-1.5 py-0.5 text-xs text-zinc-700 hover:text-red-400"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>

            {node.roles.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {node.roles.map((role, i) => (
                  <span
                    key={i}
                    className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400"
                  >
                    {role}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-2 flex gap-1.5">
              <GwcBadge label="G" value={node.getsIt} />
              <GwcBadge label="W" value={node.wantsIt} />
              <GwcBadge label="C" value={node.capacityForIt} />
            </div>
          </>
        )}

        {!editing && (
          <div className="mt-3 border-t border-zinc-800 pt-2">
            {showAddChild ? (
              <form
                action={async (formData) => {
                  await addSeat(formData);
                  setShowAddChild(false);
                }}
                className="flex flex-col md:flex-row md:items-center gap-2"
              >
                <input type="hidden" name="parentSeatId" value={node.id} />
                <input
                  name="title"
                  required
                  autoFocus
                  placeholder="Seat title"
                  className="flex-1 rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-zinc-50 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
                />
                <input
                  name="personName"
                  placeholder="Person (optional)"
                  className="flex-1 rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-zinc-50 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
                />
                <input type="hidden" name="roles" value="" />
                <button
                  type="submit"
                  className="rounded bg-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-600"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddChild(false)}
                  className="text-xs text-zinc-500 hover:text-zinc-300"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddChild(true)}
                className="text-xs text-zinc-600 hover:text-zinc-400"
              >
                + Add report
              </button>
            )}
          </div>
        )}
      </div>

      {/* Children */}
      {node.children.length > 0 && (
        <div className="ml-4 md:ml-8 space-y-3 border-l border-zinc-800 pl-3 md:pl-4">
          {node.children
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((child) => (
              <SeatCard
                key={child.id}
                node={child}
                allSeats={allSeats}
                depth={depth + 1}
              />
            ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Export
// ---------------------------------------------------------------------------

export function SeatChart({ seats }: { seats: SeatData[] }) {
  const [showAddRoot, setShowAddRoot] = useState(false);
  const tree = buildTree(seats);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Accountability Chart
          </h1>
          <p className="text-sm text-zinc-500">
            Org structure with GWC ratings
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddRoot(!showAddRoot)}
          className="rounded-md border border-dashed border-zinc-700 px-4 py-2 text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-300"
        >
          {showAddRoot ? "Cancel" : "+ Add Seat"}
        </button>
      </div>

      {showAddRoot && (
        <form
          action={async (formData) => {
            await addSeat(formData);
            setShowAddRoot(false);
          }}
          className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-zinc-500">
                Seat Title
              </label>
              <input
                name="title"
                required
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-50 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
                placeholder="e.g. Visionary, Integrator"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Person</label>
              <input
                name="personName"
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-50 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
                placeholder="Name (optional)"
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-xs text-zinc-500">
                Roles (comma-separated)
              </label>
              <input
                name="roles"
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-50 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
                placeholder="LMA, R&D, etc."
              />
            </div>
          </div>
          <input type="hidden" name="parentSeatId" value="" />
          <button
            type="submit"
            className="rounded-md bg-zinc-50 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-200"
          >
            Add Seat
          </button>
        </form>
      )}

      {seats.length === 0 && !showAddRoot ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 py-16">
          <p className="text-zinc-500">No seats defined</p>
          <p className="mt-1 text-xs text-zinc-600">
            Build your accountability chart starting with the top seat
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tree.map((node) => (
            <SeatCard
              key={node.id}
              node={node}
              allSeats={seats}
              depth={0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
