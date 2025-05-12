import { redirect } from "next/navigation"
import { PreferencesClient } from "./client"

// Mock data for build time
const MOCK_CATEGORIES = [
  { 
    id: "1", 
    name: "Technology"
  },
  { 
    id: "2", 
    name: "Science"
  },
  { 
    id: "3", 
    name: "Business"
  }
];

// Function to check if we're in build mode
function isBuildMode() {
  return process.env.NEXT_PUBLIC_BUILD_MODE === 'true' || 
         !process.env.NEXT_PUBLIC_SUPABASE_URL || 
         !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export default function PreferencesPage() {
  // Build-time safety check - return static content during build
  if (isBuildMode()) {
    console.log("Using mock data in preferences page due to build mode or missing credentials");
    return <PreferencesClient initialCategories={MOCK_CATEGORIES} />;
  }

  // For runtime only (not during build), we dynamically use async logic
  const runtime = async () => {
    try {
      // Import Supabase client only in runtime
      const { createServerSafeClient } = await import('@/lib/supabase-server');
      const supabase = createServerSafeClient();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        redirect("/auth/login");
      }

      // Get all categories
      const { data: categories } = await supabase
        .from("categories")
        .select("id, name")
        .order("name", { ascending: true });

      return <PreferencesClient initialCategories={categories || MOCK_CATEGORIES} />;
    } catch (error) {
      console.error("Error in preferences page:", error);
      // Fallback to mock data in case of errors
      return <PreferencesClient initialCategories={MOCK_CATEGORIES} />;
    }
  };

  return runtime();
}
