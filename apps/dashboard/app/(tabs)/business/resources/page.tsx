import { getResourcesForCompany } from "../../../actions/eos";
import { ResourceManager } from "../../../../components/eos/resource-manager";

export const dynamic = "force-dynamic";

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string }>;
}) {
  const params = await searchParams;
  const companyId = params.company ?? "";

  if (!companyId) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 py-16">
          <p className="text-zinc-500">Select a company to view resources</p>
        </div>
      </div>
    );
  }

  const resourceList = await getResourcesForCompany(companyId);

  const serialized = resourceList.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    type: r.type,
    content: r.content,
    attachmentUrl: r.attachmentUrl,
    category: r.category,
  }));

  return <ResourceManager resources={serialized} companyId={companyId} />;
}
