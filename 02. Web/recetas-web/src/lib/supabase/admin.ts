import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Cliente con la clave "service_role": salta Row Level Security por
// completo. SOLO se usa desde Server Actions / Route Handlers, y SOLO tras
// comprobar getCurrentUser() a mano (ver src/app/recetas/nueva/actions.ts) —
// este cliente no respeta ninguna política de supabase/schema.sql, así que
// la comprobación de "hay sesión" vive en el código de la app, no en la BD.
// Nunca lo importes desde un Componente de Cliente ni expongas la clave al
// navegador.
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      'Falta SUPABASE_SERVICE_ROLE_KEY en .env.local (Supabase → Project Settings → API → service_role secret).',
    );
  }
  return createSupabaseClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, key);
}
