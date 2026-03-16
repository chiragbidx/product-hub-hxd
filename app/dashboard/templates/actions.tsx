"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getAuthSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { contractTemplates, teamMembers } from "@/lib/db/schema";

// Utility for redirecting with result
function redirectWithMessage(status: "success" | "error", message: string): never {
  const query = new URLSearchParams({ status, message });
  redirect(`/dashboard/templates?${query.toString()}`);
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
    redirectWithMessage("error", "You must belong to a team to use this feature.");
  }

  return membership;
}

async function requireManageRole(userId: string) {
  const membership = await requireTeamMembership(userId);
  if (!["owner", "admin"].includes(membership.role)) {
    redirectWithMessage("error", "Only owner/admin can manage contract templates.");
  }
  return membership;
}

const createTemplateSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(80),
  content: z.string().min(1, "Content is required.").max(8000),
});

const updateTemplateSchema = createTemplateSchema.extend({
  id: z.string().trim().min(1, "Template id is required."),
});

const archiveTemplateSchema = z.object({
  id: z.string().trim().min(1, "Template id is required."),
});

export async function createTemplateAction(formData: FormData) {
  const parsed = createTemplateSchema.safeParse({
    name: formData.get("name"),
    content: formData.get("content"),
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

  await db.insert(contractTemplates).values({
    tenantId: membership.teamId,
    name: parsed.data.name,
    content: parsed.data.content,
    createdBy: session.userId,
    updatedAt: new Date(),
    createdAt: new Date(),
  });

  redirectWithMessage("success", "Template created.");
}

export async function updateTemplateAction(formData: FormData) {
  const parsed = updateTemplateSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    content: formData.get("content"),
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
    .update(contractTemplates)
    .set({
      name: parsed.data.name,
      content: parsed.data.content,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(contractTemplates.id, parsed.data.id),
        eq(contractTemplates.tenantId, membership.teamId)
      )
    );

  redirectWithMessage("success", "Template updated.");
}

export async function archiveTemplateAction(formData: FormData) {
  const parsed = archiveTemplateSchema.safeParse({
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
    .update(contractTemplates)
    .set({
      archivedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(contractTemplates.id, parsed.data.id),
        eq(contractTemplates.tenantId, membership.teamId)
      )
    );

  redirectWithMessage("success", "Template archived.");
}