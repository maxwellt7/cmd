import {
  getAllMeetings,
  getMeetingTemplates,
  getKpisForQuarter,
  getAllEntries,
  getRocksForQuarter,
  getAllTodos,
  getAllIssues,
} from "../../../actions/eos";
import { MeetingManager } from "../../../../components/eos/meeting-manager";

export const dynamic = "force-dynamic";

function getCurrentQuarter(): string {
  const now = new Date();
  const q = Math.ceil((now.getMonth() + 1) / 3);
  return `${now.getFullYear()}-Q${q}`;
}

export default async function MeetingsPage(props: {
  searchParams: Promise<{ company?: string }>;
}) {
  const searchParams = await props.searchParams;
  const companyId = searchParams.company ?? "default";
  const quarter = getCurrentQuarter();

  const [meetingList, templateList, kpiList, entryList, rockList, todoList, issueList] =
    await Promise.all([
      getAllMeetings(companyId),
      getMeetingTemplates(companyId),
      getKpisForQuarter(quarter, companyId),
      getAllEntries(),
      getRocksForQuarter(quarter, companyId),
      getAllTodos(companyId),
      getAllIssues(companyId),
    ]);

  const meetings = meetingList.map((m) => ({
    id: m.id,
    date: m.date,
    status: m.status,
    meetingType: (m as Record<string, unknown>).meetingType as string | null ?? null,
    currentSegment: m.currentSegment,
    segmentStartedAt: m.segmentStartedAt?.toISOString() ?? null,
    rating: m.rating,
    notes: m.notes,
    templateId: (m as Record<string, unknown>).templateId as string | null ?? null,
    createdAt: m.createdAt.toISOString(),
  }));

  const templates = templateList.map((t) => ({
    id: t.id,
    name: (t as Record<string, unknown>).name as string,
    meetingType: (t as Record<string, unknown>).meetingType as string,
    segments: (t as Record<string, unknown>).segments as string[],
    segmentDurations: (t as Record<string, unknown>).segmentDurations as number[],
  }));

  const kpis = kpiList.map((k) => ({
    id: k.id,
    name: k.name,
    ownerName: k.ownerName,
    goal: k.goal,
    unit: k.unit,
  }));

  const kpiEntries = entryList.map((e) => ({
    kpiId: e.kpiId,
    weekStart: e.weekStart,
    goal: e.goal,
    actual: e.actual,
  }));

  const rocks = rockList.map((r) => ({
    id: r.id,
    title: r.title,
    ownerName: r.ownerName,
    status: r.status,
  }));

  const todos = todoList.map((t) => ({
    id: t.id,
    title: t.title,
    ownerName: t.ownerName,
    completed: t.completed,
    dueDate: t.dueDate,
  }));

  const issues = issueList.map((i) => ({
    id: i.id,
    title: i.title,
    description: i.description,
    ownerName: i.ownerName,
    phase: i.phase,
    priority: i.priority,
  }));

  return (
    <MeetingManager
      meetings={meetings}
      templates={templates}
      companyId={companyId}
      kpis={kpis}
      kpiEntries={kpiEntries}
      rocks={rocks}
      todos={todos}
      issues={issues}
    />
  );
}
