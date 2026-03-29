"use server";

import { createDb, users, eq } from "@cmd/db";

function getDb() {
  return createDb(process.env.DATABASE_URL!);
}

/**
 * Syncs a Clerk user to the local users table.
 * Called on every authenticated page load to ensure the user record exists.
 * Uses upsert (insert on conflict update) to handle both new and returning users.
 */
export async function syncUser(clerkId: string, email: string, name: string) {
  const db = getDb();

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  if (existing.length > 0) {
    // Update if email or name changed
    const user = existing[0];
    if (user.email !== email || user.name !== name) {
      await db
        .update(users)
        .set({ email, name, updatedAt: new Date() })
        .where(eq(users.clerkId, clerkId));
    }
    return user;
  }

  // Insert new user
  const [newUser] = await db
    .insert(users)
    .values({ clerkId, email, name })
    .returning();

  return newUser;
}

/**
 * Gets the DB user record for a Clerk user ID.
 */
export async function getUserByClerkId(clerkId: string) {
  const db = getDb();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);
  return user ?? null;
}

/**
 * Deletes a user record by Clerk ID (called from webhook on user.deleted).
 */
export async function deleteUserByClerkId(clerkId: string) {
  const db = getDb();
  await db.delete(users).where(eq(users.clerkId, clerkId));
}

/**
 * Updates user role.
 */
export async function updateUserRole(clerkId: string, role: string) {
  const db = getDb();
  await db
    .update(users)
    .set({ role, updatedAt: new Date() })
    .where(eq(users.clerkId, clerkId));
}
