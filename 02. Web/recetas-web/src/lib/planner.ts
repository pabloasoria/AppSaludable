import type { Recipe } from './recipe-types';

// Fuente única de verdad del planificador semanal: la usan tanto
// WeeklyPlanner (para escribir el plan) como ShoppingList (para leerlo y
// generar la lista de la compra), de modo que no puedan desincronizarse.

export const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] as const;
export type Day = (typeof DAYS)[number];

export type SlotKey = 'desayuno' | 'comida' | 'merienda' | 'cena';

export const SLOTS: { key: SlotKey; label: string; mealTypes: Recipe['mealType'][] }[] = [
  { key: 'desayuno', label: 'Desayuno', mealTypes: ['Desayuno'] },
  { key: 'comida', label: 'Comida', mealTypes: ['Comida'] },
  { key: 'merienda', label: 'Merienda / Snack', mealTypes: ['Merienda', 'Snack'] },
  { key: 'cena', label: 'Cena', mealTypes: ['Cena'] },
];

// `${día}__${slot}` -> id de receta. Persistido en localStorage: todavía no
// hay backend conectado (ver README, sección Supabase). Cuando se conecte,
// sustituir la lectura/escritura de localStorage por la tabla
// meal_plan_items, manteniendo esta misma forma de PlanState para no tocar
// los componentes que la consumen.
export type PlanState = Partial<Record<string, string>>;

export const PLAN_STORAGE_KEY = 'recetas-planificador-v1';
export const TOTAL_SLOTS = DAYS.length * SLOTS.length;

export function cellKey(day: string, slot: SlotKey) {
  return `${day}__${slot}`;
}
