/**
 * Merge CSS class names, filtering out falsy values.
 * Lightweight alternative to clsx/classnames.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Format an amount in cents to a currency string.
 * Example: 12599 -> "$125.99"
 */
export function formatCurrency(cents: number): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}

/**
 * Format a number as a percentage string.
 * Example: 12.5 -> "12.5%"
 */
export function formatPercent(num: number): string {
  return `${Number(num.toFixed(2))}%`;
}

/**
 * Format a date string or Date object to a human-readable format.
 * Example: "2025-01-15T00:00:00Z" -> "Jan 15, 2025"
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

/**
 * Returns a greeting based on the current time of day.
 * "Good morning" (5am-12pm), "Good afternoon" (12pm-6pm), "Good evening" (6pm-5am).
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 18) return 'Good afternoon';
  return 'Good evening';
}
