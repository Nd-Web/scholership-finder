/**
 * Cron: Expire stale scholarships
 *
 * Deactivates scholarships whose deadline has passed.
 * Keeps the `scholarships` table clean so search/match results don't rot.
 * Protected by CRON_SECRET.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json({ error: 'Cron not configured' }, { status: 500 });
  }
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('scholarships')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .lt('deadline', today)
    .eq('is_active', true)
    .select('id');

  if (error) {
    console.error('[Cron] expire-stale failed:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  const expiredCount = data?.length ?? 0;
  console.log(`[Cron] expire-stale: deactivated ${expiredCount} scholarships`);

  return NextResponse.json({
    success: true,
    data: { expired: expiredCount, before: today },
  });
}

export async function POST(request: NextRequest) {
  return GET(request);
}
