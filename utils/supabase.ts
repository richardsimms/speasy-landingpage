import { createClient } from '@supabase/supabase-js'

// Lazy initialization for Supabase client
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl) {
      throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
    }
    
    if (!supabaseKey) {
      throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
    
    supabaseInstance = createClient(supabaseUrl, supabaseKey);
  }
  
  return supabaseInstance;
}

// For backward compatibility
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get: (target, prop) => {
    const client = getSupabaseClient();
    return (client as any)[prop];
  }
}); 