import Link from 'next/link';
import type { Recipe } from '@/lib/recipes';

const METHOD_ICON: Record<Recipe['method'], string> = {
  AirFryer: '🌀',
  Thermomix: '🍲',
};

const DIFFICULTY_STYLES: Record<string, string> = {
  Fácil: 'bg-primary-fixed text-on-primary-fixed',
  Media: 'bg-primary-container text-on-primary-container',
  Difícil: 'bg-primary text-on-primary',
};

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const difficultyStyle = DIFFICULTY_STYLES[recipe.difficulty] ?? 'bg-surface-container-high text-on-surface-variant';

  return (
    <Link
      href={`/recetas/${recipe.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-outline-variant/60 bg-surface-container-lowest shadow-[0_20px_40px_-34px_rgba(22,52,34,0.6)] transition hover:shadow-[0_24px_48px_-28px_rgba(22,52,34,0.5)]"
    >
      {/* Placeholder visual — sin fotografía real todavía; ver nota de diseño */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-primary to-primary-container">
        <span className="absolute inset-0 flex items-center justify-center text-5xl opacity-25 transition duration-300 group-hover:scale-105">
          {METHOD_ICON[recipe.method]}
        </span>
        <span className="absolute left-3 top-3 rounded-full bg-on-primary/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-primary">
          {recipe.method}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <span className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-secondary">
          {recipe.mealType}
        </span>
        <h3 className="mb-3 font-serif text-lg font-semibold leading-snug text-on-surface group-hover:text-primary">
          {recipe.title}
        </h3>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2 text-sm text-on-surface-variant">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${difficultyStyle}`}>
            {recipe.difficulty}
          </span>
          <span className="flex items-center gap-2 text-xs">
            <span>{recipe.totalTime}</span>
            <span className="font-semibold text-on-surface">{recipe.nutrition.kcal} kcal</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
