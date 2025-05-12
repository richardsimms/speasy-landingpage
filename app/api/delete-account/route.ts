import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/server-only';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient();
    const cookieStore = await cookies();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const userId = user.id;
    // Delete user from Supabase Auth
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
    if (deleteError) {
      return NextResponse.json({ error: 'Error deleting user from auth' }, { status: 500 });
    }
    // Delete user from users table
    await supabase.from('users').delete().eq('id', userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ error: 'Error deleting account' }, { status: 500 });
  }
}  