'use client';

import { useEffect, useState } from 'react';
import type { ScholarshipMatch } from '@/types';

interface MatchFactor {
  criterion: string;
  weight: number;
  score: number;
  description: string;
  isPositive: boolean;
}

export default function RecommendationsPage() {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<ScholarshipMatch[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<ScholarshipMatch | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 20, minScore: 40 }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setMatches(data.data.matches || []);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackApplication = async (
    scholarshipId: string,
    e: React.MouseEvent,
    matchPayload?: { score: number; explanation: unknown }
  ) => {
    e.stopPropagation();
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scholarshipId,
          matchScore: matchPayload?.score,
          matchExplanation: matchPayload?.explanation,
        }),
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" role="status" aria-label="Loading recommendations">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-gray-900">Recommendations</h1>
          <p className="text-gray-600 mt-1">
            Personalized scholarship matches based on your profile.
          </p>
        </header>
        <div className="bg-white rounded-xl p-8 sm:p-12 border border-gray-200 text-center" role="status">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4" aria-hidden="true">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No recommendations yet</h3>
          <p className="text-gray-600 mb-4">
            Complete your profile to see personalized scholarship recommendations.
          </p>
          <a
            href="/profile"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition min-h-[44px]"
          >
            Complete Profile
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Recommendations</h1>
        <p className="text-gray-600 mt-1">
          {matches.length} scholarships matched to your profile.
        </p>
      </header>

      {/* Results Summary */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4" aria-label="Match summary">
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <p className="text-sm text-green-700">Excellent Matches (80%+)</p>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {matches.filter(m => m.score >= 80).length}
          </p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <p className="text-sm text-yellow-700">Good Matches (60-79%)</p>
          <p className="text-2xl font-bold text-yellow-900 mt-1">
            {matches.filter(m => m.score >= 60 && m.score < 80).length}
          </p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <p className="text-sm text-orange-700">Potential Matches (40-59%)</p>
          <p className="text-2xl font-bold text-orange-900 mt-1">
            {matches.filter(m => m.score >= 40 && m.score < 60).length}
          </p>
        </div>
      </section>

      {/* Match Cards */}
      <div className="grid gap-4" role="list" aria-label="Scholarship recommendations">
        {matches.map((match) => (
          <article
            key={match.scholarship.id}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition"
            role="listitem"
          >
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Match Score */}
                <div className="flex-shrink-0 self-start sm:self-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center" aria-label={`Match score: ${match.score}%`}>
                    <div className="text-center">
                      <div className={`text-xl font-bold ${getScoreColor(match.score)}`}>
                        {match.score}%
                      </div>
                      <div className="text-xs text-gray-500">Match</div>
                    </div>
                  </div>
                </div>

                {/* Scholarship Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900">{match.scholarship.title}</h3>
                  <p className="text-gray-600 mt-1">{match.scholarship.provider_name}</p>

                  <div className="flex flex-wrap gap-2 mt-3" role="list" aria-label="Scholarship details">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full capitalize" role="listitem">
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

                {/* Actions */}
                <div className="flex flex-row sm:flex-col items-center justify-between sm:items-end gap-2 mt-2 sm:mt-0">
                  <button
                    onClick={() => {
                      setSelectedMatch(match);
                      setShowDetails(true);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium min-h-[44px] sm:min-h-0"
                    aria-label={`View match details for ${match.scholarship.title}`}
                  >
                    Why this match?
                  </button>
                  <button
                    onClick={(e) => handleTrackApplication(match.scholarship.id, e, { score: match.score, explanation: match.explanation })}
                    className="px-4 py-3 sm:py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 transition min-h-[44px] sm:min-h-0"
                  >
                    Track Application
                  </button>
                </div>
              </div>

              {/* Match Explanation Preview */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-700">{match.explanation.overall}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-gray-100" role="progressbar" aria-valuenow={match.score} aria-valuemin={0} aria-valuemax={100} aria-label={`Match score: ${match.score}%`}>
              <div
                className={`h-full ${getScoreBg(match.score)} transition-all duration-500`}
                style={{ width: `${match.score}%` }}
              />
            </div>
          </article>
        ))}
      </div>

      {/* Detail Modal */}
      {showDetails && selectedMatch && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4 gap-4">
                <div className="min-w-0">
                  <h2 id="modal-title" className="text-xl font-bold text-gray-900">
                    {selectedMatch.scholarship.title}
                  </h2>
                  <p className="text-gray-600">{selectedMatch.scholarship.provider_name}</p>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Overall Score */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center flex-shrink-0 ${
                  selectedMatch.score >= 80 ? 'bg-green-100' :
                  selectedMatch.score >= 60 ? 'bg-yellow-100' : 'bg-orange-100'
                }`}>
                  <span className={`text-xl sm:text-2xl font-bold ${getScoreColor(selectedMatch.score)}`}>
                    {selectedMatch.score}%
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900">Overall Match Score</p>
                  <p className="text-sm text-gray-600 mt-1">{selectedMatch.explanation.overall}</p>
                </div>
              </div>

              {/* Factor Breakdown */}
              <h3 className="font-semibold text-gray-900 mb-4">Match Breakdown</h3>
              <ul className="space-y-4" role="list">
                {selectedMatch.explanation.factors.map((factor: MatchFactor) => (
                  <li key={factor.criterion}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{factor.criterion}</span>
                      <span className={`text-sm font-semibold ${
                        factor.score >= 70 ? 'text-green-600' :
                        factor.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {factor.score}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={factor.score} aria-valuemin={0} aria-valuemax={100}>
                      <div
                        className={`h-full ${
                          factor.score >= 70 ? 'bg-green-500' :
                          factor.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${factor.score}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">Weight: {factor.weight}%</span>
                      <span className={`text-xs ${factor.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {factor.description}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Scholarship Details */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Scholarship Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Funding Type</span>
                    <p className="font-medium text-gray-900 capitalize">
                      {selectedMatch.scholarship.funding_type.replace('_', ' ')}
                    </p>
                  </div>
                  {selectedMatch.scholarship.funding_amount && (
                    <div>
                      <span className="text-gray-500">Amount</span>
                      <p className="font-medium text-gray-900">
                        ${selectedMatch.scholarship.funding_amount.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {selectedMatch.scholarship.deadline && (
                    <div>
                      <span className="text-gray-500">Deadline</span>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedMatch.scholarship.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {selectedMatch.scholarship.duration_months && (
                    <div>
                      <span className="text-gray-500">Duration</span>
                      <p className="font-medium text-gray-900">
                        {selectedMatch.scholarship.duration_months} months
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                {selectedMatch.scholarship.application_url && (
                  <a
                    href={selectedMatch.scholarship.application_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition min-h-[44px]"
                  >
                    Apply Now
                  </a>
                )}
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition min-h-[44px]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}