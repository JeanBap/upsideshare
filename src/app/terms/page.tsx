'use client';

import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <main id="main-content" className="mx-auto max-w-2xl px-5 py-16">
      <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: May 15, 2026</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-gray-700">
        <section>
          <h2 className="text-lg font-semibold text-gray-900">1. Agreement</h2>
          <p className="mt-2">
            By accessing or using UpsideShare (&quot;the platform&quot;), you agree to
            these Terms of Service. If you do not agree, do not use the platform.
            &quot;We&quot;, &quot;us&quot;, and &quot;our&quot; refer to UpsideShare.
            &quot;You&quot; refers to the user.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">2. Eligibility</h2>
          <p className="mt-2">
            You must be at least 18 years old and have the legal capacity to enter into
            agreements. If you are using the platform on behalf of a company, you
            represent that you have authority to bind that company to these terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">3. Account</h2>
          <p className="mt-2">
            You create an account via Google OAuth. You are responsible for all activity
            under your account. Notify us immediately at hello@upsideshare.com if you
            suspect unauthorized access. We may suspend or terminate accounts that
            violate these terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">4. Platform description</h2>
          <p className="mt-2">
            UpsideShare connects brands and creators through revenue share and equity
            deals. The platform tracks revenue attribution via Stripe webhooks, generates
            equity contract templates, and provides a payout ledger. UpsideShare is a
            marketplace and tracking tool. We do not process payments, issue equity, or
            provide legal or financial advice.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">5. Fees</h2>
          <p className="mt-2">
            UpsideShare charges a platform fee of 5% on tracked revenue flowing through
            deals. This fee is calculated automatically and deducted from the revenue
            share amount shown in the ledger. There are no signup fees or monthly
            subscription fees. We reserve the right to change the fee with 30 days
            written notice.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">6. Stripe integration</h2>
          <p className="mt-2">
            By connecting your Stripe account, you authorize UpsideShare to access
            read-only transaction data for revenue attribution. We cannot make charges,
            issue refunds, or modify your Stripe account. Your use of Stripe is subject
            to Stripe&apos;s own terms of service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">7. Deals and applications</h2>
          <p className="mt-2">
            Brands are responsible for the accuracy of deal terms they post (revenue
            share percentage, equity terms, creator spots). Creators are responsible for
            promoting deals in compliance with applicable laws, including FTC disclosure
            requirements for sponsored content. UpsideShare does not guarantee that any
            deal will generate revenue.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">8. Equity contracts</h2>
          <p className="mt-2">
            UpsideShare provides template equity contracts for convenience. These
            templates are not legal advice. Both parties should consult their own legal
            counsel before signing. Actual share issuance is handled outside UpsideShare
            via the brand&apos;s cap table provider. UpsideShare is not a party to any
            equity agreement and bears no liability for equity disputes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">9. Payouts</h2>
          <p className="mt-2">
            UpsideShare tracks revenue and calculates commissions but does not process
            payouts directly. Brands are responsible for paying creators according to
            deal terms. The ledger provides a two-step confirmation (brand marks paid,
            creator confirms receipt). Disputes between brands and creators are between
            those parties. UpsideShare may assist in mediation but is not obligated to.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">10. Prohibited conduct</h2>
          <p className="mt-2">
            You may not: use the platform for illegal purposes, submit false information,
            manipulate revenue attribution (self-purchases, click fraud, fake traffic),
            attempt to circumvent the platform fee, scrape or data-mine the platform,
            interfere with platform operations, or impersonate another user or brand.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">11. Intellectual property</h2>
          <p className="mt-2">
            UpsideShare owns all rights to the platform, including code, design, and
            branding. You retain ownership of content you submit (brand logos, deal
            descriptions, profile information). By submitting content, you grant us a
            non-exclusive license to display it on the platform.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">12. Disclaimer</h2>
          <p className="mt-2">
            The platform is provided &quot;as is&quot; without warranties of any kind,
            express or implied. We do not guarantee uptime, accuracy of revenue tracking,
            or the outcome of any deal. Revenue figures are sourced from Stripe and may
            be subject to Stripe&apos;s own data processing delays.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">13. Limitation of liability</h2>
          <p className="mt-2">
            To the maximum extent permitted by law, UpsideShare&apos;s total liability
            for any claims arising from your use of the platform is limited to the
            platform fees you paid in the 12 months preceding the claim. We are not
            liable for indirect, incidental, special, or consequential damages.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">14. Termination</h2>
          <p className="mt-2">
            Either party may terminate at any time. You can request account deletion by
            emailing hello@upsideshare.com. We may terminate your account for violation
            of these terms with written notice. Upon termination, your data will be
            handled according to our Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">15. Changes</h2>
          <p className="mt-2">
            We may update these terms. We will notify registered users via email of
            material changes at least 30 days before they take effect. Continued use
            after changes constitutes acceptance.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">16. Governing law</h2>
          <p className="mt-2">
            These terms are governed by the laws of England and Wales. Disputes will be
            resolved through good-faith negotiation first, then binding arbitration if
            needed.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">17. Contact</h2>
          <p className="mt-2">
            Questions about these terms? Email{' '}
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
