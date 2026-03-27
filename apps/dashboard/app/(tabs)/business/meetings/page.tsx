import { getAllMeetings } from "../../../actions/eos";
import { MeetingManager } from "../../../../components/eos/meeting-manager";

export const dynamic = "force-dynamic";

export default async function MeetingsPage() {
  const meetingList = await getAllMeetings();

  const serialized = meetingList.map((m) => ({
    id: m.id,
    date: m.date,
    status: m.status,
    currentSegment: m.currentSegment,
    segmentStartedAt: m.segmentStartedAt?.toISOString() ?? null,
    rating: m.rating,
    notes: m.notes,
    createdAt: m.createdAt.toISOString(),
  }));

  return <MeetingManager meetings={serialized} />;
}
