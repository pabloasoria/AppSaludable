-- Esquema Supabase (Postgres) para App de Recetas.
-- Ejecutar en el SQL Editor del proyecto de Supabase (o vía `supabase db push`
-- si usas la CLI).
--
-- Diseño deliberadamente simple frente a una versión anterior de este
-- archivo que normalizaba ingredientes/pasos en tablas separadas pensando
-- en sumar cantidades a nivel de SQL. Esa agregación ya se resuelve en la
-- app (src/components/ShoppingList.tsx) con una heurística de texto sobre
-- ingredientes libres — normalizar en SQL habría sido trabajo duplicado sin
-- beneficio real hoy. Si en el futuro se necesita sumar cantidades de forma
-- fiable, esa es la señal para volver a normalizar `ingredients`.

create extension if not exists "pgcrypto";

-- ========== Catálogo ==========
-- `id` es el mismo slug de texto que ya usa la app en las URLs
-- (/recetas/[id]) y en recipes.json — evita una capa de mapeo id↔slug.

create table if not exists recipes (
  id text primary key,
  title text not null,
  method text not null check (method in ('AirFryer', 'Thermomix')),
  meal_type text not null check (meal_type in ('Desayuno', 'Comida', 'Merienda', 'Snack', 'Cena')),
  servings_base int not null default 2,
  prep_time text,
  cook_time text,
  total_time text,
  difficulty text,
  kcal numeric not null,
  protein numeric not null,
  carbs numeric not null,
  fat numeric not null,
  ingredients text[] not null default '{}',
  steps text[] not null default '{}',
  tips text,
  oven_alt jsonb,          -- { temp, time, note } | null — alternativa al horno
  photo_url text,          -- fotografía subida a Storage (bucket recipe-photos) o null
  is_custom boolean not null default false, -- true = añadida desde la app (ver "Eliminar receta" en actions.ts); false = las 80 del catálogo original, que no se pueden borrar desde la UI
  created_at timestamptz not null default now()
);

-- Migración para una base de datos ya creada con una versión anterior de
-- este archivo (sin is_custom): ejecutar una sola vez en el SQL Editor de
-- Supabase. Es seguro volver a ejecutarlo (IF NOT EXISTS).
--   alter table recipes add column if not exists is_custom boolean not null default false;

create index if not exists recipes_method_idx on recipes (method);
create index if not exists recipes_meal_type_idx on recipes (meal_type);
create index if not exists recipes_kcal_idx on recipes (kcal);

-- ========== Usuarios y datos personales ==========
-- Supabase Auth gestiona auth.users; estas tablas guardan solo lo propio.

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

-- Favoritos: preparado para cuando se construya esa función (no hay UI
-- todavía). Un usuario, una receta, sin más.
create table if not exists favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  recipe_id text not null references recipes (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

-- Planificador semanal: UNA fila por usuario con el plan completo como
-- jsonb, con la misma forma que PlanState en src/lib/planner.ts
-- ({ "Lunes__desayuno": "recipe-id", ... }). Sin historial de semanas
-- pasadas por ahora — es exactamente lo que la app usa hoy vía
-- localStorage, solo que ahora persiste por usuario y sincroniza entre
-- dispositivos. Si en el futuro se pide guardar varias semanas, esa es la
-- señal para pasar a una tabla con `week_start` como clave adicional.
create table if not exists weekly_plans (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ========== Row Level Security ==========
-- El catálogo es de lectura pública; los datos personales solo son visibles
-- para su propio dueño.

alter table recipes enable row level security;
alter table profiles enable row level security;
alter table favorites enable row level security;
alter table weekly_plans enable row level security;

create policy "Catálogo visible para todos" on recipes for select using (true);

create policy "El usuario ve su propio perfil" on profiles for select using (auth.uid() = id);
create policy "El usuario edita su propio perfil" on profiles for update using (auth.uid() = id);
create policy "El usuario crea su propio perfil" on profiles for insert with check (auth.uid() = id);

create policy "El usuario gestiona sus favoritos" on favorites for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "El usuario gestiona su plan semanal" on weekly_plans for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
