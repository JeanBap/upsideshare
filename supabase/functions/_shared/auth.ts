import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface AuthUser {
  id: string;
  email: string;
}

export interface UserProfile {
  id: string;
  role: "brand" | "creator";
  display_name: string | null;
  stripe_account_id: string | null;
}

/**
 * Extract and verify the user from the Authorization header JWT.
 * Throws a structured object on failure so callers can return an error response.
 */
export async function getAuthUser(
  req: Request,
): Promise<AuthUser | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.replace("Bearer ", "");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  return { id: user.id, email: user.email ?? "" };
}

/**
 * Verify that the authenticated user has the required role.
 * Returns the user's profile row or null if the role does not match.
 */
export async function requireRole(
  user: AuthUser,
  role: "brand" | "creator",
  supabaseClient: SupabaseClient,
): Promise<UserProfile | null> {
  const { data: profile, error } = await supabaseClient
    .from("profiles")
    .select("id, role, display_name, stripe_account_id")
    .eq("id", user.id)
    .single();

  if (error || !profile) return null;
  if (profile.role !== role) return null;

  return profile as UserProfile;
}

/**
 * Create a Supabase client with the service role key.
 * Use for writes that bypass RLS.
 */
export function createServiceClient(): SupabaseClient {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(supabaseUrl, serviceRoleKey);
}

/**
 * Legacy alias kept for backward compatibility with existing functions.
 */
export function getServiceClient(): SupabaseClient {
  return createServiceClient();
}

/**
 * Create a Supabase client scoped to the authenticated user's JWT.
 */
export function getUserClient(req: Request): SupabaseClient {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const authHeader = req.headers.get("Authorization") ?? "";

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });
}
