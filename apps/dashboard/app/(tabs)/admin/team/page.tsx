import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getTeamMembers, getPendingInvites } from "../../../actions/team";
import { TeamManager } from "../../../../components/admin/team-manager";

export const dynamic = "force-dynamic";

export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const params = await searchParams;
  const companyId = params.company ?? "";

  if (!companyId) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 py-16">
        <p className="text-zinc-500">Select a company to manage your team</p>
      </div>
    );
  }

  const [members, invites] = await Promise.all([
    getTeamMembers(companyId),
    getPendingInvites(companyId),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-50">Team Management</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage members, roles, and invitations
        </p>
      </div>

      <TeamManager
        companyId={companyId}
        clerkUserId={userId}
        members={members.map((m) => ({
          id: m.id,
          userId: m.userId,
          clerkId: m.clerkId,
          email: m.email,
          name: m.name,
          role: m.role,
          joinedAt: m.joinedAt.toISOString(),
        }))}
        invites={invites.map((inv) => ({
          id: inv.id,
          email: inv.email,
          role: inv.role,
          createdAt: inv.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
