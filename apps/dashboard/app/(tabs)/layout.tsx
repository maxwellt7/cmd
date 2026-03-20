import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { TabNav } from "../../components/tab-nav";
import { RelayStatus } from "../../components/relay-status";
import { UserMenu } from "../../components/user-menu";
import { getAccessibleTabs } from "@cmd/auth";
import type { UserRole } from "@cmd/types";

export default async function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const role = (sessionClaims?.metadata as { role?: UserRole })?.role ?? "admin";
  const accessibleTabs = getAccessibleTabs(role);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-5 py-3">
        <div className="flex items-center gap-4">
          <span className="text-lg font-bold tracking-tight">{"\u26A1"} CMD</span>
          <TabNav accessibleTabs={accessibleTabs} />
        </div>
        <div className="flex items-center gap-3">
          <RelayStatus status="offline" />
          <UserMenu />
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
