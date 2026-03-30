import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserByClerkId } from "../../../../actions/user";
import { getStackSessions } from "../../../../actions/stacks";
import { StackHistory } from "../../../../../components/life/stack-history";

export const dynamic = "force-dynamic";

export default async function StackHistoryPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const dbUser = await getUserByClerkId(clerkId);
  if (!dbUser) redirect("/sign-in");

  const sessions = await getStackSessions(dbUser.id);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="text-xl font-bold md:text-2xl">Stack History</h1>
      <StackHistory sessions={sessions} />
    </div>
  );
}
