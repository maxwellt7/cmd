import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getUserByClerkId } from "../../../../actions/user";
import { getStackSession, getStackMessages } from "../../../../actions/stacks";
import { StackSession } from "../../../../../components/life/stack-session";

export const dynamic = "force-dynamic";

export default async function StackSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const dbUser = await getUserByClerkId(clerkId);
  if (!dbUser) redirect("/sign-in");

  const { sessionId } = await params;

  const [session, messages] = await Promise.all([
    getStackSession(sessionId),
    getStackMessages(sessionId),
  ]);

  if (!session) notFound();

  return (
    <StackSession
      session={session}
      initialMessages={messages}
    />
  );
}
