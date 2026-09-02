'use client';

import { useMemo, useState } from 'react';
import type { Recipe } from '@/lib/recipes';
import { MEAL_TYPES, METHODS } from '@/lib/recipes';
import { RecipeCard } from './RecipeCard';

const LABEL_CLASS = 'mb-1.5 block text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant';
const CONTROL_CLASS =
  'w-full rounded-sm border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none';

export function Catalog({ recipes }: { recipes: Recipe[] }) {
  const [method, setMethod] = useState<string>('Todos');
  const [mealType, setMealType] = useState<string>('Todos');
  const [query, setQuery] = useState('');
  const [maxKcal, setMaxKcal] = useState<number>(500);

  const filtered = useMemo(() => {
    return recipes.filter((r) => {
      if (method !== 'Todos' && r.method !== method) return false;
      if (mealType !== 'Todos' && r.mealType !== mealType) return false;
      if (r.nutrition.kcal > maxKcal) return false;
      if (query.trim() && !r.title.toLowerCase().includes(query.trim().toLowerCase())) return false;
      return true;
    });
  }, [recipes, method, mealType, query, maxKcal]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-4 sm:flex-row sm:items-end sm:flex-wrap">
        <div className="flex-1 min-w-[180px]">
          <label className={LABEL_CLASS}>Buscar</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nombre de la receta…"
            autoComplete="off"
            suppressHydrationWarning
            className={CONTROL_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>Método</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            autoComplete="off"
            suppressHydrationWarning
            className={CONTROL_CLASS}
          >
            <option>Todos</option>
            {METHODS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL_CLASS}>Tipo de comida</label>
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            autoComplete="off"
            suppressHydrationWarning
            className={CONTROL_CLASS}
          >
            <option>Todos</option>
            {MEAL_TYPES.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL_CLASS}>Máx. {maxKcal} kcal</label>
          <input
            type="range"
            min={50}
            max={500}
            step={10}
            value={maxKcal}
            onChange={(e) => setMaxKcal(Number(e.target.value))}
            className="w-40 accent-secondary"
          />
        </div>
      </div>

      <p className="mb-4 text-sm text-on-surface-variant">{filtered.length} recetas</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((r) => (
          <RecipeCard key={r.id} recipe={r} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-10 text-center text-sm text-outline">
          No hay recetas que coincidan con los filtros.
        </p>
      )}
    </div>
  );
}
