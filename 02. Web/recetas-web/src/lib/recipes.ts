import { createPublicClient } from '@/lib/supabase/public';
import type { RecipeRow } from '@/lib/supabase/types';
import type { Recipe } from '@/lib/recipe-types';

function fromRow(row: RecipeRow): Recipe {
  return {
    id: row.id,
    title: row.title,
    method: row.method,
    mealType: row.meal_type,
    servingsBase: row.servings_base,
    prepTime: row.prep_time ?? '',
    cookTime: row.cook_time ?? '',
    totalTime: row.total_time ?? '',
    difficulty: row.difficulty ?? '',
    nutrition: { kcal: row.kcal, protein: row.protein, carbs: row.carbs, fat: row.fat },
    ingredients: row.ingredients,
    steps: row.steps,
    tips: row.tips,
    ovenAlt: row.oven_alt,
    photoUrl: row.photo_url,
    isCustom: row.is_custom,
  };
}

// Capa de acceso a datos: consulta la tabla `recipes` de Supabase
// (supabase/schema.sql). SOLO se importa desde Server Components (páginas
// en src/app/**/page.tsx) — nunca desde un Componente de Cliente, porque
// arrastra el cliente de servidor de Supabase (next/headers) al bundle del
// navegador y rompe el build.
export async function getAllRecipes(): Promise<Recipe[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase.from('recipes').select('*').order('title');
  if (error) throw new Error(`No se pudo cargar el catálogo de recetas: ${error.message}`);
  return (data ?? []).map(fromRow);
}

export async function getRecipeById(id: string): Promise<Recipe | undefined> {
  const supabase = createPublicClient();
  const { data, error } = await supabase.from('recipes').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(`No se pudo cargar la receta "${id}": ${error.message}`);
  return data ? fromRow(data) : undefined;
}
