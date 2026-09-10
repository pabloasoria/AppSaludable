'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const INPUT_CLASS =
  'h-12 w-full rounded-lg bg-surface-container-low px-4 text-sm text-on-surface placeholder:text-outline focus:bg-surface-container focus:outline-none';

export default function RegistroPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
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
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
      return;
    }
    setStatus('sent');
  };

  return (
    <div className="mx-auto max-w-sm">
      <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-md sm:p-8">
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-on-surface">Crear cuenta</h1>
          <p className="mt-1.5 text-sm text-on-surface-variant">
            Guarda tu planificador y tu lista de la compra, sincronizados entre dispositivos.
          </p>
        </div>

        {status === 'sent' ? (
          <div className="flex flex-col items-center gap-2 rounded-xl bg-primary-fixed/40 p-5 text-center text-sm text-on-primary-fixed">
            <span className="material-symbols-outlined text-3xl text-primary">mark_email_read</span>
            Te hemos enviado un enlace a <strong>{email}</strong> para confirmar tu cuenta. Ábrelo y podrás iniciar
            sesión con tu contraseña.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-[13px] font-semibold text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-primary">mail</span>
                Correo electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                autoComplete="email"
                className={INPUT_CLASS}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-[13px] font-semibold text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-primary">lock</span>
                Contraseña
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                className={INPUT_CLASS}
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
                className={INPUT_CLASS}
              />
            </div>

            {status === 'error' && <p className="text-xs text-error">{errorMsg}</p>}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary via-primary-container to-secondary text-sm font-semibold text-on-primary shadow-sm transition active:scale-[0.98] disabled:opacity-60"
            >
              {status === 'sending' ? 'Creando cuenta…' : 'Crear cuenta'}
              {status !== 'sending' && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-xs text-on-surface-variant">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
