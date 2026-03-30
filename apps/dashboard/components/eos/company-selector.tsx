"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@cmd/ui";
import { createCompany } from "../../app/actions/eos";

interface Company {
  id: string;
  name: string;
  parentCompanyId: string | null;
}

export function CompanySelector({
  companies,
  userId,
}: {
  companies: Company[];
  userId: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showCreate, setShowCreate] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const selectedCompanyId = searchParams.get("company") ?? null;
  const holdingCompanies = companies.filter((c) => !c.parentCompanyId);
  const subCompanies = (parentId: string) =>
    companies.filter((c) => c.parentCompanyId === parentId);

  const selected = companies.find((c) => c.id === selectedCompanyId);

  function navigateToCompany(companyId: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("company", companyId);
    router.push(`${pathname}?${params.toString()}`);
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-200 transition-colors hover:border-zinc-700 hover:bg-zinc-800"
      >
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        <span className="max-w-[200px] truncate">
          {selected?.name ?? "Select Company"}
        </span>
        <svg
          className={cn("h-3.5 w-3.5 text-zinc-500 transition-transform", isOpen && "rotate-180")}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-zinc-800 bg-zinc-900 shadow-xl">
          <div className="max-h-64 overflow-y-auto p-1">
            {companies.length === 0 && !showCreate && (
              <p className="px-3 py-4 text-center text-xs text-zinc-500">
                No companies yet
              </p>
            )}
            {holdingCompanies.map((hc) => (
              <div key={hc.id}>
                <button
                  type="button"
                  onClick={() => navigateToCompany(hc.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
                    selectedCompanyId === hc.id
                      ? "bg-zinc-800 text-zinc-50"
                      : "text-zinc-300 hover:bg-zinc-800/60"
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  {hc.name}
                </button>
                {subCompanies(hc.id).map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => navigateToCompany(sub.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md pl-7 pr-3 py-1.5 text-left text-sm transition-colors",
                      selectedCompanyId === sub.id
                        ? "bg-zinc-800 text-zinc-50"
                        : "text-zinc-400 hover:bg-zinc-800/60"
                    )}
                  >
                    <span className="h-1 w-1 rounded-full bg-zinc-600" />
                    {sub.name}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div className="border-t border-zinc-800 p-1">
            {showCreate ? (
              <form
                action={async (formData) => {
                  await createCompany(formData);
                  setShowCreate(false);
                  setIsOpen(false);
                }}
                className="space-y-2 p-2"
              >
                <input type="hidden" name="userId" value={userId} />
                <input
                  name="name"
                  required
                  placeholder="Company name"
                  className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-sm text-zinc-50 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
                  autoFocus
                />
                <select
                  name="parentCompanyId"
                  className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-sm text-zinc-50 focus:border-zinc-500 focus:outline-none"
                >
                  <option value="">Holding Company (top-level)</option>
                  {holdingCompanies.map((hc) => (
                    <option key={hc.id} value={hc.id}>
                      Sub-company of {hc.name}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="rounded-md bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-900 hover:bg-zinc-200"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="rounded-md px-3 py-1 text-xs text-zinc-500 hover:text-zinc-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-zinc-500 transition-colors hover:bg-zinc-800/60 hover:text-zinc-300"
              >
                + Create Company
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
