import { getAllVtoSections } from "../../../actions/eos";
import { VtoEditor } from "../../../../components/eos/vto-editor";

export const dynamic = "force-dynamic";

export default async function VtoPage() {
  const sections = await getAllVtoSections();

  const serialized = sections.map((s) => ({
    id: s.id,
    sectionKey: s.sectionKey,
    content: s.content,
    version: s.version,
    updatedAt: s.updatedAt.toISOString(),
  }));

  return <VtoEditor sections={serialized} />;
}
