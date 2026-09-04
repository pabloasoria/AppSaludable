import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllRecipes, getRecipeById } from '@/lib/recipes';
import { RecipeDetail } from '@/components/RecipeDetail';
import { DeleteRecipeButton } from '@/components/DeleteRecipeButton';
import { getCurrentUser } from '@/lib/current-user';
import { LoginGate } from '@/components/LoginGate';

export async function generateStaticParams() {
  const recipes = await getAllRecipes();
  return recipes.map((r) => ({ id: r.id }));
}

export default async function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div>
        <LoginGate message="Inicia sesión para ver esta receta." />
      </div>
    );
  }

  const { id } = await params;
  const recipe = await getRecipeById(id);

  if (!recipe) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-on-surface-variant transition hover:text-primary"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Volver al catálogo
        </Link>
        {recipe.isCustom && <DeleteRecipeButton id={recipe.id} />}
      </div>
      <RecipeDetail recipe={recipe} />
    </div>
  );
}
