// Convierte las fuentes de recetas (airfryer-data.js / thermomix-data.js) en un
// dataset único y normalizado en src/data/recipes.json.
// Ese JSON es la fuente que consume scripts/seed-supabase.js para cargar (o
// actualizar) la tabla `recipes` de Supabase.

const fs = require('fs');
const path = require('path');

const airfryer = [...require('../../recetas/airfryer-data'), ...require('../../recetas/airfryer-data-2')];
const thermomix = [...require('../../recetas/thermomix-data'), ...require('../../recetas/thermomix-data-2')];

function normalize(str) {
  return str
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function toRecipe(r) {
  const id = `${r.method.toLowerCase()}-${String(r.num).padStart(2, '0')}-${normalize(r.title)}`;
  return {
    id,
    title: r.title,
    method: r.method, // 'AirFryer' | 'Thermomix'
    mealType: r.mealType, // 'Desayuno' | 'Comida' | 'Merienda' | 'Snack' | 'Cena'
    servingsBase: r.servings,
    prepTime: r.prepTime,
    cookTime: r.cookTime,
    totalTime: r.totalTime,
    difficulty: r.difficulty,
    nutrition: r.nutrition, // { kcal, protein, carbs, fat } por ración, aproximado
    ingredients: r.ingredients,
    steps: r.steps,
    tips: r.tips || null,
    ovenAlt: r.ovenAlt || null, // alternativa en horno convencional (solo algunas recetas AirFryer del lote 2)
  };
}

const recipes = [...airfryer.map(toRecipe), ...thermomix.map(toRecipe)];

const outPath = path.join(__dirname, '..', 'src', 'data', 'recipes.json');
fs.writeFileSync(outPath, JSON.stringify(recipes, null, 2));
console.log(`Escritas ${recipes.length} recetas en ${outPath}`);
