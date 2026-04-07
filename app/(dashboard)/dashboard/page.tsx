'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { ScholarshipMatch, Application } from '@/types';

interface DashboardStats {
  totalApplications: number;
  submittedApplications: number;
  acceptedApplications: number;
  profileComplete: boolean;
}

// Helper for conditional class names
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<ScholarshipMatch[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    submittedApplications: 0,
    acceptedApplications: 0,
    profileComplete: false,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch profile status
        const profileRes = await fetch('/api/profile');
        const profileData = await profileRes.json();
        const profileComplete = profileData.success && profileData.data;

        // Fetch applications
        const appsRes = await fetch('/api/applications');
        const appsData = await appsRes.json();
        const applications: Application[] = appsData.success ? appsData.data || [] : [];

        // Fetch recommendations
        const recsRes = await fetch('/api/recommendations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ limit: 5 }) });
        const recsData = await recsRes.json();
        const recommendations: ScholarshipMatch[] = recsData.success ? recsData.data?.matches || [] : [];

        setStats({
          totalApplications: applications.length,
          submittedApplications: applications.filter(a => ['submitted', 'under_review', 'interview_scheduled'].includes(a.status)).length,
          acceptedApplications: applications.filter(a => a.status === 'accepted').length,
          profileComplete,
        });

        setMatches(recommendations);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" role="status" aria-label="Loading dashboard">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here&apos;s your scholarship overview.</p>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" aria-label="Application statistics">
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm text-gray-600">Total Applications</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stats.totalApplications}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0" aria-hidden="true">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm text-gray-600">Submitted</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stats.submittedApplications}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0" aria-hidden="true">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm text-gray-600">Accepted</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1">{stats.acceptedApplications}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0" aria-hidden="true">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm text-gray-600">Profile Status</p>
              <p className="text-xl sm:text-2xl font-bold mt-1">
                <span className={stats.profileComplete ? 'text-green-600' : 'text-yellow-600'}>
                  {stats.profileComplete ? 'Complete' : 'Incomplete'}
                </span>
              </p>
            </div>
            <div className={cn(
              'w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0',
              stats.profileComplete ? 'bg-green-100' : 'bg-yellow-100'
            )} aria-hidden="true">
              <svg className={cn('w-5 h-5 sm:w-6 sm:h-6', stats.profileComplete ? 'text-green-600' : 'text-yellow-600')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Incomplete Alert */}
      {!stats.profileComplete && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 sm:p-6" role="alert">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0" aria-hidden="true">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Complete Your Profile</h3>
              <p className="text-gray-600 mt-1">
                Create your profile to get personalized scholarship recommendations based on your background and goals.
              </p>
              <Link
                href="/profile"
                className="inline-block mt-4 bg-yellow-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-yellow-700 transition min-h-[44px]"
              >
                Complete Profile
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Top Recommendations */}
      <section aria-labelledby="recommendations-heading">
        <div className="flex items-center justify-between mb-4">
          <h2 id="recommendations-heading" className="text-xl font-bold text-gray-900">Top Recommendations</h2>
          <Link href="/scholarships" className="text-blue-600 hover:text-blue-700 text-sm font-medium min-h-[44px] flex items-center">
            View all scholarships
          </Link>
        </div>

        {matches.length === 0 ? (
          <div className="bg-white rounded-xl p-8 border border-gray-200 text-center" role="status">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No recommendations yet</h3>
            <p className="text-gray-600 mb-4">
              {stats.profileComplete
                ? 'Check back later for new scholarship opportunities.'
                : 'Complete your profile to see personalized recommendations.'}
            </p>
            {!stats.profileComplete && (
              <Link
                href="/profile"
                className="inline-block bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition min-h-[44px]"
              >
                Complete Profile
              </Link>
            )}
          </div>
        ) : (
          <ul className="grid gap-4" role="list" aria-label="Scholarship recommendations">
            {matches.slice(0, 5).map((match) => (
              <li
                key={match.scholarship.id}
                className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 hover:shadow-md transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900">{match.scholarship.title}</h3>
                    <p className="text-gray-600 mt-1">{match.scholarship.provider_name}</p>
                    <div className="flex flex-wrap gap-2 mt-3" role="list" aria-label="Scholarship details">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full" role="listitem">
                        {match.scholarship.funding_type.replace('_', ' ')}
                      </span>
                      {match.scholarship.funding_amount && (
                        <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full" role="listitem">
                          ${match.scholarship.funding_amount.toLocaleString()}
                        </span>
                      )}
                      {match.scholarship.deadline && (
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full" role="listitem">
                          Deadline: {new Date(match.scholarship.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-left sm:text-right flex-shrink-0">
                    <div className={cn(
                      'text-2xl font-bold',
                      match.score >= 80 ? 'text-green-600' :
                      match.score >= 60 ? 'text-yellow-600' : 'text-orange-600'
                    )} aria-label={`Match score: ${match.score}%`}>
                      {match.score}%
                    </div>
                    <p className="text-xs text-gray-500">Match</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}