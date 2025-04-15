"use server"

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

type SubscribeData = {
  name: string
  email: string
}

export async function subscribeToEarlyAccess(data: SubscribeData) {
  try {
    // Insert the data into the waitlist table
    const { error } = await supabase.from("waitlist").insert([
      {
        name: data.name,
        email: data.email,
        created_at: new Date().toISOString(),
      },
    ])

    if (error) {
      console.error("Error inserting data:", error)
      return { success: false, error: error.message }
    }

    // Revalidate the home page to update any counters or UI
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("Error in subscribeToEarlyAccess:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
