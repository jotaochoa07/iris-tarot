# IRIS — análisis de producto

*Fase 1. Escrito antes de la primera línea de código y conservado como
referencia de las decisiones tomadas.*

---

## 1. Comprensión del producto

IRIS no es una app de lecturas de Tarot. Es un **cuaderno de estudio asistido**
para una disciplina simbólica concreta: el Tarot de Marsella leído según el
sistema estructural de Jodorowsky/Costa.

La tirada física es el hecho primario. La app entra después, y su trabajo no es
adivinar sino **traducir**: convertir una disposición de cartas en una
observación estructurada, aplicarla a una pregunta real y dejar una enseñanza.

El indicador de éxito es contraintuitivo para un producto digital: **el usuario
debe necesitar IRIS cada vez menos.** Cualquier decisión que aumente la
dependencia —predicciones seductoras, respuestas cerradas, gamificación de la
frecuencia— va en contra del producto aunque suba la retención.

---

## 2. Las cinco decisiones de producto

**1. La procedencia es un componente de interfaz, no una nota legal.**
Cada afirmación se emite etiquetada: fuente, estructura, interpretación o lente
psicológica. Es un tipo del modelo de datos (`Claim`), viaja en el JSON
exportado y se pinta con una marca discreta delante de cada párrafo. Sin esto,
IRIS es un generador de texto místico con buena tipografía.

**2. Lo que se puede calcular no se le pregunta al modelo.**
Palos presentes, palos ausentes, dominancia, progresión numérica, grados
repetidos, número de arcanos mayores: todo eso lo resuelve `readout.ts` en
código determinista y se le entrega ya resuelto al modelo. El modelo interpreta;
no cuenta. Así elimina de raíz la clase de error más embarazosa —«observo tres
Espadas» cuando hay dos.

**3. La confirmación es obligatoria y la incertidumbre es visible.**
El reconocimiento visual devuelve confianza por carta y una alternativa cuando
duda. Por debajo de 0,65 la interfaz escribe literalmente «no estoy
suficientemente segura». Nunca se interpreta antes de confirmar.

**4. Dos memorias que jamás se suman.**
`personal_count` cuenta apariciones en tiradas propias; `studied_count` cuenta
todo lo que el propietario ha trabajado, incluidas las tiradas hechas para
invitados. Está implementado en un trigger de base de datos, no en la interfaz,
para que ningún desarrollo futuro pueda mezclarlas por descuido. Existe además
una vista `personal_readings` para que calcular patrones sobre el conjunto
equivocado requiera un acto deliberado.

**5. Los datos son del usuario desde el primer día.**
Modelo portable definido con independencia de Supabase, `schema_version` en cada
tirada y exportación JSON completa desde el MVP. La migración a otra plataforma
no debe costar nada.

---

## 3. Riesgos y contradicciones detectadas

**Copyright del canon.** El brief pide que «La vía del Tarot» sea la fuente
principal, pero es una obra con derechos vigentes: no puede ingerirse y
reproducirse en un producto distribuible. **Resolución adoptada:** dos capas.
Capa 1, base estructurada de redacción original con atribución explícita de
escuela y sin localizador inventado. Capa 2, pipeline RAG opcional sobre los
PDFs personales del propietario, activable solo en su instalación. El motor
nunca las mezcla sin marcar el origen.

**Imágenes de la baraja.** La restauración Camoin–Jodorowsky tiene copyright. La
app usa escaneos de dominio público (linaje Conver / Noblet) para la Biblioteca
y las fotos del propio usuario para sus tiradas. Mientras no haya escaneos
cargados, IRIS dibuja una representación estructural honesta —que respeta el
número real de signos y el eje central de los impares— en lugar de simular una
carta que no tiene.

**«Nunca inventar elementos visuales» contra el modo Aprender.** Un LLM
describirá miradas y objetos plausibles pero inexistentes si se le deja. Por eso
la composición visual **no la genera el modelo**: se le entrega desde la base de
conocimiento y el prompt le prohíbe añadir elementos, ofreciéndole la salida de
formularlo como invitación a mirar la baraja física.

**No determinismo contra «qué observar».** Es la costura más frágil del
producto: la sección invita a mirar el futuro sin predecirlo. Se sostiene con
una instrucción explícita y un ejemplo de violación en el prompt del sistema.
Es el punto que más conviene auditar con uso real.

**Tensión pedagógica de fondo.** Cuanto mejor interpreta IRIS, menos aprende el
usuario. El contrapeso es estructural: el modo Reflexionar es deliberadamente
breve, el modo Aprender exige una sola lección por sesión, y los bloques «Mira
esto» formulan preguntas en lugar de dar respuestas.

---

## 4. Arquitectura de información del MVP

```
HOME  ¿Qué muestran hoy las cartas?
├── NUEVA TIRADA          foto → para quién → detección → confirmación
│                         → pregunta → estructura → lectura
├── TIRADA                observa · movimiento · interpreta · qué observar
│   ├── APRENDER          lección · carta por carta · mira esto
│   ├── ARQUETIPOS        lente psicológica opcional
│   └── DIARIO            notas · ¿qué ocurrió?
├── DIARIO                mías | invitados | todas → por persona
└── BIBLIOTECA            78 fichas → estructura · composición · mis tiradas
```

Una pantalla, una pregunta. La profundidad se despliega; no se impone.

---

## 5. Flujo principal

```
FOTOGRAFÍA
   ↓
¿PARA QUIÉN ES ESTA TIRADA?        ← perfiles desde V1
   ↓
RECONOCIMIENTO (visión)            ← devuelve confianza, no certeza
   ↓
CONFIRMACIÓN                       ← obligatoria: cambiar, reordenar,
   ↓                                 invertir, quitar, añadir
PREGUNTA
   ↓
ESTRUCTURA DE POSICIONES
   ↓
LECTURA ESTRUCTURAL (código) → INTERPRETACIÓN (modelo) → GUARDADO
   ↓
APRENDER · ARQUETIPOS · DIARIO
```

---

## 6. Componentes de interfaz

| Componente | Función |
|---|---|
| `CardFace` | Carta: escaneo si existe, dibujo estructural si no |
| `CardPicker` | Selector de las 78, red de seguridad del reconocimiento |
| `ProvenanceMark` / `ProvenanceLegend` | Procedencia visible de cada afirmación |
| `ClaimParagraph` | Párrafo con marca y «ver fuente» desplegable |
| `LearnPanel` | Microclase: lección única, acordeón carta a carta |
| `Notice` | Incertidumbre y avisos, sin alarmismo |
| `StepHeader` | Progreso del flujo en seis pasos |
| `Button` / `Display` / `Rule` | Primitivas editoriales |

---

## 7. Modelo de datos mínimo

`Person(id, type: owner|guest, display_name, is_recurring)`
`Reading(id, person_id, question, spread_type, positions[], cards[],
card_order[], orientation{}, image_reference, structural_readout,
tarot_analysis, learn_analysis, archetypal_analysis, reflection_question,
user_notes, outcome, outcome_added_at, learnings[], sources[])`
`CardProgress(card_slug, personal_count, studied_count, first/last_studied_at)`
`CardNote(card_slug, note)`

Definición canónica en `src/lib/types.ts`, independiente de Supabase.

---

## 8. Arquitectura del sistema de conocimiento

```
FUENTES
  ├── Capa 1  base estructurada         determinista, siempre disponible
  └── Capa 2  corpus privado (RAG)      opcional, solo instalación propia
        ↓
RECUPERACIÓN            retrieval.ts — devuelve contexto con SourceRef
        ↓
LECTURA ESTRUCTURAL     readout.ts — calculada en código, no inferida
        ↓
RAZONAMIENTO            engine.ts — prompts con jerarquía de escuelas
        ↓
INTERPRETACIÓN          salida JSON validada con zod
        ↓
RESPUESTA               Claim[] con procedencia, pintada por la interfaz
```

Cada escuela lleva identificador propio (`jodorowsky-costa`, `ben-dov`,
`marteau`, `pollack`, `jung`, `iris`). Añadir Ben-Dov o Marteau consiste en
añadir entradas con su `school`, no en reescribir el motor. Cuando dos escuelas
discrepen, el modelo tiene instrucción de mostrar la diferencia en lugar de
fundirla.

---

## 9. Cómo se separa fuente de interpretación

En cuatro sitios a la vez, porque un solo mecanismo se rompe:

1. **Tipo** — `Claim.provenance` es obligatorio en el modelo de datos.
2. **Esquema** — zod rechaza la respuesta si falta o no es válido.
3. **Prompt** — regla dura con instrucción de desempate: ante la duda entre
   «fuente» e «interpretación», siempre «interpretación».
4. **Interfaz** — marca visible delante de cada párrafo y «ver fuente»
   desplegable que muestra «página no disponible» cuando no hay localizador
   verificable. Nunca se inventa una página.

Jung recibe además una barrera propia: prompt separado, procedencia propia y
prohibición explícita de la forma «para Jung, esta carta significa». Puede
responder que no procede, y esa es una respuesta válida.

---

## 10. Qué es real y qué está simulado

**Real y funcional:** autenticación, esquema con RLS, perfiles propietario/
invitado, separación de las dos memorias por trigger, reconocimiento visual con
Claude, confirmación y corrección completa, lectura estructural calculada,
modos Reflexionar y Aprender generados en vivo, capa junguiana, Diario con
notas y desenlace, Biblioteca de 78 fichas, exportación JSON.

**Pendiente de material:** los escaneos de dominio público de la baraja
(`/public/cards/`). Mientras no estén, IRIS dibuja una representación
estructural honesta en lugar de fingir la carta.

**Diseñado pero desactivado:** la capa 2 del corpus. El punto de extensión
existe con su contrato definido; con `IRIS_CORPUS_RAG_ENABLED=false` devuelve
vacío y no simula pasajes jamás.

**Fuera de alcance por decisión:** pagos, comunidad, perfiles sociales,
gamificación, aprendizaje longitudinal avanzado (más allá de los contadores).
