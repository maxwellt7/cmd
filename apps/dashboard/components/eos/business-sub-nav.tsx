"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@cmd/ui";

const SECTIONS = [
  { label: "Overview", href: "/business" },
  { label: "Scorecard", href: "/business/scorecard" },
  { label: "Rocks", href: "/business/rocks" },
  { label: "Issues", href: "/business/issues" },
  { label: "To-Dos", href: "/business/todos" },
  { label: "V/TO", href: "/business/vto" },
  { label: "Meetings", href: "/business/meetings" },
  { label: "Seats", href: "/business/seats" },
  { label: "Resources", href: "/business/resources" },
  { label: "Analytics", href: "/business/analytics", badge: "Coming Soon" },
];

export function BusinessSubNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const companyParam = searchParams.get("company");

  function buildHref(base: string) {
    if (companyParam) {
      return `${base}?company=${companyParam}`;
    }
    return base;
  }

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950/60 px-3 md:px-5">
      <div className="flex gap-0.5 overflow-x-auto py-2 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SECTIONS.map((section) => {
          const isActive =
            section.href === "/business"
              ? pathname === "/business"
              : pathname.startsWith(section.href);
          return (
            <Link
              key={section.href}
              href={buildHref(section.href)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-zinc-800 text-zinc-50"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {section.label}
              {section.badge && (
                <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-normal text-zinc-500">
                  {section.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
