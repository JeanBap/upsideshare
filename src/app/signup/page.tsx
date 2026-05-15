'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Building2, Palette, Mail } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase';
import type { UserRole } from '@/lib/types';

export default function SignupPage() {
  const searchParams = useSearchParams();
  const dealSlug = searchParams.get('deal');
  const authError = searchParams.get('error');

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [error, setError] = useState<string | null>(
    authError === 'auth_callback_failed' ? 'Authentication failed. Please try again.' : null
  );

  async function handleGoogleSignup() {
    if (!selectedRole) return;
    setError(null);

    const supabase = createClient();
    const redirectTo = dealSlug
      ? `${window.location.origin}/auth/callback?next=/deals`
      : `${window.location.origin}/auth/callback`;

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        data: {
          role: selectedRole,
        },
      },
    });

    if (oauthError) {
      setError(oauthError.message);
    }
  }

  async function handleSendMagicLink() {
    if (!email || !selectedRole) return;
    setError(null);
    setSending(true);

    const supabase = createClient();
    const redirectTo = dealSlug
      ? `${window.location.origin}/auth/callback?next=/deals`
      : `${window.location.origin}/auth/callback`;

    const { error: magicLinkError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          role: selectedRole,
        },
      },
    });

    setSending(false);

    if (magicLinkError) {
      setError(magicLinkError.message);
    } else {
      setMagicLinkSent(true);
    }
  }

  return (
    <main id="main-content" className="flex min-h-screen flex-col items-center justify-center bg-purple-50 px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600 text-white font-bold text-lg">
            U
          </div>
          <h1 className="mt-3 text-xl font-bold text-gray-900">
            UpsideShare
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Where creators earn equity
          </p>
        </div>

        {/* Role selector */}
        <Card variant="elevated" className="space-y-5 p-6">
          <h2 className="text-center text-base font-semibold text-gray-900">
            Get started
          </h2>

          {dealSlug && (
            <p className="text-center text-xs text-purple-600 font-medium">
              Signing up to apply for a deal
            </p>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedRole('brand')}
              className={cn(
                'flex flex-col items-center gap-3 rounded-2xl border-2 p-5 transition-all',
                selectedRole === 'brand'
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 bg-white hover:border-gray-300',
              )}
            >
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-xl',
                  selectedRole === 'brand'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-500',
                )}
              >
                <Building2 className="h-6 w-6" />
              </div>
              <span
                className={cn(
                  'text-sm font-semibold',
                  selectedRole === 'brand'
                    ? 'text-purple-700'
                    : 'text-gray-700',
                )}
              >
                I&apos;m a brand
              </span>
            </button>

            <button
              onClick={() => setSelectedRole('creator')}
              className={cn(
                'flex flex-col items-center gap-3 rounded-2xl border-2 p-5 transition-all',
                selectedRole === 'creator'
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 bg-white hover:border-gray-300',
              )}
            >
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-xl',
                  selectedRole === 'creator'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-500',
                )}
              >
                <Palette className="h-6 w-6" />
              </div>
              <span
                className={cn(
                  'text-sm font-semibold',
                  selectedRole === 'creator'
                    ? 'text-purple-700'
                    : 'text-gray-700',
                )}
              >
                I&apos;m a creator
              </span>
            </button>
          </div>

          {/* Auth options (shown after role selection) */}
          {selectedRole && !magicLinkSent && (
            <div className="space-y-4 pt-2">
              <Button
                variant="secondary"
                fullWidth
                size="lg"
                onClick={handleGoogleSignup}
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </Button>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs text-gray-400">or</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              <Input
                label="Email"
                placeholder="you@example.com"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              />

              <Button
                variant="primary"
                fullWidth
                size="lg"
                loading={sending}
                onClick={handleSendMagicLink}
                disabled={!email}
              >
                <Mail className="h-4 w-4" />
                Send magic link
              </Button>
            </div>
          )}

          {/* Magic link confirmation */}
          {magicLinkSent && (
            <div className="space-y-3 pt-2 text-center">
              <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-green-50">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-sm font-semibold text-gray-900">Check your email</p>
              <p className="text-xs text-gray-500">
                We sent a magic link to <strong>{email}</strong>. Click the link to sign in.
              </p>
              <button
                onClick={() => { setMagicLinkSent(false); setEmail(''); }}
                className="text-xs text-purple-600 hover:text-purple-800 underline"
              >
                Use a different email
              </button>
            </div>
          )}
        </Card>

        {/* Terms */}
        <p className="mt-6 text-center text-xs leading-relaxed text-gray-400">
          By signing up, you agree to our{' '}
          <a href="/terms" className="underline hover:text-gray-600">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="underline hover:text-gray-600">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </main>
  );
}
