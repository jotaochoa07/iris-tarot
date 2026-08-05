# IRIS Tarot Style v1 — dirección de arte de los Arcanos Mayores

Documento de encargo. Sirve igual si las ilustraciones las genera un modelo de
imagen o las dibuja una persona.

El reparto es: la dirección de arte y el sistema visual viven aquí, la
ilustración se produce fuera, y la composición final —orla, numeral, cartela—
la hace la aplicación. Los 56 Arcanos Menores seguirán generándose en SVG. No
hay ninguna razón para que todo el mazo comparta técnica de producción; sí la
hay para que comparta lenguaje.

---

## Las dos decisiones que lo condicionan todo

### 1. El marco viaja DENTRO de la imagen, y el SVG se adapta a él

> Revisado tras la carta maestra. La decisión previa era la contraria —marco
> compuesto por fuera— y era la correcta *en abstracto*: los modelos de imagen
> escriben mal, y veintidós marcos generados serían veintidós marcos distintos.
>
> La maestra de El Emperador salió con la orla, los acantos, los numerales
> laterales y la cartela integrados y **bien escritos**, con el suelo tramado
> muriendo contra el filete. Compuesto por fuera nunca habría quedado así de
> cosido. Cuando la evidencia contradice al plan, manda la evidencia.

La carta se genera entera: orla de tres filetes, acantos en las cuatro
esquinas, numeral romano en el canto izquierdo y en el derecho, doble regla y
cartela con el nombre al pie.

El precio hay que pagarlo en dos sitios:

- **El numeral es un dato, no un adorno.** Un `IV` donde debe ir `IIII`, o un
  `IX` donde debe ir `VIIII`, no es un defecto estético: contradice lo que IRIS
  enseña sobre el grado. Se revisa carta por carta y no se retoca: se rehace.
- **Los 56 Menores en SVG tienen que adoptar ESTA orla.** Es trabajo del lado
  del código, no del ilustrador: mismos filetes, mismos acantos, misma posición
  de los numerales laterales, misma cartela y misma tipografía al pie. La carta
  maestra pasa a ser la referencia de marco de toda la baraja.

Numerales correctos, para tenerlos a mano al revisar:

`I · II · III · IIII · V · VI · VII · VIII · VIIII · X · XI · XII · XIII ·
XIIII · XV · XVI · XVII · XVIII · XVIIII · XX · XXI`

El Loco no lleva número: la cartela va sola.

### 2. Fase 1 en Iluminación. El Nocturno se deriva después

El mazo tiene dos tiradas de imprenta. Generar las 22 dos veces multiplica el
riesgo de que las dos familias no se parezcan entre sí.

El orden correcto es: cerrar las 22 en **Iluminación** (pergamino cálido), y
solo cuando estén las 22 aprobadas, pasarlas por edición de imagen para
obtener la variante **Nocturno** conservando la composición. Editar preserva el
dibujo; regenerar, no.

Hasta que exista la variante nocturna, los Mayores se muestran en Iluminación
aunque el mazo esté en Nocturno. Es una incoherencia pequeña y temporal, y es
mucho menos grave que veintidós cartas que no se parecen entre sí.

---

## Especificación técnica

## La orla, al detalle

Tomada de la maestra. Los 56 Menores en SVG ya la reproducen —`Border`,
`Numerals` y `Cartouche` en `src/components/deck/IrisCard.tsx`— sobre un lienzo
de 400 × 600. Las medidas van en proporción del ancho de la carta, para que
sirvan a cualquier resolución.

| Elemento | Posición |
|---|---|
| Filete exterior | oscuro, fino, a 1,75% del borde, esquinas apenas redondeadas |
| Filete interior | rojo, a 3,75% del borde |
| Hojas de esquina | doradas, en las cuatro esquinas, inclinadas hacia dentro |
| Numeral superior | centrado, a 9,3% de la altura desde arriba |
| Numerales laterales | girados 90°, a 9,5% de cada canto, centrados en vertical |
| Doble regla | a 87,3% de la altura: una línea oscura y otra verde justo debajo |
| Cartela | centrada, a 93,7% de la altura, versales con espaciado amplio |

El numeral aparece **tres veces**: arriba y en los dos cantos. No es redundancia
decorativa — el grado es la mitad de la lectura, y la carta tiene que poder
leerse desde cualquier lado de la mesa.

---

## Especificación técnica

| | |
|---|---|
| Proporción | 2:3 vertical, exacta. La aplicación dibuja los 56 Menores a 400 × 600 |
| Resolución | 1024 × 1536 mínimo |
| Formato | PNG |
| Fondo | Plano, `#F1E7D2`. Sin viñeta, sin degradado, sin textura de papel, sin sombra proyectada |
| Nombre de archivo | `arcano-00.png` … `arcano-21.png` |
| Dónde va | `public/cards/` — esa carpeta está ignorada por git |
| Zona segura | Toda la figura dentro del 88% central. La aplicación recorta un poco al encajar la imagen dentro de la orla |

El grano de papel lo añade la aplicación sobre toda la interfaz. Si la imagen
ya trae textura, se duplica y se ensucia.

---

## Lenguaje visual

**Técnica.** Grabado contemporáneo. Relleno plano con contorno, y volumen
resuelto con **trama de líneas paralelas**, nunca con degradado ni con
aerógrafo. Debe parecer estampado, no pintado.

**Jerarquía de línea.** Tres grosores, siempre los tres presentes:

- contorno exterior de la figura, el más grueso
- líneas interiores: pliegues, separación de piezas, rasgos
- trama: la más fina, solo en los valles del paño, bajo el mentón, en las caras
  en sombra de los volúmenes arquitectónicos y en el suelo

**Paleta cerrada.** Estos siete y ningún otro. Nada de colores intermedios ni
mezclas:

| Uso | Color |
|---|---|
| Línea | `#241C14` |
| Campo | `#F1E7D2` |
| Rojo | `#B0392C` |
| Azul | `#2F5A86` |
| Oro | `#C9A23C` |
| Verde | `#557A4C` |
| Carnación | `#E6C6A4` |
| Violeta (secundario) | `#3B2D4A` |

**Perspectiva.** Frontal y plana, medieval. Nada de punto de fuga, nada de
escorzo dramático, nada de profundidad atmosférica.

**Rostros.** Serenos y sin expresión teatral. Ni sonrisas, ni ceños, ni ojos
brillantes. Las figuras del Tarot de Marsella no actúan: están.

**Prohibido.** Fotorrealismo. Sombreado suave. Brillos, resplandores, partículas,
destellos. Texturas de fantasía digital. Estética *new age*, aura, humo,
estrellas de purpurina. Firmas o marcas de agua. Cualquier texto.

---

## Prompt maestro — El Emperador

Se elige El Emperador como carta patrón porque concentra todos los problemas a
la vez: rostro de perfil, manos, objeto largo, postura sentada, mueble,
vestuario con pliegues y símbolo heráldico. Si esta funciona, las otras
veintiuna son variaciones.

```
Original tarot card illustration in the style of a contemporary woodcut
engraving, reinterpreting the Tarot de Marseille tradition. Editorial, austere,
hand-cut feel.

SUBJECT — The Emperor. A bearded king seated in profile, facing LEFT. He wears
a four-pointed crown with jewels. In his raised hand he holds a long sceptre
topped with an orb and cross. His other hand rests on the arm of a cubic
throne. His legs are crossed so that they form the shape of a number four. A
shield bearing a black eagle stands on the ground at his feet.

TECHNIQUE — Flat colour fills with a dark outline. Volume rendered ONLY with
parallel hatching lines in the shadow areas: the folds of the robe, under the
jaw, the shaded face of the throne, the ground. Three distinct line weights:
heavy outer contour, medium interior lines, fine hatching. Printed, not
painted.

PALETTE — Strictly limited to: line #241C14, background #F1E7D2, red #B0392C,
blue #2F5A86, gold #C9A23C, green #557A4C, skin #E6C6A4. No other colours, no
blends, no gradients.

COMPOSITION — Frontal, flat, medieval perspective. No vanishing point, no
dramatic foreshortening. Figure centred, occupying the central 88% of a 2:3
vertical frame. Flat #F1E7D2 background with no vignette, no texture, no
shadow. Serene, neutral facial expression.

FRAME — Triple rule border (dark outer, thin red inner), a small gold acanthus
leaf in each of the four corners, the roman numeral rotated 90° on the left and
right edges, and the card name in serif capitals inside a cartouche at the foot,
above a double rule.

STRICTLY EXCLUDE — Photorealism. Soft shading. Glows, sparkles, light rays,
particles. New-age or mystical fantasy aesthetics. Drop shadows. Signatures or
watermarks.
```

Cuando la maestra esté aprobada, el prompt de las otras veintiuna es este mismo
con el bloque `SUBJECT` sustituido, el numeral y el nombre cambiados, y esto al
final:

```
Match the reference image exactly: same border, same corner leaves, same
cartouche, same lettering, same line weight, same palette, same background,
same level of hatching detail. Same world, same hand, same printing.
```

La referencia es siempre **la maestra**, no la carta anterior. Encadenar cada
carta a la anterior hace que la familia derive: para la diecisiete ya no se
parecerá a la uno.

---

## Lo que no se puede cambiar entre cartas

Estos atributos no son decisiones de dibujo: son el contenido de la carta y lo
que IRIS explica en el análisis. Si el dibujo los contradice, la enseñanza queda
desmentida por la propia imagen.

- **Hacia dónde mira** la figura. Izquierda, derecha o al frente.
- **Qué sostiene cada mano**, y en cuál.
- **De pie o sentada.**
- **Qué hay bajo los pies** y qué hay encima.
- **Cuántas figuras** aparecen, y cómo se relacionan.

Van a vivir como datos estructurados en `src/lib/knowledge/majors.ts`, de modo
que el motor pueda razonar sobre ellos —«dos cartas seguidas mirando en
direcciones opuestas» pasa a ser una observación calculada, con procedencia
estructural, y no algo que el modelo se invente.

---

## Revisión de cada carta

Antes de dar una por buena:

1. ¿El numeral está bien escrito, a la manera del Tarot de Marsella —`IIII` y
   no `IV`, `VIIII` y no `IX`— y es el mismo en los dos cantos? ¿El nombre de
   la cartela está bien escrito y acentuado? Si falla, se rehace. No se retoca.
2. ¿Los siete colores son exactamente los de la paleta?
3. ¿El volumen está hecho con trama, o se ha colado un degradado?
4. ¿Se distinguen los tres grosores de línea?
5. ¿El fondo es plano y del color exacto?
6. ¿La figura mira hacia donde dice su ficha de atributos?
7. ¿Cada mano sostiene lo que le corresponde, en la mano que le corresponde?
8. ¿Cabe entera en el 88% central, sin que el recorte de la orla le coma nada?
9. Puesta al lado de la maestra y de tres menores en SVG, ¿parecen la misma
   baraja?

La novena es la única que importa de verdad. Las ocho primeras existen para que
la novena salga bien.
