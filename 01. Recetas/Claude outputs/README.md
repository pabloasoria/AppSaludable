# App de Recetas Saludables — web

Catálogo de recetas AirFryer y Thermomix con filtros, ficha de receta,
planificador semanal, lista de la compra automática y cuentas de usuario
(Supabase).

## Stack

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS**.
- **Supabase** (Postgres + Auth) como backend: catálogo de recetas, sesión
  del usuario (enlace mágico por email) y persistencia del planificador
  semanal por cuenta. Esquema en `supabase/schema.sql`.
- Toda la capa de acceso a datos vive en `src/lib/recipes.ts`
  (server-side, consulta Supabase) y `src/lib/usePlan.ts` (cliente, plan
  semanal sincronizado en Supabase). Catálogo, planificador y lista de la
  compra requieren sesión iniciada — cada `page.tsx` comprueba la sesión en
  el servidor (`src/lib/supabase/server.ts`) antes de pedir ningún dato; si
  no hay usuario, se muestra un aviso para iniciar sesión en vez del
  contenido (ver `src/components/LoginGate.tsx`).

## Cómo ejecutarlo en local

```bash
npm install
cp .env.local.example .env.local   # rellena las claves, ver abajo
npm run dev
```

Abre http://localhost:3000.

## Conectar tu propio proyecto de Supabase

La app **no funciona sin esto**: el catálogo de recetas ya no vive en un
JSON local, vive en Supabase.

1. Crea un proyecto en https://supabase.com (nivel gratuito de sobra para
   empezar).
2. En el SQL Editor del proyecto, pega y ejecuta el contenido de
   `supabase/schema.sql`.
3. En Authentication → Providers, confirma que "Email" está activado con
   "Confirm email" según prefieras (el login de la app usa enlace mágico,
   `signInWithOtp`, no contraseña).
4. En Authentication → URL Configuration, añade la URL donde despliegues la
   app (y `http://localhost:3000` para desarrollo) a "Redirect URLs" —
   si no, el enlace del email no volverá a la app correctamente.
5. En Project Settings → API copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key (¡secreta!) → `SUPABASE_SERVICE_ROLE_KEY`, solo
     para el paso siguiente; puedes borrarla de `.env.local` después.
6. Siembra las 80 recetas ya generadas:
   ```bash
   set -a; source .env.local; set +a
   node scripts/seed-supabase.js
   ```
7. `npm run dev` (o `npm run build && npm run start`) y prueba iniciar
   sesión desde `/login`.

### Modo desarrollo: login automático

El login real (enlace mágico) está **desactivado temporalmente** para
agilizar el desarrollo: `/login` muestra un único botón que inicia sesión
como un usuario fijo (`usuario1@dev.local`), sin pasar por email. Antes de
usarlo, crea ese usuario una vez (necesita `SUPABASE_SERVICE_ROLE_KEY`, como
el paso 6):

```bash
set -a; source .env.local; set +a
node scripts/create-dev-user.js
```

Luego, en `/login`, pulsa "Entrar como usuario1@dev.local". Como es un
usuario real de Supabase Auth, el planificador y la lista de la compra
persisten igual que con cualquier otra cuenta.

Para volver al login real (enlace mágico), pon `DEV_LOGIN_ENABLED` en
`false` en `src/app/login/page.tsx` — el formulario original sigue intacto
debajo, no hay que reescribirlo.

Si en algún momento cambias `airfryer-data.js` / `thermomix-data.js` (en la
carpeta hermana `../recetas`) o quieres regenerar `src/data/recipes.json`
antes de volver a sembrar:

```bash
node scripts/build-data.js
```

## Qué incluye

- Catálogo (`/`) con filtro por método (AirFryer/Thermomix), tipo de comida
  y calorías máximas, más buscador por nombre.
- Ficha de receta (`/recetas/[id]`) con información nutricional, tiempos,
  dificultad, ingredientes escalables por ración y elaboración paso a paso.
- Planificador semanal (`/planificador`): cuadrícula Lunes-Domingo ×
  Desayuno/Comida/Merienda-Snack/Cena, generación aleatoria de la semana,
  reroll individual por celda, selector manual de receta.
- Lista de la compra (`/lista-de-compra`): agregada automáticamente desde
  el plan semanal, con deduplicación de ingredientes (normaliza mayúsculas,
  acentos, singular/plural, modificadores de preparación y pesos entre
  paréntesis — ver comentarios en `src/components/ShoppingList.tsx`).
- Login sin contraseña (`/login`, enlace mágico por email) y persistencia
  del planificador por cuenta, sincronizada entre dispositivos.
- Las 80 recetas generadas previamente, cargadas en Supabase.

## Qué NO incluye todavía

1. **Fotografías de las recetas** — el catálogo del proyecto las pide
   explícitamente; queda pendiente definir la estrategia (banco de fotos,
   generadas, o subidas manualmente a Supabase Storage).
2. **Favoritos** — la tabla `favorites` ya existe en el esquema, falta la
   interfaz.
3. **Filtros por proteínas, carbohidratos, grasas, tiempo y dificultad** —
   hoy solo hay filtro de calorías máximas, método y tipo de comida.
4. **Modo cocina** interactivo paso a paso (los pasos se muestran como
   lista estática, no hay navegación a pantalla completa).
5. **Gestión de ingredientes disponibles en casa**, sustitución de
   ingredientes, creación de recetas propias, asistente de IA — fases más
   avanzadas del roadmap, no empezadas.
6. **Despliegue.** Recomendado: subir el repo a GitHub y conectarlo a
   Vercel (detecta Next.js automáticamente, define ahí las mismas
   variables de entorno de `.env.local.example` — nunca subas
   `SUPABASE_SERVICE_ROLE_KEY` al repo ni a un entorno de cliente).

## Notas técnicas

- **Renderizado estático de recetas**: `/recetas/[id]` usa
  `generateStaticParams` para pre-generar cada página en el build. Si
  añades o borras recetas directamente en Supabase (fuera de
  `scripts/seed-supabase.js`), hace falta un nuevo build para que
  aparezcan/desaparezcan esas páginas.
- **Ingredientes en texto libre**: cada ingrediente sigue siendo una
  cadena de texto ("6 claras de huevo (180 ml) + 1 huevo entero"), no
  `{ cantidad, unidad, nombre }` estructurado. La lista de la compra
  agrega por texto con una heurística (ver `ShoppingList.tsx`) en vez de
  sumar cantidades numéricas entre recetas — mezclar unidades distintas
  automáticamente daría un dato incorrecto, así que las cantidades se
  muestran concatenadas y es el usuario quien decide.
- Los valores nutricionales (kcal/proteína/carbohidratos/grasas) son
  estimaciones hechas al generar las recetas, no de una base de datos
  nutricional certificada.
