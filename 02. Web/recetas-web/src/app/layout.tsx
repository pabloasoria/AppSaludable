import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/current-user';
import { AuthStatus } from '@/components/AuthStatus';
import { LOGO_IMAGE } from '@/lib/stitch-images';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'App de Recetas Saludables',
  description: 'Catálogo de recetas saludables AirFryer y Thermomix, planificador semanal y lista de la compra.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="es" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background text-on-background antialiased" suppressHydrationWarning>
        <header className="sticky top-0 z-50 border-b border-outline-variant/60 bg-surface/80 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <Link href="/" className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={LOGO_IMAGE}
                alt="Logo Sano&Fácil"
                className="h-10 w-10 rounded-full bg-primary object-cover shadow-sm"
              />
              <span className="flex flex-col leading-tight">
                <span className="font-serif text-lg font-semibold tracking-tight text-primary">Sano&amp;Fácil</span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
                  Recetas
                </span>
              </span>
            </Link>
            <nav className="flex items-center gap-1 text-sm font-medium text-on-surface-variant sm:gap-2">
              <Link
                href="/"
                className="rounded-full px-3 py-2 transition hover:bg-surface-container hover:text-primary"
              >
                Catálogo
              </Link>
              <Link
                href="/planificador"
                className="rounded-full px-3 py-2 transition hover:bg-surface-container hover:text-primary"
              >
                Planificador
              </Link>
              <Link
                href="/lista-de-compra"
                className="rounded-full px-3 py-2 transition hover:bg-surface-container hover:text-primary"
              >
                Lista de la compra
              </Link>
              <span className="ml-1 rounded-full px-3 py-2">
                <AuthStatus email={user?.email ?? null} isDevBypass={user?.isDevBypass ?? false} />
              </span>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 py-10 text-xs text-outline sm:px-6">
          Valores nutricionales aproximados. Catálogo, planificador y lista de la compra requieren sesión iniciada;
          tu plan semanal se guarda en tu cuenta y sincroniza entre dispositivos.
        </footer>
      </body>
    </html>
  );
}
