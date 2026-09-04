// Crea (si no existe ya) el usuario fijo de desarrollo que usa el botón
// "Entrar como usuario1" de /login mientras el login real (enlace mágico)
// está desactivado temporalmente — ver src/app/login/page.tsx.
//
// Las credenciales están duplicadas aquí y en src/lib/dev-auth.ts (este
// script es CommonJS y no puede importar de src/) — si cambias una, cambia
// la otra.
//
// Requiere el mismo entorno que seed-supabase.js:
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY   (clave "service_role", no la anon key —
//     hace falta la API admin de Auth para crear el usuario ya confirmado,
//     sin pasar por el flujo de email)
//
// Uso:
//   set -a; source .env.local; set +a; node scripts/create-dev-user.js
// (Windows PowerShell: carga .env.local como se explica en el README y
// ejecuta `node scripts/create-dev-user.js`.)

const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en el entorno.');
  process.exit(1);
}

const DEV_EMAIL = 'usuario1@dev.local';
const DEV_PASSWORD = 'usuario1-dev-2026';

const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

async function run() {
  // listUsers no filtra por email en la API, así que paginamos hasta
  // encontrarlo o agotar las páginas (de sobra para un proyecto de
  // desarrollo con pocos usuarios).
  let page = 1;
  let existing = null;
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    existing = data.users.find((u) => u.email === DEV_EMAIL) ?? null;
    if (existing || data.users.length < 200) break;
    page += 1;
  }

  if (existing) {
    console.log(`Ya existe el usuario de desarrollo (${DEV_EMAIL}), id=${existing.id}. Nada que hacer.`);
    return;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: DEV_EMAIL,
    password: DEV_PASSWORD,
    email_confirm: true, // evita el paso de confirmación por email
  });
  if (error) throw error;

  console.log(`Usuario de desarrollo creado: ${DEV_EMAIL} (id=${data.user.id})`);
  console.log('Ya puedes usar el botón "Entrar como usuario1" en /login.');
}

run().catch((err) => {
  console.error('Error creando el usuario de desarrollo:', err.message);
  process.exitCode = 1;
});
