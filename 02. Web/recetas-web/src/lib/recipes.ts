import recipesData from '@/data/recipes.json';

export type Method = 'AirFryer' | 'Thermomix';
export type MealType = 'Desayuno' | 'Comida' | 'Merienda' | 'Snack' | 'Cena';

export type Nutrition = {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type Recipe = {
  id: string;
  title: string;
  method: Method;
  mealType: MealType;
  servingsBase: number;
  prepTime: string;
  cookTime: string;
  totalTime: string;
  difficulty: string;
  nutrition: Nutrition;
  ingredients: string[];
  steps: string[];
  tips: string | null;
  ovenAlt: { temp: string; time: string; note: string } | null;
};

// Fuente de datos local (JSON generado desde scripts/build-data.js).
// Cuando se conecte Supabase, sustituir el cuerpo de estas funciones por
// consultas a la base de datos manteniendo la misma firma, para no tocar
// las páginas que las consumen.
const recipes = recipesData as Recipe[];

export function getAllRecipes(): Recipe[] {
  return recipes;
}

export function getRecipeById(id: string): Recipe | undefined {
  return recipes.find((r) => r.id === id);
}

export const MEAL_TYPES: MealType[] = ['Desayuno', 'Comida', 'Merienda', 'Snack', 'Cena'];
export const METHODS: Method[] = ['AirFryer', 'Thermomix'];

// Escala best-effort de cantidades: multiplica todos los números (enteros,
// decimales o fracciones tipo "1/2") que aparecen en el texto del
// ingrediente. Es una solución provisional para el esqueleto: la forma
// correcta a medio plazo es estructurar cada ingrediente como
// { qty, unit, item } en vez de texto libre (ver README, sección "Deuda técnica").
export function scaleIngredientText(text: string, factor: number): string {
  if (factor === 1) return text;
  return text.replace(/(\d+)\s*\/\s*(\d+)|(\d+(?:[.,]\d+)?)/g, (match, num, den, plain) => {
    let value: number;
    if (num && den) {
      value = parseInt(num, 10) / parseInt(den, 10);
    } else {
      value = parseFloat(plain.replace(',', '.'));
    }
    const scaled = value * factor;
    const rounded = Math.round(scaled * 100) / 100;
    return rounded % 1 === 0 ? String(rounded) : rounded.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  });
}
