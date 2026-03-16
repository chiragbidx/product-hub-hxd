"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createAuthSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { teams, teamMembers, users } from "@/lib/db/schema";

// Replication pattern for server actions in this codebase:
// 1) Validate FormData with Zod.
// 2) Return serializable error state for recoverable issues.
// 3) Run DB/auth side effects only after validation passes.
// 4) Redirect on successful terminal paths.
export type AuthActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const signInSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

const signUpSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required."),
    lastName: z.string().trim().min(1, "Last name is required."),
    email: z.string().trim().email("Please enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

function getSafeRedirect(formData: FormData): string {
  // Prevent open-redirects by allowing only internal paths.
  const raw = formData.get("redirectTo");
  if (typeof raw === "string" && raw.startsWith("/")) return raw;
  return "/dashboard";
}

export async function signInWithPassword(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  // Step 1: validate request payload.
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const email = parsed.data.email.toLowerCase();
  // Step 2: look up user and verify credentials.
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) {
    return { status: "error", message: "Invalid email or password." };
  }

  const isValidPassword = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!isValidPassword) {
    return { status: "error", message: "Invalid email or password." };
  }

  // Step 3: create session + redirect (success path does not return state).
  await createAuthSession(user.id, user.email);
  redirect(getSafeRedirect(formData));
}

export async function signUpWithPassword(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  // Step 1: validate request payload.
  const parsed = signUpSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const email = parsed.data.email.toLowerCase();
  // Step 2: enforce unique email.
  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser) {
    return {
      status: "error",
      message: "An account with this email already exists.",
    };
  }

  // Step 3: create user record.
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const [newUser] = await db.insert(users).values({
    email,
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    passwordHash,
  }).returning({ id: users.id });

  const redirectTo = getSafeRedirect(formData);
  const isInviteFlow = redirectTo.startsWith("/invite/");

  // Step 4: non-invite signup auto-creates a personal team + owner membership.
  if (!isInviteFlow) {
    const teamName = `${parsed.data.firstName}'s Team`;
    const [newTeam] = await db.insert(teams).values({ name: teamName }).returning({ id: teams.id });
    await db.insert(teamMembers).values({
      teamId: newTeam.id,
      userId: newUser.id,
      role: "owner",
    });
  }

  // Step 5: create session + redirect.
  await createAuthSession(newUser.id, email);
  redirect(redirectTo);
}
