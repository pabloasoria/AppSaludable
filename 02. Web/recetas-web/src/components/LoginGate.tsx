import Link from 'next/link';

// Bloque vacío reutilizable para las páginas que requieren sesión
// (catálogo, planificador, lista de la compra). El check de sesión vive en
// cada page.tsx (Server Component, vía cookies()), así que cuando no hay
// usuario ni siquiera se llega a pedir los datos a Supabase — no es solo
// una cuestión de UI, se ahorra la consulta.
export function LoginGate({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl bg-surface-container-lowest p-10 text-center shadow-sm">
      <span className="material-symbols-outlined flex h-14 w-14 items-center justify-center rounded-full bg-surface-container text-3xl text-primary">
        skillet
      </span>
      <p className="max-w-xs text-sm text-on-surface-variant">{message}</p>
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary via-primary-container to-secondary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition active:scale-[0.98]"
      >
        Iniciar sesión
        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
      </Link>
      {process.env.NODE_ENV !== 'production' && (
        <a href="/dev-login" className="text-xs font-semibold text-on-surface-variant underline hover:text-secondary">
          🧪 Entrar sin email (solo desarrollo)
        </a>
      )}
    </div>
  );
}
