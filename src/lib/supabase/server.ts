import { createClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";

export const createServiceRoleClient = () =>
  createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

export const createBrowserClient = () =>
  createClient(env.NEXT_PUBLIC_SUPABASE_URL ?? env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: {
      detectSessionInUrl: true,
      persistSession: true,
    },
  });


