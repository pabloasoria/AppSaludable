import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { DEV_BYPASS_COOKIE, isDevEnvironment } from '@/lib/dev-auth';
import type { NextRequest } from 'next/server';

// Activa el bypass de sesión para pruebas locales. Bloqueado fuera de
// desarrollo: en un build de producción esta ruta responde 404 igual que si
// no existiera.
export async function GET(request: NextRequest) {
  if (!isDevEnvironment()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const cookieStore = await cookies();
  cookieStore.set(DEV_BYPASS_COOKIE, '1', { httpOnly: true, sameSite: 'lax', path: '/' });

  const { origin, searchParams } = new URL(request.url);
  const next = searchParams.get('next') ?? '/';
  return NextResponse.redirect(`${origin}${next}`);
}
