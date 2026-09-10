'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export function AuthStatus({ email, isDevBypass }: { email: string | null; isDevBypass: boolean }) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  const handleDevLogout = () => {
    window.location.href = '/dev-logout';
  };

  if (!email) {
    return (
      <Link href="/login" className="transition hover:text-primary">
        Iniciar sesión
      </Link>
    );
  }

  if (isDevBypass) {
    return (
      <span className="flex items-center gap-3">
        <span className="hidden rounded-full bg-secondary-fixed px-2 py-0.5 text-[11px] font-bold text-on-secondary-fixed sm:inline">
          🧪 modo dev
        </span>
        <button type="button" onClick={handleDevLogout} className="transition hover:text-primary">
          Salir del bypass
        </button>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-3">
      <Link href="/cuenta" className="hidden text-xs text-outline transition hover:text-primary sm:inline">
        {email}
      </Link>
      <button type="button" onClick={handleSignOut} className="transition hover:text-primary">
        Cerrar sesión
      </button>
    </span>
  );
}
