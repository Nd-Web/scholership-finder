'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function DebugAuthPage() {
  const [info, setInfo] = useState<string[]>([]);

  useEffect(() => {
    const debug = async () => {
      const logs: string[] = [];
      const supabase = createClient();

      // 1. Check current session
      logs.push('1. Checking current session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        logs.push(`   ERROR: ${sessionError.message}`);
      } else if (session) {
        logs.push(`   SUCCESS: Session found`);
        logs.push(`   - User ID: ${session.user.id}`);
        logs.push(`   - Email: ${session.user.email}`);
        logs.push(`   - Access Token (first 20): ${session.access_token.substring(0, 20)}...`);
        logs.push(`   - Expires At: ${session.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'N/A'}`);
      } else {
        logs.push(`   NO SESSION FOUND`);
      }

      // 2. Get user
      logs.push('');
      logs.push('2. Getting current user...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        logs.push(`   ERROR: ${userError.message}`);
      } else if (user) {
        logs.push(`   SUCCESS: User found`);
        logs.push(`   - User ID: ${user.id}`);
        logs.push(`   - Email: ${user.email}`);
      } else {
        logs.push(`   NO USER FOUND`);
      }

      // 3. Check cookies
      logs.push('');
      logs.push('3. Checking document cookies...');
      const allCookies = document.cookie.split(';').map(c => c.trim());
      logs.push(`   Found ${allCookies.length} cookies:`);
      allCookies.forEach(cookie => {
        const name = cookie.split('=')[0];
        const value = cookie.split('=')[1];
        if (name.includes('sb-') || name.includes('auth')) {
          logs.push(`   - ${name}: ${value ? value.substring(0, 30) + '...' : 'empty'}`);
        }
      });

      // 4. Test API call
      logs.push('');
      logs.push('4. Testing /api/profile endpoint...');
      try {
        const response = await fetch('/api/profile');
        const data = await response.json();
        logs.push(`   Status: ${response.status}`);
        logs.push(`   Response: ${JSON.stringify(data, null, 2).substring(0, 200)}`);
      } catch (e) {
        logs.push(`   ERROR: ${(e as Error).message}`);
      }

      setInfo(logs);
    };

    debug();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Auth Debug Page</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-lg font-semibold mb-4">Debug Output</h2>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto text-sm font-mono">
            {info.join('\n') || 'Loading...'}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
}
