'use client';

/**
 * Injects a noindex meta tag. Use on auth-required pages
 * that should not appear in search results.
 */
export function NoIndex() {
  return (
    <>
      <meta name="robots" content="noindex, nofollow" />
    </>
  );
}
