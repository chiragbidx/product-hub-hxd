"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getAuthSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { parties, teamMembers } from "@/lib/db/schema";

function redirectWithMessage(status: "success" | "error", message: string): never {
  const query = new URLSearchParams({ status, message });
  redirect(`/dashboard/parties?${query.toString()}`);
}

async function requireTeamMembership(userId: string) {
  const [membership] = await db
    .select({
      teamId: teamMembers.teamId,
      role: teamMembers.role,
    })
    .from(teamMembers)
    .where(eq(teamMembers.userId, userId))
    .limit(1);

  if (!membership) {
    redirectWithMessage("error", "You must belong to a team to manage parties.");
  }

  return membership;
}

async function requireManageRole(userId: string) {
  const membership = await requireTeamMembership(userId);
  if (!["owner", "admin"].includes(membership.role)) {
    redirectWithMessage("error", "Only owner/admin can manage parties.");
  }
  return membership;
}

const createPartySchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(80),
  role: z.string().trim().min(1, "Role is required.").max(80),
  contactEmail: z.string().email("Invalid email.").max(120).optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
});

const updatePartySchema = createPartySchema.extend({
  id: z.string().trim().min(1, "Party id is required."),
});

const archivePartySchema = z.object({
  id: z.string().trim().min(1, "Party id is required."),
});

export async function createPartyAction(formData: FormData) {
  const parsed = createPartySchema.safeParse({
    name: formData.get("name"),
    role: formData.get("role"),
    contactEmail: formData.get("contactEmail") || null,
    phone: formData.get("phone") || null,
  });

  if (!parsed.success) {
    redirectWithMessage(
      "error",
      parsed.error.issues[0]?.message ?? "Invalid create request."
    );
  }

  const session = await getAuthSession();
  if (!session) redirect("/auth#signin");

  const membership = await requireManageRole(session.userId);

  await db.insert(parties).values({
    tenantId: membership.teamId,
    name: parsed.data.name,
    role: parsed.data.role,
    contactEmail: parsed.data.contactEmail || null,
    phone: parsed.data.phone || null,
    updatedAt: new Date(),
    createdAt: new Date(),
  });

  redirectWithMessage("success", "Party created.");
}

export async function updatePartyAction(formData: FormData) {
  const parsed = updatePartySchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    role: formData.get("role"),
    contactEmail: formData.get("contactEmail") || null,
    phone: formData.get("phone") || null,
  });

  if (!parsed.success) {
    redirectWithMessage(
      "error",
      parsed.error.issues[0]?.message ?? "Invalid update request."
    );
  }

  const session = await getAuthSession();
  if (!session) redirect("/auth#signin");

  const membership = await requireManageRole(session.userId);

  await db
    .update(parties)
    .set({
      name: parsed.data.name,
      role: parsed.data.role,
      contactEmail: parsed.data.contactEmail || null,
      phone: parsed.data.phone || null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(parties.id, parsed.data.id),
        eq(parties.tenantId, membership.teamId)
      )
    );

  redirectWithMessage("success", "Party updated.");
}

export async function archivePartyAction(formData: FormData) {
  const parsed = archivePartySchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    redirectWithMessage(
      "error",
      parsed.error.issues[0]?.message ?? "Invalid archive request."
    );
  }

  const session = await getAuthSession();
  if (!session) redirect("/auth#signin");

  const membership = await requireManageRole(session.userId);

  await db
    .update(parties)
    .set({
      archivedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(parties.id, parsed.data.id),
        eq(parties.tenantId, membership.teamId)
      )
    );

  redirectWithMessage("success", "Party archived.");
}