"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@cmd/ui";
import type { TabAccess } from "@cmd/types";

const TABS: { key: keyof TabAccess; label: string; emoji: string; href: string }[] = [
  { key: "chat", label: "Chat", emoji: "\u{1F4AC}", href: "/chat" },
  { key: "life", label: "Life", emoji: "\u{1F300}", href: "/life" },
  { key: "business", label: "Business", emoji: "\u{1F4CA}", href: "/business" },
  { key: "admin", label: "Admin", emoji: "\u2699\uFE0F", href: "/admin" },
];

interface TabNavProps {
  accessibleTabs: (keyof TabAccess)[];
}

export function TabNav({ accessibleTabs }: TabNavProps) {
  const pathname = usePathname();
  const visibleTabs = TABS.filter((tab) => accessibleTabs.includes(tab.key));

  return (
    <div className="flex overflow-x-auto gap-0.5 rounded-lg bg-zinc-900 p-0.5">
      {visibleTabs.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.key}
            href={tab.href}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-zinc-800 text-zinc-50"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            {tab.emoji} {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
