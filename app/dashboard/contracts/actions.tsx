"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getAuthSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { contracts, teamMembers } from "@/lib/db/schema";

// Utility for redirecting with result
function redirectWithMessage(status: "success" | "error", message: string): never {
  const query = new URLSearchParams({ status, message });
  redirect(`/dashboard/contracts?${query.toString()}`);
}

// Permissions
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
    redirectWithMessage("error", "You must belong to a team to manage contracts.");
  }

  return membership;
}

async function requireManageRole(userId: string) {
  const membership = await requireTeamMembership(userId);
  if (!["owner", "admin"].includes(membership.role)) {
    redirectWithMessage("error", "Only owner/admin can manage contracts.");
  }
  return membership;
}

// Schemas
const statusEnum = z.enum(["draft", "pending_review", "signed", "archived"]);

const createContractSchema = z.object({
  name: z.string().trim().min(1, "Contract name is required.").max(80),
  templateId: z.string().min(1).max(60).optional().or(z.literal("")),
  content: z.string().min(1, "Content is required.").max(4000),
  status: statusEnum,
  effectiveDate: z.string().optional().or(z.literal("")),
  parties: z.string().max(255).optional().or(z.literal("")),
});

const updateContractSchema = createContractSchema.extend({
  id: z.string().trim().min(1, "Contract id is required."),
});

const archiveContractSchema = z.object({
  id: z.string().trim().min(1, "Contract id is required."),
});

// Actions
export async function createContractAction(formData: FormData) {
  const parsed = createContractSchema.safeParse({
    name: formData.get("name"),
    templateId: formData.get("templateId") || null,
    content: formData.get("content"),
    status: formData.get("status"),
    effectiveDate: formData.get("effectiveDate") || null,
    parties: formData.get("parties") || null,
  });

  if (!parsed.success) {
    redirectWithMessage(
      "error",
      parsed.error.issues[0]?.message ?? "Invalid contract create request."
    );
  }

  const session = await getAuthSession();
  if (!session) redirect("/auth#signin");

  const membership = await requireManageRole(session.userId);

  await db.insert(contracts).values({
    tenantId: membership.teamId,
    name: parsed.data.name,
    templateId: parsed.data.templateId || null,
    content: parsed.data.content,
    status: parsed.data.status,
    effectiveDate: parsed.data.effectiveDate ? new Date(parsed.data.effectiveDate as string) : null,
    parties: parsed.data.parties || null,
    createdBy: session.userId,
    updatedAt: new Date(),
    createdAt: new Date(),
  });

  redirectWithMessage("success", "Contract created.");
}

export async function updateContractAction(formData: FormData) {
  const parsed = updateContractSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    templateId: formData.get("templateId") || null,
    content: formData.get("content"),
    status: formData.get("status"),
    effectiveDate: formData.get("effectiveDate") || null,
    parties: formData.get("parties") || null,
  });

  if (!parsed.success) {
    redirectWithMessage(
      "error",
      parsed.error.issues[0]?.message ?? "Invalid contract update request."
    );
  }

  const session = await getAuthSession();
  if (!session) redirect("/auth#signin");

  const membership = await requireManageRole(session.userId);

  await db
    .update(contracts)
    .set({
      name: parsed.data.name,
      templateId: parsed.data.templateId || null,
      content: parsed.data.content,
      status: parsed.data.status,
      effectiveDate: parsed.data.effectiveDate ? new Date(parsed.data.effectiveDate as string) : null,
      parties: parsed.data.parties || null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(contracts.id, parsed.data.id),
        eq(contracts.tenantId, membership.teamId)
      )
    );

  redirectWithMessage("success", "Contract updated.");
}

export async function archiveContractAction(formData: FormData) {
  const parsed = archiveContractSchema.safeParse({
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
    .update(contracts)
    .set({
      archivedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(contracts.id, parsed.data.id),
        eq(contracts.tenantId, membership.teamId)
      )
    );

  redirectWithMessage("success", "Contract archived.");
}