import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic'; // Ensure this route is always dynamic

export async function GET() {
  try {
    // Initialize Supabase client inside the function
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
    
    // Call the new RPC function
    const { data, error } = await supabase.rpc('articles_converted_last_30_days');
    console.log('RPC data:', data, 'error:', error);
    if (error) {
      console.error('Supabase RPC error:', error);
      return NextResponse.json({ count: null, error: 'Failed to fetch count' }, { status: 500 });
    }
    // Handle array or direct integer response
    let count = data;
    if (Array.isArray(data)) {
      count = data[0];
      console.log('Array response detected, using first element:', count);
    }
    // Set cache headers for 5 minutes
    return new NextResponse(
      JSON.stringify({ count }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=300',
        },
      }
    );
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json({ count: null, error: 'Internal server error' }, { status: 500 });
  }
} 