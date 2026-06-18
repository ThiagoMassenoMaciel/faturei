import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mqdosolveajugsepozin.supabase.co/rest/v1/"; // <-- minha URL
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xZG9zb2x2ZWFqdWdzZXBvemluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MDYyMjMsImV4cCI6MjA5NzM4MjIyM30.L1DDoz9wjEwOSfKc35HA6FBDDymWHrYKoALGWFEv0h4"; // <-- minha anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
