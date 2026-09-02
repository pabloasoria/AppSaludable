import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllRecipes, getRecipeById } from '@/lib/recipes';
import { RecipeDetail } from '@/components/RecipeDetail';

export function generateStaticParams() {
  return getAllRecipes().map((r) => ({ id: r.id }));
}

export default async function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = getRecipeById(id);

  if (!recipe) {
    notFound();
  }

  return (
    <div>
      <Link href="/" className="mb-6 inline-block text-sm text-on-surface-variant hover:text-primary">
        ← Volver al catálogo
      </Link>
      <RecipeDetail recipe={recipe} />
    </div>
  );
}
