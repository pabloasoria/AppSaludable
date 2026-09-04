'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { DEV_USER_EMAIL, DEV_USER_PASSWORD } from '@/lib/dev-auth';

// Login real (enlace mágico) DESACTIVADO TEMPORALMENTE para desarrollo:
// pon esto en `false` para volver a mostrar el formulario de abajo y dejar
// de usar el usuario fijo `usuario1`. El formulario del enlace mágico no se
// ha tocado — solo se oculta mientras esta constante sea `true`.
const DEV_LOGIN_ENABLED = true;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [devStatus, setDevStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [devError, setDevError] = useState('');

  const handleDevLogin = async () => {
    setDevStatus('loading');
    setDevError('');

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: DEV_USER_EMAIL,
      password: DEV_USER_PASSWORD,
    });

    if (error) {
      setDevStatus('error');
      setDevError(
        `No se pudo iniciar sesión como ${DEV_USER_EMAIL}: ${error.message}. ¿Has ejecutado "node scripts/create-dev-user.js"?`,
      );
      return;
    }

    router.push('/');
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
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
      <h1 className="font-serif text-2xl font-semibold tracking-tight text-on-surface">Iniciar sesión</h1>
      <p className="mt-1.5 text-sm text-on-surface-variant">
        Sin contraseñas: te enviamos un enlace de acceso a tu email. Sirve para guardar tu planificador y tu lista de
        la compra y tenerlos sincronizados entre dispositivos.
      </p>

      {DEV_LOGIN_ENABLED ? (
        <div className="mt-6 rounded-lg border border-secondary/40 bg-secondary-container/15 p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-secondary">Modo desarrollo</p>
          <p className="mt-1.5 text-sm text-on-surface-variant">
            El enlace mágico está desactivado temporalmente. Entra directamente como el usuario de pruebas.
          </p>
          <button
            type="button"
            onClick={handleDevLogin}
            disabled={devStatus === 'loading'}
            className="mt-3 w-full rounded-sm bg-secondary px-4 py-2 text-sm font-semibold text-on-secondary transition hover:opacity-90 disabled:opacity-60"
          >
            {devStatus === 'loading' ? 'Entrando…' : `Entrar como ${DEV_USER_EMAIL}`}
          </button>
          {devStatus === 'error' && <p className="mt-2 text-xs text-error">{devError}</p>}
        </div>
      ) : status === 'sent' ? (
        <div className="mt-6 rounded-lg border border-primary/30 bg-primary-fixed/40 p-4 text-sm text-on-primary-fixed">
          Te hemos enviado un enlace a <strong>{email}</strong>. Ábrelo desde este mismo dispositivo para iniciar
          sesión.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
              className="w-full rounded-sm border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none"
            />
          </div>

          {status === 'error' && <p className="text-xs text-error">{errorMsg}</p>}

          <button
            type="submit"
            disabled={status === 'sending'}
            className="mt-1 rounded-sm bg-secondary px-4 py-2 text-sm font-semibold text-on-secondary transition hover:opacity-90 disabled:opacity-60"
          >
            {status === 'sending' ? 'Enviando…' : 'Enviarme el enlace'}
          </button>
        </form>
      )}
    </div>
  );
}
