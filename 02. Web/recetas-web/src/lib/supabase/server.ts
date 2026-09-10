import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { Database } from './types';

// Cliente para Componentes de Servidor, Route Handlers y Server Functions.
// `cookies()` es asíncrono desde Next 15+ (ver AGENTS.md: esta versión de
// Next tiene cambios respecto al entrenamiento — comprobado en
// node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cookies.md).
//
// `set` puede fallar si se llama desde un Server Component puro (solo se
// permite escribir cookies desde Route Handlers / Server Functions); se
// ignora ese error a propósito porque el middleware/proxy ya se encarga de
// refrescar la sesión en cada request.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Llamado desde un Server Component: el proxy.ts se encarga de
            // refrescar la sesión, así que este set() es best-effort.
          }
        },
      },
    },
  );
}
