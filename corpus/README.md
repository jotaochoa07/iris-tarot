# Corpus privado — capa 2

Esta carpeta está en `.gitignore`. No subas libros al repositorio.

## Para qué sirve

La **capa 1** (`src/lib/knowledge/`) es una base estructurada de redacción
original con atribución explícita de escuela. Siempre disponible, determinista y
distribuible.

La **capa 2** es recuperación semántica sobre tus propias copias de los libros,
para uso personal en tu instalación. Aporta lo que la capa 1 no puede tener:
localizadores verificables y matiz de autor.

Están separadas a propósito. El motor nunca las funde sin marcar el origen:
cada dato viaja con su `SourceRef.via` (`structured-kb` o `corpus-retrieval`).

## Jerarquía de escuelas

| Nivel | Escuela | `school` |
|---|---|---|
| 1 | Jodorowsky & Costa — *La vía del Tarot* | `jodorowsky-costa` |
| 2 | Yoav Ben-Dov — *The Marseille Tarot Revealed* | `ben-dov` |
| 2 | Paul Marteau — *Le Tarot de Marseille* | `marteau` |
| 3 | Rachel Pollack — *Seventy-Eight Degrees of Wisdom* | `pollack` |
| 4 | C. G. Jung — *El hombre y sus símbolos* | `jung` |

Reglas que el motor ya aplica:

- Cuando dos escuelas discrepan, se muestra la diferencia; no se fusiona.
- Pollack pertenece mayoritariamente al Rider-Waite-Smith: sus significados no
  se trasladan automáticamente al Marsella.
- Jung nunca se usa como autoridad sobre el significado de una carta.

## Activarla

```bash
IRIS_CORPUS_RAG_ENABLED=true
```

Con el valor en `false`, `retrieveFromCorpus()` devuelve vacío y el motor
trabaja solo con la capa 1. **Nunca simula pasajes.**

## Implementación pendiente

Contrato definido en `src/lib/knowledge/retrieval.ts`:

1. Ingesta local: PDF → texto → fragmentos de ~800 tokens con solape.
2. Embeddings → tabla `corpus_chunks` en Supabase con `pgvector`.
3. Consulta: embedding de la tirada, filtrado por `school`.
4. Devolver pasajes con localizador **real**. Si no hay localizador fiable,
   `locator` se queda en `null` y la interfaz muestra «página no disponible».
