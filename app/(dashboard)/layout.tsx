'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  email: string;
}

// Shared navigation items
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )},
  { name: 'Profile', href: '/profile', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )},
  { name: 'Scholarships', href: '/scholarships', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  )},
  { name: 'Applications', href: '/applications', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  )},
  { name: 'Recommendations', href: '/recommendations', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  )},
  { name: 'Assistant', href: '/assistant', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 2v-2z" />
    </svg>
  )},
  { name: 'Notifications', href: '/notifications', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  )},
];

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header skeleton */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 h-16">
        <div className="flex items-center justify-between px-4 h-full">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
            <div className="w-36 h-5 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="w-11 h-11 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Desktop sidebar skeleton */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col bg-white border-r border-gray-200">
        <div className="p-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
            <div className="w-36 h-5 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="flex-1 px-3 py-4 space-y-2">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex-1">
              <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-1" />
              <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main content skeleton */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-gray-200 rounded" />
            <div className="h-4 w-96 bg-gray-200 rounded" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                  <div className="h-8 w-16 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Logo component with optional collapse
function Logo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2" aria-label="Scholarship Finder AI home">
      <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm" aria-hidden="true">
        <span className="text-white font-bold text-sm">SF</span>
      </div>
      {!collapsed && <span className="text-lg font-bold text-gray-900 whitespace-nowrap">Scholarship Finder</span>}
    </Link>
  );
}

// Navigation links with collapse support
function NavigationLinks({
  pathname,
  collapsed = false,
  onClick
}: {
  pathname: string;
  collapsed?: boolean;
  onClick?: () => void;
}) {
  return (
    <nav className="px-3 py-4 flex-1" aria-label="Primary">
      <ul className="space-y-1" role="list">
        {navigation.map((item) => (
          <li key={item.name}>
            <Link
              href={item.href}
              onClick={onClick}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                'hover:bg-gray-100',
                collapsed ? 'justify-center' : '',
                pathname === item.href
                  ? 'bg-blue-50 text-blue-600 shadow-sm'
                  : 'text-gray-700'
              )}
              aria-current={pathname === item.href ? 'page' : undefined}
              title={collapsed ? item.name : undefined}
            >
              <span className={cn(
                'transition-transform duration-200 flex-shrink-0',
                pathname === item.href ? 'scale-110' : ''
              )}>
                {item.icon}
              </span>
              {!collapsed && item.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// User section with collapse support
function UserSection({
  user,
  collapsed = false,
  onLogout,
  onClose
}: {
  user: User | null;
  collapsed?: boolean;
  onLogout: () => void;
  onClose?: () => void;
}) {
  return (
    <div className="p-4 border-t border-gray-200">
      {/* Settings link */}
      <Link
        href="/matching-config"
        onClick={onClose}
        className={cn(
          'flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 mb-3',
          collapsed ? 'justify-center' : ''
        )}
        title={collapsed ? 'Matching Config' : undefined}
      >
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {!collapsed && 'Matching Config'}
      </Link>

      {/* User info */}
      <div className={cn(
        'flex items-center gap-3 mb-3',
        collapsed ? 'justify-center' : ''
      )}>
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm" aria-hidden="true">
          <span className="text-white text-sm font-semibold">
            {user?.email?.charAt(0).toUpperCase()}
          </span>
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
            <p className="text-xs text-gray-500">Signed in</p>
          </div>
        )}
      </div>

      {/* Logout button */}
      <button
        onClick={onLogout}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200',
          collapsed ? 'justify-center' : ''
        )}
        title={collapsed ? 'Sign out' : undefined}
      >
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        {!collapsed && 'Sign out'}
      </button>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Load collapsed state from localStorage
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsed !== null) {
      setSidebarCollapsed(savedCollapsed === 'true');
    }
  }, []);

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Focus trap and escape key handler for mobile sidebar
  useEffect(() => {
    if (!sidebarOpen) return;

    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    const focusableElements = sidebar.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
        menuButtonRef.current?.focus();
      }

      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [sidebarOpen]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/profile');
        const data = await response.json();

        if (response.status === 401) {
          router.push('/login');
          return;
        }

        if (data.success && data.data) {
          setUser({
            id: data.data.user_id,
            email: data.data.email,
          });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Skip to main content
      </a>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 h-16">
        <div className="flex items-center justify-between px-4 h-full">
          <Logo />
          <button
            ref={menuButtonRef}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2.5 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={sidebarOpen}
            aria-controls="mobile-sidebar"
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              {sidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <div
        className={cn(
          'lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300 ease-in-out',
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Sidebar */}
      <aside
        ref={sidebarRef}
        id="mobile-sidebar"
        className={cn(
          'lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200',
          'transform transition-transform duration-300 ease-in-out',
          'flex flex-col',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Main navigation"
        role="navigation"
      >
        {/* Close button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <Logo />
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <NavigationLinks pathname={pathname} onClick={() => setSidebarOpen(false)} />

        <UserSection user={user} onLogout={handleLogout} onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex fixed inset-y-0 left-0 z-30 flex-col bg-white border-r border-gray-200',
          'transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
        aria-label="Main navigation"
        role="navigation"
      >
        {/* Header with collapse toggle */}
        <div className={cn(
          'flex items-center p-4 border-b border-gray-100',
          sidebarCollapsed ? 'justify-center' : 'justify-between'
        )}>
          <Logo collapsed={sidebarCollapsed} />
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={cn(
              'p-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200',
              sidebarCollapsed ? 'mt-2' : ''
            )}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              className={cn(
                'w-5 h-5 text-gray-500 transition-transform duration-200',
                sidebarCollapsed ? 'rotate-180' : ''
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <NavigationLinks pathname={pathname} collapsed={sidebarCollapsed} />

        <UserSection user={user} collapsed={sidebarCollapsed} onLogout={handleLogout} />
      </aside>

      {/* Main Content */}
      <main
        id="main-content"
        className={cn(
          'pt-16 lg:pt-0 min-h-screen transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        )}
        tabIndex={-1}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}