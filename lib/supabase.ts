import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Export createClient for client components in a way that doesn't immediately throw errors
// This will defer any errors until the client is actually used
let clientInstance: ReturnType<typeof createClientComponentClient> | null = null;

export function createClient() {
  if (!clientInstance) {
    // Only create when first called
    try {
      clientInstance = createClientComponentClient();
    } catch (error) {
      console.error('Error creating Supabase client:', error);
      // Return a mock client that will throw a clearer error when actually used
      return new Proxy({} as ReturnType<typeof createClientComponentClient>, {
        get: (target, prop) => {
          throw new Error(`Supabase client not properly initialized. Make sure environment variables are set.`);
        }
      });
    }
  }
  return clientInstance;
}
