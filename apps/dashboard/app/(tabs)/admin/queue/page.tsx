import { QueueTable } from "../../../../components/admin/queue-table";

export const dynamic = "force-dynamic";

export default function QueuePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-50">Message Queue</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Monitor pending, delivered, and failed messages
        </p>
      </div>

      <QueueTable />
    </div>
  );
}
