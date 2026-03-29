import { createDb, journalEntries, eq, desc } from "@cmd/db";
import { JournalView } from "../../../../components/life/journal-view";

export const dynamic = "force-dynamic";

export default async function JournalPage(props: {
  searchParams: Promise<{ date?: string }>;
}) {
  const searchParams = await props.searchParams;
  const db = createDb(process.env.DATABASE_URL!);

  let entries;
  if (searchParams.date) {
    entries = await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.date, searchParams.date))
      .orderBy(desc(journalEntries.createdAt));
  } else {
    entries = await db
      .select()
      .from(journalEntries)
      .orderBy(desc(journalEntries.createdAt))
      .limit(50);
  }

  const serialized = entries.map((e) => ({
    id: e.id,
    date: e.date,
    stackType: e.stackType,
    prompt: e.prompt,
    content: e.content,
    createdAt: e.createdAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-xl md:text-2xl font-bold">Journal</h1>
      <JournalView entries={serialized} filterDate={searchParams.date ?? null} />
    </div>
  );
}
