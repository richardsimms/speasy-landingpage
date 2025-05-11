import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

// Helper to get user id from Supabase session (using cookies/JWT)
async function getUserId(req: NextRequest): Promise<string | null> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '') || req.cookies.get('sb-access-token')?.value;
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
    // Fetch category subscriptions
    const { data: categoryRows } = await supabase
      .from('user_category_subscriptions')
      .select('category_id')
      .eq('user_id', userId);

    const categoryPreferences = categoryRows?.map(row => row.category_id) || [];

    // Fetch preferences from user_onboarding_metadata
    const { data: meta, error: metaError } = await supabase
      .from('user_onboarding_metadata')
      .select('listening_context, session_length, preferred_tone, exclusions, otherCategory')
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
      otherCategory: meta?.otherCategory || '',
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
      otherCategory,
    } = body;

    // Validate fields (optional, but must be string or empty)
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
    if (otherCategory && typeof otherCategory !== 'string') {
      return NextResponse.json({ error: 'otherCategory must be a string' }, { status: 400 });
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
        otherCategory: otherCategory || null,
      });
    if (metaError) {
      return NextResponse.json({ error: metaError.message }, { status: 500 });
    }

    return NextResponse.json({
      categoryPreferences: categoryPreferences || [],
      listening_context: listening_context || '',
      session_length: session_length || '',
      preferred_tone: preferred_tone || '',
      exclusions: exclusions || '',
      otherCategory: otherCategory || '',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}  