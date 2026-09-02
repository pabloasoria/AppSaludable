// Carga src/data/recipes.json en las tablas de Supabase definidas en
// supabase/schema.sql. Pensado para ejecutarse UNA VEZ, tras crear el
// proyecto de Supabase y correr schema.sql.
//
// Requisitos:
//   npm install @supabase/supabase-js
//   export SUPABASE_URL=...
//   export SUPABASE_SERVICE_ROLE_KEY=...   (clave "service_role", NO la anon key: hace falta para saltarse RLS al insertar)
//
// Uso:
//   node scripts/seed-supabase.js

const { createClient } = require('@supabase/supabase-js');
const recipes = require('../src/data/recipes.json');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en el entorno.');
  process.exit(1);
}

const supabase = createClient(url, key);

async function run() {
  for (const r of recipes) {
    const { data: recipeRow, error: recipeError } = await supabase
      .from('recipes')
      .upsert(
        {
          slug: r.id,
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
          tips: r.tips,
        },
        { onConflict: 'slug' }
      )
      .select()
      .single();

    if (recipeError) {
      console.error(`Error insertando ${r.id}:`, recipeError.message);
      continue;
    }

    // Reemplaza ingredientes y pasos existentes para permitir re-ejecutar el script.
    await supabase.from('recipe_ingredients').delete().eq('recipe_id', recipeRow.id);
    await supabase.from('recipe_steps').delete().eq('recipe_id', recipeRow.id);

    const ingredientsPayload = r.ingredients.map((text, i) => ({
      recipe_id: recipeRow.id,
      position: i,
      raw_text: text,
      // quantity/unit se dejan sin rellenar: el texto libre aún no está
      // estructurado (ver README, "Deuda técnica").
    }));
    const { error: ingError } = await supabase.from('recipe_ingredients').insert(ingredientsPayload);
    if (ingError) console.error(`Error en ingredientes de ${r.id}:`, ingError.message);

    const stepsPayload = r.steps.map((instruction, i) => ({
      recipe_id: recipeRow.id,
      position: i + 1,
      instruction,
    }));
    const { error: stepsError } = await supabase.from('recipe_steps').insert(stepsPayload);
    if (stepsError) console.error(`Error en pasos de ${r.id}:`, stepsError.message);

    console.log(`✓ ${r.id}`);
  }
  console.log(`Listo. ${recipes.length} recetas procesadas.`);
}

run();
