import { Catalog } from '@/components/Catalog';
import { getAllRecipes } from '@/lib/recipes';

export default function HomePage() {
  const recipes = getAllRecipes();

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-on-surface">Catálogo de recetas</h1>
        <p className="mt-1.5 text-sm text-on-surface-variant">
          {recipes.length} recetas saludables, filtra por método de cocción, tipo de comida o calorías.
        </p>
      </div>
      <Catalog recipes={recipes} />
    </div>
  );
}
