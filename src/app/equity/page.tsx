'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  FileText,
  Download,
  ChevronDown,
} from 'lucide-react';
import { TopBar } from '@/components/ui/TopBar';
import { NavBar } from '@/components/ui/NavBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

type TemplateType = 'simple' | 'vesting' | 'advisory';
type RevenueMode = 'from-zero' | 'target';

const TEMPLATE_OPTIONS: { value: TemplateType; label: string }[] = [
  { value: 'simple', label: 'Simple equity' },
  { value: 'vesting', label: 'With vesting' },
  { value: 'advisory', label: 'Advisory' },
];

const SHARE_CLASS_OPTIONS = [
  { value: 'common', label: 'Common' },
  { value: 'preferred', label: 'Preferred' },
];

const MOCK_DEALS = [
  { value: 'deal-skincare-line', label: 'Skincare Line Launch' },
  { value: 'deal-fitness-app', label: 'Fitness App Promo' },
];

export default function EquityPage() {
  const [template, setTemplate] = useState<TemplateType>('simple');
  const [brandName, setBrandName] = useState('Glow Naturals Inc.');
  const [creatorName, setCreatorName] = useState('');
  const [equityPct, setEquityPct] = useState('');
  const [shareClass, setShareClass] = useState('common');
  const [revenueMode, setRevenueMode] = useState<RevenueMode>('from-zero');
  const [revenueTarget, setRevenueTarget] = useState('');
  const [linkedDeal, setLinkedDeal] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [additionalTerms, setAdditionalTerms] = useState('');
  const [generating, setGenerating] = useState(false);

  const filename = `equity-${template}-${(creatorName || 'creator').toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`;

  function handleGenerate() {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 1500);
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pb-24">
      <TopBar title="Create equity contract" showBack onBack={() => {}} />

      <main className="flex-1 space-y-5 px-4 py-5">
        {/* Info banner */}
        <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs leading-relaxed text-amber-800">
            This generates a template contract as PDF. Both parties sign
            offline. UpsideShare does not handle legal issuance.
          </p>
        </div>

        {/* Template type selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            Template type
          </label>
          <div className="flex gap-2">
            {TEMPLATE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTemplate(opt.value)}
                className={cn(
                  'flex-1 rounded-[10px] border px-3 py-2.5 text-sm font-medium transition-colors',
                  template === opt.value
                    ? 'border-purple-400 bg-purple-50 text-purple-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form fields */}
        <div className="space-y-4">
          <Input
            label="Brand legal name"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="Your registered company name"
          />

          <Input
            label="Creator legal name"
            value={creatorName}
            onChange={(e) => setCreatorName(e.target.value)}
            placeholder="Full legal name of the creator"
            required
          />

          <Input
            label="Equity percentage"
            value={equityPct}
            onChange={(e) => setEquityPct(e.target.value)}
            placeholder="e.g. 1.5"
            type="number"
            suffix="%"
            required
          />

          {/* Share class dropdown */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="share-class"
              className="text-sm font-medium text-gray-700"
            >
              Share class
            </label>
            <div className="relative">
              <select
                id="share-class"
                value={shareClass}
                onChange={(e) => setShareClass(e.target.value)}
                className={cn(
                  'h-11 w-full appearance-none rounded-[10px] border border-gray-200 bg-white px-3 pr-10 text-sm text-gray-900 outline-none transition-colors',
                  'focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20',
                )}
              >
                {SHARE_CLASS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Revenue target unlock */}
        <Card variant="surface" className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">
            Revenue target unlock
          </h3>

          <div className="flex gap-2">
            <button
              onClick={() => setRevenueMode('from-zero')}
              className={cn(
                'flex-1 rounded-[10px] border px-3 py-2 text-sm font-medium transition-colors',
                revenueMode === 'from-zero'
                  ? 'border-amber-400 bg-amber-50 text-amber-800'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
              )}
            >
              From $0
            </button>
            <button
              onClick={() => setRevenueMode('target')}
              className={cn(
                'flex-1 rounded-[10px] border px-3 py-2 text-sm font-medium transition-colors',
                revenueMode === 'target'
                  ? 'border-amber-400 bg-amber-50 text-amber-800'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
              )}
            >
              Target
            </button>
          </div>

          {revenueMode === 'target' && (
            <Input
              label="Minimum revenue amount"
              value={revenueTarget}
              onChange={(e) => setRevenueTarget(e.target.value)}
              placeholder="e.g. 50000"
              type="number"
              helperText="Equity vests only after this revenue milestone is hit."
            />
          )}

          {revenueMode === 'from-zero' && (
            <p className="text-xs text-gray-500">
              Equity is active from the first dollar of tracked revenue.
            </p>
          )}
        </Card>

        {/* Linked deal */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="linked-deal"
            className="text-sm font-medium text-gray-700"
          >
            Linked deal
          </label>
          <div className="relative">
            <select
              id="linked-deal"
              value={linkedDeal}
              onChange={(e) => setLinkedDeal(e.target.value)}
              className={cn(
                'h-11 w-full appearance-none rounded-[10px] border border-gray-200 bg-white px-3 pr-10 text-sm text-gray-900 outline-none transition-colors',
                'focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20',
              )}
            >
              <option value="">Select a deal (optional)</option>
              {MOCK_DEALS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <Input
          label="Effective date"
          value={effectiveDate}
          onChange={(e) => setEffectiveDate(e.target.value)}
          type="date"
        />

        {/* Additional terms */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="additional-terms"
            className="text-sm font-medium text-gray-700"
          >
            Additional terms
          </label>
          <textarea
            id="additional-terms"
            value={additionalTerms}
            onChange={(e) => setAdditionalTerms(e.target.value)}
            rows={4}
            placeholder="Any additional clauses or conditions..."
            className={cn(
              'w-full rounded-[10px] border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors resize-none',
              'placeholder:text-gray-400',
              'focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20',
            )}
          />
        </div>

        {/* Contract preview */}
        <Card variant="purpleTint" className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-purple-600" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {filename}
            </p>
            <p className="text-xs text-gray-500">Contract preview</p>
          </div>
        </Card>

        {/* CTA */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={generating}
          onClick={handleGenerate}
        >
          <Download className="h-4 w-4" />
          Generate and download PDF
        </Button>

        <p className="text-center text-xs text-gray-400">
          Both parties sign the PDF offline. UpsideShare keeps a record.
        </p>
      </main>

      <NavBar role="brand" activeTab="equity" />
    </div>
  );
}
