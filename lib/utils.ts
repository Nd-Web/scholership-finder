/**
 * Utility Functions
 *
 * Common helper functions used throughout the application.
 */

import { type ClassValue, clsx } from 'clsx';

/**
 * Combines class names conditionally.
 * Works with Tailwind CSS and className merging.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Formats a date string for display.
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Formats a date as ISO string (YYYY-MM-DD).
 */
export function toIsoDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Calculates days between two dates.
 */
export function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Checks if a deadline is approaching (within 30 days).
 */
export function isDeadlineApproaching(deadline: string | null): boolean {
  if (!deadline) return false;
  const daysLeft = daysBetween(new Date().toISOString(), deadline);
  return daysLeft >= 0 && daysLeft <= 30;
}

/**
 * Checks if a deadline has passed.
 */
export function isDeadlinePassed(deadline: string | null): boolean {
  if (!deadline) return false;
  return daysBetween(new Date().toISOString(), deadline) < 0;
}

/**
 * Checks if a deadline is within the next 7 days (urgent).
 */
export function isDeadlineThisWeek(deadline: string | null): boolean {
  if (!deadline) return false;
  const daysLeft = daysBetween(new Date().toISOString(), deadline);
  return daysLeft >= 0 && daysLeft <= 7;
}

/**
 * Formats a GPA with its scale.
 */
export function formatGpa(gpa: number | null, scale: number = 4.0): string {
  if (gpa === null) return 'N/A';
  return `${gpa.toFixed(2)}/${scale}`;
}

/**
 * Formats currency amounts.
 */
export function formatCurrency(amount: number | null, currency: string = 'USD'): string {
  if (amount === null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Capitalizes the first letter of a string.
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts snake_case to Title Case.
 */
export function snakeToTitle(snake: string): string {
  return snake
    .split('_')
    .map((word) => capitalize(word))
    .join(' ');
}

/**
 * Truncates text to a maximum length with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Generates a unique ID (client-side fallback).
 * For production, use database-generated UUIDs.
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Safe JSON parse that returns null on failure.
 */
export function safeJsonParse<T>(str: string): T | null {
  try {
    return JSON.parse(str) as T;
  } catch {
    return null;
  }
}

/**
 * Debounce function for search inputs.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Sleep utility for delays.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
