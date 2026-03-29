import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { TabNav } from "../../components/tab-nav";
import { RelayStatus } from "../../components/relay-status";
import { UserMenu } from "../../components/user-menu";
import { getAccessibleTabs } from "@cmd/auth";
import { syncUser } from "../actions/user";
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

  // Sync Clerk user to local DB on every authenticated load
  const clerkUser = await currentUser();
  if (clerkUser) {
    await syncUser(
      clerkUser.id,
      clerkUser.emailAddresses[0]?.emailAddress ?? "",
      `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || "User",
    );
  }

  const role = (sessionClaims?.metadata as { role?: UserRole })?.role ?? "admin";
  const accessibleTabs = getAccessibleTabs(role);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex flex-wrap items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-3 md:px-5 py-3">
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
