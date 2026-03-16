-- DocuBuild schema for contracts, templates, parties, activity_logs

CREATE TABLE IF NOT EXISTS "contract_templates" (
  "id" TEXT PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id" TEXT NOT NULL REFERENCES "teams"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "created_by" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "archived_at" TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS "parties" (
  "id" TEXT PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id" TEXT NOT NULL REFERENCES "teams"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "contact_email" TEXT,
  "phone" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "archived_at" TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS "contracts" (
  "id" TEXT PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id" TEXT NOT NULL REFERENCES "teams"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "template_id" TEXT REFERENCES "contract_templates"("id"),
  "content" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "effective_date" TIMESTAMP WITH TIME ZONE,
  "parties" TEXT,
  "created_by" TEXT NOT NULL REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "archived_at" TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS "activity_logs" (
  "id" TEXT PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "contract_id" TEXT NOT NULL REFERENCES "contracts"("id") ON DELETE CASCADE,
  "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "action" TEXT NOT NULL,
  "details" TEXT,
  "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);