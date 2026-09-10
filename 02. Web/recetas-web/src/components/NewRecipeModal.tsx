'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createRecipe, type CreateRecipeState } from '@/app/recetas/actions';
import { MEAL_TYPES, METHODS, type Method } from '@/lib/recipe-types';

const INITIAL_STATE: CreateRecipeState = { ok: false, error: null, id: null };

const INPUT_CLASS =
  'w-full rounded-lg bg-surface-container-low px-3 py-2 text-sm text-on-surface placeholder:text-outline focus:bg-surface-container focus:outline-none';
const LABEL_CLASS = 'mb-1.5 block text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant';

export function NewRecipeModal({ triggerClassName }: { triggerClassName?: string }) {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<Method>('AirFryer');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createRecipe, INITIAL_STATE);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      setPhotoPreview(null);
      setMethod('AirFryer');
      setOpen(false);
      router.refresh();
    }
  }, [state, router]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPhotoPreview(null);
      return;
    }
    setPhotoPreview(URL.createObjectURL(file));
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Añadir receta nueva"
        title="Añadir receta nueva"
        className={
          triggerClassName ??
          'flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-primary via-primary-container to-secondary text-on-primary shadow-sm transition active:scale-[0.98]'
        }
      >
        <span className="material-symbols-outlined text-[24px]">add</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-xl flex-col rounded-2xl bg-surface-container-lowest shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-outline-variant/40 p-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-primary">Nueva receta</p>
                <h2 className="font-serif text-xl font-semibold text-on-surface">Añadir al catálogo</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container-low"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form ref={formRef} action={formAction} className="flex-1 overflow-y-auto p-5">
              <div className="flex flex-col gap-4">
                <div>
                  <label className={LABEL_CLASS}>Título</label>
                  <input name="title" required placeholder="Ej. Pollo al limón con brócoli" className={INPUT_CLASS} />
                </div>

                <div>
                  <label className={LABEL_CLASS}>Foto de portada (opcional)</label>
                  <div className="flex items-center gap-3">
                    {photoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photoPreview} alt="" className="h-16 w-24 rounded-lg object-cover" />
                    ) : (
                      <span className="material-symbols-outlined flex h-16 w-24 items-center justify-center rounded-lg bg-surface-container-low text-2xl text-on-surface-variant">
                        image
                      </span>
                    )}
                    <input
                      type="file"
                      name="photo"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="flex-1 text-xs text-on-surface-variant file:mr-3 file:rounded-lg file:border-0 file:bg-surface-container-low file:px-3 file:py-2 file:text-xs file:font-semibold file:text-primary hover:file:bg-surface-container"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL_CLASS}>Método</label>
                    <div className="grid grid-cols-2 gap-1 rounded-lg bg-surface-container-low p-1">
                      {METHODS.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMethod(m)}
                          className={`rounded-md py-1.5 text-sm font-semibold transition ${
                            method === m ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                    <input type="hidden" name="method" value={method} />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Tipo de comida</label>
                    <select name="mealType" defaultValue={MEAL_TYPES[0]} className={INPUT_CLASS}>
                      {MEAL_TYPES.map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <label className={LABEL_CLASS}>Raciones</label>
                    <input type="number" name="servingsBase" min={1} defaultValue={2} className={INPUT_CLASS} />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Prep.</label>
                    <input name="prepTime" placeholder="10 min" className={INPUT_CLASS} />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Cocción</label>
                    <input name="cookTime" placeholder="15 min" className={INPUT_CLASS} />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Total</label>
                    <input name="totalTime" placeholder="25 min" className={INPUT_CLASS} />
                  </div>
                </div>

                <div>
                  <label className={LABEL_CLASS}>Dificultad</label>
                  <select name="difficulty" defaultValue="Fácil" className={INPUT_CLASS}>
                    <option>Fácil</option>
                    <option>Media</option>
                    <option>Difícil</option>
                  </select>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className={LABEL_CLASS}>Kcal</label>
                    <input type="number" name="kcal" required min={0} className={INPUT_CLASS} />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Prot. (g)</label>
                    <input type="number" name="protein" min={0} className={INPUT_CLASS} />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Carbs (g)</label>
                    <input type="number" name="carbs" min={0} className={INPUT_CLASS} />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Grasas (g)</label>
                    <input type="number" name="fat" min={0} className={INPUT_CLASS} />
                  </div>
                </div>

                <div>
                  <label className={LABEL_CLASS}>Ingredientes (uno por línea)</label>
                  <textarea
                    name="ingredients"
                    required
                    rows={4}
                    placeholder={'400 g de pechuga de pollo\n1 brócoli\n2 cucharadas de aceite de oliva'}
                    className={`${INPUT_CLASS} resize-y`}
                  />
                </div>

                <div>
                  <label className={LABEL_CLASS}>Pasos de elaboración (uno por línea)</label>
                  <textarea
                    name="steps"
                    required
                    rows={4}
                    placeholder={'Corta el pollo en tacos.\nCocina a 190°C durante 15 minutos.'}
                    className={`${INPUT_CLASS} resize-y`}
                  />
                </div>

                <div>
                  <label className={LABEL_CLASS}>Consejo (opcional)</label>
                  <textarea name="tips" rows={2} className={`${INPUT_CLASS} resize-y`} />
                </div>

                <fieldset className="rounded-lg bg-surface-container-low p-3">
                  <legend className="px-1 text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">
                    Alternativa en horno (opcional)
                  </legend>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <input name="ovenTemp" placeholder="200°C" className={INPUT_CLASS} />
                    <input name="ovenTime" placeholder="20 min" className={INPUT_CLASS} />
                  </div>
                  <textarea
                    name="ovenNote"
                    rows={2}
                    placeholder="Notas para hacerla en horno convencional…"
                    className={`${INPUT_CLASS} mt-3 resize-y`}
                  />
                </fieldset>

                {state.error && <p className="text-sm text-error">{state.error}</p>}
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 border-t border-outline-variant/40 pt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-on-surface-variant transition hover:bg-surface-container-low"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary via-primary-container to-secondary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition active:scale-[0.98] disabled:opacity-60"
                >
                  {pending ? 'Guardando…' : 'Guardar receta'}
                  {!pending && <span className="material-symbols-outlined text-[18px]">check</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
