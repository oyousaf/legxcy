import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Pull from Edge Function environment
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase credentials in Edge Function env vars.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
