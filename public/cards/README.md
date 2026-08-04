# Imágenes de las cartas

IRIS busca cada carta en `/public/cards/<slug>.jpg`. Si el archivo no existe,
dibuja una representación estructural en su lugar — no finge tener una carta que
no tiene.

## Qué escaneos usar

Usa ediciones en **dominio público** del Tarot de Marsella:

- **Nicolas Conver, 1760** — el estándar del Marsella tipo II.
- **Jean Noblet, ~1650** — Marsella tipo I, trazo más antiguo.
- **Jean Dodal, ~1701** — alternativa de la misma familia.

No incluyas en el repositorio escaneos de restauraciones modernas con derechos
vigentes (Camoin–Jodorowsky, Ben-Dov, Fournier y similares). Puedes usarlas en
tu instalación privada, pero no distribuirlas.

## Convención de nombres

Arcanos Mayores, dos dígitos, del 00 al 21:

```
arcano-00.jpg   El Loco
arcano-01.jpg   El Mago
...
arcano-21.jpg   El Mundo
```

Arcanos Menores, `<palo>-<grado>` con grado de dos dígitos:

```
bastos-01.jpg   As de Bastos
bastos-10.jpg   X de Bastos
bastos-11.jpg   Sota de Bastos
bastos-12.jpg   Caballero de Bastos
bastos-13.jpg   Reina de Bastos
bastos-14.jpg   Rey de Bastos
```

Palos válidos: `bastos`, `copas`, `espadas`, `oros`.

## Recomendaciones técnicas

- Proporción ~0,6 (por ejemplo 600 × 1000 px).
- JPEG de calidad alta, 150–250 KB por carta.
- Recorte al borde impreso, sin marco blanco añadido.
- Color sin corregir en exceso: los pigmentos de Marsella son el único color
  saturado de toda la interfaz.
