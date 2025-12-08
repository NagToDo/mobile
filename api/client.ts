import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_API_URL;
const supabaseKey = process.env.EXPO_PUBLIC_API_KEY;

export const supabaseConfigured = Boolean(supabaseUrl && supabaseKey);

if (!supabaseConfigured) {
  // Avoid crashing the app if env vars are missing; warn instead.
  console.warn(
    "Supabase env vars are not set. Auth will be disabled until EXPO_PUBLIC_API_URL and EXPO_PUBLIC_API_KEY are provided.",
  );
}

const supabase = createClient(
  supabaseUrl || "https://example.supabase.co",
  supabaseKey || "public-anon-key",
);

export default supabase;
