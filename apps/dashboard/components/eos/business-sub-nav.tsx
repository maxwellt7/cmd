"use client";

import { usePathname } from "next/navigation";
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
];

export function BusinessSubNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950/60 px-5">
      <div className="flex gap-0.5 overflow-x-auto py-2">
        {SECTIONS.map((section) => {
          const isActive =
            section.href === "/business"
              ? pathname === "/business"
              : pathname.startsWith(section.href);
          return (
            <Link
              key={section.href}
              href={section.href}
              className={cn(
                "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-zinc-800 text-zinc-50"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {section.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
