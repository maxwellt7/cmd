"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@cmd/ui";

const LIFE_TABS = [
  { label: "Overview", href: "/life" },
  { label: "Pillars", href: "/life/pillars" },
  { label: "Pipeline", href: "/life/pipeline" },
  { label: "Today", href: "/life/today" },
  { label: "Weekly", href: "/life/weekly" },
  { label: "Journal", href: "/life/journal" },
  { label: "Stacks", href: "/life/stacks" },
  { label: "History", href: "/life/stacks/history" },
];

export function LifeSubNav() {
  const pathname = usePathname();

  return (
    <div className="flex gap-0.5 rounded-lg bg-zinc-900 p-0.5 overflow-x-auto whitespace-nowrap">
      {LIFE_TABS.map((tab) => {
        const isActive =
          tab.href === "/life"
            ? pathname === "/life"
            : tab.href === "/life/stacks"
              ? pathname.startsWith("/life/stacks") && !pathname.startsWith("/life/stacks/history")
              : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-zinc-800 text-zinc-50"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
