import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  isSupabaseConfigured,
  supabaseConfig,
} from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CmsSessionUser = {
  id: string;
  email: string;
};

function getConfiguredAdminEmails() {
  return (process.env.CMS_ADMIN_EMAIL ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function getConfiguredCmsAdminCount() {
  return getConfiguredAdminEmails().length;
}

export function hasSingleConfiguredCmsAdmin() {
  return getConfiguredCmsAdminCount() === 1;
}

export function getDefaultCmsEmail() {
  return getConfiguredAdminEmails()[0] ?? "";
}

async function isEmailPresentInAdminTable(email: string) {
  const adminsTable = process.env.SUPABASE_ADMINS_TABLE?.trim();

  if (!adminsTable || !supabaseConfig.serviceRoleKey) {
    return false;
  }

  try {
    const adminClient = createSupabaseAdminClient();
    const { data, error } = await adminClient
      .from(adminsTable)
      .select("email")
      .eq("email", email)
      .limit(1)
      .maybeSingle();

    if (error) {
      return false;
    }

    return Boolean(data);
  } catch {
    return false;
  }
}

export async function isAuthorizedCmsEmail(email?: string | null) {
  if (!email) {
    return false;
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return false;
  }

  if (getConfiguredAdminEmails().includes(normalizedEmail)) {
    return true;
  }

  if (!isSupabaseConfigured()) {
    return false;
  }

  return isEmailPresentInAdminTable(normalizedEmail);
}

export async function getCmsSessionUser(): Promise<CmsSessionUser | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return null;
  }

  if (!(await isAuthorizedCmsEmail(user.email))) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
  };
}

export async function requireCmsSessionUser() {
  const user = await getCmsSessionUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}
