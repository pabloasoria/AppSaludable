import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { DEV_BYPASS_COOKIE } from '@/lib/dev-auth';
import type { NextRequest } from 'next/server';

// Desactiva el bypass de sesión de desarrollo (ver /dev-login). Se puede
// llamar aunque no esté en modo desarrollo — simplemente borra la cookie si
// existiera, sin riesgo.
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete(DEV_BYPASS_COOKIE);

  const { origin, searchParams } = new URL(request.url);
  const next = searchParams.get('next') ?? '/';
  return NextResponse.redirect(`${origin}${next}`);
}
