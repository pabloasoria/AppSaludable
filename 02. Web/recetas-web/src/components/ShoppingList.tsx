'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Recipe } from '@/lib/recipe-types';
import { DAYS, SLOTS, cellKey } from '@/lib/planner';
import { usePlan } from '@/lib/usePlan';

type IngredientEntry = { quantity: string; recipeTitle: string; recipeId: string };
type IngredientGroup = { key: string; label: string; entries: IngredientEntry[] };

// Separa "320g Arroz Arborio o Carnaroli" en { quantity: "320g", name: "Arroz
// Arborio o Carnaroli" }. Heurística best-effort: no todos los ingredientes
// empiezan con cantidad ("Sal y pimienta al gusto"), en cuyo caso quantity
// queda vacío y el ingrediente se agrupa solo por nombre.
//
// Se reconocen tanto unidades de peso/volumen (g, ml...) como "unidades de
// cocina" (cucharada, diente, loncha...): así "1 cucharada de aceite de
// oliva" y "Aceite de oliva" identifican el mismo producto ("aceite de
// oliva"), en vez de quedar como dos ingredientes distintos en la lista.
const UNIT_WORDS =
  'g|kg|ml|l|litro|litros|cda|cdta|cdas|cdtas|cucharada|cucharadas|cucharadita|cucharaditas|ud|uds|unidad|unidades|diente|dientes|loncha|lonchas|lomo|lomos|rodaja|rodajas|manojo|manojos|puñado|puñados|pizca|pizcas';

// Singular canónico de cada "unidad de cocina" de UNIT_WORDS, para que
// summarizeQuantities (más abajo) reconozca "1 cucharada" + "3 cucharadas"
// como la misma unidad al sumar en vez de tratarlas como distintas por ser
// formas singular/plural distintas. g/kg/ml/l no llevan plural, así que no
// hace falta mapearlas (ya son su propio canónico).
const UNIT_SINGULAR: Record<string, string> = {
  litros: 'litro',
  cdas: 'cda',
  cdtas: 'cdta',
  cucharadas: 'cucharada',
  cucharaditas: 'cucharadita',
  uds: 'ud',
  unidades: 'unidad',
  dientes: 'diente',
  lonchas: 'loncha',
  lomos: 'lomo',
  rodajas: 'rodaja',
  manojos: 'manojo',
  puñados: 'puñado',
  pizcas: 'pizca',
};

// Inversa de UNIT_SINGULAR, para mostrar la suma con la forma plural cuando
// el total no es 1 ("6 cucharadas" en vez de "6 cucharada").
const UNIT_PLURAL: Record<string, string> = Object.fromEntries(
  Object.entries(UNIT_SINGULAR).map(([plural, singular]) => [singular, plural]),
);

// Palabras/frases sueltas al principio ("Diente de ajo picado" = "1 diente
// de ajo picado") que implican cantidad 1 aunque no lleven número delante.
const IMPLIED_ONE_RE = new RegExp(
  '^(diente|lonchas?|lomos?|manojo|puñado|rodajas?|cucharadas?|cucharaditas?|pizca)\\s+de\\s+(.*)$',
  'i',
);

function splitIngredient(text: string): { quantity: string; name: string } {
  // El "de" conector ("300 g DE brócoli", "2 dientes DE ajo") se descarta:
  // es una preposición, no parte del nombre del producto a comprar.
  const withUnit = text.match(new RegExp(`^(\\d+(?:[.,]\\d+)?\\s*(?:${UNIT_WORDS})\\.?)\\s+(?:de\\s+)?(.*)$`, 'i'));
  if (withUnit) return { quantity: withUnit[1].trim(), name: withUnit[2].trim() };

  const plainNumber = text.match(/^(\d+(?:[.,]\d+)?(?:\s*\/\s*\d+)?)\s+(?:de\s+)?(.*)$/);
  if (plainNumber) return { quantity: plainNumber[1].trim(), name: plainNumber[2].trim() };

  const impliedOne = text.match(IMPLIED_ONE_RE);
  if (impliedOne) return { quantity: `1 ${impliedOne[1].toLowerCase()}`, name: impliedOne[2].trim() };

  return { quantity: '', name: text.trim() };
}

// Rango Unicode "Combining Diacritical Marks" (U+0300–U+036F), construido con
// fromCharCode para evitar ambigüedades de codificación de caracteres no-ASCII
// directamente en el código fuente.
const DIACRITICS_RE = new RegExp('[' + String.fromCharCode(0x0300) + '-' + String.fromCharCode(0x036f) + ']', 'g');

function capitalize(text: string): string {
  return text.length ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

// Descompone una cantidad ya aislada ("320g", "2 dientes", "3") en su valor
// numérico y su unidad (cadena vacía si es un recuento suelto, "3 calabacín").
// Acepta fracciones tipo "1/2". Devuelve null si no se pudo interpretar como
// número (no debería pasar dado que `quantity` siempre viene de un match con
// número al principio, pero se comprueba por seguridad).
function parseQuantityValue(text: string): { value: number; unit: string } | null {
  // La fracción va primero en la alternancia: para "1/2", el patrón del
  // entero ("\d+") ya casaría con "1" sin más y dejaría "/2" colgando como si
  // fuera parte de la unidad si se probara antes.
  const match = text.match(/^(\d+\s*\/\s*\d+|\d+(?:[.,]\d+)?)\s*(.*)$/);
  if (!match) return null;
  const fraction = match[1].match(/^(\d+)\s*\/\s*(\d+)$/);
  const value = fraction
    ? parseInt(fraction[1], 10) / parseInt(fraction[2], 10)
    : parseFloat(match[1].replace(',', '.'));
  if (!Number.isFinite(value)) return null;
  const rawUnit = match[2].trim().toLowerCase();
  return { value, unit: UNIT_SINGULAR[rawUnit] ?? rawUnit };
}

function formatQuantityValue(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return rounded % 1 === 0 ? String(rounded) : rounded.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

// Si todas las cantidades del grupo comparten exactamente la misma unidad
// (incluido "sin unidad" — un recuento de piezas suelto, como en "1
// calabacín" + "3 calabacines") se suman en un único número. Si las unidades
// no coinciden (p. ej. "300 g" y "2 unidades") o alguna no se pudo
// interpretar, se listan tal cual con " + ": sumar unidades distintas
// automáticamente daría un dato incorrecto (ver cabecera del archivo).
function summarizeQuantities(quantities: string[]): string {
  const parsed = quantities.map(parseQuantityValue);
  const allParsed = parsed.every((p): p is { value: number; unit: string } => p !== null);
  const sameUnit = allParsed && parsed.every((p) => p!.unit === parsed[0]!.unit);
  if (sameUnit) {
    const total = parsed.reduce((sum, p) => sum + p!.value, 0);
    const singular = parsed[0]!.unit;
    const unit = total === 1 ? singular : (UNIT_PLURAL[singular] ?? singular);
    return unit ? `${formatQuantityValue(total)} ${unit}` : formatQuantityValue(total);
  }
  return quantities.join(' + ');
}

// Modificadores de preparación/tamaño/estado que NO cambian qué hay que
// comprar (cómo esté cortado o de qué tamaño es no importa en la tienda) y
// por tanto se descartan al agrupar. Deliberadamente NO se tocan palabras
// que sí cambian el producto: "de pollo"/"de verduras" (tipo de caldo),
// colores ("rojo"/"verde" de pimiento), "integral", "light", "griego"... —
// esas siguen generando grupos distintos a propósito.
const TRAILING_PHRASES = [
  'en juliana',
  'en dados',
  'en trozos',
  'en tiras',
  'en rodajas',
  'en gajos',
  'en cuartos',
  'en bastones',
  'en láminas',
  'en lonchas',
  'en cubos',
  'en rama',
  'al gusto',
  'y bien escurridos',
  'y bien escurridas',
  'y bien escurrido',
  'y bien escurrida',
  'y escurridos',
  'y escurridas',
  'y escurrido',
  'y escurrida',
];
const TRAILING_WORDS = [
  'picados',
  'picadas',
  'picado',
  'picada',
  'rallados',
  'ralladas',
  'rallado',
  'rallada',
  'troceados',
  'troceadas',
  'troceado',
  'troceada',
  'laminados',
  'laminadas',
  'laminado',
  'laminada',
  'triturados',
  'trituradas',
  'triturado',
  'triturada',
  'desmenuzados',
  'desmenuzadas',
  'desmenuzado',
  'desmenuzada',
  'machacados',
  'machacadas',
  'machacado',
  'machacada',
  'cocidos',
  'cocidas',
  'cocido',
  'cocida',
  'batidos',
  'batidas',
  'batido',
  'batida',
  'desalados',
  'desaladas',
  'desalado',
  'desalada',
  'congelados',
  'congeladas',
  'congelado',
  'congelada',
  'pelados',
  'peladas',
  'pelado',
  'pelada',
  'fileteados',
  'fileteadas',
  'fileteado',
  'fileteada',
  'deshuesados',
  'deshuesadas',
  'deshuesado',
  'deshuesada',
  'escurridos',
  'escurridas',
  'escurrido',
  'escurrida',
  'maduros',
  'maduras',
  'maduro',
  'madura',
  'grandes',
  'grande',
  'medianos',
  'medianas',
  'mediano',
  'mediana',
  'pequeños',
  'pequeñas',
  'pequeño',
  'pequeña',
  'finas',
  'finos',
  'fina',
  'fino',
  'frescos',
  'frescas',
  'fresco',
  'fresca',
  'enteros',
  'enteras',
  'entero',
  'entera',
];
// Frases primero (más largas), para no dejar restos sueltos al recortar.
// El tercer patrón quita paréntesis que solo repiten un peso/volumen ya
// implícito en el producto ("Pechugas de pollo (300 g)" y "Pechugas de
// pollo" son el mismo artículo de compra) — no se toca ningún otro
// paréntesis, que suele indicar una variante real (alternativa, nota).
const TRAILING_RE = new RegExp(
  '(\\s*\\(\\s*(?:opcional|o similar|como fermento)\\)?|\\s+(?:' +
    [...TRAILING_PHRASES, ...TRAILING_WORDS].join('|') +
    ')|\\s*\\(\\s*\\d+(?:[.,]\\d+)?\\s*(?:-\\s*\\d+(?:[.,]\\d+)?)?\\s*(?:g|kg|ml|l)\\s*\\))$',
  'i',
);

function stripTrailingModifiers(input: string): string {
  let result = input;
  for (let i = 0; i < 5; i++) {
    let next = result.replace(TRAILING_RE, '').trim();
    next = next.replace(/\s+y$/i, '').trim();
    if (next === result) break;
    result = next;
  }
  return result;
}

// Limpia UN fragmento ya aislado (una cantidad opcional + un nombre):
// colapsa cantidades incrustadas a mitad de frase ("Zumo de 1 limón" →
// "Zumo de limón") y quita los modificadores de preparación/tamaño del
// final. Se reutiliza tanto para la línea completa como para cada
// sub-ingrediente tras dividir listas ("1 cucharada de aceite de oliva"
// como segundo elemento de "Sal, pimienta y 1 cucharada de aceite de
// oliva" recupera aquí su propia cantidad y nombre).
function cleanSegment(raw: string): { quantity: string; name: string } {
  const { quantity, name } = splitIngredient(raw.trim());
  const withoutEmbeddedQty = name.replace(/\bde\s+\d+(?:[.,]\d+)?(?:\s*\/\s*\d+)?\s+/gi, 'de ');
  return { quantity, name: stripTrailingModifiers(withoutEmbeddedQty).trim() };
}

// Divide en la conjunción "y" cuando une dos PRODUCTOS distintos ("sal y
// pimienta" → dos artículos a comprar) — nunca cuando "y" encadena dos
// adjetivos del mismo producto ("rallado y bien escurrido"), caso que
// stripTrailingModifiers ya consume antes de llegar aquí (ver su bucle:
// quita el adjetivo final y, si queda una "y" colgando, también la quita,
// para poder seguir pelando adjetivos anteriores). Por eso esta función solo
// se llama con el resultado YA limpio de modificadores: si todavía queda una
// "y", es una lista real, no una cadena de adjetivos.
// Guarda de seguridad: no toca nada con paréntesis (p. ej. "sésamo (blanco y
// negro)"), donde la "y" describe una variedad, no un segundo producto.
function splitOnConjunctionY(name: string): string[] {
  if (name.includes('(')) return [name];
  const parts = name
    .split(/\s+y\s+/i)
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.length > 1 ? parts : [name];
}

// Un ingrediente en texto libre puede en realidad describir VARIOS
// productos a comprar por separado: "Aceite de oliva, orégano y sal" son
// tres artículos, no uno — tratarlo como uno solo antes hacía que "orégano y
// sal" se perdiera sin más (solo se conservaba lo anterior a la primera
// coma). Ahora se separa por comas y, en el último tramo, también por la "y"
// final al estilo lista española ("a, b y c").
function parseIngredientLine(raw: string): { quantity: string; name: string }[] {
  if (raw.includes(',')) {
    const commaParts = raw
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    const lastIndex = commaParts.length - 1;
    const lastSplit = splitOnConjunctionY(commaParts[lastIndex]);
    const allParts = [...commaParts.slice(0, lastIndex), ...lastSplit];
    return allParts.map(cleanSegment).filter((e) => e.name);
  }

  // Sin comas: se limpia la línea entera primero (esto ya resuelve
  // correctamente cadenas de adjetivos unidos por "y", como
  // "rallado y bien escurrido"). Si tras limpiar queda una "y" suelta, es
  // una lista real de productos y se separa; si no, es un único ingrediente.
  const cleaned = cleanSegment(raw);
  const parts = splitOnConjunctionY(cleaned.name);
  if (parts.length === 1) return [cleaned];
  // La cantidad de la línea original solo puede atribuirse al primer
  // producto — un único valor no se puede repartir entre varios artículos
  // distintos sin inventar un dato.
  return parts.map((name, i) => ({ quantity: i === 0 ? cleaned.quantity : '', name }));
}

function toComparable(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITICS_RE, '')
    .trim();
}

// El singular/plural español no sigue una única regla ("tomate"→"tomates"
// añade una "s", pero "calabacín"→"calabacines" añade "es"), así que en vez
// de adivinar una sola forma "correcta", se generan las variantes posibles
// de la PRIMERA palabra (el sustantivo principal: "pechuga de pollo",
// "tomate maduro") y luego se comprueba cuál de ellas ya existe como grupo.
// Solo afecta a la clave de agrupación interna, nunca al texto mostrado.
function candidateKeys(comparableName: string): string[] {
  const words = comparableName.split(' ');
  const first = words[0] ?? '';
  const rest = words.slice(1);
  const variants = new Set<string>([first]);
  if (first.length > 4 && first.endsWith('s')) variants.add(first.slice(0, -1)); // tomates -> tomate
  if (first.length > 5 && first.endsWith('es')) variants.add(first.slice(0, -2)); // calabacines -> calabacin
  if (!first.endsWith('s')) {
    variants.add(first + 's'); // tomate -> tomates
    variants.add(first + 'es'); // calabacin -> calabacines
  }
  return [...variants].map((w) => [w, ...rest].join(' '));
}

export function ShoppingList({ recipes }: { recipes: Recipe[] }) {
  const { plan, loaded } = usePlan();
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const recipesById = useMemo(() => {
    const map = new Map<string, Recipe>();
    recipes.forEach((r) => map.set(r.id, r));
    return map;
  }, [recipes]);

  const plannedRecipes = useMemo(() => {
    const list: Recipe[] = [];
    DAYS.forEach((day) => {
      SLOTS.forEach((slot) => {
        const id = plan[cellKey(day, slot.key)];
        const recipe = id ? recipesById.get(id) : undefined;
        if (recipe) list.push(recipe);
      });
    });
    return list;
  }, [plan, recipesById]);

  const groups = useMemo(() => {
    const map = new Map<string, IngredientGroup>();
    plannedRecipes.forEach((recipe) => {
      recipe.ingredients.forEach((ing) => {
        parseIngredientLine(ing).forEach(({ quantity, name }) => {
          const candidates = candidateKeys(toComparable(name));
          const existingKey = candidates.find((k) => map.has(k));
          const key = existingKey ?? candidates[0];
          if (!map.has(key)) map.set(key, { key, label: capitalize(name), entries: [] });
          map.get(key)!.entries.push({ quantity, recipeTitle: recipe.title, recipeId: recipe.id });
        });
      });
    });
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label, 'es'));
  }, [plannedRecipes]);

  const toggle = (key: string) => setChecked((prev) => ({ ...prev, [key]: !prev[key] }));

  const uniqueRecipeCount = new Set(plannedRecipes.map((r) => r.id)).size;
  const checkedCount = Object.values(checked).filter(Boolean).length;

  if (loaded && plannedRecipes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-surface-container-lowest p-10 text-center shadow-sm">
        <span className="material-symbols-outlined flex h-14 w-14 items-center justify-center rounded-full bg-surface-container text-3xl text-primary">
          calendar_month
        </span>
        <p className="max-w-xs text-sm text-on-surface-variant">Todavía no has planificado ninguna comida esta semana.</p>
        <Link
          href="/planificador"
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary via-primary-container to-secondary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition active:scale-[0.98]"
        >
          Ir al planificador
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface-container-lowest p-4 text-sm text-on-surface-variant shadow-sm">
        <span className="flex items-center gap-2">
          <span className="material-symbols-outlined flex h-8 w-8 items-center justify-center rounded-full bg-primary-fixed text-[18px] text-primary">
            shopping_cart_checkout
          </span>
          {groups.length} ingredientes · de {uniqueRecipeCount} recetas planificadas
          {checkedCount > 0 ? ` · ${checkedCount} marcados` : ''}
        </span>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-1.5 rounded-xl bg-surface-container-high px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-surface-container-highest print:hidden"
        >
          <span className="material-symbols-outlined text-[16px]">print</span>
          Imprimir / Guardar como PDF
        </button>
      </div>

      <p className="mb-4 text-xs text-outline print:hidden">
        Las cantidades se suman automáticamente cuando comparten la misma unidad. Si un ingrediente aparece con
        unidades distintas —g, ml, unidades sueltas— entre recetas (mezclarlas daría un dato incorrecto), se listan
        tal cual con &quot;+&quot;; revisa esas antes de comprar.
      </p>

      <ul className="divide-y divide-outline-variant/40 rounded-2xl bg-surface-container-lowest shadow-sm">
        {groups.map((group) => {
          const isChecked = !!checked[group.key];
          const quantities = group.entries.map((e) => e.quantity).filter(Boolean);
          const recipeTitles = Array.from(new Set(group.entries.map((e) => e.recipeTitle)));
          return (
            <li key={group.key}>
              <button
                type="button"
                onClick={() => toggle(group.key)}
                className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-surface-container-low"
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full border text-[11px] leading-none transition ${
                    isChecked ? 'border-primary bg-primary text-on-primary' : 'border-outline-variant'
                  }`}
                >
                  {isChecked ? '✓' : ''}
                </span>
                <span className="flex-1">
                  <span className={isChecked ? 'text-on-surface-variant line-through opacity-50' : 'font-medium text-on-surface'}>
                    {group.label}
                  </span>
                  <span className={`ml-2 text-xs ${isChecked ? 'opacity-50' : 'text-on-surface-variant'}`}>
                    {quantities.length > 0
                      ? summarizeQuantities(quantities)
                      : `usado en ${group.entries.length} receta${group.entries.length > 1 ? 's' : ''}`}
                  </span>
                  {recipeTitles.length > 1 && (
                    <span className="mt-0.5 block text-[11px] text-outline">{recipeTitles.join(' · ')}</span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
