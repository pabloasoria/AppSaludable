'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function ChangePasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setStatus('idle');

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
      setErrorMsg(error.message);
      return;
    }
    setPassword('');
    setConfirmPassword('');
    setStatus('done');
  };

  return (
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

      {status === 'error' && <p className="text-xs text-error">{errorMsg}</p>}
      {status === 'done' && <p className="text-xs font-semibold text-primary">Contraseña actualizada.</p>}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary via-primary-container to-secondary text-sm font-semibold text-on-primary shadow-sm transition active:scale-[0.98] disabled:opacity-60 sm:w-auto sm:px-6"
      >
        {status === 'sending' ? 'Guardando…' : 'Guardar contraseña'}
      </button>
    </form>
  );
}
