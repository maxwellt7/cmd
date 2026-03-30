import { getAllIssues } from "../../../actions/eos";
import { IssueBoard } from "../../../../components/eos/issue-board";

export const dynamic = "force-dynamic";

export default async function IssuesPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string }>;
}) {
  const params = await searchParams;
  const companyId = params.company ?? "";

  const issueList = companyId ? await getAllIssues(companyId) : [];

  const serialized = issueList.map((i) => ({
    id: i.id,
    title: i.title,
    description: i.description,
    category: i.category,
    phase: i.phase,
    ownerName: i.ownerName,
    priority: i.priority,
    createdAt: i.createdAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-7xl">
      <IssueBoard issues={serialized} companyId={companyId} />
    </div>
  );
}
