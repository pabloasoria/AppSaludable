import Link from 'next/link';
import type { Recipe } from '@/lib/recipe-types';
import { RECIPE_IMAGES } from '@/lib/stitch-images';
import { DeleteRecipeIconButton } from './DeleteRecipeIconButton';

const METHOD_ICON: Record<Recipe['method'], string> = {
  AirFryer: 'mode_heat',
  Thermomix: 'cyclone',
};

const METHOD_BADGE_STYLES: Record<Recipe['method'], string> = {
  AirFryer: 'bg-secondary-fixed text-on-secondary-fixed',
  Thermomix: 'bg-tertiary-fixed text-on-tertiary-fixed',
};

const METHOD_ICON_COLOR: Record<Recipe['method'], string> = {
  AirFryer: 'text-secondary',
  Thermomix: 'text-tertiary',
};

const DIFFICULTY_STYLES: Record<string, string> = {
  Fácil: 'bg-primary-fixed text-on-primary-fixed',
  Media: 'bg-primary-container text-on-primary-container',
  Difícil: 'bg-primary text-on-primary',
};

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const difficultyStyle = DIFFICULTY_STYLES[recipe.difficulty] ?? 'bg-surface-container-high text-on-surface-variant';
  const photo = recipe.photoUrl ?? RECIPE_IMAGES[recipe.title];

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm transition hover:shadow-md">
      {recipe.isCustom && <DeleteRecipeIconButton id={recipe.id} />}
      <Link href={`/recetas/${recipe.id}`} className="flex flex-1 flex-col">
        <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-primary via-primary-container to-tertiary">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              alt={recipe.title}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-6xl text-on-primary/25 transition duration-300 group-hover:scale-105">
              {METHOD_ICON[recipe.method]}
            </span>
          )}
          <span
            className={`absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-sm ${METHOD_BADGE_STYLES[recipe.method]}`}
          >
            <span className={`material-symbols-outlined text-[14px] ${METHOD_ICON_COLOR[recipe.method]}`}>
              {METHOD_ICON[recipe.method]}
            </span>
            {recipe.method}
          </span>
          <span className="absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded-lg bg-inverse-surface/80 px-2.5 py-1 text-[11px] font-semibold text-inverse-on-surface backdrop-blur-sm">
            <span className="material-symbols-outlined text-[14px]">timer</span>
            {recipe.totalTime}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-4">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em]">
            <span className="text-primary">{recipe.mealType}</span>
            <span className="h-1 w-1 rounded-full bg-outline-variant" />
            <span className="font-semibold text-on-surface-variant normal-case tracking-normal">
              {recipe.nutrition.kcal} kcal
            </span>
          </div>
          <h3 className="font-serif text-lg font-semibold leading-snug text-on-surface group-hover:text-primary">
            {recipe.title}
          </h3>
          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${difficultyStyle}`}>
              {recipe.difficulty}
            </span>
            <span className="flex items-center gap-1.5 rounded-xl bg-primary-container px-3 py-1.5 text-xs font-semibold text-on-primary shadow-sm transition group-hover:bg-primary">
              Ver receta
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
