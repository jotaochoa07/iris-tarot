# Lo que salió de las 22 cartas

No es una baraja. Es un **lenguaje formal para describir barajas**, y la baraja
es su primera aplicación.

La diferencia importa porque decide qué se puede hacer mañana. Con una baraja,
mañana tienes una baraja. Con un lenguaje, mañana puedes describir el Visconti,
el Noblet, el Conver, el Dodal o un oráculo que no existe todavía **cambiando
los datos y no el sistema**.

---

## Las piezas

| Pieza | Dónde vive | Qué responde |
|---|---|---|
| Canon semántico | `src/lib/knowledge/major-attributes.ts` | Qué debe representar cada carta |
| Grafo espacial | `src/lib/knowledge/major-graph.ts` | Cómo se relacionan los elementos entre sí |
| Canon visual | `docs/master/MASTER_REFERENCE.png` | Cómo debe verse, definido por una imagen y no por una especificación |
| Reglas de QA | `docs/iris-tarot-style-v1.md` | Cómo se revisa una carta antes de aceptarla |
| Clasificación de derivas | mismo documento | Si un fallo se arregla en los datos o en la generación |
| Prompts | `scripts/prompts-mayores.mjs` | Se generan de los datos. Nunca se escriben a mano |
| Manifest | `src/lib/knowledge/major-status.ts` | Qué está aprobado y qué retoque queda |
| Estado reproducible | `npm run estado` | Cuenta el propio código, no una persona |
| Fixtures y tests | `src/lib/knowledge/relations.test.ts` | Que la frontera hecho/interpretación no se erosione |

---

## Las seis reglas que lo hicieron posible

Están ordenadas por cuánto salvaron.

**1. Una maestra congelada, y referenciarla SIEMPRE a ella.** Nunca a la carta
anterior. Encadenando cada generación a la previa, la familia deriva sin que
nadie lo note hasta que ya es tarde.

**2. Dos canon separados.** El semántico no se negocia porque es lo que IRIS
enseña a observar: si el dibujo lo contradice, la lección queda desmentida por
la propia imagen. El visual lo define la imagen aprobada, no un documento —y
cuando el documento y la imagen discreparon, se corrigió el documento.

**3. Los prompts se generan de los datos.** Ningún prompt se quedó viejo cuando
cambió una ficha, porque no había prompts guardados que actualizar.

**4. Cuando los campos planos se quedan cortos, un grafo.** `manos`,
`bajo_los_pies` y `encima` responden a «¿qué hay?». Dos ilustraciones costaron
descubrir que la carta también dice cosas con el **cómo**: quién sostiene qué,
qué está detrás de qué, hacia dónde apunta.

**5. Un `null` no es una instrucción, es una ausencia.** `tocado: null` no dice
«sin sombrero»: no dice nada, y ante un silencio el modelo rellena con la
iconografía por defecto. Si la ausencia significa algo, se escribe en positivo.

**6. Para un recuento, describe posiciones y no cantidades.** Dos ediciones
pidiendo «seis muñones por tronco» salieron con nueve. La tercera decía «uno
arriba, uno en medio, uno abajo» y salió exacta. Contar se le da mal al modelo;
colocar, bien.

---

## Cómo se aplicaría a otra baraja

1. Copiar `major-attributes.ts` y rellenarlo mirando la baraja nueva. Marcar
   `verify: true` todo lo que no se pueda afirmar, y no generar hasta cerrarlo.
2. Copiar `major-graph.ts` y escribir solo las relaciones que enseñan algo.
3. Generar UNA carta maestra y congelarla.
4. Reescribir el canon visual del documento de estilo leyendo esa imagen.
5. `node scripts/prompts-mayores.mjs` y a producir.

El sistema no cambia. Los verbos del grafo, la separación en tres capas, la
clasificación de derivas, las pruebas y el manifest sirven igual.

---

## Y la regla que gobierna todo lo demás

> Si dos personas mirando las mismas cartas pudieran discrepar de la frase, la
> frase no es un hecho.

Eso es lo que separa `structural` de `interpretation` en el motor, lo que separa
`canonical` de `reading` en las fichas, y lo que se defiende con una prueba que
falla en vez de con buenas intenciones.

Es también, dicho de otra manera, todo el producto: **IRIS no predice, traduce.**
