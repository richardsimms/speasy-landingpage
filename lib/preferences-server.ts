interface UserPreferences {
  categoryPreferences?: string[] | string
  listeningContext?: string
  sessionLength?: string
  preferredTone?: string
  exclusions?: string
}

export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  // In a real app, this would fetch from Supabase
  // For demo purposes, we'll return null to simulate a new user
  return null
}
