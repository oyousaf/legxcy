import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Get secrets from Supabase Edge Function runtime
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE");

// Create client
export const supabase = createClient(supabaseUrl, supabaseKey);
