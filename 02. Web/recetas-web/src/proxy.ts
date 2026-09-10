import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { NextRequest } from 'next/server';

// NOTA: en Next.js 16 el fichero "middleware.ts" está deprecado y renombrado
// a "proxy.ts" (export `proxy`, no `middleware`) — confirmado en
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md.
// Toda la lógica es la misma que un middleware de Supabase+Next.js clásico:
// refresca el token de sesión en cada request y reescribe las cookies tanto
// en la request entrante como en la response, para que Server Components y
// cliente vean siempre la sesión actualizada.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  // Refresca la sesión si el token de acceso ha caducado.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    // Todas las rutas excepto assets estáticos y de optimización de imagen.
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
