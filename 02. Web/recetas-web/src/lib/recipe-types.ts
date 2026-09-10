// Tipos y utilidades PURAS relacionadas con Recipe, sin ninguna dependencia
// de servidor (nada de next/headers ni del cliente Supabase). Separado de
// src/lib/recipes.ts a propósito: los Componentes de Cliente (RecipeDetail,
// Catalog, WeeklyPlanner, ShoppingList, RecipeCard) necesitan estos tipos y
// `scaleIngredientText`, pero NO deben arrastrar al bundle del navegador el
// cliente de servidor que usa recipes.ts para consultar Supabase — si lo
// hacen, el build falla ("You're importing a module that depends on
// next/headers... in the Pages Router" es el síntoma engañoso que da Next
// cuando en realidad el problema es un import de servidor en un módulo
// compartido con el cliente).

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
  photoUrl: string | null;
  isCustom: boolean;
};

export const MEAL_TYPES: MealType[] = ['Desayuno', 'Comida', 'Merienda', 'Snack', 'Cena'];
export const METHODS: Method[] = ['AirFryer', 'Thermomix'];

// Escala best-effort de cantidades: multiplica todos los números (enteros,
// decimales o fracciones tipo "1/2") que aparecen en el texto del
// ingrediente. Sigue siendo una solución de texto libre a propósito — ver
// supabase/schema.sql para la razón de no normalizar ingredientes en SQL.
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
