import { createClient } from '@/lib/supabase/server';
import { isDevBypassActive } from '@/lib/dev-auth';

export type CurrentUser = { id: string; email: string | null; isDevBypass: boolean };

// Punto único que usan todas las páginas gateadas (catálogo, planificador,
// lista de la compra, detalle de receta) para saber si hay "sesión". Primero
// comprueba la sesión real de Supabase; si no hay, y estamos en desarrollo
// con el bypass activado (/dev-login), devuelve un usuario falso para saltar
// el gate — ver src/lib/dev-auth.ts.
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) return { id: user.id, email: user.email ?? null, isDevBypass: false };

  if (await isDevBypassActive()) {
    return { id: 'dev-bypass-user', email: 'dev@local (bypass)', isDevBypass: true };
  }

  return null;
}
