// Credenciales de un usuario fijo para saltar el login real (enlace mágico)
// mientras se desarrolla. SOLO para desarrollo — ver README "Modo
// desarrollo: login automático". El usuario debe existir en Supabase Auth;
// créalo con `node scripts/create-dev-user.js` (usa las mismas constantes,
// duplicadas allí porque ese script es CommonJS y no puede importar de
// `src/`).
//
// Para volver al login real, pon DEV_LOGIN_ENABLED en `false` en
// src/app/login/page.tsx.
export const DEV_USER_EMAIL = 'usuario1@dev.local';
export const DEV_USER_PASSWORD = 'usuario1-dev-2026';
