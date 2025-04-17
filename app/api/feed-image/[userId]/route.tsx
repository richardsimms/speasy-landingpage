import { ImageResponse } from "next/og"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  const { userId } = params

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get user profile
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single()

    const userName = profile?.full_name || "Speasy User"

    return new ImageResponse(
      <div
        style={{
          display: "flex",
          fontSize: 60,
          color: "white",
          background: "#10b981",
          width: "100%",
          height: "100%",
          padding: "50px 50px",
          textAlign: "center",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <svg
            width="120"
            height="120"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
          </svg>
          <div style={{ marginTop: 20 }}>Speasy</div>
          <div style={{ fontSize: 30, marginTop: 10, opacity: 0.8 }}>{userName}'s Feed</div>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    )
  } catch (error) {
    console.error("Error generating feed image:", error)

    // Return a default image on error
    return new ImageResponse(
      <div
        style={{
          display: "flex",
          fontSize: 60,
          color: "white",
          background: "#10b981",
          width: "100%",
          height: "100%",
          padding: "50px 50px",
          textAlign: "center",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <svg
            width="120"
            height="120"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
          </svg>
          <div style={{ marginTop: 20 }}>Speasy</div>
          <div style={{ fontSize: 30, marginTop: 10, opacity: 0.8 }}>Audio Content Feed</div>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    )
  }
}
