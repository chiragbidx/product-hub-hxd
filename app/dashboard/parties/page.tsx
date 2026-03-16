import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import Client from "@/app/dashboard/parties/client";
import { getAuthSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { parties, teamMembers } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

type PartiesPageProps = {
  searchParams?: Promise<{
    status?: string;
    message?: string;
  }>;
};

export default async function PartiesPage({ searchParams }: PartiesPageProps) {
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
        parties={[]}
      />
    );
  }

  // Load all parties for team
  const partyRows = await db
    .select({
      id: parties.id,
      name: parties.name,
      role: parties.role,
      contactEmail: parties.contactEmail,
      phone: parties.phone,
      updatedAt: parties.updatedAt,
      archivedAt: parties.archivedAt,
    })
    .from(parties)
    .where(
      eq(parties.tenantId, membership.teamId)
    )
    .orderBy(desc(parties.updatedAt));

  return (
    <Client
      status={status}
      message={message}
      canManage={["owner", "admin"].includes(membership.role)}
      parties={partyRows.map(p => ({
        ...p,
        updatedAt: p.updatedAt?.toISOString() ?? null,
        archivedAt: p.archivedAt?.toISOString() ?? null,
      }))}
    />
  );
}