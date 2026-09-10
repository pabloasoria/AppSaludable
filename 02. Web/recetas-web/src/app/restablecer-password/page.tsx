'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// Se llega aquí solo tras pulsar el enlace de /recuperar-password, que ya
// canjeó el código en /auth/callback y dejó una sesión de recuperación
// activa (supabase.auth.updateUser funciona con esa sesión sin pedir la
// contraseña anterior — así es como Supabase permite fijar la primera
// contraseña a una cuenta que antes solo usaba enlace mágico).
export default function RestablecerPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 8) {
      setStatus('error');
      setErrorMsg('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setStatus('error');
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    setStatus('sending');
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus('error');
      setErrorMsg(
        error.message === 'Auth session missing!'
          ? 'Este enlace ha caducado o ya se usó. Pide uno nuevo desde «Recuperar contraseña».'
          : error.message,
      );
      return;
    }
    router.push('/');
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-sm">
      <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-md sm:p-8">
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-on-surface">Nueva contraseña</h1>
          <p className="mt-1.5 text-sm text-on-surface-variant">Elige la contraseña que usarás a partir de ahora.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-[13px] font-semibold text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-primary">lock</span>
              Contraseña nueva
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              className="h-12 w-full rounded-lg bg-surface-container-low px-4 text-sm text-on-surface placeholder:text-outline focus:bg-surface-container focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-[13px] font-semibold text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-primary">lock</span>
              Repite la contraseña
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              className="h-12 w-full rounded-lg bg-surface-container-low px-4 text-sm text-on-surface placeholder:text-outline focus:bg-surface-container focus:outline-none"
            />
          </div>

          {status === 'error' && (
            <p className="text-xs text-error">
              {errorMsg}{' '}
              <Link href="/recuperar-password" className="underline">
                Pedir enlace nuevo
              </Link>
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'sending'}
            className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary via-primary-container to-secondary text-sm font-semibold text-on-primary shadow-sm transition active:scale-[0.98] disabled:opacity-60"
          >
            {status === 'sending' ? 'Guardando…' : 'Guardar contraseña'}
            {status !== 'sending' && <span className="material-symbols-outlined text-[18px]">check</span>}
          </button>
        </form>
      </div>
    </div>
  );
}
