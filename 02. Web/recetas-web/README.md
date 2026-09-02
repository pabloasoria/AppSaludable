# App de Recetas Saludables — esqueleto web (v0)

Catálogo de recetas AirFryer y Thermomix con filtros, ficha de receta y
escalado de raciones. Base de partida para el resto de funcionalidades del
proyecto (planificador semanal, lista de la compra, IA).

## Stack

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS**.
- Datos: por ahora un JSON local (`src/data/recipes.json`, 40 recetas), sin
  base de datos todavía. Toda la capa de acceso a datos está aislada en
  `src/lib/recipes.ts` para poder sustituirla por consultas a Supabase sin
  tocar las páginas.
- Preparado para **Supabase** (Postgres + Auth + Storage) como siguiente
  paso — ver `supabase/schema.sql`.

## Cómo ejecutarlo en local

```bash
npm install
npm run dev
```

Abre http://localhost:3000 — verás el catálogo de las 40 recetas. Cada
tarjeta lleva a su ficha completa con ingredientes, pasos y un selector de
raciones que reescala las cantidades.

Si en algún momento cambias `airfryer-data.js` / `thermomix-data.js` (en la
carpeta hermana `../recetas`) o quieres regenerar `recipes.json`:

```bash
node scripts/build-data.js
```

## Qué incluye este esqueleto

- Catálogo (`/`) con filtro por método (AirFryer/Thermomix), tipo de comida
  y calorías máximas, más buscador por nombre.
- Ficha de receta (`/recetas/[id]`) con información nutricional, tiempos,
  dificultad, ingredientes escalables por ración y elaboración paso a paso.
- Las 40 recetas generadas previamente, ya cargadas.

## Qué NO incluye todavía (siguiente fases)

1. **Conexión a base de datos real.** Ahora mismo los datos viven en un
   JSON local. Para conectar Supabase:
   1. Crea un proyecto en https://supabase.com (gratis para empezar).
   2. Ejecuta `supabase/schema.sql` en el SQL Editor del proyecto.
   3. `npm install @supabase/supabase-js`
   4. Define las variables de entorno `SUPABASE_URL` y
      `SUPABASE_SERVICE_ROLE_KEY` (las encuentras en Project Settings → API)
      y ejecuta `node scripts/seed-supabase.js` para cargar las 40 recetas.
   5. Sustituye el cuerpo de las funciones en `src/lib/recipes.ts` por
      llamadas a Supabase (`@supabase/supabase-js`), manteniendo la misma
      firma para no tener que tocar las páginas.
2. **Autenticación** (necesaria para favoritos y planificador personales).
   Supabase Auth es la opción más directa dado el resto del stack.
3. **Favoritos.**
4. **Planificador semanal** y **generación de lista de la compra agregada**
   — la funcionalidad central del proyecto. Requiere el punto de deuda
   técnica de abajo antes de poder agregar cantidades entre recetas.
5. **Fotografías de las recetas** — el catálogo del proyecto las pide
   explícitamente y no se han generado en esta tanda.
6. **Despliegue.** Recomendado: subir el repo a GitHub y conectarlo a
   Vercel (detecta Next.js automáticamente, despliegue en ~2 minutos,
   capa gratuita suficiente para empezar).

## Deuda técnica conocida (importante antes de construir la lista de la compra)

Los ingredientes de cada receta son **texto libre** ("6 claras de huevo
(180 ml) + 1 huevo entero"), heredado de cómo se generaron los .docx
iniciales. El escalado de raciones en la ficha de receta
(`scaleIngredientText` en `src/lib/recipes.ts`) hace un reemplazo de
números "mejor esfuerzo" sobre ese texto — funciona razonablemente para
mostrarlo en pantalla, pero **no sirve para agregar cantidades entre
recetas distintas**, que es lo que necesita la lista de la compra
automática. Antes de construir esa función hay que estructurar cada
ingrediente como `{ cantidad, unidad, nombre }` (el esquema de Supabase ya
prevé estos campos en `recipe_ingredients.quantity` / `.unit`, hoy vacíos).
Es la pieza de trabajo más importante antes de avanzar a la fase de
planificador + lista de la compra.

Los valores nutricionales (kcal/proteína/carbohidratos/grasas) son
estimaciones hechas al generar las recetas, no de una base de datos
nutricional certificada — revisar antes de depender de ellos para filtros
serios.
