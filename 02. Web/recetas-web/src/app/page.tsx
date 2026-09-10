import { Catalog } from '@/components/Catalog';
import { getAllRecipes } from '@/lib/recipes';
import { getCurrentUser } from '@/lib/current-user';
import { LoginGate } from '@/components/LoginGate';

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-on-surface">Catálogo de recetas</h1>
          <p className="mt-1.5 text-sm text-on-surface-variant">Inicia sesión para ver el catálogo.</p>
        </div>
        <LoginGate message="El catálogo de recetas es solo para usuarios registrados." />
      </div>
    );
  }

  const recipes = await getAllRecipes();

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
