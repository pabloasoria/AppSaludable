'use client';

import { useActionState, useEffect } from 'react';
import { deleteRecipe, type DeleteRecipeState } from '@/app/recetas/actions';

const INITIAL_STATE: DeleteRecipeState = { error: null };

// Versión compacta de DeleteRecipeButton para usar sobre la miniatura de la
// tarjeta del catálogo (ver RecipeCard) — mismo guard de servidor
// (is_custom) y misma confirmación, sin tener que entrar al detalle.
// Se renderiza como hermano del <Link> de la tarjeta, nunca anidado dentro,
// porque un <form>/<button> dentro de un <a> es HTML inválido y complica
// distinguir "click para abrir" de "click para borrar".
export function DeleteRecipeIconButton({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState(deleteRecipe, INITIAL_STATE);

  useEffect(() => {
    if (state.error) window.alert(state.error);
  }, [state.error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.stopPropagation();
    if (!window.confirm('¿Eliminar esta receta? Esta acción no se puede deshacer.')) {
      e.preventDefault();
    }
  };

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      onClick={(e) => e.stopPropagation()}
      className="absolute left-2.5 top-2.5 z-10"
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        aria-label="Eliminar receta"
        title="Eliminar receta"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-lowest/90 text-error shadow-sm backdrop-blur-sm transition hover:bg-error hover:text-on-error disabled:opacity-60"
      >
        <span className="material-symbols-outlined text-[18px]">{pending ? 'hourglass_top' : 'delete'}</span>
      </button>
    </form>
  );
}
