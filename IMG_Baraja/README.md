# IMG_Baraja

Las 22 ilustraciones aprobadas del IRIS Marseille Deck, en su resolución
original. Esta carpeta es el **archivo maestro**: lo que se conserva.

`public/cards/` es otra cosa: es lo que sirve la aplicación, está ignorado por
git y se puede reescalar o recomprimir sin miedo, porque el original vive aquí.

## Nombres

```
arcano-00.png   El Loco              arcano-11.png   La Fuerza
arcano-01.png   El Mago              arcano-12.png   El Colgado
arcano-02.png   La Papisa            arcano-13.png   (sin nombre)
arcano-03.png   La Emperatriz        arcano-14.png   Templanza
arcano-04.png   El Emperador ← MAESTRA
arcano-05.png   El Papa              arcano-15.png   El Diablo
arcano-06.png   El Enamorado         arcano-16.png   La Torre
arcano-07.png   El Carro             arcano-17.png   La Estrella
arcano-08.png   La Justicia          arcano-18.png   La Luna
arcano-09.png   El Ermitaño          arcano-19.png   El Sol
arcano-10.png   La Rueda de la Fortuna
                                     arcano-20.png   El Juicio
                                     arcano-21.png   El Mundo
```

## Qué copiar dónde

```
IMG_Baraja/arcano-04.png          el original, aquí
docs/master/MASTER_REFERENCE.png  la misma imagen, congelada como referencia
public/cards/arcano-04.png        la que muestra la app
```

Son tres copias con tres oficios distintos. La de `docs/master/` no se toca
nunca; la de `public/` se puede optimizar; la de aquí es el respaldo.

## Retoques pendientes

`npm run estado` los lista. Cuando corrijas una carta, **sustituye la copia de
esta carpeta también** — si no, el archivo maestro deja de serlo.
