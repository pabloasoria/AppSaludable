-- Esquema inicial para Supabase (Postgres).
-- Ejecutar en el SQL Editor del proyecto de Supabase (o vía `supabase db push`
-- si usas la CLI) una vez creado el proyecto.
--
-- Diseño pensado para las funcionalidades descritas en el proyecto:
-- catálogo filtrable, favoritos, planificador semanal y lista de la compra
-- agregada. La app todavía NO consume esta base de datos (usa
-- src/data/recipes.json); este esquema es el destino para cuando se conecte.

create extension if not exists "pgcrypto";

-- ========== Catálogo ==========

create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,                -- coincide con el id usado hoy en recipes.json
  title text not null,
  method text not null check (method in ('AirFryer', 'Thermomix')),
  meal_type text not null check (meal_type in ('Desayuno', 'Comida', 'Merienda', 'Snack', 'Cena')),
  servings_base int not null default 2,
  prep_time text,
  cook_time text,
  total_time text,
  difficulty text,
  kcal numeric not null,                    -- información nutricional aproximada, por ración
  protein numeric not null,
  carbs numeric not null,
  fat numeric not null,
  tips text,
  photo_url text,                           -- pendiente: fotografías de las recetas
  created_at timestamptz not null default now()
);

create index if not exists recipes_method_idx on recipes (method);
create index if not exists recipes_meal_type_idx on recipes (meal_type);
create index if not exists recipes_kcal_idx on recipes (kcal);

-- Catálogo maestro de ingredientes, para poder agregar cantidades entre
-- recetas distintas en la lista de la compra (evita duplicados por
-- variaciones de texto, p. ej. "tomate" vs "tomates").
create table if not exists ingredients (
  id uuid primary key default gen_random_uuid(),
  name text unique not null
);

-- Relación receta-ingrediente. `raw_text` conserva el texto original de la
-- receta (como se generó en la v1); `quantity` y `unit` quedan nullable
-- porque todavía no están estructurados — ver "Deuda técnica" en el README.
-- Sin quantity/unit numéricos, la agregación de la lista de la compra no se
-- puede automatizar de forma fiable; es el primer bloque de trabajo pendiente.
create table if not exists recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes (id) on delete cascade,
  ingredient_id uuid references ingredients (id),
  position int not null default 0,
  raw_text text not null,
  quantity numeric,
  unit text
);

create index if not exists recipe_ingredients_recipe_idx on recipe_ingredients (recipe_id);

create table if not exists recipe_steps (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes (id) on delete cascade,
  position int not null,
  instruction text not null
);

create index if not exists recipe_steps_recipe_idx on recipe_steps (recipe_id);

-- ========== Usuarios y datos personales ==========
-- Supabase Auth gestiona auth.users; esta tabla guarda datos de perfil propios.

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  recipe_id uuid not null references recipes (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

create table if not exists meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  week_start date not null,                 -- lunes de la semana planificada
  created_at timestamptz not null default now(),
  unique (user_id, week_start)
);

create table if not exists meal_plan_items (
  id uuid primary key default gen_random_uuid(),
  meal_plan_id uuid not null references meal_plans (id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6), -- 0 = lunes
  meal_type text not null check (meal_type in ('Desayuno', 'Comida', 'Merienda', 'Snack', 'Cena')),
  recipe_id uuid not null references recipes (id),
  servings int not null default 2
);

create index if not exists meal_plan_items_plan_idx on meal_plan_items (meal_plan_id);

-- ========== Row Level Security ==========
-- El catálogo es de lectura pública; los datos personales solo son visibles
-- para su propio dueño.

alter table recipes enable row level security;
alter table ingredients enable row level security;
alter table recipe_ingredients enable row level security;
alter table recipe_steps enable row level security;
alter table profiles enable row level security;
alter table favorites enable row level security;
alter table meal_plans enable row level security;
alter table meal_plan_items enable row level security;

create policy "Catálogo visible para todos" on recipes for select using (true);
create policy "Ingredientes visibles para todos" on ingredients for select using (true);
create policy "Recipe_ingredients visibles para todos" on recipe_ingredients for select using (true);
create policy "Recipe_steps visibles para todos" on recipe_steps for select using (true);

create policy "El usuario ve su propio perfil" on profiles for select using (auth.uid() = id);
create policy "El usuario edita su propio perfil" on profiles for update using (auth.uid() = id);
create policy "El usuario crea su propio perfil" on profiles for insert with check (auth.uid() = id);

create policy "El usuario gestiona sus favoritos" on favorites for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "El usuario gestiona sus planes" on meal_plans for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "El usuario gestiona los items de sus planes" on meal_plan_items for all
  using (
    exists (
      select 1 from meal_plans
      where meal_plans.id = meal_plan_items.meal_plan_id
      and meal_plans.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from meal_plans
      where meal_plans.id = meal_plan_items.meal_plan_id
      and meal_plans.user_id = auth.uid()
    )
  );
