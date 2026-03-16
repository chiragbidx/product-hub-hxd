"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { OpenAIError } from "openai";

import { getOpenAIClient, DEFAULT_OPENAI_MODEL } from "@/lib/openai";
import { getAuthSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { contracts, contractTemplates, teamMembers } from "@/lib/db/schema";

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

const aiContractGenSchema = z.object({
  name: z.string().trim().min(1).max(80),
  templateId: z.string().optional().or(z.literal("")),
  parties: z.string().optional().or(z.literal("")),
  description: z.string().min(1, "Describe the contract purpose or scenario for best results.").max(300),
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

// AI Assistant action for contract generation
export async function generateContractWithAIAction(formData: FormData) {
  const parsed = aiContractGenSchema.safeParse({
    name: formData.get("name"),
    templateId: formData.get("templateId") || null,
    parties: formData.get("parties") || null,
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Invalid data.", content: "" };
  }

  const session = await getAuthSession();
  if (!session) return { status: "error", message: "You must be signed in.", content: "" };

  const membership = await requireManageRole(session.userId);

  let templateContent: string | null = null;
  if (parsed.data.templateId) {
    // Load the template
    const [tpl] = await db
      .select({ content: contractTemplates.content })
      .from(contractTemplates)
      .where(and(
        eq(contractTemplates.id, parsed.data.templateId),
        eq(contractTemplates.tenantId, membership.teamId)
      ));
    templateContent = tpl?.content || null;
  }

  const systemMsg = [
    "You are a legal AI assistant that drafts customizable business contracts for modern SaaS teams.",
    "Never provide real legal advice; focus on clarity, compliance, and simple language.",
    "If a template is provided, keep all main sections and merge fields as indicated, replacing {{field}} with best guess placeholders or party/contact information.",
    "Always label major sections, and include all info provided about parties, effective date, and business purpose.",
  ].join(" ");

  let prompt = `Please draft a legal contract named "${parsed.data.name}"`;
  if (parsed.data.description) {
    prompt += ` for the purpose of: ${parsed.data.description}.`;
  }
  if (parsed.data.parties) {
    prompt += ` Involve these parties: ${parsed.data.parties}.`;
  }
  if (templateContent) {
    prompt += `\n\nUse this template:\n${templateContent}`;
  }

  try {
    const openai = getOpenAIClient();
    const chat = await openai.chat.completions.create({
      model: DEFAULT_OPENAI_MODEL,
      messages: [
        { role: "system", content: systemMsg },
        { role: "user", content: prompt },
      ],
      max_tokens: 2000,
      temperature: 0.2,
    });

    const content = chat.choices?.[0]?.message?.content?.trim() ?? "";
    if (content.length === 0) {
      return { status: "error", message: "AI was unable to generate a contract. Try a more detailed description.", content: "" };
    }
    return { status: "success", message: "AI contract generated!", content };
  } catch (error: any) {
    if (error instanceof OpenAIError && error.message) {
      return { status: "error", message: "AI Error: " + error.message, content: "" };
    }
    return { status: "error", message: "An unexpected error occurred during AI contract generation.", content: "" };
  }
}