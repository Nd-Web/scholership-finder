'use client';

import { useEffect, useState } from 'react';
import type { Application, ApplicationStatus } from '@/types';

interface ApplicationWithScholarship extends Application {
  scholarship?: {
    title: string;
    provider_name: string;
    deadline: string | null;
    funding_type: string;
    application_url: string | null;
  };
}

const statusColors: Record<ApplicationStatus, string> = {
  saved: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  submitted: 'bg-purple-100 text-purple-700',
  under_review: 'bg-yellow-100 text-yellow-700',
  interview_scheduled: 'bg-orange-100 text-orange-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-gray-100 text-gray-500',
};

const statusOptions: ApplicationStatus[] = [
  'saved',
  'in_progress',
  'submitted',
  'under_review',
  'interview_scheduled',
  'accepted',
  'rejected',
  'withdrawn',
];

export default function ApplicationsPage() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<ApplicationWithScholarship[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    accepted: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications');
      const data = await response.json();

      if (data.success) {
        setApplications(data.data || []);

        // Calculate stats
        const apps = data.data || [];
        setStats({
          total: apps.length,
          submitted: apps.filter((a: Application) =>
            ['submitted', 'under_review', 'interview_scheduled'].includes(a.status)
          ).length,
          accepted: apps.filter((a: Application) => a.status === 'accepted').length,
          rejected: apps.filter((a: Application) => a.status === 'rejected').length,
        });
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId: string, newStatus: ApplicationStatus) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        setApplications((prev) =>
          prev.map((app) =>
            app.id === applicationId ? { ...app, status: newStatus } : app
          )
        );
      } else {
        alert(data.error?.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    }
  };

  const handleDelete = async (applicationId: string) => {
    if (!confirm('Are you sure you want to remove this application from your tracker?')) {
      return;
    }

    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setApplications((prev) => prev.filter((app) => app.id !== applicationId));
      } else {
        alert(data.error?.message || 'Failed to delete application');
      }
    } catch (error) {
      console.error('Failed to delete application:', error);
      alert('Failed to delete application');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-600 mt-1">
          Track and manage your scholarship applications.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Submitted</p>
          <p className="text-2xl font-bold text-blue-600">{stats.submitted}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Accepted</p>
          <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Rejected</p>
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
        </div>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications yet</h3>
          <p className="text-gray-600 mb-4">
            Start tracking scholarships to see them here.
          </p>
          <a
            href="/scholarships"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Browse Scholarships
          </a>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scholarship
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {applications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {application.scholarship?.title || 'Unknown Scholarship'}
                        </p>
                        <p className="text-sm text-gray-500 capitalize">
                          {application.scholarship?.funding_type.replace('_', ' ') || ''}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={application.status}
                        onChange={(e) =>
                          handleStatusChange(application.id, e.target.value as ApplicationStatus)
                        }
                        className={`px-3 py-1.5 text-xs font-medium rounded-full border-0 cursor-pointer text-gray-900 ${statusColors[application.status]}`}
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {application.scholarship?.provider_name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {application.scholarship?.deadline
                        ? new Date(application.scholarship.deadline).toLocaleDateString()
                        : 'No deadline'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {application.scholarship?.application_url && (
                          <a
                            href={application.scholarship.application_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Apply
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(application.id)}
                          className="text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
