import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import { cookies } from 'next/headers';

// Helper to get user id from Supabase session (using cookies/JWT)
async function getUserId(req: NextRequest): Promise<string | null> {
  const cookieStore = cookies();
  const token = req.headers.get('Authorization')?.replace('Bearer ', '') || cookieStore.get('sb-access-token')?.value;
  if (!token) return null;
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user?.id) return null;
  return data.user.id;
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Fetch category subscriptions and join with categories to get names
    const { data: categoryRows } = await supabase
      .from('user_category_subscriptions')
      .select('category_id, categories(name)')
      .eq('user_id', userId);

    const categoryPreferences = categoryRows?.map(row => row.categories.name) || [];

    // Fetch preferences from users and user_onboarding_metadata
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('categoryPreferences')
      .eq('id', userId)
      .single();
    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }
    const { data: meta, error: metaError } = await supabase
      .from('user_onboarding_metadata')
      .select('listening_context, session_length, preferred_tone, exclusions')
      .eq('user_id', userId)
      .single();
    if (metaError && metaError.code !== 'PGRST116') { // PGRST116: No rows found
      return NextResponse.json({ error: metaError.message }, { status: 500 });
    }
    return NextResponse.json({
      categoryPreferences,
      listening_context: meta?.listening_context || '',
      session_length: meta?.session_length || '',
      preferred_tone: meta?.preferred_tone || '',
      exclusions: meta?.exclusions || '',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const {
      categoryPreferences,
      listening_context,
      session_length,
      preferred_tone,
      exclusions,
    } = body;

    // Validate categoryPreferences (required, array of strings)
    if (!Array.isArray(categoryPreferences) || categoryPreferences.length === 0 || !categoryPreferences.every((v: any) => typeof v === 'string')) {
      return NextResponse.json({ error: 'categoryPreferences is required and must be an array of strings' }, { status: 400 });
    }
    // Validate other fields (optional, but must be string or empty)
    if (listening_context && typeof listening_context !== 'string') {
      return NextResponse.json({ error: 'listening_context must be a string' }, { status: 400 });
    }
    if (session_length && typeof session_length !== 'string') {
      return NextResponse.json({ error: 'session_length must be a string' }, { status: 400 });
    }
    if (preferred_tone && typeof preferred_tone !== 'string') {
      return NextResponse.json({ error: 'preferred_tone must be a string' }, { status: 400 });
    }
    if (exclusions && typeof exclusions !== 'string') {
      return NextResponse.json({ error: 'exclusions must be a string' }, { status: 400 });
    }

    // Update users table
    const { error: userError } = await supabase
      .from('users')
      .update({ categoryPreferences })
      .eq('id', userId);
    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    // Upsert onboarding metadata
    const { error: metaError } = await supabase
      .from('user_onboarding_metadata')
      .upsert({
        user_id: userId,
        listening_context: listening_context || null,
        session_length: session_length || null,
        preferred_tone: preferred_tone || null,
        exclusions: exclusions || null,
      });
    if (metaError) {
      return NextResponse.json({ error: metaError.message }, { status: 500 });
    }

    return NextResponse.json({
      categoryPreferences,
      listening_context,
      session_length,
      preferred_tone,
      exclusions,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
} 