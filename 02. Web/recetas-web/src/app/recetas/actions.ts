'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentUser } from '@/lib/current-user';
import { MEAL_TYPES, METHODS, type MealType, type Method } from '@/lib/recipe-types';

const RECIPE_PHOTOS_BUCKET = 'recipe-photos';

// Rango Unicode "Combining Diacritical Marks" (U+0300–U+036F), construido con
// fromCharCode para evitar ambigüedades de codificación de caracteres
// no-ASCII directamente en el código fuente (mismo patrón que ShoppingList.tsx).
const DIACRITICS_RE = new RegExp('[' + String.fromCharCode(0x0300) + '-' + String.fromCharCode(0x036f) + ']', 'g');

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(DIACRITICS_RE, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function linesToList(value: FormDataEntryValue | null): string[] {
  return String(value ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function textOrNull(value: FormDataEntryValue | null): string | null {
  const text = String(value ?? '').trim();
  return text || null;
}

function getAdminOrError(): { admin: ReturnType<typeof createAdminClient> } | { error: string } {
  try {
    return { admin: createAdminClient() };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'No se pudo conectar con Supabase.' };
  }
}

export type CreateRecipeState = { ok: boolean; error: string | null; id: string | null };

// Las recetas que crea este formulario se marcan `is_custom: true` — es lo
// único que distingue "se puede borrar desde la app" (ver deleteRecipe) de
// las 80 recetas originales del catálogo, que solo se gestionan editando
// src/data/recipes.json + scripts/seed-supabase.js.
export async function createRecipe(_prev: CreateRecipeState, formData: FormData): Promise<CreateRecipeState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: 'Inicia sesión para añadir recetas.', id: null };

  const title = String(formData.get('title') ?? '').trim();
  if (!title) return { ok: false, error: 'El título es obligatorio.', id: null };

  const method = String(formData.get('method') ?? '') as Method;
  if (!METHODS.includes(method)) return { ok: false, error: 'Elige un método de cocción válido.', id: null };

  const mealType = String(formData.get('mealType') ?? '') as MealType;
  if (!MEAL_TYPES.includes(mealType)) return { ok: false, error: 'Elige un tipo de comida válido.', id: null };

  const ingredients = linesToList(formData.get('ingredients'));
  if (ingredients.length === 0) return { ok: false, error: 'Añade al menos un ingrediente (uno por línea).', id: null };

  const steps = linesToList(formData.get('steps'));
  if (steps.length === 0) return { ok: false, error: 'Añade al menos un paso de elaboración (uno por línea).', id: null };

  const kcal = Number(formData.get('kcal'));
  const protein = Number(formData.get('protein')) || 0;
  const carbs = Number(formData.get('carbs')) || 0;
  const fat = Number(formData.get('fat')) || 0;
  if (!Number.isFinite(kcal) || kcal <= 0) return { ok: false, error: 'Indica las kcal por ración.', id: null };

  const servingsBase = Number(formData.get('servingsBase')) || 2;

  const ovenTemp = textOrNull(formData.get('ovenTemp'));
  const ovenTime = textOrNull(formData.get('ovenTime'));
  const ovenAlt = ovenTemp && ovenTime ? { temp: ovenTemp, time: ovenTime, note: textOrNull(formData.get('ovenNote')) ?? '' } : null;

  const adminResult = getAdminOrError();
  if ('error' in adminResult) return { ok: false, error: adminResult.error, id: null };
  const { admin } = adminResult;

  const base = `${method.toLowerCase()}-${slugify(title)}` || `${method.toLowerCase()}-receta`;
  let id = base;
  for (let i = 2; i <= 50; i++) {
    const { data: existing } = await admin.from('recipes').select('id').eq('id', id).maybeSingle();
    if (!existing) break;
    id = `${base}-${i}`;
  }

  let photoUrl: string | null = null;
  const photo = formData.get('photo');
  if (photo instanceof File && photo.size > 0) {
    const { error: bucketError } = await admin.storage.createBucket(RECIPE_PHOTOS_BUCKET, { public: true });
    if (bucketError && !/already exists/i.test(bucketError.message)) {
      return { ok: false, error: `No se pudo preparar el almacenamiento de fotos: ${bucketError.message}`, id: null };
    }

    const ext = photo.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${id}.${ext}`;
    const { error: uploadError } = await admin.storage
      .from(RECIPE_PHOTOS_BUCKET)
      .upload(path, photo, { upsert: true, contentType: photo.type || undefined });
    if (uploadError) return { ok: false, error: `No se pudo subir la foto: ${uploadError.message}`, id: null };

    const { data: publicUrlData } = admin.storage.from(RECIPE_PHOTOS_BUCKET).getPublicUrl(path);
    photoUrl = publicUrlData.publicUrl;
  }

  const { error: insertError } = await admin.from('recipes').insert({
    id,
    title,
    method,
    meal_type: mealType,
    servings_base: servingsBase,
    prep_time: textOrNull(formData.get('prepTime')),
    cook_time: textOrNull(formData.get('cookTime')),
    total_time: textOrNull(formData.get('totalTime')),
    difficulty: textOrNull(formData.get('difficulty')),
    kcal,
    protein,
    carbs,
    fat,
    ingredients,
    steps,
    tips: textOrNull(formData.get('tips')),
    oven_alt: ovenAlt,
    photo_url: photoUrl,
    is_custom: true,
  });

  if (insertError) return { ok: false, error: `No se pudo guardar la receta: ${insertError.message}`, id: null };

  revalidatePath('/');
  revalidatePath(`/recetas/${id}`);
  return { ok: true, error: null, id };
}

export type DeleteRecipeState = { error: string | null };

// Solo borra recetas con is_custom = true — comprobado aquí en el servidor,
// no solo ocultando el botón en la UI, para que no baste con llamar a la
// action a mano (p. ej. desde la consola del navegador) para borrar una de
// las 80 recetas originales del catálogo.
export async function deleteRecipe(_prev: DeleteRecipeState, formData: FormData): Promise<DeleteRecipeState> {
  const id = String(formData.get('id') ?? '');
  if (!id) return { error: 'Falta el identificador de la receta.' };

  const user = await getCurrentUser();
  if (!user) return { error: 'Inicia sesión para eliminar recetas.' };

  const adminResult = getAdminOrError();
  if ('error' in adminResult) return { error: adminResult.error };
  const { admin } = adminResult;

  const { data: recipe, error: fetchError } = await admin
    .from('recipes')
    .select('is_custom')
    .eq('id', id)
    .maybeSingle();

  if (fetchError) return { error: `No se pudo comprobar la receta: ${fetchError.message}` };
  if (!recipe) return { error: 'Esa receta ya no existe.' };
  if (!recipe.is_custom) return { error: 'Solo se pueden eliminar recetas añadidas manualmente.' };

  const { error: deleteError } = await admin.from('recipes').delete().eq('id', id);
  if (deleteError) return { error: `No se pudo eliminar la receta: ${deleteError.message}` };

  revalidatePath('/');
  revalidatePath(`/recetas/${id}`);
  redirect('/');
}
