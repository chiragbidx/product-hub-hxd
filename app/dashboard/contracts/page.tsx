import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import Client from "@/app/dashboard/contracts/client";
import { getAuthSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { users, teamMembers, contracts, parties, contractTemplates } from "@/lib/db/schema";

// This page handles listing contracts with metadata, tenant scoping, and feedback messages.

export const dynamic = "force-dynamic";

type ContractsPageProps = {
  searchParams?: Promise<{
    status?: string;
    message?: string;
  }>;
};

export default async function ContractsPage({
  searchParams,
}: ContractsPageProps) {
  // 1. Require authenticated session.
  const session = await getAuthSession();
  if (!session) redirect("/auth#signin");

  // 2. Resolve tenant membership.
  const [membership] = await db
    .select({
      teamId: teamMembers.teamId,
      role: teamMembers.role,
    })
    .from(teamMembers)
    .where(eq(teamMembers.userId, session.userId))
    .limit(1);

  // 3. Handle action feedback.
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
        contracts={[]}
        templates={[]}
        parties={[]}
      />
    );
  }

  // 4. Load contracts for tenant
  const contractRows = await db
    .select({
      id: contracts.id,
      name: contracts.name,
      status: contracts.status,
      effectiveDate: contracts.effectiveDate,
      updatedAt: contracts.updatedAt,
      archivedAt: contracts.archivedAt,
      templateId: contracts.templateId,
    })
    .from(contracts)
    .where(eq(contracts.tenantId, membership.teamId))
    .orderBy(desc(contracts.updatedAt));

  // 5. Load related templates and parties (for add/edit forms)
  const templates = await db
    .select({
      id: contractTemplates.id,
      name: contractTemplates.name,
    })
    .from(contractTemplates)
    .where(eq(contractTemplates.tenantId, membership.teamId))
    .orderBy(desc(contractTemplates.updatedAt));

  const partiesRows = await db
    .select({
      id: parties.id,
      name: parties.name,
      role: parties.role,
    })
    .from(parties)
    .where(eq(parties.tenantId, membership.teamId));

  // 6. Serialize relevant fields
  return (
    <Client
      status={status}
      message={message}
      canManage={["owner", "admin"].includes(membership.role)}
      contracts={contractRows.map((item) => ({
        ...item,
        updatedAt: item.updatedAt?.toISOString() ?? null,
        effectiveDate: item.effectiveDate?.toISOString() ?? null,
        archivedAt: item.archivedAt?.toISOString() ?? null,
      }))}
      templates={templates}
      parties={partiesRows}
    />
  );
}