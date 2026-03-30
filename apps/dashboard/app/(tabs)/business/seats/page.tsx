import { getAllSeats } from "../../../actions/eos";
import { SeatChart } from "../../../../components/eos/seat-chart";

export const dynamic = "force-dynamic";

export default async function SeatsPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string }>;
}) {
  const params = await searchParams;
  const companyId = params.company ?? "";

  const seatList = companyId ? await getAllSeats(companyId) : [];

  const serialized = seatList.map((s) => ({
    id: s.id,
    title: s.title,
    parentSeatId: s.parentSeatId,
    personName: s.personName,
    roles: s.roles,
    getsIt: s.getsIt,
    wantsIt: s.wantsIt,
    capacityForIt: s.capacityForIt,
    sortOrder: s.sortOrder,
  }));

  return <SeatChart seats={serialized} />;
}
