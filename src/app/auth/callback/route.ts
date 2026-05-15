import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next');
  const role = requestUrl.searchParams.get('role');

  if (code) {
    const redirectUrl = new URL(next || '/dashboard', requestUrl.origin);
    const response = NextResponse.redirect(redirectUrl);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: Record<string, unknown>) {
            response.cookies.set({ name, value, ...options as any });
          },
          remove(name: string, options: Record<string, unknown>) {
            response.cookies.set({ name, value: '', ...options as any });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const userRole = role && (role === 'brand' || role === 'creator') ? role : null;
      if (userRole) {
        await supabase.auth.updateUser({ data: { role: userRole } });

        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (serviceKey) {
          const serviceClient = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceKey,
            {
              cookies: {
                get() { return undefined; },
                set() {},
                remove() {},
              },
            }
          );
          await serviceClient.from('profiles').upsert(
            {
              id: data.user.id,
              role: userRole,
              display_name:
                data.user.user_metadata?.full_name ||
                data.user.email?.split('@')[0] ||
                'User',
              email: data.user.email,
            },
            { onConflict: 'id' }
          );
        }
      }

      return response;
    }

    if (error) {
      console.error('Auth callback error:', error.message, error);
    }
  }

  return NextResponse.redirect(
    new URL('/signup?error=auth_callback_failed', requestUrl.origin)
  );
}
