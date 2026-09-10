'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { LOGIN_HERO_IMAGE, TESTIMONIAL_AVATAR_IMAGE } from '@/lib/stitch-images';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

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
      <div className="relative mb-4 h-32 overflow-hidden rounded-2xl shadow-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LOGIN_HERO_IMAGE}
          alt="Cocina saludable con AirFryer y Thermomix"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-inverse-surface/10 to-transparent" />
        <span className="absolute bottom-3 left-4 rounded bg-primary px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-on-primary">
          Tu cocina inteligente
        </span>
      </div>

      <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-md sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl font-semibold tracking-tight text-on-surface">Bienvenido de nuevo</h1>
            <p className="mt-1.5 text-sm text-on-surface-variant">
              Sin contraseñas: te enviamos un enlace de acceso a tu email.
            </p>
          </div>
          <span className="material-symbols-outlined flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-container text-2xl text-primary">
            skillet
          </span>
        </div>

        {status === 'sent' ? (
          <div className="flex flex-col items-center gap-2 rounded-xl bg-primary-fixed/40 p-5 text-center text-sm text-on-primary-fixed">
            <span className="material-symbols-outlined text-3xl text-primary">mark_email_read</span>
            Te hemos enviado un enlace a <strong>{email}</strong>. Ábrelo desde este mismo dispositivo para iniciar
            sesión.
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
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-xl bg-surface-container-low p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={TESTIMONIAL_AVATAR_IMAGE} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
        <p className="text-xs italic text-on-surface-variant">
          «Por fin uso la Thermomix y la Airfryer a diario sin pensar qué cenar.»
        </p>
      </div>

      {process.env.NODE_ENV !== 'production' && (
        <a
          href="/dev-login"
          className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-outline-variant py-2.5 text-xs font-semibold text-on-surface-variant transition hover:border-secondary hover:text-secondary"
        >
          🧪 Entrar sin email (solo desarrollo)
        </a>
      )}
    </div>
  );
}
