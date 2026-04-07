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
      <div className="min-h-[400px] flex items-center justify-center" role="status" aria-label="Loading notifications">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" aria-hidden="true"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600 mt-1">Manage your notification preferences and view upcoming deadlines</p>
      </header>

      {/* Upcoming Deadlines */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" aria-labelledby="deadlines-heading">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 id="deadlines-heading" className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h2>
        </div>
        <div className="p-4 sm:p-6">
          {data?.upcomingDeadlines && data.upcomingDeadlines.length > 0 ? (
            <ul className="space-y-3" role="list">
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
                  <li
                    key={deadline.applicationId}
                    className={cn(
                      'p-4 rounded-lg border',
                      getUrgencyStyles(urgency)
                    )}
                    role="listitem"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-semibold">{deadline.title}</h3>
                        <p className="text-sm opacity-80 mt-1">{deadline.provider}</p>
                      </div>
                      <span className={cn(
                        'px-2.5 py-1 rounded-full text-xs font-medium self-start',
                        urgency === 'expired' ? 'bg-red-200 text-red-800' :
                        urgency === 'urgent' ? 'bg-red-200 text-red-800' :
                        urgency === 'soon' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-blue-200 text-blue-800'
                      )}>
                        {urgencyLabel}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <span className="text-sm">
                        Status: <span className="font-medium capitalize">{deadline.status.replace('_', ' ')}</span>
                      </span>
                      {deadline.status !== 'submitted' && urgency !== 'expired' && (
                        <button
                          onClick={() => router.push('/applications')}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium text-left"
                        >
                          Continue application →
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-center py-8" role="status">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-600">No upcoming deadlines</p>
              <p className="text-sm text-gray-500 mt-1">Browse scholarships and start applying!</p>
              <button
                onClick={() => router.push('/scholarships')}
                className="mt-4 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium min-h-[44px]"
              >
                Browse Scholarships
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Notification Preferences */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" aria-labelledby="preferences-heading">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 id="preferences-heading" className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
          <button
            onClick={savePreferences}
            disabled={saving}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition min-h-[44px] sm:min-h-0"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true"></span>
                Saving...
              </span>
            ) : 'Save Changes'}
          </button>
        </div>
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-100 gap-3">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Deadline Reminders</h3>
              <p className="text-sm text-gray-500 mt-1">Get notified about upcoming scholarship deadlines</p>
            </div>
            <button
              onClick={() => handlePreferenceChange('email_deadline_reminders')}
              role="switch"
              aria-checked={preferences.email_deadline_reminders}
              aria-label="Toggle deadline reminders"
              className={cn(
                'relative inline-flex h-7 w-14 items-center rounded-full transition-colors flex-shrink-0',
                preferences.email_deadline_reminders ? 'bg-blue-600' : 'bg-gray-200'
              )}
            >
              <span
                className={cn(
                  'inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow',
                  preferences.email_deadline_reminders ? 'translate-x-8' : 'translate-x-1'
                )}
              />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-100 gap-3">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">New Match Alerts</h3>
              <p className="text-sm text-gray-500 mt-1">Get notified when new scholarships match your profile</p>
            </div>
            <button
              onClick={() => handlePreferenceChange('email_matches')}
              role="switch"
              aria-checked={preferences.email_matches}
              aria-label="Toggle new match alerts"
              className={cn(
                'relative inline-flex h-7 w-14 items-center rounded-full transition-colors flex-shrink-0',
                preferences.email_matches ? 'bg-blue-600' : 'bg-gray-200'
              )}
            >
              <span
                className={cn(
                  'inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow',
                  preferences.email_matches ? 'translate-x-8' : 'translate-x-1'
                )}
              />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-3">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Application Updates</h3>
              <p className="text-sm text-gray-500 mt-1">Get notified about changes to your applications</p>
            </div>
            <button
              onClick={() => handlePreferenceChange('email_updates')}
              role="switch"
              aria-checked={preferences.email_updates}
              aria-label="Toggle application updates"
              className={cn(
                'relative inline-flex h-7 w-14 items-center rounded-full transition-colors flex-shrink-0',
                preferences.email_updates ? 'bg-blue-600' : 'bg-gray-200'
              )}
            >
              <span
                className={cn(
                  'inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow',
                  preferences.email_updates ? 'translate-x-8' : 'translate-x-1'
                )}
              />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}