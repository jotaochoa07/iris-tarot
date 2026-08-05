# IRIS Tarot Style v1 — dirección de arte de los Arcanos Mayores

> **La maestra manda.**
>
> La imagen aprobada de El Emperador —`docs/master/MASTER_REFERENCE.png`— es la
> verdad visual de esta baraja. Este documento la describe; no la gobierna.
> Donde documento e imagen se contradigan, se corrige el documento.
>
> La maestra está **congelada**. No se regenera, no se mejora, no se retoca.

Documento de encargo. Sirve igual si las ilustraciones las genera un modelo de
imagen o las dibuja una persona.

El reparto es: la dirección de arte vive aquí, la ilustración se produce fuera,
y los 56 Arcanos Menores se siguen generando en SVG dentro de la aplicación —
adaptados a la orla de la maestra. No hay ninguna razón para que todo el mazo
comparta técnica de producción; sí la hay para que comparta lenguaje.

---

## Dos canon, y hay que cumplir los dos

Toda carta futura tiene que satisfacer a la vez:

### CANON SEMÁNTICO — qué debe representar

Es lo innegociable, y es innegociable por una razón concreta: **IRIS enseña a
observar estas cosas**. Si el dibujo las contradice, la lección queda desmentida
por la propia imagen.

- **Numeral marsellés correcto.** `IIII` y no `IV`. `VIIII` y no `IX`. `XIIII`,
  `XVIIII`. Igual en las tres posiciones. El Loco no lleva ninguno.
- **Nombre** correcto y acentuado en la cartela. El XIII va sin nombre: la
  cartela queda vacía, y eso es un dato de la carta.
- **Dirección de la mirada.** Izquierda, derecha o al frente.
- **Postura.** Sentado, de pie, caminando, suspendido.
- **Qué sostiene cada mano**, y en cuál de las dos.
- **Número de personajes.**
- **Elementos simbólicos** que la ficha declara.
- **Relaciones espaciales** que significan: qué hay bajo los pies, qué hay
  encima, quién está más alto, quién da la espalda.

La fuente de estos datos es `src/lib/knowledge/major-attributes.ts`, y los
prompts salen de ahí con `node scripts/prompts-mayores.mjs`.

### CANON VISUAL — cómo debe verse

Lo define la maestra. Todo lo de este apartado se lee de la imagen, no de una
especificación previa: técnica, textura, densidad de trama, tratamiento del
papel, riqueza cromática, línea, volumen, marco, cartela y acabado.

La instrucción operativa es una sola y va en todos los prompts:

```
Match the reference image of THE EMPEROR exactly: same border, same corner
leaves, same cartouche, same lettering, same line weight, same palette, same
paper, same level of hatching detail. Same world, same hand, same printing.
```

La referencia es **siempre la maestra**, nunca la carta anterior. Encadenando
cada carta a la previa, la familia deriva: para la diecisiete ya no se parece a
la cuatro.

---

## Paleta maestra

No es una paleta cerrada de siete hexadecimales. Perseguir la exactitud
matemática destruiría justo lo que hace que la maestra parezca impresa y no
renderizada: la tinta carga desigual, el papel tiene tono, las sombras
enriquecen el color.

Lo que se hereda es el **carácter**, no el valor:

| Familia | Carácter |
|---|---|
| Rojo | ladrillo, terroso, nada de bermellón chillón |
| Azul | profundo, apagado, azul de tinta |
| Oro | mostaza, sin brillo metálico |
| Tinta | negro amarronado, nunca negro puro |
| Papel | pergamino cálido, con tono, no blanco |
| Carnaciones | naturales y sobrias |

Se admiten **pequeños acentos** propios de cada carta —una gema, un ave, un
fruto— siempre dentro de la saturación de la maestra. Lo que no se admite es
subir el brillo, meter un color que grite más que los suyos, o dejar el fondo
blanco.

El criterio de aceptación es de ojo, no de cuentagotas: puesta al lado de la
maestra, ¿parecen salidas de la misma prensa?

---

## Lo que la maestra fija y antes no estaba escrito

Cosas que la especificación previa decía de otra manera, o no decía. Manda la
imagen:

- **El suelo lleva enlosado con líneas de fuga** en las escenas de interior o
  arquitectónicas. La especificación anterior pedía perspectiva plana sin punto
  de fuga; la maestra hace otra cosa y funciona. En escenas de exterior —El
  Loco, La Estrella, La Luna— el suelo se resuelve con el mismo lenguaje de
  trama, adaptado al terreno.
- **La regla inferior es doble y la segunda es verdosa**, no oscura.
- **El papel tiene textura y tono propios**, no es un plano liso.
- **El volumen se resuelve con trama densa y variada**, con más carga en los
  valles del paño y en los laterales en sombra. Es trama de verdad, no una
  insinuación.
- **La corona lleva gemas de color**, alternando azul y rojo.
- **Las esquinas llevan hoja dorada**, pequeña, inclinada hacia dentro.
- **El numeral aparece tres veces**: arriba al centro y en los dos cantos,
  girado. No es redundancia decorativa: el grado es la mitad de la lectura y la
  carta tiene que poder leerse desde cualquier lado de la mesa.

### Lo que sí puede variar de carta a carta

Establecido al comparar la maestra con La Emperatriz, que salió con flores de
lis en los laterales del trono donde el Emperador tenía el águila:

- **El ornamento del mobiliario.** Cada trono, cada columna, cada pedestal puede
  llevar su propio motivo. Lo que no cambia es cómo está dibujado: mismo
  contorno, misma trama, mismo oro.
- **La longitud del cabello, el ropaje y las telas**, dentro de la paleta.
- **El motivo del enlosado**, mientras conserve las líneas de fuga y la trama.

Lo que **no** puede variar nunca es la orla, la cartela, la posición de los
numerales, el papel ni la saturación.

---

## La orla, al detalle

Los 56 Menores en SVG ya la reproducen —`Border`, `Numerals` y `Cartouche` en
`src/components/deck/IrisCard.tsx`— sobre un lienzo de 400 × 600. Las medidas
van en proporción, para que sirvan a cualquier resolución.

| Elemento | Posición |
|---|---|
| Filete exterior | oscuro, fino, a 1,75% del borde, esquinas apenas redondeadas |
| Filete interior | rojo, a 3,75% del borde |
| Hojas de esquina | doradas, en las cuatro, inclinadas hacia dentro |
| Numeral superior | centrado, a 9,3% de la altura |
| Numerales laterales | girados 90°, a 9,5% de cada canto, centrados en vertical |
| Doble regla | a 87,3% de la altura: línea oscura y línea verdosa debajo |
| Cartela | centrada, a 93,7% de la altura, versales con espaciado amplio |

---

## Especificación técnica

| | |
|---|---|
| Proporción | 2:3 vertical, exacta. Los Menores se dibujan a 400 × 600 |
| Resolución | 1024 × 1536 mínimo |
| Formato | PNG |
| Nombre de archivo | `arcano-00.png` … `arcano-21.png` |
| Dónde va | `public/cards/` — ignorada por git, no sale del disco |
| La maestra | además, copia congelada en `docs/master/MASTER_REFERENCE.png` |

---

## Prompt maestro

El bloque `SUBJECT` de cada carta sale generado de los atributos:

```
node scripts/prompts-mayores.mjs            # los 22 → docs/prompts-mayores.md
node scripts/prompts-mayores.mjs arcano-03  # uno solo, por pantalla
```

Y se monta debajo de este cuerpo, que es común a las 22:

```
Original tarot card illustration in the style of a contemporary woodcut
engraving, reinterpreting the Tarot de Marseille tradition. Editorial, austere,
hand-cut feel. Printed, not painted.

[ SUBJECT — generado desde los atributos ]

TECHNIQUE — Flat colour fills with a dark outline. Volume rendered with dense
parallel hatching in the shadow areas: the folds of cloth, under the jaw, the
shaded faces of architecture, the ground. Distinct line weights: heavy outer
contour, medium interior lines, fine hatching. Warm textured paper, never flat
white.

PALETTE — Brick red, deep muted blue, mustard gold, brown-black ink, warm
parchment, natural skin tones. Small card-specific accents allowed within the
same saturation. Nothing brighter or more saturated than the reference.

COMPOSITION — Figure occupying the central portion of a 2:3 vertical frame.
Serene, neutral facial expression.

FRAME — Triple rule border with a red inner line, a small gold leaf in each of
the four corners, the roman numeral at top centre and rotated 90° on both side
edges, and the card name in serif capitals at the foot, below a double rule
whose lower line is greenish.

STRICTLY EXCLUDE — Photorealism. Soft airbrushed shading. Glows, sparkles,
light rays, particles. New-age or mystical fantasy aesthetics. Drop shadows.
Signatures or watermarks.

Match the reference image of THE EMPEROR exactly: same border, same corner
leaves, same cartouche, same lettering, same line weight, same palette, same
paper, same level of hatching detail. Same world, same hand, same printing.
```

---

## Orden de producción

**Resolver la ficha antes de generar.** Ocho de las veintidós llevan `verify:
true` en `major-attributes.ts`: son direcciones de mirada, manos y objetos que
cambian entre ediciones, y ahí no queremos afirmar de más. Generar una carta con
la ficha en duda significa arriesgarse a rehacer la ilustración, no a corregir
un texto.

El orden sensato es: cerrar la ficha contra una baraja física → generar →
revisar → congelar.

Cartas con ficha cerrada, listas para generar cuando toque:

`00 · 02 · 04 ✓ · 05 · 07 · 08 · 09 · 10 · 12 · 13 · 16 · 17 · 18 · 20 · 21`

Cartas que hay que comprobar primero:

`01 · 03 · 06 · 11 · 14 · 15 · 19`

---

## Revisión de cada carta

Semántico primero, porque es lo que no se puede negociar:

1. ¿El numeral está a la marsellesa y es el mismo en las tres posiciones?
2. ¿El nombre está bien escrito y acentuado? ¿El XIII va sin nombre?
3. ¿Mira hacia donde dice su ficha?
4. ¿La postura es la que dice su ficha?
5. ¿Cada mano sostiene lo que le corresponde, en la mano que le corresponde?
6. ¿Está el número de personajes correcto?
7. ¿Aparecen todos los símbolos declarados?
8. ¿Se respetan las relaciones espaciales: quién está encima, quién debajo,
   quién de espaldas?

Visual después, siempre contra la maestra y a ojo:

9. ¿El volumen está hecho con trama, o se ha colado un degradado?
10. ¿El papel tiene tono y textura?
11. ¿La saturación se mantiene dentro de la de la maestra?
12. ¿La orla, las hojas de esquina y la cartela coinciden?

Y la única que decide de verdad:

13. Puesta al lado de la maestra y de tres Menores en SVG, ¿parecen la misma
    baraja?

Las doce primeras existen para que la trece salga bien.
