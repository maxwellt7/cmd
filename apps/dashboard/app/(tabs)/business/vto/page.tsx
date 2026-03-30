import { getAllVtoSections } from "../../../actions/eos";
import { VtoEditor } from "../../../../components/eos/vto-editor";

export const dynamic = "force-dynamic";

export default async function VtoPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string }>;
}) {
  const params = await searchParams;
  const companyId = params.company ?? "";

  const sections = companyId ? await getAllVtoSections(companyId) : [];

  const serialized = sections.map((s) => ({
    id: s.id,
    sectionKey: s.sectionKey,
    content: s.content,
    version: s.version,
    updatedAt: s.updatedAt.toISOString(),
  }));

  return <VtoEditor sections={serialized} companyId={companyId} />;
}
