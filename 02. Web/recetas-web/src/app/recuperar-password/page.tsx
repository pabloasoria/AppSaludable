'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function RecuperarPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');

    const supabase = createClient();
    // El código PKCE que llega por email pasa por /auth/callback (misma
    // ruta que el resto de flujos de auth) y de ahí a
    // /restablecer-password, ya con la sesión de recuperación activa.
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/restablecer-password`,
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
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-on-surface">Recuperar contraseña</h1>
          <p className="mt-1.5 text-sm text-on-surface-variant">
            Te enviamos un enlace para fijar una contraseña nueva — también sirve si es la primera vez que la
            configuras.
          </p>
        </div>

        {status === 'sent' ? (
          <div className="flex flex-col items-center gap-2 rounded-xl bg-primary-fixed/40 p-5 text-center text-sm text-on-primary-fixed">
            <span className="material-symbols-outlined text-3xl text-primary">mark_email_read</span>
            Si <strong>{email}</strong> tiene una cuenta, te hemos enviado un enlace. Ábrelo desde este dispositivo
            para fijar la nueva contraseña.
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
                className="h-12 w-full rounded-lg bg-surface-container-low px-4 text-sm text-on-surface placeholder:text-outline focus:bg-surface-container focus:outline-none"
              />
            </div>

            {status === 'error' && <p className="text-xs text-error">{errorMsg}</p>}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary via-primary-container to-secondary text-sm font-semibold text-on-primary shadow-sm transition active:scale-[0.98] disabled:opacity-60"
            >
              {status === 'sending' ? 'Enviando…' : 'Enviarme el enlace'}
              {status !== 'sending' && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-xs text-on-surface-variant">
          <Link href="/login" className="font-semibold text-primary hover:underline">
            ← Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
