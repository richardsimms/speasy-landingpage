import { redirect } from 'next/navigation'

export default function ContentIndexPage() {
  // Redirect to the dashboard if someone tries to access /content directly
  redirect('/dashboard')
} 