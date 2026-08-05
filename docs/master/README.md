# La maestra

Aquí va **`MASTER_REFERENCE.png`**: la imagen aprobada de El Emperador, en su
resolución original.

Es la verdad visual del IRIS Marseille Deck. Cada uno de los otros veintiún
Arcanos Mayores se genera contra ella, y contra ella se revisa.

## Reglas

**Congelada.** No se regenera. No se mejora. No se retoca. Si algún día hubiera
que cambiar la dirección de arte, se crea `MASTER_REFERENCE_v2.png` y se
renumera el documento de estilo — no se sobrescribe esta.

**Se referencia siempre esta, nunca la carta anterior.** Encadenando cada
generación a la previa, la familia deriva sin que nadie lo note hasta que ya es
tarde.

**Va en el repositorio.** No es una carta más: es la especificación. Por eso
vive aquí, versionada, y no en `public/cards/`, que está ignorada.

## Dos copias, dos oficios

| Ruta | Para qué |
|---|---|
| `docs/master/MASTER_REFERENCE.png` | la referencia. Versionada. No se toca |
| `public/cards/arcano-04.png` | el naipe que muestra la aplicación. Ignorado por git |

Es el mismo archivo, con dos trabajos distintos. Si algún día se recorta o se
reescala la copia de `public/`, la de aquí sigue intacta.

## Lo que fija

Técnica, textura, densidad de trama, tratamiento del papel, riqueza cromática,
línea, volumen, marco, cartela y acabado de impresión. Todo eso se lee de la
imagen, no de una especificación previa.

Lo que la imagen NO decide es el canon semántico —numeral, nombre, mirada,
postura, manos, personajes, símbolos, relaciones espaciales—: eso vive en
`src/lib/knowledge/major-attributes.ts` y es lo único innegociable, porque es lo
que IRIS enseña a observar.

Ver `docs/iris-tarot-style-v1.md`.
