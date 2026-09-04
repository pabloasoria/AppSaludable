'use client';

import { useActionState, useEffect, useRef } from 'react';
import { deleteRecipe, type DeleteRecipeState } from '@/app/recetas/actions';

const INITIAL_STATE: DeleteRecipeState = { error: null };

// Solo se renderiza cuando recipe.isCustom es true (ver
// src/app/recetas/[id]/page.tsx) — las 80 recetas originales del catálogo no
// muestran este botón. deleteRecipe() vuelve a comprobar is_custom en el
// servidor antes de borrar, así que ocultar el botón es solo UX, no la única
// barrera de seguridad.
export function DeleteRecipeButton({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState(deleteRecipe, INITIAL_STATE);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.error) window.alert(state.error);
  }, [state.error]);

  const handleSubmit = (e: React.FormEvent) => {
    if (!window.confirm('¿Eliminar esta receta? Esta acción no se puede deshacer.')) {
      e.preventDefault();
    }
  };

  return (
    <form ref={formRef} action={formAction} onSubmit={handleSubmit}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-error transition hover:bg-error-container disabled:opacity-60"
      >
        <span className="material-symbols-outlined text-[18px]">delete</span>
        {pending ? 'Eliminando…' : 'Eliminar receta'}
      </button>
    </form>
  );
}
