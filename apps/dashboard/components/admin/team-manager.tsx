"use client";

import { useTransition, useState } from "react";
import {
  inviteTeamMember,
  removeTeamMember,
  updateTeamMemberRole,
  cancelInvite,
} from "../../app/actions/team";
import { cn } from "@cmd/ui";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Member {
  id: string;
  userId: string;
  clerkId: string;
  email: string;
  name: string;
  role: string;
  joinedAt: string;
}

interface Invite {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

interface TeamManagerProps {
  companyId: string;
  clerkUserId: string;
  members: Member[];
  invites: Invite[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ROLE_BADGE: Record<string, string> = {
  superadmin: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  admin: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  member: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  viewer: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        ROLE_BADGE[role] ?? ROLE_BADGE.viewer,
      )}
    >
      {role}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TeamManager({
  companyId,
  clerkUserId,
  members,
  invites,
}: TeamManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  // Determine current user role within this company
  const currentMember = members.find((m) => m.clerkId === clerkUserId) ?? null;
  const canManage =
    currentMember?.role === "superadmin" || currentMember?.role === "admin";

  return (
    <div className="space-y-8">
      {/* ----------------------------------------------------------------- */}
      {/* Members List                                                      */}
      {/* ----------------------------------------------------------------- */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-400">
          Members ({members.length})
        </h2>

        <div className="divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-900">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-sm font-medium text-zinc-300">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-50">
                    {member.name}
                  </p>
                  <p className="truncate text-xs text-zinc-500">
                    {member.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {canManage && member.role !== "superadmin" ? (
                  <form
                    action={(formData) => {
                      startTransition(() => updateTeamMemberRole(formData));
                    }}
                  >
                    <input type="hidden" name="memberId" value={member.id} />
                    <select
                      name="newRole"
                      defaultValue={member.role}
                      onChange={(e) => {
                        const form = e.currentTarget.closest("form");
                        if (form) {
                          startTransition(() => {
                            const fd = new FormData(form);
                            fd.set("newRole", e.target.value);
                            updateTeamMemberRole(fd);
                          });
                        }
                      }}
                      className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                    >
                      <option value="admin">Admin</option>
                      <option value="member">Member</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </form>
                ) : (
                  <RoleBadge role={member.role} />
                )}

                {canManage && member.clerkId !== clerkUserId && (
                  <>
                    {confirmRemoveId === member.id ? (
                      <div className="flex items-center gap-1">
                        <form
                          action={(formData) => {
                            startTransition(() => {
                              removeTeamMember(formData);
                              setConfirmRemoveId(null);
                            });
                          }}
                        >
                          <input
                            type="hidden"
                            name="memberId"
                            value={member.id}
                          />
                          <input
                            type="hidden"
                            name="companyId"
                            value={companyId}
                          />
                          <button
                            type="submit"
                            disabled={isPending}
                            className="rounded px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-500/10"
                          >
                            Confirm
                          </button>
                        </form>
                        <button
                          type="button"
                          onClick={() => setConfirmRemoveId(null)}
                          className="rounded px-2 py-1 text-xs text-zinc-500 hover:text-zinc-300"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmRemoveId(member.id)}
                        className="rounded px-2 py-1 text-xs text-zinc-500 hover:text-red-400"
                      >
                        Remove
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Invite Form                                                       */}
      {/* ----------------------------------------------------------------- */}
      {canManage && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-400">
            Invite Member
          </h2>

          <form
            action={(formData) => {
              startTransition(() => inviteTeamMember(formData));
            }}
            className="flex flex-col gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4 sm:flex-row sm:items-end"
          >
            <input type="hidden" name="companyId" value={companyId} />
            <input
              type="hidden"
              name="invitedByClerkId"
              value={clerkUserId}
            />

            <div className="flex-1 space-y-1">
              <label
                htmlFor="invite-email"
                className="text-xs font-medium text-zinc-400"
              >
                Email
              </label>
              <input
                id="invite-email"
                type="email"
                name="email"
                required
                placeholder="colleague@company.com"
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-50 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="invite-role"
                className="text-xs font-medium text-zinc-400"
              >
                Role
              </label>
              <select
                id="invite-role"
                name="role"
                defaultValue="member"
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-600 sm:w-36"
              >
                <option value="admin">Admin</option>
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 disabled:opacity-50"
            >
              Send Invite
            </button>
          </form>
        </section>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Pending Invites                                                   */}
      {/* ----------------------------------------------------------------- */}
      {invites.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-400">
            Pending Invites ({invites.length})
          </h2>

          <div className="divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-900">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-dashed border-zinc-700 text-xs text-zinc-500">
                    ?
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm text-zinc-300">
                      {invite.email}
                    </p>
                    <p className="text-xs text-zinc-600">
                      Sent{" "}
                      {new Date(invite.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <RoleBadge role={invite.role} />
                  {canManage && (
                    <form
                      action={(formData) => {
                        startTransition(() => cancelInvite(formData));
                      }}
                    >
                      <input
                        type="hidden"
                        name="inviteId"
                        value={invite.id}
                      />
                      <button
                        type="submit"
                        disabled={isPending}
                        className="rounded px-2 py-1 text-xs text-zinc-500 hover:text-red-400"
                      >
                        Cancel
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Permissions Reference                                             */}
      {/* ----------------------------------------------------------------- */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-400">
          Role Permissions
        </h2>

        <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-4 py-2.5 font-medium text-zinc-400">Role</th>
                <th className="px-4 py-2.5 font-medium text-zinc-400">
                  Permissions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              <tr>
                <td className="px-4 py-2.5">
                  <RoleBadge role="superadmin" />
                </td>
                <td className="px-4 py-2.5 text-zinc-400">
                  Everything &mdash; manage company, invite/remove members, all
                  CRUD
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5">
                  <RoleBadge role="admin" />
                </td>
                <td className="px-4 py-2.5 text-zinc-400">
                  Manage members, all CRUD operations
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5">
                  <RoleBadge role="member" />
                </td>
                <td className="px-4 py-2.5 text-zinc-400">
                  View and edit assigned items, add new items
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5">
                  <RoleBadge role="viewer" />
                </td>
                <td className="px-4 py-2.5 text-zinc-400">
                  Read-only access to all data
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
