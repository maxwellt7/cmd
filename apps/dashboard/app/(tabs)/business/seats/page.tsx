import { getAllSeats } from "../../../actions/eos";
import { SeatChart } from "../../../../components/eos/seat-chart";

export const dynamic = "force-dynamic";

export default async function SeatsPage() {
  const seatList = await getAllSeats();

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
