import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_API_URL;
const supabaseKey = process.env.EXPO_PUBLIC_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Supabase configuration missing: Both EXPO_PUBLIC_API_URL and EXPO_PUBLIC_API_KEY environment variables must be set. Make sure you have added these variables to your environment.",
  );
}

export const supabaseConfigured = true;

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
