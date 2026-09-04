// Tipos mínimos escritos a mano para las tablas que la app consulta,
// reflejando supabase/schema.sql. No generados con `supabase gen types`
// porque todavía no hay un proyecto Supabase enlazado — si en el futuro se
// enlaza, `npx supabase gen types typescript --project-id ... > este archivo`
// puede sustituir este fichero por uno completo y siempre sincronizado.
//
// La forma (Row/Insert/Update/Relationships, y Tables/Views/Functions en el
// nivel del schema) es la que exige el tipo genérico interno de
// @supabase/supabase-js — sin ella el cliente tipado infiere `never` en
// vez de dar error de tipos claro.

export type RecipeRow = {
  id: string;
  title: string;
  method: 'AirFryer' | 'Thermomix';
  meal_type: 'Desayuno' | 'Comida' | 'Merienda' | 'Snack' | 'Cena';
  servings_base: number;
  prep_time: string | null;
  cook_time: string | null;
  total_time: string | null;
  difficulty: string | null;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  steps: string[];
  tips: string | null;
  oven_alt: { temp: string; time: string; note: string } | null;
  photo_url: string | null;
  is_custom: boolean;
  created_at: string;
};

export type FavoriteRow = {
  user_id: string;
  recipe_id: string;
  created_at: string;
};

export type WeeklyPlanRow = {
  user_id: string;
  plan: Partial<Record<string, string>>;
  updated_at: string;
};

type TableOf<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      recipes: TableOf<
        RecipeRow,
        Omit<RecipeRow, 'created_at' | 'photo_url' | 'is_custom'> &
          Partial<Pick<RecipeRow, 'created_at' | 'photo_url' | 'is_custom'>>,
        Partial<RecipeRow>
      >;
      favorites: TableOf<FavoriteRow, FavoriteRow, Partial<FavoriteRow>>;
      weekly_plans: TableOf<WeeklyPlanRow, Partial<WeeklyPlanRow> & { user_id: string }, Partial<WeeklyPlanRow>>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
