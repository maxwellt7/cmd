"use server";

import {
  createDb,
  companyMembers,
  companyInvites,
  users,
  eq,
  and,
  desc,
  asc,
} from "@cmd/db";
import { revalidatePath } from "next/cache";

function getDb() {
  return createDb(process.env.DATABASE_URL!);
}

/** Resolve Clerk userId to DB user ID */
async function resolveDbUserId(clerkId: string): Promise<string | null> {
  const db = getDb();
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);
  return user?.id ?? null;
}

// ---------------------------------------------------------------------------
// Team Members
// ---------------------------------------------------------------------------

export async function getTeamMembers(companyId: string) {
  const db = getDb();
  const rows = await db
    .select({
      id: companyMembers.id,
      userId: companyMembers.userId,
      clerkId: users.clerkId,
      email: users.email,
      name: users.name,
      role: companyMembers.role,
      joinedAt: companyMembers.createdAt,
    })
    .from(companyMembers)
    .innerJoin(users, eq(companyMembers.userId, users.id))
    .where(eq(companyMembers.companyId, companyId))
    .orderBy(asc(companyMembers.createdAt));

  return rows;
}

export async function getTeamMembersForSelect(companyId: string) {
  const db = getDb();
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
    })
    .from(companyMembers)
    .innerJoin(users, eq(companyMembers.userId, users.id))
    .where(eq(companyMembers.companyId, companyId))
    .orderBy(asc(users.name));

  return rows;
}

// ---------------------------------------------------------------------------
// Invitations
// ---------------------------------------------------------------------------

export async function inviteTeamMember(formData: FormData) {
  const db = getDb();
  const email = formData.get("email") as string;
  const companyId = formData.get("companyId") as string;
  const role = formData.get("role") as string;
  const invitedByClerkId = formData.get("invitedByClerkId") as string;

  const inviterId = await resolveDbUserId(invitedByClerkId);
  if (!inviterId) {
    throw new Error("Inviter not found in database.");
  }

  await db.insert(companyInvites).values({
    companyId,
    email,
    role,
    invitedBy: inviterId,
    status: "pending",
  });

  revalidatePath("/admin");
}

export async function getPendingInvites(companyId: string) {
  const db = getDb();
  return db
    .select()
    .from(companyInvites)
    .where(
      and(
        eq(companyInvites.companyId, companyId),
        eq(companyInvites.status, "pending"),
      ),
    )
    .orderBy(desc(companyInvites.createdAt));
}

export async function cancelInvite(formData: FormData) {
  const db = getDb();
  const inviteId = formData.get("inviteId") as string;

  await db.delete(companyInvites).where(eq(companyInvites.id, inviteId));

  revalidatePath("/admin");
}

// ---------------------------------------------------------------------------
// Member Management
// ---------------------------------------------------------------------------

export async function removeTeamMember(formData: FormData) {
  const db = getDb();
  const memberId = formData.get("memberId") as string;
  const companyId = formData.get("companyId") as string;

  await db
    .delete(companyMembers)
    .where(
      and(
        eq(companyMembers.id, memberId),
        eq(companyMembers.companyId, companyId),
      ),
    );

  revalidatePath("/admin");
}

export async function updateTeamMemberRole(formData: FormData) {
  const db = getDb();
  const memberId = formData.get("memberId") as string;
  const newRole = formData.get("newRole") as string;

  await db
    .update(companyMembers)
    .set({ role: newRole })
    .where(eq(companyMembers.id, memberId));

  revalidatePath("/admin");
}

// ---------------------------------------------------------------------------
// Auto-accept invites on login
// ---------------------------------------------------------------------------

export async function acceptInviteForUser(clerkUserId: string, email: string) {
  const db = getDb();

  const dbUserId = await resolveDbUserId(clerkUserId);
  if (!dbUserId) return;

  const pendingInvites = await db
    .select()
    .from(companyInvites)
    .where(
      and(
        eq(companyInvites.email, email),
        eq(companyInvites.status, "pending"),
      ),
    );

  for (const invite of pendingInvites) {
    // Check if already a member
    const existing = await db
      .select({ id: companyMembers.id })
      .from(companyMembers)
      .where(
        and(
          eq(companyMembers.companyId, invite.companyId),
          eq(companyMembers.userId, dbUserId),
        ),
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(companyMembers).values({
        companyId: invite.companyId,
        userId: dbUserId,
        role: invite.role,
      });
    }

    await db
      .update(companyInvites)
      .set({ status: "accepted" })
      .where(eq(companyInvites.id, invite.id));
  }
}
