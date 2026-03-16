import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import Client from "@/app/dashboard/templates/client";
import { getAuthSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { contractTemplates, teamMembers } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

type TemplatesPageProps = {
  searchParams?: Promise<{
    status?: string;
    message?: string;
  }>;
};

export default async function TemplatesPage({ searchParams }: TemplatesPageProps) {
  const session = await getAuthSession();
  if (!session) redirect("/auth#signin");

  // Check team membership and role
  const [membership] = await db
    .select({
      teamId: teamMembers.teamId,
      role: teamMembers.role,
    })
    .from(teamMembers)
    .where(eq(teamMembers.userId, session.userId))
    .limit(1);

  const params = (await searchParams) ?? {};
  const status =
    params.status === "success" || params.status === "error"
      ? params.status
      : null;
  const message = typeof params.message === "string" ? params.message : null;

  if (!membership) {
    return (
      <Client
        status={status}
        message={message}
        canManage={false}
        templates={[]}
      />
    );
  }

  // Load all templates for team
  const templates = await db
    .select({
      id: contractTemplates.id,
      name: contractTemplates.name,
      content: contractTemplates.content,
      updatedAt: contractTemplates.updatedAt,
      archivedAt: contractTemplates.archivedAt,
    })
    .from(contractTemplates)
    .where(
      eq(contractTemplates.tenantId, membership.teamId)
    )
    .orderBy(desc(contractTemplates.updatedAt));

  return (
    <Client
      status={status}
      message={message}
      canManage={["owner", "admin"].includes(membership.role)}
      templates={templates.map(t => ({
        ...t,
        updatedAt: t.updatedAt?.toISOString() ?? null,
        archivedAt: t.archivedAt?.toISOString() ?? null,
      }))}
    />
  );
}