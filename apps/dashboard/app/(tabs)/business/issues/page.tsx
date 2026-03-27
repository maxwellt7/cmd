import { getAllIssues } from "../../../actions/eos";
import { IssueBoard } from "../../../../components/eos/issue-board";

export const dynamic = "force-dynamic";

export default async function IssuesPage() {
  const issueList = await getAllIssues();

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
      <IssueBoard issues={serialized} />
    </div>
  );
}
