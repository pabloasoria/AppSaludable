'use client';

import { useState } from 'react';
import type { Recipe } from '@/lib/recipe-types';
import { scaleIngredientText } from '@/lib/recipe-types';
import { RECIPE_IMAGES, RECIPE_DETAIL_HERO_OVERRIDE } from '@/lib/stitch-images';

const DIFFICULTY_STYLES: Record<string, string> = {
  Fácil: 'bg-primary-fixed text-on-primary-fixed',
  Media: 'bg-primary-container text-on-primary-container',
  Difícil: 'bg-primary text-on-primary',
};

const METHOD_ICON: Record<Recipe['method'], string> = {
  AirFryer: 'mode_heat',
  Thermomix: 'cyclone',
};

export function RecipeDetail({ recipe }: { recipe: Recipe }) {
  const [servings, setServings] = useState(recipe.servingsBase);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const factor = servings / recipe.servingsBase;
  const difficultyStyle = DIFFICULTY_STYLES[recipe.difficulty] ?? 'bg-surface-container-high text-on-surface-variant';

  const toggleIngredient = (i: number) => setChecked((prev) => ({ ...prev, [i]: !prev[i] }));
  const heroPhoto = recipe.photoUrl ?? RECIPE_DETAIL_HERO_OVERRIDE[recipe.title] ?? RECIPE_IMAGES[recipe.title];

  return (
    <article>
      {/* Hero */}
      <div className="relative mb-4 flex h-56 flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-container to-tertiary p-5 shadow-md sm:h-64">
        {heroPhoto ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroPhoto} alt={recipe.title} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/85 via-inverse-surface/20 to-transparent" />
          </>
        ) : (
          <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-8xl text-on-primary/10">
            {METHOD_ICON[recipe.method]}
          </span>
        )}
        <div className="relative flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-surface/90 px-3 py-1 text-xs font-semibold text-on-surface shadow-sm backdrop-blur-md">
            <span className="material-symbols-outlined text-[16px] text-secondary">restaurant</span>
            {recipe.mealType}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary-fixed px-3 py-1 text-xs font-semibold text-on-secondary-fixed shadow-sm">
            <span className="material-symbols-outlined text-[16px]">{METHOD_ICON[recipe.method]}</span>
            {recipe.method}
          </span>
        </div>
        <h1 className="relative mt-3 font-serif text-3xl font-semibold leading-tight text-on-primary drop-shadow-sm sm:text-4xl">
          {recipe.title}
        </h1>
      </div>

      {/* Bento metrics */}
      <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-surface-container-lowest p-3 text-center shadow-sm sm:grid-cols-4">
        <div className="flex flex-col items-center justify-center rounded-xl bg-surface-container-low p-2.5">
          <span className="material-symbols-outlined mb-0.5 text-[20px] text-primary">timer</span>
          <span className="font-serif text-lg font-semibold text-on-surface">{recipe.totalTime}</span>
          <span className="text-[11px] text-on-surface-variant">tiempo total</span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl bg-surface-container-low p-2.5">
          <span className="material-symbols-outlined mb-0.5 text-[20px] text-secondary">local_fire_department</span>
          <span className="font-serif text-lg font-semibold text-on-surface">{recipe.nutrition.kcal}</span>
          <span className="text-[11px] text-on-surface-variant">kcal / ración</span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl bg-surface-container-low p-2.5">
          <span className="material-symbols-outlined mb-0.5 text-[20px] text-primary">group</span>
          <span className="font-serif text-lg font-semibold text-on-surface">{servings}</span>
          <span className="text-[11px] text-on-surface-variant">porciones</span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl bg-surface-container-low p-2.5">
          <span className="material-symbols-outlined mb-0.5 text-[20px] text-tertiary">bolt</span>
          <span className="font-serif text-lg font-semibold text-on-surface">{recipe.difficulty}</span>
          <span className="text-[11px] text-on-surface-variant">dificultad</span>
        </div>
      </div>

      {/* Macro strip */}
      <div className="mb-6 flex items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${difficultyStyle}`}>
          {recipe.prepTime} prep · {recipe.cookTime} cocción
        </span>
        <span className="rounded-full bg-surface-container-low px-2.5 py-0.5 text-xs font-semibold text-on-surface-variant">
          {recipe.nutrition.protein}g proteína
        </span>
        <span className="rounded-full bg-surface-container-low px-2.5 py-0.5 text-xs font-semibold text-on-surface-variant">
          {recipe.nutrition.carbs}g carbs
        </span>
        <span className="rounded-full bg-surface-container-low px-2.5 py-0.5 text-xs font-semibold text-on-surface-variant">
          {recipe.nutrition.fat}g grasas
        </span>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,300px)_1fr]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-on-surface">Ingredientes</h2>
            <div className="flex items-center gap-1 rounded-full bg-surface-container p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setServings((s) => Math.max(1, s - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-lowest text-on-surface transition hover:bg-surface-dim active:scale-95"
                aria-label="Menos raciones"
              >
                <span className="material-symbols-outlined text-[18px]">remove</span>
              </button>
              <span className="w-8 text-center font-semibold text-on-surface">{servings}</span>
              <button
                type="button"
                onClick={() => setServings((s) => s + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-lowest text-on-surface transition hover:bg-surface-dim active:scale-95"
                aria-label="Más raciones"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
            </div>
          </div>
          <ul className="space-y-1 rounded-2xl bg-surface-container-lowest p-3 shadow-sm">
            {recipe.ingredients.map((ing, i) => {
              const isChecked = !!checked[i];
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => toggleIngredient(i)}
                    className="flex w-full items-start gap-2.5 rounded-lg py-2 px-1.5 text-left text-sm transition hover:bg-surface-container-low"
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
          <ol className="space-y-3">
            {recipe.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3.5 rounded-2xl bg-surface-container-lowest p-3.5 shadow-sm">
                <span className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full bg-secondary-container text-sm font-semibold text-on-secondary-container">
                  {i + 1}
                </span>
                <span className="pt-0.5 text-sm leading-relaxed text-on-surface-variant">{step}</span>
              </li>
            ))}
          </ol>

          {recipe.ovenAlt && (
            <div className="mt-6 rounded-2xl bg-secondary-fixed p-4 text-sm text-on-secondary-fixed">
              <p className="mb-1 flex items-center gap-1.5 font-semibold">
                <span className="material-symbols-outlined text-[18px]">local_fire_department</span>
                Alternativa en horno convencional
              </p>
              <p>
                <span className="font-semibold">{recipe.ovenAlt.temp}, {recipe.ovenAlt.time}.</span> {recipe.ovenAlt.note}
              </p>
            </div>
          )}

          {recipe.tips && (
            <div className="mt-6 rounded-2xl bg-surface-container-low p-4 text-sm italic text-on-surface-variant">
              {recipe.tips}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
