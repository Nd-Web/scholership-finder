import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's notification preferences
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('notification_preferences')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching preferences:', profileError);
    }

    // Get upcoming deadlines (next 14 days)
    const fourteenDaysFromNow = new Date();
    fourteenDaysFromNow.setDate(fourteenDaysFromNow.getDate() + 14);

    const { data: applications, error: appsError } = await supabase
      .from('applications')
      .select(`
        *,
        scholarships (
          id,
          title,
          provider,
          deadline
        )
      `)
      .eq('user_id', user.id)
      .in('status', ['not_submitted', 'in_progress', 'submitted'])
      .lte('scholarships.deadline', fourteenDaysFromNow.toISOString())
      .order('scholarships.deadline', { ascending: true });

    if (appsError) {
      console.error('Error fetching applications:', appsError);
    }

    const upcomingDeadlines = applications?.filter(app => app.scholarships).map(app => ({
      applicationId: app.id,
      scholarshipId: app.scholarships.id,
      title: app.scholarships.title,
      provider: app.scholarships.provider,
      deadline: app.scholarships.deadline,
      status: app.status,
      daysUntil: Math.ceil((new Date(app.scholarships.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    })) || [];

    return NextResponse.json({
      success: true,
      data: {
        preferences: profile?.notification_preferences || {
          email_deadline_reminders: true,
          email_updates: true,
          email_matches: true
        },
        upcomingDeadlines,
        unreadCount: 0
      }
    });
  } catch (error) {
    console.error('Notifications API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { preferences } = body;

    const { error } = await supabase
      .from('profiles')
      .update({ notification_preferences: preferences })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating preferences:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { preferences }
    });
  } catch (error) {
    console.error('Notifications API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
