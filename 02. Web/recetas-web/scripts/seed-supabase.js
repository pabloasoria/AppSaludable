// Carga src/data/recipes.json en la tabla `recipes` de Supabase definida en
// supabase/schema.sql. Pensado para ejecutarse tras crear el proyecto de
// Supabase y correr schema.sql; es seguro volver a ejecutarlo (upsert por
// `id`, que es el mismo slug que ya usa la app en las URLs).
//
// Requisitos (en el entorno, NUNCA hardcodeados en este archivo):
//   npm install @supabase/supabase-js   (ya está en package.json)
//   export NEXT_PUBLIC_SUPABASE_URL=...
//   export SUPABASE_SERVICE_ROLE_KEY=...   (clave "service_role", NO la anon
//     key: hace falta para saltarse RLS al insertar el catálogo público)
//
// Uso:
//   node scripts/seed-supabase.js
//
// Si tienes las variables en .env.local en vez de exportadas en el shell
// (Mac/Linux; en Windows PowerShell usa Get-Content .env.local para
// exportarlas manualmente):
//   set -a; source .env.local; set +a; node scripts/seed-supabase.js

const { createClient } = require('@supabase/supabase-js');
const recipes = require('../src/data/recipes.json');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en el entorno.');
  process.exit(1);
}

const supabase = createClient(url, key);

function toRow(r) {
  return {
    id: r.id,
    title: r.title,
    method: r.method,
    meal_type: r.mealType,
    servings_base: r.servingsBase,
    prep_time: r.prepTime,
    cook_time: r.cookTime,
    total_time: r.totalTime,
    difficulty: r.difficulty,
    kcal: r.nutrition.kcal,
    protein: r.nutrition.protein,
    carbs: r.nutrition.carbs,
    fat: r.nutrition.fat,
    ingredients: r.ingredients,
    steps: r.steps,
    tips: r.tips,
    oven_alt: r.ovenAlt,
  };
}

async function run() {
  const rows = recipes.map(toRow);
  const BATCH_SIZE = 20;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('recipes').upsert(batch, { onConflict: 'id' });
    if (error) {
      console.error(`Error en el lote ${i}-${i + batch.length}:`, error.message);
      process.exitCode = 1;
      continue;
    }
    console.log(`✓ ${i + batch.length}/${rows.length}`);
  }

  console.log(`Listo. ${rows.length} recetas procesadas.`);
}

run();
