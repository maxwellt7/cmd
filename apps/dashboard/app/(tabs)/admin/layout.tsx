import { auth } from "@clerk/nextjs/server";
import { AdminSubNav } from "./admin-sub-nav";
import { CompanySelector } from "../../../components/eos/company-selector";
import { getCompaniesForUser } from "../../actions/eos";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  const companies = userId ? await getCompaniesForUser(userId) : [];
  const serialized = companies.map((c) => ({
    id: c.id,
    name: c.name,
    parentCompanyId: c.parentCompanyId,
  }));

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 border-b border-zinc-800 bg-zinc-950/60 px-4 md:px-6 py-2">
        <CompanySelector
          companies={serialized}
          userId={userId ?? ""}
        />
      </div>
      <div className="border-b border-zinc-800 bg-zinc-950/50 px-4 md:px-6 py-3">
        <AdminSubNav />
      </div>
      <div className="p-4 md:p-6">{children}</div>
    </div>
  );
}
