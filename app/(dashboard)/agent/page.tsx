'use client';

import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { AgentRun, AgentProgress } from '@/types/agent';

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    running: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      colors[status] || colors.pending
    )}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// Agent status card component
function AgentStatusCard({
  progress,
  isRunning,
  onTrigger,
  isLoading,
}: {
  progress: AgentProgress | null;
  isRunning: boolean;
  onTrigger: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Agent Status</h2>
        <StatusBadge status={progress?.status || 'pending'} />
      </div>

      {progress && (
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Current Step</span>
            <span className="font-medium text-gray-900">{progress.current_step}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Found</span>
            <span className="font-medium text-gray-900">{progress.total_found}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Processed</span>
            <span className="font-medium text-gray-900">{progress.total_processed}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Added</span>
            <span className="font-medium text-green-600">{progress.total_added}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Skipped (duplicates)</span>
            <span className="font-medium text-gray-900">{progress.total_skipped}</span>
          </div>
          {progress.elapsed_seconds && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Elapsed</span>
              <span className="font-medium text-gray-900">{formatDuration(progress.elapsed_seconds)}</span>
            </div>
          )}
        </div>
      )}

      <button
        onClick={onTrigger}
        disabled={isRunning || isLoading}
        className={cn(
          'w-full py-3 px-4 rounded-lg font-medium transition-all duration-200',
          'flex items-center justify-center gap-2',
          isRunning || isLoading
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-sm hover:shadow-md'
        )}
      >
        {isRunning ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Running...
          </>
        ) : isLoading ? (
          'Loading...'
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Run Agent Now
          </>
        )}
      </button>
    </div>
  );
}

// Run history table component
function RunHistoryTable({ runs }: { runs: AgentRun[] }) {
  if (runs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Run History</h2>
        <p className="text-gray-500 text-center py-8">No runs yet. Click &quot;Run Agent Now&quot; to start.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Run History</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skipped</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {runs.map((run) => (
              <tr key={run.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(run.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                    run.trigger_type === 'scheduled' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                  )}>
                    {run.trigger_type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={run.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                  {run.total_added}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {run.total_skipped}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {run.started_at && run.completed_at
                    ? formatDuration(
                        Math.floor(
                          (new Date(run.completed_at).getTime() - new Date(run.started_at).getTime()) / 1000
                        )
                      )
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Stats cards component
function StatsCards({ runs }: { runs: AgentRun[] }) {
  const completedRuns = runs.filter((r) => r.status === 'completed');
  const totalAdded = completedRuns.reduce((sum, r) => sum + r.total_added, 0);
  const totalSkipped = completedRuns.reduce((sum, r) => sum + r.total_skipped, 0);
  const successRate = completedRuns.length > 0
    ? Math.round((completedRuns.length / runs.length) * 100)
    : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <p className="text-sm text-gray-500 mb-1">Total Runs</p>
        <p className="text-2xl font-bold text-gray-900">{runs.length}</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <p className="text-sm text-gray-500 mb-1">Scholarships Added</p>
        <p className="text-2xl font-bold text-green-600">{totalAdded}</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <p className="text-sm text-gray-500 mb-1">Duplicates Skipped</p>
        <p className="text-2xl font-bold text-gray-900">{totalSkipped}</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <p className="text-sm text-gray-500 mb-1">Success Rate</p>
        <p className="text-2xl font-bold text-blue-600">{successRate}%</p>
      </div>
    </div>
  );
}

// Format duration helper
function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
}

// Main page component
export default function AgentPage() {
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [progress, setProgress] = useState<AgentProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch run history
  const fetchRuns = useCallback(async () => {
    try {
      const response = await fetch('/api/agent/history');
      const data = await response.json();

      if (data.success) {
        setRuns(data.data.runs);
      }
    } catch (err) {
      console.error('Failed to fetch runs:', err);
    }
  }, []);

  // Check for running agent
  const checkRunningAgent = useCallback(async () => {
    const runningRun = runs.find((r) => r.status === 'running' || r.status === 'pending');
    if (runningRun) {
      try {
        const response = await fetch(`/api/agent/status?run_id=${runningRun.id}`);
        const data = await response.json();

        if (data.success) {
          setProgress(data.data);
          if (data.data.status === 'running' || data.data.status === 'pending') {
            setIsRunning(true);
          } else {
            setIsRunning(false);
          }
        }
      } catch (err) {
        console.error('Failed to check running agent:', err);
      }
    }
  }, [runs]);

  // Poll for updates when running
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(async () => {
      await checkRunningAgent();
      await fetchRuns();

      // Stop polling if no longer running
      if (progress?.status === 'completed' || progress?.status === 'failed') {
        setIsRunning(false);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isRunning, progress?.status, checkRunningAgent, fetchRuns]);

  // Initial load
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await fetchRuns();
      setIsLoading(false);
    };
    load();
  }, [fetchRuns]);

  // Check for running agent after runs load
  useEffect(() => {
    if (runs.length > 0) {
      checkRunningAgent();
    }
  }, [runs, checkRunningAgent]);

  // Trigger agent run
  const handleTrigger = async () => {
    setIsRunning(true);
    setError(null);

    try {
      const response = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to start agent');
      }

      // Start polling for updates
      setProgress({
        run_id: data.data.run_id,
        status: 'pending',
        current_step: 'starting',
        total_found: 0,
        total_processed: 0,
        total_added: 0,
        total_skipped: 0,
        started_at: new Date().toISOString(),
        elapsed_seconds: 0,
      });

      // Refresh history
      await fetchRuns();
    } catch (err) {
      setIsRunning(false);
      setError(err instanceof Error ? err.message : 'Failed to start agent');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Scholarship Agent</h1>
        <p className="mt-1 text-sm text-gray-500">
          AI-powered agent that automatically discovers and adds new scholarships from the web.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <StatsCards runs={runs} />

      {/* Status and trigger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <AgentStatusCard
            progress={progress}
            isRunning={isRunning}
            onTrigger={handleTrigger}
            isLoading={isLoading}
          />
        </div>

        {/* Info card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Search</h3>
                  <p className="text-sm text-gray-500">
                    Tavily API searches the web for scholarship opportunities using curated queries.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-indigo-600 font-semibold">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Extract</h3>
                  <p className="text-sm text-gray-500">
                    Groq LLM extracts structured scholarship data from search results.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-semibold">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Deduplicate</h3>
                  <p className="text-sm text-gray-500">
                    Checks for existing scholarships and skips duplicates automatically.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-semibold">4</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Store</h3>
                  <p className="text-sm text-gray-500">
                    New scholarships are saved to the database and become available to all users.
                  </p>
                </div>
              </div>
            </div>

            {/* Schedule info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  Scheduled runs daily at 6:00 AM UTC. Click &quot;Run Agent Now&quot; for immediate execution.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History */}
      <RunHistoryTable runs={runs} />
    </div>
  );
}