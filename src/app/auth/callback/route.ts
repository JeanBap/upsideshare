import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next');
  const role = requestUrl.searchParams.get('role');

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: Record<string, unknown>) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch {
              // Ignored in Server Component context
            }
          },
          remove(name: string, options: Record<string, unknown>) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch {
              // Ignored in Server Component context
            }
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const userRole = role && (role === 'brand' || role === 'creator') ? role : null;

      if (userRole) {
        await supabase.auth.updateUser({
          data: { role: userRole },
        });

        // Update profile role via service client
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

          await serviceClient
            .from('profiles')
            .upsert({
              id: data.user.id,
              role: userRole,
              display_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
              email: data.user.email,
            }, { onConflict: 'id' });
        }
      }

      // Determine redirect: explicit next param, or role-based dashboard
      const finalRole = userRole || data.user.user_metadata?.role || 'creator';
      const defaultRedirect = finalRole === 'brand' ? '/dashboard' : '/dashboard';
      const redirectPath = next || defaultRedirect;

      return NextResponse.redirect(new URL(redirectPath, requestUrl.origin));
    }

    if (error) {
      console.error('Auth callback error:', error.message);
    }
  }

  return NextResponse.redirect(
    new URL('/signup?error=auth_callback_failed', requestUrl.origin)
  );
}
