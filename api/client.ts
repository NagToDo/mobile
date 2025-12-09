import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const supabaseUrl = process.env.EXPO_PUBLIC_API_URL;
const supabaseKey = process.env.EXPO_PUBLIC_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Supabase configuration missing: Both EXPO_PUBLIC_API_URL and EXPO_PUBLIC_API_KEY environment variables must be set. Make sure you have added these variables to your environment.",
  );
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export default supabase;
export { supabaseUrl, supabaseKey };
