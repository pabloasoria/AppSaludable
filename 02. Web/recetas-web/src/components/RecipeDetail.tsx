'use client';

import { useState } from 'react';
import type { Recipe } from '@/lib/recipes';
import { scaleIngredientText } from '@/lib/recipes';

const DIFFICULTY_STYLES: Record<string, string> = {
  Fácil: 'bg-primary-fixed text-on-primary-fixed',
  Media: 'bg-primary-container text-on-primary-container',
  Difícil: 'bg-primary text-on-primary',
};

export function RecipeDetail({ recipe }: { recipe: Recipe }) {
  const [servings, setServings] = useState(recipe.servingsBase);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const factor = servings / recipe.servingsBase;
  const difficultyStyle = DIFFICULTY_STYLES[recipe.difficulty] ?? 'bg-surface-container-high text-on-surface-variant';

  const toggleIngredient = (i: number) => setChecked((prev) => ({ ...prev, [i]: !prev[i] }));

  return (
    <article>
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-on-primary">
          {recipe.method}
        </span>
        <span className="rounded-full bg-surface-container-high px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">
          {recipe.mealType}
        </span>
      </div>

      <h1 className="mb-6 font-serif text-4xl font-semibold tracking-tight text-on-surface">{recipe.title}</h1>

      <dl className="mb-8 grid grid-cols-2 gap-4 rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-4 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Preparación</dt>
          <dd className="mt-1 font-medium text-on-surface">{recipe.prepTime}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Cocción</dt>
          <dd className="mt-1 font-medium text-on-surface">{recipe.cookTime}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Tiempo total</dt>
          <dd className="mt-1 font-medium text-on-surface">{recipe.totalTime}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Dificultad</dt>
          <dd className="mt-1">
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${difficultyStyle}`}>
              {recipe.difficulty}
            </span>
          </dd>
        </div>
      </dl>

      <div className="mb-8 grid grid-cols-4 divide-x divide-primary-container/40 rounded-lg bg-primary p-4 text-center text-on-primary">
        <div>
          <div className="text-lg font-semibold">{recipe.nutrition.kcal}</div>
          <div className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-on-primary-container">kcal / ración</div>
        </div>
        <div>
          <div className="text-lg font-semibold">{recipe.nutrition.protein} g</div>
          <div className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-on-primary-container">proteínas</div>
        </div>
        <div>
          <div className="text-lg font-semibold">{recipe.nutrition.carbs} g</div>
          <div className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-on-primary-container">carbohidratos</div>
        </div>
        <div>
          <div className="text-lg font-semibold">{recipe.nutrition.fat} g</div>
          <div className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-on-primary-container">grasas</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,280px)_1fr]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-on-surface">Ingredientes</h2>
            <div className="flex items-center gap-2 text-sm">
              <button
                type="button"
                onClick={() => setServings((s) => Math.max(1, s - 1))}
                className="h-7 w-7 rounded-full border border-outline-variant text-on-surface-variant transition hover:border-primary hover:text-primary"
                aria-label="Menos raciones"
              >
                −
              </button>
              <span className="w-16 text-center font-medium text-on-surface">{servings} rac.</span>
              <button
                type="button"
                onClick={() => setServings((s) => s + 1)}
                className="h-7 w-7 rounded-full border border-outline-variant text-on-surface-variant transition hover:border-primary hover:text-primary"
                aria-label="Más raciones"
              >
                +
              </button>
            </div>
          </div>
          <ul className="space-y-1">
            {recipe.ingredients.map((ing, i) => {
              const isChecked = !!checked[i];
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => toggleIngredient(i)}
                    className="flex w-full items-start gap-2.5 rounded-sm py-1.5 text-left text-sm transition hover:bg-surface-container-low"
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full border text-[11px] leading-none transition ${
                        isChecked
                          ? 'border-primary bg-primary text-on-primary'
                          : 'border-outline-variant'
                      }`}
                    >
                      {isChecked ? '✓' : ''}
                    </span>
                    <span className={isChecked ? 'text-on-surface-variant line-through opacity-50' : 'text-on-surface'}>
                      {scaleIngredientText(ing, factor)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {factor !== 1 && (
            <p className="mt-3 text-xs text-outline">
              Cantidades ajustadas automáticamente ×{factor.toFixed(2).replace(/\.00$/, '')}. Revisa los ajustes en recetas con pasos muy dependientes de una cantidad exacta.
            </p>
          )}
        </div>

        <div>
          <h2 className="mb-4 font-serif text-lg font-semibold text-on-surface">Elaboración</h2>
          <ol className="space-y-6">
            {recipe.steps.map((step, i) => (
              <li key={i} className="relative pl-10">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-2 left-0 select-none font-serif text-5xl font-semibold text-primary/10"
                >
                  {i + 1}
                </span>
                <span className="relative block pt-2 text-sm leading-relaxed text-on-surface">{step}</span>
              </li>
            ))}
          </ol>

          {recipe.ovenAlt && (
            <div className="mt-6 rounded-lg border border-secondary-container bg-secondary-container/15 p-4 text-sm text-on-secondary-container">
              <p className="mb-1 font-semibold">🔥 Alternativa en horno convencional</p>
              <p>
                <span className="font-semibold">{recipe.ovenAlt.temp}, {recipe.ovenAlt.time}.</span> {recipe.ovenAlt.note}
              </p>
            </div>
          )}

          {recipe.tips && (
            <div className="mt-8 rounded-lg border-l-4 border-primary-container bg-surface-container-low p-4 text-sm italic text-on-surface-variant">
              {recipe.tips}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
