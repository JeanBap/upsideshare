'use client';

/**
 * Renders a JSON-LD <script> tag for structured data.
 * Safe to use inside 'use client' pages.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
