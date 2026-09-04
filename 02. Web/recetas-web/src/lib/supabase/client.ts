'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

// Cliente para Componentes de Cliente ('use client'): sesión de auth,
// lecturas/escrituras de favoritos y planificador desde el navegador.
// Las variables NEXT_PUBLIC_* son seguras de exponer: la clave "anon" solo
// permite lo que las políticas de Row Level Security dejan hacer.
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
