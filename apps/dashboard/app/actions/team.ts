"use server";

import {
  createDb,
  companyMembers,
  companyInvites,
  companies,
  users,
  eq,
  and,
  desc,
  asc,
} from "@cmd/db";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

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

  // Get inviter name and company name for the email
  const [inviter] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, inviterId))
    .limit(1);

  const [company] = await db
    .select({ name: companies.name })
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1);

  await db.insert(companyInvites).values({
    companyId,
    email,
    role,
    invitedBy: inviterId,
    status: "pending",
  });

  // Send invite email via Resend
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.cmdcntr.app";
    const inviterName = inviter?.name || "A team member";
    const companyName = company?.name || "a company";

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "CMD <onboarding@resend.dev>",
      to: email,
      subject: `${inviterName} invited you to join ${companyName} on CMD`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="font-size: 24px; font-weight: 700; color: #fafafa; margin-bottom: 8px;">You're invited!</h1>
          <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            <strong style="color: #fafafa;">${inviterName}</strong> has invited you to join
            <strong style="color: #fafafa;">${companyName}</strong> as a <strong style="color: #fafafa;">${role}</strong> on CMD — Command Center.
          </p>
          <a href="${appUrl}/sign-up"
             style="display: inline-block; background: #fafafa; color: #0a0a0a; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Accept Invite &amp; Sign Up
          </a>
          <p style="color: #71717a; font-size: 13px; margin-top: 24px; line-height: 1.5;">
            Already have an account? <a href="${appUrl}/sign-in" style="color: #a1a1aa;">Sign in</a> and the invite will be accepted automatically.
          </p>
          <hr style="border: none; border-top: 1px solid #27272a; margin: 32px 0;" />
          <p style="color: #52525b; font-size: 12px;">
            CMD — Command Center &bull; <a href="${appUrl}" style="color: #71717a;">${appUrl}</a>
          </p>
        </div>
      `,
    });
  }

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
