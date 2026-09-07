// Imágenes decorativas generadas por Stitch (proyecto "Recetas Saludables
// Planner") que siguen usándose directamente desde Google — logo del header,
// hero de la portada de login y avatar del testimonio. Host:
// lh3.googleusercontent.com/aida-public, CDN público de Google sin
// autenticación, sin el límite de peticiones del subpath /aida/ (ver nota
// histórica más abajo).
//
// Las fotos de las 80 recetas del catálogo YA NO viven aquí: se generaron en
// Stitch en varias tandas bajo /aida/, un endpoint que no está pensado para
// hotlinking sostenido y empezó a devolver 429 (Too Many Requests) en cuanto
// se usó desde la app. Se descargaron una vez y se subieron al propio bucket
// de Supabase Storage (`recipe-photos`); cada receta guarda su URL final en
// `recipes.photo_url` (ver src/lib/recipes.ts). RecipeCard/RecipeDetail leen
// `recipe.photoUrl` directamente y caen al degradado con icono de método si
// es null — no hay fallback a un mapa de Stitch aquí.
const BASE = 'https://lh3.googleusercontent.com/aida-public/';

export const LOGO_IMAGE =
  BASE +
  'AB6AXuCLSEXeomg7GPPo0UE3PZPaPRbFQ0vahLRhj8wQG7lg3XMLd98bKigQ7kt57K_8vTUSavPfe_n_UNgOhdoJuhJ8idjU3Vk3jagaAjuAEhYtGXENdem8HQQjk6ksRMSqEwqfVHJIBv65wuPU3XVLyB372eaBZO6ESUd7jPAxBMRQB4x66Jnjh7ByxWRm7O17cxKT2_d8gG343wYPM5uz9ImVd8HanKpgbTrCtavhQb_h15f7NHI6PdvQ';

export const LOGIN_HERO_IMAGE =
  BASE +
  'AB6AXuCLjuVc5DDvgyNiCPADV8boSTtfj7Vq3VJRQsK_RRz7MNhwRV2f9FPQVt1edM1QpZpOMZu8JfQmu8bH1PUYVStdIEI20eltilABP9zSFa28g02Co4BQst82CyEKoJgoGbeP4755kOinkq1IPtBBEEmUq9SOKOGj_QdiFUUnqD1TBx1h668HB9qVSWdpbOvHrpUEzgbrdmDDrc9DZAqMYfKn9r5v39lETSxWSlR41S7OxYrwQaKrIyqz';

export const TESTIMONIAL_AVATAR_IMAGE =
  BASE +
  'AB6AXuCa5b-nuFqiLI-S1S7HWZBsulercGWACNndVdRORFLT2PJLTyN3Hgu_aG5pZ_pOa8b3z8P1nfr83hliEl0kLGls-95cb8Pz7f_fyGCVikOC8EGKF61sNUF9_BVsXU04ygfZkieNKk9UeoVgbTGuqvbN-iVTQx0gTCbwCdrT8qwnJp9JTtOe1y2b8mKZFBR45nvB7sCvkN6bUCR3pkOlf6vwMzHnswz3Pt5T42DA38gJKe_pgZxxzSQs';
