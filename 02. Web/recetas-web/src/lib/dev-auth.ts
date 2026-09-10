import { cookies } from 'next/headers';

// Bypass de sesión SOLO para desarrollo local. Permite probar el catálogo,
// el planificador y la lista de la compra sin pedir el enlace mágico por
// email en cada prueba. Se activa/desactiva desde /dev-login y /dev-logout
// (ver src/lib/current-user.ts para cómo se combina con la sesión real de
// Supabase).
//
// Nunca se activa en producción: `next build` compila con
// NODE_ENV=production, así que esta comprobación queda "apagada" en el
// bundle de producción aunque alguien consiguiera poner la cookie a mano.
export const DEV_BYPASS_COOKIE = 'dev_bypass_user';

export function isDevEnvironment(): boolean {
  return process.env.NODE_ENV !== 'production';
}

export async function isDevBypassActive(): Promise<boolean> {
  if (!isDevEnvironment()) return false;
  const cookieStore = await cookies();
  return cookieStore.get(DEV_BYPASS_COOKIE)?.value === '1';
}
