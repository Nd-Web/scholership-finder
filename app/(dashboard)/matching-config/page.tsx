'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface MatchingCriteria {
  countryWeight: number;
  fieldOfStudyWeight: number;
  gpaWeight: number;
  fundingTypeWeight: number;
  deadlineWeight: number;
}

interface MatchingConfig {
  defaultCriteria: MatchingCriteria;
  minScore: number;
  maxResults: number;
}

export default function MatchingConfigPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<MatchingConfig | null>(null);
  const [criteria, setCriteria] = useState<MatchingCriteria>({
    countryWeight: 25,
    fieldOfStudyWeight: 25,
    gpaWeight: 20,
    fundingTypeWeight: 15,
    deadlineWeight: 10,
  });
  const [totalWeight, setTotalWeight] = useState(100);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  useEffect(() => {
    const total = Object.values(criteria).reduce((sum, w) => sum + w, 0);
    setTotalWeight(total);
  }, [criteria]);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/matching/config');
      const result = await response.json();

      if (result.success && result.data) {
        setConfig(result.data);
        setCriteria(result.data.defaultCriteria);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCriteriaChange = (key: keyof MatchingCriteria, value: number) => {
    setCriteria(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = async () => {
    setCriteria({
      countryWeight: 25,
      fieldOfStudyWeight: 25,
      gpaWeight: 20,
      fundingTypeWeight: 15,
      deadlineWeight: 10,
    });
    setError(null);
  };

  const saveConfig = async () => {
    if (totalWeight !== 100) {
      setError('Criteria weights must sum to 100');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/matching/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: {
            defaultCriteria: criteria,
            minScore: config?.minScore,
            maxResults: config?.maxResults,
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        setConfig(result.data);
      } else {
        setError(result.error?.message || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      setError('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Matching Configuration</h1>
        <p className="text-gray-600 mt-1">Customize how scholarships are matched to your profile</p>
      </div>

      {/* Weight Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Criteria Weights</h2>
          <p className="text-sm text-gray-500 mt-1">Adjust the importance of each criterion in your recommendations</p>
        </div>
        <div className="p-6 space-y-6">
          {/* Country Weight */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Country Eligibility</label>
              <span className="text-sm font-semibold text-blue-600">{criteria.countryWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={criteria.countryWeight}
              onChange={(e) => handleCriteriaChange('countryWeight', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <p className="text-xs text-gray-500 mt-1">How important is it that the scholarship is available in your country?</p>
          </div>

          {/* Field of Study Weight */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Field of Study</label>
              <span className="text-sm font-semibold text-blue-600">{criteria.fieldOfStudyWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={criteria.fieldOfStudyWeight}
              onChange={(e) => handleCriteriaChange('fieldOfStudyWeight', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <p className="text-xs text-gray-500 mt-1">How important is matching your field of study?</p>
          </div>

          {/* GPA Weight */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">GPA Requirement</label>
              <span className="text-sm font-semibold text-blue-600">{criteria.gpaWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={criteria.gpaWeight}
              onChange={(e) => handleCriteriaChange('gpaWeight', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <p className="text-xs text-gray-500 mt-1">How important is meeting or exceeding the GPA requirement?</p>
          </div>

          {/* Funding Type Weight */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Funding Type</label>
              <span className="text-sm font-semibold text-blue-600">{criteria.fundingTypeWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={criteria.fundingTypeWeight}
              onChange={(e) => handleCriteriaChange('fundingTypeWeight', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <p className="text-xs text-gray-500 mt-1">How important is the type of funding (full, partial, merit-based)?</p>
          </div>

          {/* Deadline Weight */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Deadline</label>
              <span className="text-sm font-semibold text-blue-600">{criteria.deadlineWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={criteria.deadlineWeight}
              onChange={(e) => handleCriteriaChange('deadlineWeight', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <p className="text-xs text-gray-500 mt-1">How important is having enough time before the deadline?</p>
          </div>

          {/* Total Weight Indicator */}
          <div className={cn(
            'p-4 rounded-lg border-2',
            totalWeight === 100
              ? 'bg-green-50 border-green-200'
              : 'bg-yellow-50 border-yellow-200'
          )}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Total Weight</span>
              <span className={cn(
                'text-lg font-bold',
                totalWeight === 100 ? 'text-green-600' : 'text-yellow-600'
              )}>
                {totalWeight}% / 100%
              </span>
            </div>
            {totalWeight !== 100 && (
              <p className="text-xs text-yellow-600 mt-2">
                Adjust the weights so they sum to exactly 100%
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Additional Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Additional Settings</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Match Score</label>
            <select
              value={config?.minScore || 40}
              onChange={(e) => setConfig(prev => prev ? { ...prev, minScore: parseInt(e.target.value) } : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-sm text-gray-900"
            >
              <option value="0">Show all matches (0%)</option>
              <option value="30">Low threshold (30%)</option>
              <option value="40">Moderate threshold (40%)</option>
              <option value="50">Medium threshold (50%)</option>
              <option value="60">High threshold (60%)</option>
              <option value="70">Very high threshold (70%)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Scholarships below this score won't be shown in recommendations</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Recommendations</label>
            <select
              value={config?.maxResults || 20}
              onChange={(e) => setConfig(prev => prev ? { ...prev, maxResults: parseInt(e.target.value) } : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-sm text-gray-900"
            >
              <option value="10">10 scholarships</option>
              <option value="20">20 scholarships</option>
              <option value="30">30 scholarships</option>
              <option value="50">50 scholarships</option>
              <option value="100">100 scholarships</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Maximum number of scholarships to show in recommendations</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={handleReset}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Reset to Defaults
        </button>
        <button
          onClick={saveConfig}
          disabled={saving || totalWeight !== 100}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition"
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
}
