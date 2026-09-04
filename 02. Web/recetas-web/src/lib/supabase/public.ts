import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Cliente "público": sin cookies ni sesión, solo la clave anon. Para el
// catálogo de recetas — mismo contenido para cualquier visitante, esté o
// no autenticado (política RLS "Catálogo visible para todos", recipes.ts).
//
// A propósito NO usa el cliente de './server' (que depende de cookies()):
// generateStaticParams se ejecuta en build time, sin request ni cookies
// disponibles, y usar cookies() ahí rompe el build ("used cookies() inside
// generateStaticParams... not supported"). Nunca uses este cliente para
// tablas con RLS por usuario (favorites, weekly_plans) — esas requieren el
// cliente de servidor con cookies o el de navegador.
export function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
