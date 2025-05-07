"use server"

import { createAdminClient } from "@/lib/supabase"

const supabase = createAdminClient()

import { revalidatePath } from "next/cache"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"
// Temporary module declaration for unfluff to suppress TS error
// @ts-ignore
// eslint-disable-next-line
declare module 'unfluff';
// Temporary module declaration for node-fetch to suppress TS error
// @ts-ignore
// eslint-disable-next-line
declare module 'node-fetch';

// Use require for unfluff to avoid TS import error
const unfluffModule = require('unfluff');
const unfluff = unfluffModule.default || unfluffModule;
const fetch = require('node-fetch');

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

export async function submitUrl(url: string) {
  try {
    const supabase = createServerActionClient({ cookies })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, error: "Not authenticated" }
    }

    // Scrape the URL for content
    let scraped: any = {}
    try {
      const response = await fetch(url)
      const html = await response.text()
      scraped = unfluff(html)
    } catch (err) {
      console.error("Error scraping URL:", err)
      return { success: false, error: "Failed to fetch or parse the URL." }
    }

    // Insert the scraped content into content_items
    const { data: contentItem, error: contentError } = await supabase.from("content_items").insert({
      title: scraped.title || url,
      url,
      content: scraped.text || scraped.description || "",
      summary: scraped.description || "",
      created_at: new Date().toISOString(),
    }).select().single()

    if (contentError || !contentItem) {
      console.error("Error inserting content item:", contentError)
      return { success: false, error: contentError?.message || "Failed to save content." }
    }

    // Insert the URL into the user_submitted_urls table, linking to the content item
    const { error } = await supabase.from("user_submitted_urls").insert({
      id: uuidv4(),
      user_id: session.user.id,
      url,
      title: scraped.title || url,
      status: "pending",
      content_item_id: contentItem.id,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error submitting URL:", error)
      return { success: false, error: error.message }
    }

    // Revalidate dashboard
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error: any) {
    console.error("Error in submitUrl:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function subscribeToCategory(categoryId: string) {
  try {
    const supabase = createServerActionClient({ cookies })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, error: "Not authenticated" }
    }

    // Check if the user is already subscribed to this category
    const { data: existingSubscription } = await supabase
      .from("user_category_subscriptions")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("category_id", categoryId)
      .single()

    if (existingSubscription) {
      return { success: true, message: "Already subscribed" }
    }

    // Insert the subscription
    const { error } = await supabase.from("user_category_subscriptions").insert({
      id: uuidv4(),
      user_id: session.user.id,
      category_id: categoryId,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error subscribing to category:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/dashboard")
    revalidatePath("/settings/subscriptions")

    return { success: true }
  } catch (error: any) {
    console.error("Error in subscribeToCategory:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function unsubscribeFromCategory(categoryId: string) {
  try {
    const supabase = createServerActionClient({ cookies })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, error: "Not authenticated" }
    }

    // Delete the subscription
    const { error } = await supabase
      .from("user_category_subscriptions")
      .delete()
      .eq("user_id", session.user.id)
      .eq("category_id", categoryId)

    if (error) {
      console.error("Error unsubscribing from category:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/dashboard")
    revalidatePath("/settings/subscriptions")

    return { success: true }
  } catch (error: any) {
    console.error("Error in unsubscribeFromCategory:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function saveContentItem(contentId: string) {
  try {
    const supabase = createServerActionClient({ cookies })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, error: "Not authenticated" }
    }

    // Check if the content item is already saved
    const { data: existingSaved } = await supabase
      .from("user_content_items")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("content_id", contentId)
      .single()

    if (existingSaved) {
      // Update the existing record to mark as favorite
      const { error } = await supabase
        .from("user_content_items")
        .update({ is_favorite: true })
        .eq("id", existingSaved.id)

      if (error) {
        console.error("Error updating saved content:", error)
        return { success: false, error: error.message }
      }
    } else {
      // Insert a new record
      const { error } = await supabase.from("user_content_items").insert({
        id: uuidv4(),
        user_id: session.user.id,
        content_id: contentId,
        is_favorite: true,
        created_at: new Date().toISOString(),
      })

      if (error) {
        console.error("Error saving content:", error)
        return { success: false, error: error.message }
      }
    }

    revalidatePath("/dashboard")
    revalidatePath("/saved")

    return { success: true }
  } catch (error: any) {
    console.error("Error in saveContentItem:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function markContentAsRead(contentId: string) {
  try {
    const supabase = createServerActionClient({ cookies })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, error: "Not authenticated" }
    }

    // Check if the content item exists in user_content_items
    const { data: existingItem } = await supabase
      .from("user_content_items")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("content_id", contentId)
      .single()

    if (existingItem) {
      // Update the existing record
      const { error } = await supabase.from("user_content_items").update({ is_read: true }).eq("id", existingItem.id)

      if (error) {
        console.error("Error marking content as read:", error)
        return { success: false, error: error.message }
      }
    } else {
      // Insert a new record
      const { error } = await supabase.from("user_content_items").insert({
        id: uuidv4(),
        user_id: session.user.id,
        content_id: contentId,
        is_read: true,
        created_at: new Date().toISOString(),
      })

      if (error) {
        console.error("Error marking content as read:", error)
        return { success: false, error: error.message }
      }
    }

    revalidatePath("/dashboard")
    revalidatePath("/history")

    return { success: true }
  } catch (error: any) {
    console.error("Error in markContentAsRead:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
