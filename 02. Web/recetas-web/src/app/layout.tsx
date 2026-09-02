import type { Metadata } from 'next';
import { EB_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-eb-garamond',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'App de Recetas Saludables',
  description: 'Catálogo de recetas saludables AirFryer y Thermomix, planificador semanal y lista de la compra.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${ebGaramond.variable} ${plusJakartaSans.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-on-background antialiased" suppressHydrationWarning>
        <header className="border-b border-outline-variant bg-surface-container-lowest">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
            <Link href="/" className="font-serif text-xl font-semibold tracking-tight text-primary">
              🥗 App de Recetas
            </Link>
            <nav className="flex items-center gap-6 text-sm font-medium text-on-surface-variant">
              <Link href="/" className="transition hover:text-primary">Catálogo</Link>
              <span className="cursor-not-allowed text-outline-variant" title="Próximamente">Planificador</span>
              <span className="cursor-not-allowed text-outline-variant" title="Próximamente">Lista de la compra</span>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 py-10 text-xs text-outline sm:px-6">
          Valores nutricionales aproximados. Esqueleto v0 — datos locales, pendiente de conectar a base de datos.
        </footer>
      </body>
    </html>
  );
}
