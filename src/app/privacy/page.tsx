'use client';

import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main id="main-content" className="mx-auto max-w-2xl px-5 py-16">
      <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: May 15, 2026</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-gray-700">
        <section>
          <h2 className="text-lg font-semibold text-gray-900">1. Who we are</h2>
          <p className="mt-2">
            UpsideShare (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the website
            upsideshare.com. This policy explains how we collect, use, store, and
            protect your personal data when you use our platform.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">2. Data we collect</h2>
          <p className="mt-2">We collect the following categories of personal data:</p>
          <p className="mt-2">
            <strong>Account data:</strong> name, email address, and profile information
            provided through Google OAuth when you sign up.
          </p>
          <p className="mt-2">
            <strong>Stripe data:</strong> when you connect your Stripe account via OAuth,
            we receive read-only access to transaction data (charges, customers, coupons)
            for the purpose of revenue attribution. We do not store full payment card
            numbers or bank account details.
          </p>
          <p className="mt-2">
            <strong>Usage data:</strong> pages visited, actions taken on the platform,
            browser type, IP address, and device information. Collected via privacy-friendly
            analytics (Umami, no cookies).
          </p>
          <p className="mt-2">
            <strong>Deal and application data:</strong> deal terms you create or apply to,
            revenue figures attributed to your tracking links, ledger entries, and equity
            contract details.
          </p>
          <p className="mt-2">
            <strong>Waitlist data:</strong> email address and role (brand or creator)
            submitted through our waitlist form.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">3. How we use your data</h2>
          <p className="mt-2">We use your data to:</p>
          <p className="mt-2">
            Provide the platform: match brands with creators, track revenue attribution
            via Stripe, calculate commissions, generate equity contract PDFs, and manage
            the payout ledger.
          </p>
          <p className="mt-2">
            Communicate with you: send transactional emails (waitlist confirmation, deal
            notifications, payout alerts) via Resend.
          </p>
          <p className="mt-2">
            Improve the platform: analyze usage patterns to fix bugs, improve performance,
            and develop new features.
          </p>
          <p className="mt-2">
            We do not sell your personal data. We do not use your data for advertising.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">4. Legal basis (GDPR)</h2>
          <p className="mt-2">
            For users in the European Economic Area (EEA), we process data under the
            following legal bases: (a) contract performance (providing the platform
            services you signed up for), (b) legitimate interest (improving security and
            platform quality), and (c) consent (waitlist signup, optional communications).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">5. Data sharing</h2>
          <p className="mt-2">
            We share data only with the following third-party processors, each under
            their own privacy policies:
          </p>
          <p className="mt-2">
            <strong>Supabase</strong> (database hosting, EU region): stores account data,
            deal data, and ledger entries.
          </p>
          <p className="mt-2">
            <strong>Vercel</strong> (website hosting): serves web pages, receives IP
            addresses and request metadata.
          </p>
          <p className="mt-2">
            <strong>Stripe</strong> (payment verification): we access your Stripe data
            via OAuth. Stripe processes payments independently.
          </p>
          <p className="mt-2">
            <strong>Resend</strong> (transactional email): receives email addresses
            to deliver platform notifications.
          </p>
          <p className="mt-2">
            We may also share data if required by law or to protect our legal rights.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">6. Data retention</h2>
          <p className="mt-2">
            We retain your data for as long as your account is active. If you request
            account deletion, we will remove your personal data within 30 days. Anonymized
            aggregate data (e.g., total platform revenue) may be retained indefinitely.
            Stripe transaction data is subject to Stripe&apos;s own retention policies.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">7. Your rights</h2>
          <p className="mt-2">
            You have the right to: access your personal data, correct inaccurate data,
            request deletion of your data, object to processing, request data portability,
            and withdraw consent at any time. To exercise any of these rights, email
            hello@upsideshare.com.
          </p>
          <p className="mt-2">
            For users in the EEA: you may lodge a complaint with your local data
            protection authority.
          </p>
          <p className="mt-2">
            For users in California: under the CCPA, you have the right to know what
            personal information we collect and to request its deletion. We do not sell
            personal information.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">8. Cookies</h2>
          <p className="mt-2">
            UpsideShare uses only essential cookies required for authentication (Supabase
            auth session). We do not use advertising cookies or tracking cookies. Our
            analytics tool (Umami) is cookie-free and does not track users across sites.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">9. Security</h2>
          <p className="mt-2">
            We protect your data with: HTTPS encryption in transit, row-level security
            (RLS) policies on all database tables, OAuth-based authentication (no passwords
            stored), CORS domain whitelisting, rate limiting on public endpoints, and
            security headers (HSTS, CSP, X-Content-Type-Options).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">10. Children</h2>
          <p className="mt-2">
            UpsideShare is not directed at children under 18. We do not knowingly collect
            data from anyone under 18. If you believe a child has provided us with
            personal data, contact hello@upsideshare.com.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">11. Changes</h2>
          <p className="mt-2">
            We may update this policy. We will notify registered users via email of
            material changes. The &quot;last updated&quot; date at the top reflects the
            most recent revision.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">12. Contact</h2>
          <p className="mt-2">
            Questions about this policy? Email{' '}
            <a href="mailto:hello@upsideshare.com" className="text-purple-600 hover:underline">
              hello@upsideshare.com
            </a>.
          </p>
        </section>
      </div>

      <div className="mt-12 border-t border-gray-200 pt-6">
        <Link href="/" className="text-sm text-purple-600 hover:underline">
          Back to home
        </Link>
      </div>
    </main>
  );
}
