"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@cmd/ui";

const ADMIN_TABS = [
  { label: "Overview", href: "/admin" },
  { label: "Agents", href: "/admin/agents" },
  { label: "Integrations", href: "/admin/integrations" },
  { label: "Queue", href: "/admin/queue" },
];

export function AdminSubNav() {
  const pathname = usePathname();

  return (
    <div className="flex gap-0.5 rounded-lg bg-zinc-900 p-0.5">
      {ADMIN_TABS.map((tab) => {
        const isActive =
          tab.href === "/admin"
            ? pathname === "/admin"
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
