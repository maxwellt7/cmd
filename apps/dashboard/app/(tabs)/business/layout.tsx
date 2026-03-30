import { auth } from "@clerk/nextjs/server";
import { BusinessSubNav } from "../../../components/eos/business-sub-nav";
import { CompanySelector } from "../../../components/eos/company-selector";
import { getCompaniesForUser } from "../../actions/eos";

export default async function BusinessLayout({
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
      <div className="flex items-center gap-3 border-b border-zinc-800 bg-zinc-950/60 px-3 md:px-5 py-2">
        <CompanySelector
          companies={serialized}
          userId={userId ?? ""}
        />
      </div>
      <BusinessSubNav />
      <div className="flex-1 p-3 md:p-5">{children}</div>
    </div>
  );
}
