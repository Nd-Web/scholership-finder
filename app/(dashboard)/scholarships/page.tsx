'use client';

import { useEffect, useState } from 'react';
import type { Scholarship } from '@/types';
import { isDeadlineApproaching, isDeadlinePassed } from '@/lib/utils';

interface Filters {
  search: string;
  country: string;
  fieldOfStudy: string;
  fundingType: string;
  minGpa: string;
  degreeLevel: string;
  onlyOpen: boolean;
}

export default function ScholarshipsPage() {
  const [loading, setLoading] = useState(true);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    country: '',
    fieldOfStudy: '',
    fundingType: '',
    minGpa: '',
    degreeLevel: '',
    onlyOpen: false,
  });

  const limit = 10;

  const fetchScholarships = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v && v !== false)
        ),
      });

      const response = await fetch(`/api/scholarships?${params}`);
      const data = await response.json();

      if (data.success && data.data) {
        setScholarships(data.data.items);
        setTotal(data.data.pagination.total);
      }
    } catch (error) {
      console.error('Failed to fetch scholarships:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, [page, filters]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Scholarships</h1>
        <p className="text-gray-600 mt-1">
          Browse and search through available scholarship opportunities.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-sm text-gray-900 placeholder-gray-400"
              placeholder="Search scholarships by title or provider..."
            />
          </div>
          <button
            onClick={() => setFilters({
              search: '',
              country: '',
              fieldOfStudy: '',
              fundingType: '',
              minGpa: '',
              degreeLevel: '',
              onlyOpen: false,
            })}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            Clear all
          </button>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => handleFilterChange('onlyOpen', !filters.onlyOpen)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              filters.onlyOpen
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filters.onlyOpen ? '✓ ' : ''}Open for Applications
          </button>
          <button
            onClick={() => handleFilterChange('fundingType', filters.fundingType === 'full' ? '' : 'full')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              filters.fundingType === 'full'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filters.fundingType === 'full' ? '✓ ' : ''}Full Funding
          </button>
          <button
            onClick={() => handleFilterChange('degreeLevel', filters.degreeLevel === 'Undergraduate' ? '' : 'Undergraduate')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              filters.degreeLevel === 'Undergraduate'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filters.degreeLevel === 'Undergraduate' ? '✓ ' : ''}Undergraduate
          </button>
          <button
            onClick={() => handleFilterChange('degreeLevel', filters.degreeLevel === 'Graduate' ? '' : 'Graduate')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              filters.degreeLevel === 'Graduate'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filters.degreeLevel === 'Graduate' ? '✓ ' : ''}Graduate
          </button>
        </div>

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
            <input
              type="text"
              value={filters.country}
              onChange={(e) => handleFilterChange('country', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-sm text-gray-900 placeholder-gray-400"
              placeholder="e.g., USA, UK"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Field of Study</label>
            <input
              type="text"
              value={filters.fieldOfStudy}
              onChange={(e) => handleFilterChange('fieldOfStudy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-sm text-gray-900 placeholder-gray-400"
              placeholder="e.g., Engineering"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Funding Type</label>
            <select
              value={filters.fundingType}
              onChange={(e) => handleFilterChange('fundingType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-sm"
            >
              <option value="">All types</option>
              <option value="full">Full Funding</option>
              <option value="partial">Partial Funding</option>
              <option value="merit_based">Merit-Based</option>
              <option value="need_based">Need-Based</option>
              <option value="research_grant">Research Grant</option>
              <option value="fellowship">Fellowship</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Min GPA</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="4"
              value={filters.minGpa}
              onChange={(e) => handleFilterChange('minGpa', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-sm text-gray-900 placeholder-gray-400"
              placeholder="e.g., 3.0"
            />
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {scholarships.length} of {total} scholarships
        </p>
      </div>

      {/* Scholarships List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : scholarships.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No scholarships found</h3>
          <p className="text-gray-600">Try adjusting your filters to see more results.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {scholarships.map((scholarship) => (
            <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function ScholarshipCard({ scholarship }: { scholarship: Scholarship }) {
  const [expanded, setExpanded] = useState(false);
  const deadlinePassed = isDeadlinePassed(scholarship.deadline);
  const deadlineApproaching = isDeadlineApproaching(scholarship.deadline);

  const handleTrackApplication = async () => {
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scholarshipId: scholarship.id }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Scholarship added to your applications!');
      } else {
        alert(data.error?.message || 'Failed to track this scholarship');
      }
    } catch (error) {
      console.error('Failed to track scholarship:', error);
      alert('Failed to track scholarship');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{scholarship.title}</h3>
          <p className="text-gray-600 mt-1">{scholarship.provider_name}</p>
        </div>
        <div className="flex items-center gap-2">
          {deadlinePassed && (
            <span className="px-2.5 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full">
              Deadline Passed
            </span>
          )}
          {deadlineApproaching && !deadlinePassed && (
            <span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-full">
              Deadline Soon
            </span>
          )}
        </div>
      </div>

      {scholarship.description && (
        <p className="text-gray-600 mb-4">
          {expanded ? scholarship.description : `${scholarship.description.slice(0, 150)}...`}
        </p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full capitalize">
          {scholarship.funding_type.replace('_', ' ')}
        </span>
        {scholarship.funding_amount && (
          <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
            ${scholarship.funding_amount.toLocaleString()}
          </span>
        )}
        {scholarship.min_gpa && (
          <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
            Min GPA: {scholarship.min_gpa}
          </span>
        )}
        {scholarship.deadline && (
          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
            deadlinePassed
              ? 'bg-red-50 text-red-700'
              : deadlineApproaching
              ? 'bg-yellow-50 text-yellow-700'
              : 'bg-gray-100 text-gray-700'
          }`}>
            Deadline: {new Date(scholarship.deadline).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
        <div className="flex items-center gap-3">
          {scholarship.application_url && (
            <a
              href={scholarship.application_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Apply Now
            </a>
          )}
          <button
            onClick={handleTrackApplication}
            disabled={deadlinePassed}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Track Application
          </button>
        </div>
      </div>
    </div>
  );
}
