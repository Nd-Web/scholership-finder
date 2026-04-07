'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NotificationPreference {
  email_deadline_reminders: boolean;
  email_updates: boolean;
  email_matches: boolean;
}

interface UpcomingDeadline {
  applicationId: string;
  scholarshipId: string;
  title: string;
  provider: string;
  deadline: string;
  status: string;
  daysUntil: number;
}

interface NotificationsData {
  preferences: NotificationPreference;
  upcomingDeadlines: UpcomingDeadline[];
  unreadCount: number;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<NotificationsData | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreference>({
    email_deadline_reminders: true,
    email_updates: true,
    email_matches: true
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      const result = await response.json();

      if (result.success && result.data) {
        setData(result.data);
        setPreferences(result.data.preferences);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (key: keyof NotificationPreference) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences })
      });

      const result = await response.json();

      if (result.success) {
        setData(prev => prev ? { ...prev, preferences } : null);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const getDeadlineUrgency = (days: number) => {
    if (days < 0) return 'expired';
    if (days <= 3) return 'urgent';
    if (days <= 7) return 'soon';
    return 'upcoming';
  };

  const getUrgencyStyles = (urgency: string) => {
    switch (urgency) {
      case 'expired':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'urgent':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'soon':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-900';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600 mt-1">Manage your notification preferences and view upcoming deadlines</p>
      </div>

      {/* Upcoming Deadlines */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h2>
        </div>
        <div className="p-6">
          {data?.upcomingDeadlines && data.upcomingDeadlines.length > 0 ? (
            <div className="space-y-3">
              {data.upcomingDeadlines.map((deadline) => {
                const urgency = getDeadlineUrgency(deadline.daysUntil);
                const urgencyLabel = urgency === 'expired'
                  ? 'Deadline passed'
                  : urgency === 'urgent'
                  ? `${deadline.daysUntil} day${deadline.daysUntil !== 1 ? 's' : ''} left`
                  : urgency === 'soon'
                  ? `${deadline.daysUntil} day${deadline.daysUntil !== 1 ? 's' : ''} left`
                  : `Due ${new Date(deadline.deadline).toLocaleDateString()}`;

                return (
                  <div
                    key={deadline.applicationId}
                    className={cn(
                      'p-4 rounded-lg border',
                      getUrgencyStyles(urgency)
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{deadline.title}</h3>
                        <p className="text-sm opacity-80 mt-1">{deadline.provider}</p>
                      </div>
                      <span className={cn(
                        'px-2.5 py-1 rounded-full text-xs font-medium',
                        urgency === 'expired' ? 'bg-red-200 text-red-800' :
                        urgency === 'urgent' ? 'bg-red-200 text-red-800' :
                        urgency === 'soon' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-blue-200 text-blue-800'
                      )}>
                        {urgencyLabel}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-4">
                      <span className="text-sm">
                        Status: <span className="font-medium capitalize">{deadline.status.replace('_', ' ')}</span>
                      </span>
                      {deadline.status !== 'submitted' && urgency !== 'expired' && (
                        <button
                          onClick={() => router.push(`/applications`)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Continue application →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-600">No upcoming deadlines</p>
              <p className="text-sm text-gray-500 mt-1">Browse scholarships and start applying!</p>
              <button
                onClick={() => router.push('/scholarships')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Browse Scholarships
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
          <button
            onClick={savePreferences}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <h3 className="font-medium text-gray-900">Deadline Reminders</h3>
              <p className="text-sm text-gray-500 mt-1">Get notified about upcoming scholarship deadlines</p>
            </div>
            <button
              onClick={() => handlePreferenceChange('email_deadline_reminders')}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                preferences.email_deadline_reminders ? 'bg-blue-600' : 'bg-gray-200'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform ml-1',
                  preferences.email_deadline_reminders ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <h3 className="font-medium text-gray-900">New Match Alerts</h3>
              <p className="text-sm text-gray-500 mt-1">Get notified when new scholarships match your profile</p>
            </div>
            <button
              onClick={() => handlePreferenceChange('email_matches')}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                preferences.email_matches ? 'bg-blue-600' : 'bg-gray-200'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform ml-1',
                  preferences.email_matches ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <h3 className="font-medium text-gray-900">Application Updates</h3>
              <p className="text-sm text-gray-500 mt-1">Get notified about changes to your applications</p>
            </div>
            <button
              onClick={() => handlePreferenceChange('email_updates')}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                preferences.email_updates ? 'bg-blue-600' : 'bg-gray-200'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform ml-1',
                  preferences.email_updates ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
