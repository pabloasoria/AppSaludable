// Imágenes generadas por Stitch (proyecto "Recetas Saludables Planner") para
// las 12 recetas de muestra que Stitch usó como mockup del catálogo — el
// título coincide EXACTO con el de src/data/recipes.json, así que sirve como
// clave de lookup. El resto de recetas (68 de 80) no tienen foto generada:
// los componentes que usan este mapa deben tener un fallback visual (ver
// RecipeCard/RecipeDetail) para cuando `RECIPE_IMAGES[recipe.title]` es
// undefined. Host: lh3.googleusercontent.com/aida-public, CDN público de
// Google sin autenticación (mismo dominio que usan las páginas HTML de
// Stitch directamente).

const BASE = 'https://lh3.googleusercontent.com/aida-public/';

export const RECIPE_IMAGES: Record<string, string> = {
  'Salmón con costra de sésamo y brócoli':
    BASE +
    'AB6AXuCAL-e9UgIGieHDxeSqa11wW2U4WxvSbSQ81oAniOFuYVeTa_D9TC73zeRO0HMIC6rp_keh1ThpZn4gqzu78Pp7CyCCGCOC3fRisZNzS6QpWS7_nj73kyRb3hzywpUrL27b2OqXsuFJNYkRfX0ud5ccHzaIpKryD8JUJSRum6Uu5ihja8TmG0BJRNkYAMMCHSokpV-BAGg_wroGc4jeQN-5jOHl73cHuMoGB2t-xAvQF-E59hOjqjY0',
  'Huevos al horno en aguacate':
    BASE +
    'AB6AXuCahu-TlG5znJpz8YgOywZWf9I6a0mzwsO6uRtp-ACD3Jv6q5durper-Q8-h70aN306o2QJWmfnCklTXE9c9ZLKU0e22j9cgQ1nNohlI80NA9W5KjWi7sfK2rdYZT9c-NGnbDCluNY7QRYhs_tfrmYZNaiY9BdbBOcQWRKuplLawUp3LKMcvfOX6KrM3sMVvF67l3hIeDAyRtmit1lZJbuZUKtMsq8MFl6JZBC-2IOa3qFZ-rIhqbXk',
  'Arroz integral con verduras al vapor y pollo (Varoma)':
    BASE +
    'AB6AXuCR1_Lx9fOlFSjISTPW3waZNVaDSyKOVzFIKPM9rt8lUEQt_5Pev5u5mvBUsKVk2IdPY5kO0Fgbq2VDwga5JTOPRF6U1XRD5IoAtTMKVlw_gMGsigQVb-D032pvh-wx4P2eXRNmS_Aw-cOEfNkd1CTKpeElkB7l31Ow1HpSplTb7cm7sl52Gf2ztlvwDMEKOiVZYSqfHjIaTeXAp61yBcY6mwaipRfALrDYmsjeGjdQObrHcRrzE8zp',
  'Crema de calabacín y puerro con pollo':
    BASE +
    'AB6AXuArVT-FjAJ3TAN-21Qw4a3m5xokaLj22h6hleoRHgWi9_vgeWQYYbktowYq7gkok7AbhudJt8yxu5Ap1lT9FHrupht-ecRhAakTfEgGuk_qgXTENelUJb0qrdhs2EAWNF68rkwEGJiiLpgRNSsQ6e4CnPgQbHs1vFHcJammdasXJ6inAtJ0_ZD6XMsPdHCgTCdVieK2YN4az0ELyi8da_1UQfJ_MO67Z3xZ4tifhg2rSfJctrNpsdzB',
  'Barritas de avena y plátano horneadas':
    BASE +
    'AB6AXuDnE-9MLkokFh30hVq0bHP163Tsj-2QSUZWNFI6z76qf_im5JmHm_ay9G-3QypPQAugIh3ovg4WL-7_SEMVYEUr1H4ka8HGikYh62xzP1ZtXS_tywcqsSEh4NPvOFzFu-PACkZLN_aNkCsinIBgpUvGMvDrUJBD9RYdK8Ay7aK15wSw1WiVywBrHTLnBJE7C4SNosWuItHgxcEoFKxPXYJHIf0zYMgFzzwH3dhgAIG1T_QKflZA_Fmh',
  'Batido bowl de fresas y plátano':
    BASE +
    'AB6AXuAnLFo7njUE8FeecX4cskVuN4YkiwqWB5XuQs6Nk2wwKN-iuAo3_ZMlbBO5Xz-oGmpHi94LyAd29hEJbf_LMPby9YqRvuXl9m2JSRknAQeVLsJ4wX_0252XBx4fLcgxNJtXC4LiFoK_IxMGV4EI5SyPJnzzY-9FT0B2cczPX0uSSmAnqtQvGOON81154LkLuHioH4ZNv_5ECq8VtN1L9pVPe-5BINFQYNWYgJc08vZP7IWSg6JUG1w_',
  'Hummus clásico de garbanzos':
    BASE +
    'AB6AXuCKk0MH88fHxsa0OfElQAK5m-XfEDc0CBtc7v-a5yluydg5OwaPeuOWzI6hypI7XEEIFpuJM7j337WVuWCIC2QaHE0U6-LA8Kia8ydk-6jn_7c0TWI7qDlenWFFv_lBM9KiecYnX7rA4aV1Hb6XiMHGaLHheqiF-EC1FRgMPvoeEN0-i7b8aMIjWCX2oo8GcGK_BTZs8wKDCh6HjZiI5nSD_qSG7ECzC9wQYJJAORbC6utoSyPogNQ-',
  'Garbanzos crujientes especiados':
    BASE +
    'AB6AXuCj_FiD9Gf_TLO0x6IJj7NQi4ieZ-w1TaWekcjlbtRwNLxo7Bd8CgDzN6HpxG6Jzc_PBJbAdsr7A2xoG6K7mnyoB71na1jDGBRy5KtgbWRgHACQueXkQgJtKRY_vgWZfKJ4AiOIbkmSYy2rEA5KV5t4kYavW-2M_22yMje9ReVN1gqswoVctRDYvv3KCBCQkuAxQy00vD50i4fYsvomJad9IWWVZdXj634LggMq2-wDgr2jKNix3kUH',
  'Albóndigas de pollo con calabacín':
    BASE +
    'AB6AXuCuy1b2RF_LB8qq4W0GNhx-oj0f5JJZif7CQGVsUNMUg9tvHDWwcUKYWbbX3sa2sQdD6WhK3vVYz901Lda7kYreZSmY-UyHnAG0S6lNrpDZTaXYbLyhHtSKw8Vq_VWVMEa_SxaR-p9H4J8SwVhCzyhhlGfRUk4c7Wj9TtXCTkNcpH0LbsgMjAwG9Qa3hhLyKbOjPthgh9lw_aCHim_Y9YESGOvxPHYIRMxshV1js_1o61j52fOCek0U',
  'Merluza con salsa verde al Varoma':
    BASE +
    'AB6AXuC5Q_JFoXq45uhAK0CsPio9sYBJxn4ycGiR0T2e-7KJO3GuT7u3_MpzHUUp-KxhuGHzdC4FXUTbfUQnPFP9Ms0eDTReDRjAJIYsuBO9wmluEW2sM8BeH-QfwWQi5p5O4GYC-QXash96-b1sAdw5LT3NzRjLJZBWp6jC82YsaBBwd2etaVNzTAblD5TgxrivWVLdoYh1flBG1ulCUpFvTZ7ppNL1ekKPzIn7wF7AD3IJ5ZAhzS5fLjHy',
  'Boniato asado con canela y crema de cacahuete':
    BASE +
    'AB6AXuA5AntTJsBleMcWDtyvyloY7whcTdJsQOxJoZlCYnH2G6Z8EN1dDjBZ81KGpGHdXN94oelAUPwZWoWFOUz9i-nLr4mgY_797qBlpzTTTeK97x5wDUu6hKT8oKuZGRI1aYqT2GyPwFnIWDnFX7n6yelqRJGblzSV8ET2kH2LH78lNO442MHfL6d-yyAN3FEghcuvylG5ouyQ81aOPtEH5cp6Y-ImiaqZFuJ6LEkPorBkWf6lwg64RAio',
  'Bizcocho esponjoso de manzana':
    BASE +
    'AB6AXuDKfBMPLYNIT_QcOMOHXFA7Wg5gObmRL4WDg8LsDtGliy79Q4TzPhM5rP3SR__AB9mJLaoaj-Zk_a1PAPPY2p8cBlC5fY2PWP_96zsTW57CdoxIRgGwI3Roueeol_nCKwvaQ1N5kZEDdpOH851w76PvJaZ4qDNSTBQ2_LgB2PMjYBwZPLbyai6LPuYGD3A2yYOHqE06RQKLbq8jQ7bxtU20R9o1WPjoF9eqRJUN0vXLABiazBrbRZu3',
};

// Recorte distinto (más ancho, mayor resolución) usado por Stitch solo en la
// pantalla de detalle para esta receta concreta; el resto de recetas con
// foto reutilizan la miniatura de RECIPE_IMAGES también en el detalle.
export const RECIPE_DETAIL_HERO_OVERRIDE: Record<string, string> = {
  'Salmón con costra de sésamo y brócoli':
    BASE +
    'AB6AXuBkShJx4rXA_CB-WWqg-sQZCiSRQBvHeYvMnevqTeNhIK9Vbqxwefa62-V4ujPI2R1pj6YRnfJ2W4kJNtr5JOgEGRJLleMRNPOWwtEHrPBTcxL8vaUH61t3TsgvMHzvOe-8RpBIAs9C31Wfb_xKGo88PdRn7JbvTpEky3JL8m3xyiG4uI0WuUvuAO0_cPijq_sAkA3xliL8AfgsaC7bnuie29Dxr-bv7EZmamlElZdrkue1q62s4Wji',
};

export const LOGO_IMAGE =
  BASE +
  'AB6AXuCLSEXeomg7GPPo0UE3PZPaPRbFQ0vahLRhj8wQG7lg3XMLd98bKigQ7kt57K_8vTUSavPfe_n_UNgOhdoJuhJ8idjU3Vk3jagaAjuAEhYtGXENdem8HQQjk6ksRMSqEwqfVHJIBv65wuPU3XVLyB372eaBZO6ESUd7jPAxBMRQB4x66Jnjh7ByxWRm7O17cxKT2_d8gG343wYPM5uz9ImVd8HanKpgbTrCtavhQb_h15f7NHI6PdvQ';

export const LOGIN_HERO_IMAGE =
  BASE +
  'AB6AXuCLjuVc5DDvgyNiCPADV8boSTtfj7Vq3VJRQsK_RRz7MNhwRV2f9FPQVt1edM1QpZpOMZu8JfQmu8bH1PUYVStdIEI20eltilABP9zSFa28g02Co4BQst82CyEKoJgoGbeP4755kOinkq1IPtBBEEmUq9SOKOGj_QdiFUUnqD1TBx1h668HB9qVSWdpbOvHrpUEzgbrdmDDrc9DZAqMYfKn9r5v39lETSxWSlR41S7OxYrwQaKrIyqz';

export const TESTIMONIAL_AVATAR_IMAGE =
  BASE +
  'AB6AXuCa5b-nuFqiLI-S1S7HWZBsulercGWACNndVdRORFLT2PJLTyN3Hgu_aG5pZ_pOa8b3z8P1nfr83hliEl0kLGls-95cb8Pz7f_fyGCVikOC8EGKF61sNUF9_BVsXU04ygfZkieNKk9UeoVgbTGuqvbN-iVTQx0gTCbwCdrT8qwnJp9JTtOe1y2b8mKZFBR45nvB7sCvkN6bUCR3pkOlf6vwMzHnswz3Pt5T42DA38gJKe_pgZxxzSQs';
