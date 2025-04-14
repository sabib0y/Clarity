import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  // Create a server-side Supabase client with cookies
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // NOTE: `set` and `remove` are intentionally omitted here.
        // This client is intended for use in Server Components where cookie
        // modification is not possible. For Server Actions or Route Handlers,
        // a different client instance should be created passing the full
        // cookie methods available in those contexts.
      },
    }
  );
}
