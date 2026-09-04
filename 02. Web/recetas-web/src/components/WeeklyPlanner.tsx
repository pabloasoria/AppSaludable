'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { Recipe } from '@/lib/recipe-types';
import { DAYS, SLOTS, TOTAL_SLOTS, cellKey, type SlotKey, type PlanState } from '@/lib/planner';
import { usePlan } from '@/lib/usePlan';

export function WeeklyPlanner({ recipes }: { recipes: Recipe[] }) {
  const { plan, setPlan, isLoggedIn } = usePlan();
  const [picker, setPicker] = useState<{ day: string; slot: SlotKey } | null>(null);

  const recipesById = useMemo(() => {
    const map = new Map<string, Recipe>();
    recipes.forEach((r) => map.set(r.id, r));
    return map;
  }, [recipes]);

  const assignedCount = Object.values(plan).filter(Boolean).length;

  const assign = (day: string, slot: SlotKey, recipeId: string | null) => {
    setPlan((prev) => {
      const next = { ...prev };
      if (recipeId) next[cellKey(day, slot)] = recipeId;
      else delete next[cellKey(day, slot)];
      return next;
    });
    setPicker(null);
  };

  const clearWeek = () => {
    if (assignedCount === 0) return;
    if (window.confirm('¿Vaciar todo el plan de la semana? Esta acción no se puede deshacer.')) {
      setPlan({});
    }
  };

  // Rellena las 28 celdas con una receta aleatoria del tipo de comida
  // correspondiente. El icono de cambiar sigue disponible en cada celda
  // después de generar, para ajustar manualmente cualquier receta.
  const generateWeek = () => {
    if (
      assignedCount > 0 &&
      !window.confirm('Esto sustituirá las recetas ya asignadas por una selección aleatoria. ¿Continuar?')
    ) {
      return;
    }

    const next: PlanState = {};
    DAYS.forEach((day) => {
      SLOTS.forEach((slot) => {
        const candidates = recipes.filter((r) => slot.mealTypes.includes(r.mealType));
        if (candidates.length === 0) return;
        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        next[cellKey(day, slot.key)] = pick.id;
      });
    });
    setPlan(next);
  };

  // Sustituye SOLO la receta de una celda por otra aleatoria del mismo tipo
  // de comida (desayuno/comida/merienda-snack/cena, según la fila). Si hay
  // más de una receta candidata, se excluye la actual para que el dado
  // siempre cambie algo visible.
  const randomizeCell = (day: string, slot: SlotKey) => {
    const slotDef = SLOTS.find((s) => s.key === slot)!;
    const currentId = plan[cellKey(day, slot)];
    const candidates = recipes.filter((r) => slotDef.mealTypes.includes(r.mealType));
    if (candidates.length === 0) return;
    const pool = candidates.length > 1 ? candidates.filter((r) => r.id !== currentId) : candidates;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    assign(day, slot, pick.id);
  };

  const activeSlot = picker ? SLOTS.find((s) => s.key === picker.slot)! : null;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-on-surface-variant">
          {assignedCount} de {TOTAL_SLOTS} comidas planificadas
          {isLoggedIn ? (
            <span className="ml-2 text-xs text-primary">· sincronizado con tu cuenta</span>
          ) : (
            <span className="ml-2 text-xs text-outline">
              · guardado solo en este navegador —{' '}
              <Link href="/login" className="underline hover:text-primary">
                inicia sesión para sincronizar
              </Link>
            </span>
          )}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={generateWeek}
            className="flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-1.5 text-xs font-semibold text-on-secondary shadow-sm transition active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
            Generar semana
          </button>
          <button
            type="button"
            onClick={clearWeek}
            className="rounded-xl bg-surface-container-low px-3 py-1.5 text-xs font-semibold text-on-surface-variant transition hover:bg-error-container hover:text-on-error-container"
          >
            Vaciar semana
          </button>
        </div>
      </div>

      {/* Se rompe el ancho máximo de la página (max-w-6xl del layout) solo
          para esta cuadrícula, así caben las 7 columnas + etiquetas sin
          scroll horizontal en pantallas de escritorio habituales. En móvil
          sigue habiendo overflow-x-auto como red de seguridad. */}
      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1500px] overflow-x-auto rounded-2xl bg-surface-container-lowest shadow-sm">
          <div className="grid min-w-[1020px]" style={{ gridTemplateColumns: '110px repeat(7, minmax(130px, 1fr))' }}>
            <div className="sticky left-0 z-10 border-b border-r border-outline-variant/60 bg-surface-container-low" />
          {DAYS.map((day) => (
            <div
              key={day}
              className="border-b border-outline-variant/60 px-3 py-3 text-center text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant"
            >
              {day}
            </div>
          ))}

          {SLOTS.map((slot) => (
            <Fragment key={slot.key}>
              <div className="sticky left-0 z-10 flex items-center border-b border-r border-outline-variant/60 bg-surface-container-low px-3 py-3 font-serif text-sm font-semibold text-on-surface">
                {slot.label}
              </div>
              {DAYS.map((day) => {
                const recipeId = plan[cellKey(day, slot.key)];
                const recipe = recipeId ? recipesById.get(recipeId) : undefined;
                return (
                  <PlannerCell
                    key={day}
                    recipe={recipe}
                    onEdit={() => setPicker({ day, slot: slot.key })}
                    onRandomize={() => randomizeCell(day, slot.key)}
                  />
                );
              })}
            </Fragment>
          ))}
          </div>
        </div>
      </div>

      {picker && activeSlot && (
        <RecipePicker
          day={picker.day}
          slotLabel={activeSlot.label}
          candidates={recipes.filter((r) => activeSlot.mealTypes.includes(r.mealType))}
          current={plan[cellKey(picker.day, picker.slot)]}
          onPick={(id) => assign(picker.day, picker.slot, id)}
          onClose={() => setPicker(null)}
        />
      )}
    </div>
  );
}

function PlannerCell({
  recipe,
  onEdit,
  onRandomize,
}: {
  recipe?: Recipe;
  onEdit: () => void;
  onRandomize: () => void;
}) {
  return (
    <div className="relative min-h-[92px] border-b border-l border-outline-variant/40 p-2">
      {recipe ? (
        <Link href={`/recetas/${recipe.id}`} className="block rounded-sm p-1.5 pb-6 transition hover:bg-surface-container-low">
          <span className="mb-1 inline-block rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-primary">
            {recipe.method}
          </span>
          <p className="line-clamp-2 font-serif text-sm font-semibold leading-snug text-on-surface">{recipe.title}</p>
          <p className="mt-1 text-[11px] text-on-surface-variant">
            {recipe.totalTime} · {recipe.nutrition.kcal} kcal
          </p>
        </Link>
      ) : (
        <p className="p-1.5 pb-6 text-xs italic text-outline">Sin asignar</p>
      )}

      <button
        type="button"
        onClick={onRandomize}
        aria-label={recipe ? 'Elegir otra al azar' : 'Asignar receta al azar'}
        title={recipe ? 'Elegir otra al azar' : 'Asignar receta al azar'}
        className="absolute bottom-2 left-2 flex h-6 w-6 items-center justify-center rounded-full border border-outline-variant bg-surface-container-lowest text-on-surface-variant shadow-sm transition hover:border-secondary hover:bg-secondary hover:text-on-secondary"
      >
        <DiceIcon />
      </button>

      <button
        type="button"
        onClick={onEdit}
        aria-label={recipe ? 'Cambiar receta' : 'Añadir receta'}
        title={recipe ? 'Cambiar receta' : 'Añadir receta'}
        className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full border border-outline-variant bg-surface-container-lowest text-on-surface-variant shadow-sm transition hover:border-primary hover:bg-primary hover:text-on-primary"
      >
        <SwapIcon />
      </button>
    </div>
  );
}

function SwapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="M17 3l4 4-4 4" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <path d="M7 21l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

function DiceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <circle cx="8.5" cy="8.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="8.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="15.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="15.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function RecipePicker({
  day,
  slotLabel,
  candidates,
  current,
  onPick,
  onClose,
}: {
  day: string;
  slotLabel: string;
  candidates: Recipe[];
  current: string | undefined;
  onPick: (id: string | null) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [method, setMethod] = useState<'Todos' | Recipe['method']>('Todos');

  const filtered = useMemo(() => {
    return candidates.filter((r) => {
      if (method !== 'Todos' && r.method !== method) return false;
      if (query.trim() && !r.title.toLowerCase().includes(query.trim().toLowerCase())) return false;
      return true;
    });
  }, [candidates, query, method]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/10 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-lg bg-surface-container-lowest shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-outline-variant/60 p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-secondary">
            {day} · {slotLabel}
          </p>
          <h3 className="mt-0.5 font-serif text-lg font-semibold text-on-surface">Elegir receta</h3>
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar…"
              autoFocus
              autoComplete="off"
              className="flex-1 rounded-sm border border-outline-variant bg-surface px-3 py-1.5 text-sm text-on-surface focus:border-primary focus:outline-none"
            />
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as 'Todos' | Recipe['method'])}
              className="rounded-sm border border-outline-variant bg-surface px-2 py-1.5 text-sm text-on-surface focus:border-primary focus:outline-none"
            >
              <option>Todos</option>
              <option value="AirFryer">AirFryer</option>
              <option value="Thermomix">Thermomix</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {filtered.length === 0 && <p className="p-4 text-center text-sm text-outline">Sin resultados.</p>}
          {filtered.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onPick(r.id)}
              className={`flex w-full items-center justify-between gap-3 rounded-sm px-3 py-2.5 text-left text-sm transition hover:bg-surface-container-low ${
                r.id === current ? 'bg-primary-fixed/40' : ''
              }`}
            >
              <span>
                <span className="mr-2 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-primary">
                  {r.method}
                </span>
                <span className="font-medium text-on-surface">{r.title}</span>
              </span>
              <span className="flex-none text-xs text-on-surface-variant">{r.nutrition.kcal} kcal</span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-outline-variant/60 p-3">
          <button
            type="button"
            onClick={() => onPick(null)}
            disabled={!current}
            className="text-xs font-semibold text-error disabled:cursor-not-allowed disabled:text-outline"
          >
            Quitar receta de esta celda
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm border border-outline-variant px-3 py-1.5 text-xs font-semibold text-on-surface-variant hover:border-primary hover:text-primary"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
