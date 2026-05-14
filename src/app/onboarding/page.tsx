'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Upload,
  ChevronDown,
  Check,
  ExternalLink,
  Search,
  ImagePlus,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/lib/types';

const TOTAL_STEPS = 3;

const CATEGORY_OPTIONS = [
  { value: '', label: 'Select a category' },
  { value: 'beauty', label: 'Beauty and skincare' },
  { value: 'fitness', label: 'Fitness and wellness' },
  { value: 'tech', label: 'Tech and gadgets' },
  { value: 'food', label: 'Food and beverage' },
  { value: 'fashion', label: 'Fashion and apparel' },
  { value: 'finance', label: 'Finance and business' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'other', label: 'Other' },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [role] = useState<UserRole>('brand');
  const [stripeConnected, setStripeConnected] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [category, setCategory] = useState('');
  const [completing, setCompleting] = useState(false);

  function handleNext() {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    }
  }

  function handleBack() {
    if (step > 1) {
      setStep(step - 1);
    }
  }

  function handleComplete() {
    setCompleting(true);
    setTimeout(() => setCompleting(false), 1500);
  }

  function handleConnectStripe() {
    setStripeConnected(true);
  }

  const progressPct = (step / TOTAL_STEPS) * 100;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Top section: back button + step indicator */}
      <header className="px-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="w-10">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="rounded-[10px] p-1.5 text-gray-600 transition-colors hover:bg-gray-100"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Step dots */}
          <div className="flex items-center gap-2">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => {
              const stepNum = i + 1;
              const isComplete = stepNum < step;
              const isCurrent = stepNum === step;
              return (
                <div
                  key={stepNum}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                    isCurrent &&
                      'bg-purple-600 text-white',
                    isComplete &&
                      'bg-purple-100 text-purple-600',
                    !isCurrent &&
                      !isComplete &&
                      'bg-gray-100 text-gray-400',
                  )}
                >
                  {isComplete ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    stepNum
                  )}
                </div>
              );
            })}
          </div>

          <div className="w-10" />
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-purple-600 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </header>

      {/* Step content */}
      <main className="flex flex-1 flex-col px-4 py-8">
        {/* Step 1: Connect Stripe */}
        {step === 1 && (
          <div className="flex flex-1 flex-col">
            <div className="flex-1 space-y-6">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Connect your Stripe account
                </h1>
                <p className="mt-2 text-sm text-gray-500">
                  We use Stripe to track revenue, attribute sales, and pay
                  creators. This is how we keep everything verified and
                  transparent.
                </p>
              </div>

              <Card
                variant={stripeConnected ? 'success' : 'surface'}
                className="flex flex-col items-center py-8"
              >
                {stripeConnected ? (
                  <>
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                      <Check className="h-7 w-7 text-emerald-600" />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-gray-900">
                      Stripe connected
                    </p>
                    <Badge variant="verified" className="mt-2">
                      Verified
                    </Badge>
                  </>
                ) : (
                  <>
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-100">
                      <ExternalLink className="h-6 w-6 text-purple-600" />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-gray-900">
                      Secure OAuth connection
                    </p>
                    <p className="mt-1 text-xs text-gray-500 text-center max-w-[240px]">
                      You will be redirected to Stripe to authorize
                      UpsideShare. We never see your banking details.
                    </p>
                    <Button
                      variant="primary"
                      size="lg"
                      className="mt-5"
                      onClick={handleConnectStripe}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Connect with Stripe
                    </Button>
                  </>
                )}
              </Card>

              {!stripeConnected && (
                <button
                  onClick={handleNext}
                  className="mx-auto block text-sm text-gray-400 underline hover:text-gray-600"
                >
                  I&apos;ll do this later
                </button>
              )}

              {!stripeConnected && (
                <p className="text-center text-xs text-amber-600">
                  Skipping gives you an unverified badge. Brands and
                  creators prefer verified partners.
                </p>
              )}
            </div>

            <div className="mt-8">
              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={handleNext}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Profile info */}
        {step === 2 && (
          <div className="flex flex-1 flex-col">
            <div className="flex-1 space-y-6">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {role === 'brand'
                    ? 'Tell us about your brand'
                    : 'Tell us about yourself'}
                </h1>
                <p className="mt-2 text-sm text-gray-500">
                  This information appears on your public profile. You can
                  update it anytime.
                </p>
              </div>

              {/* Logo upload */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  {role === 'brand' ? 'Brand logo' : 'Profile photo'}
                </label>
                <button
                  className={cn(
                    'flex h-32 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 transition-colors',
                    'hover:border-purple-400 hover:bg-purple-50',
                  )}
                >
                  <ImagePlus className="h-6 w-6 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    Tap to upload
                  </span>
                  <span className="text-[10px] text-gray-400">
                    PNG or JPG, max 2 MB
                  </span>
                </button>
              </div>

              <Input
                label="Display name"
                placeholder={
                  role === 'brand'
                    ? 'e.g. Glow Naturals'
                    : 'e.g. Jess Rivera'
                }
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />

              {/* Bio textarea */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="bio"
                  className="text-sm font-medium text-gray-700"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder={
                    role === 'brand'
                      ? 'What does your brand do? What makes you different?'
                      : 'Tell brands and fans about yourself...'
                  }
                  className={cn(
                    'w-full rounded-[10px] border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors resize-none',
                    'placeholder:text-gray-400',
                    'focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20',
                  )}
                />
                <p className="text-xs text-gray-400">
                  {bio.length}/160 characters
                </p>
              </div>

              {/* Category select */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="category"
                  className="text-sm font-medium text-gray-700"
                >
                  Category
                </label>
                <div className="relative">
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={cn(
                      'h-11 w-full appearance-none rounded-[10px] border border-gray-200 bg-white px-3 pr-10 text-sm text-gray-900 outline-none transition-colors',
                      'focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20',
                    )}
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={handleNext}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: First action */}
        {step === 3 && (
          <div className="flex flex-1 flex-col">
            <div className="flex-1 space-y-6">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {role === 'brand'
                    ? 'Create your first deal'
                    : 'Browse deals'}
                </h1>
                <p className="mt-2 text-sm text-gray-500">
                  {role === 'brand'
                    ? 'You are all set up. Create a deal to start connecting with creators who will drive real revenue.'
                    : 'You are all set up. Browse available deals from brands that share revenue and equity with their creators.'}
                </p>
              </div>

              {/* Summary card */}
              <Card variant="purpleTint" className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  Your profile summary
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Display name
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {displayName || 'Not set'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Category</span>
                    <span className="text-sm font-medium text-gray-900">
                      {CATEGORY_OPTIONS.find((c) => c.value === category)
                        ?.label || 'Not set'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Stripe</span>
                    {stripeConnected ? (
                      <Badge variant="verified">Connected</Badge>
                    ) : (
                      <Badge variant="unverified">Not connected</Badge>
                    )}
                  </div>
                </div>
              </Card>

              {role === 'brand' && (
                <Card
                  variant="surface"
                  onClick={() => {}}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      Create a deal
                    </p>
                    <p className="text-xs text-gray-500">
                      Set terms, pick attribution, invite creators
                    </p>
                  </div>
                </Card>
              )}

              {role === 'creator' && (
                <Card
                  variant="surface"
                  onClick={() => {}}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                    <Search className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      Browse deals
                    </p>
                    <p className="text-xs text-gray-500">
                      Find brands offering revenue share and equity
                    </p>
                  </div>
                </Card>
              )}
            </div>

            <div className="mt-8">
              <Button
                variant="primary"
                fullWidth
                size="lg"
                loading={completing}
                onClick={handleComplete}
              >
                Complete
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
