import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import 'server-only';

export const createServerSupabaseClient = () => {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options?: any) {
          // Next.js RequestCookies.set supports (name, value, options)
          // Using the tuple form keeps types happy across versions
          cookieStore.set(name, value, options);
        },
        remove(name: string, _options?: any) {
          // RequestCookies.delete accepts just the name
          cookieStore.delete(name);
        },
      },
    }
  );
};
