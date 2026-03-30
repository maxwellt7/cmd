type Issue = {
  id: string;
  title: string;
  description: string;
  category: string;
  phase: string;
  ownerName: string | null;
  priority: number;
  createdAt: Date;
};

export function IssuesSection({ issues }: { issues: Issue[] }) {
  if (issues.length === 0) {
    return (
      <p className="rounded border border-dashed border-zinc-700 bg-zinc-900/50 px-4 py-6 text-center text-sm text-zinc-500">
        No open issues.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {issues.map((issue) => (
        <li
          key={issue.id}
          className="rounded border border-zinc-800 bg-zinc-900/50 px-4 py-3"
        >
          <p className="font-medium text-zinc-100">{issue.title}</p>
          {issue.description && (
            <p className="mt-1 text-sm text-zinc-500 line-clamp-2">
              {issue.description}
            </p>
          )}
          <p className="mt-2 text-xs text-zinc-500">
            {issue.category} · {issue.phase}
            {issue.ownerName && ` · ${issue.ownerName}`}
          </p>
        </li>
      ))}
    </ul>
  );
}
