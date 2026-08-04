# IRIS

**Entre las cartas y tú.**

Mentor personal para aprender a leer el Tarot de Marsella. Convierte una tirada
física fotografiada en una interpretación estructurada y, sobre todo, en una
lección. El objetivo del producto es que dependas de él cada vez menos.

> IRIS no predice. IRIS traduce.

---

## Puesta en marcha

### 1. Dependencias

```bash
npm install
```

### 2. Supabase

Crea un proyecto en [supabase.com](https://supabase.com) y ejecuta la migración
en **SQL Editor**:

```
supabase/migrations/0001_init.sql
```

Crea tablas, políticas RLS, el bucket privado `spreads`, el trigger de progreso
y el alta automática del perfil propietario.

En **Authentication → URL Configuration** añade como redirect URL:

```
http://localhost:3000/auth/callback
https://TU-DOMINIO.vercel.app/auth/callback
```

### 3. Variables de entorno

```bash
cp .env.example .env.local
```

Rellena `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y
`ANTHROPIC_API_KEY`.

### 4. Arrancar

```bash
npm run dev
```

Entra con tu correo: recibirás un enlace de acceso.

### 5. Desplegar en Vercel

Importa el repositorio, copia las mismas variables de entorno y ajusta
`NEXT_PUBLIC_SITE_URL` al dominio de producción.

---

## Imágenes de la baraja

`/public/cards/` está vacío a propósito. Ver
[`public/cards/README.md`](public/cards/README.md): usa escaneos de **dominio
público** (linaje Conver 1760 o Noblet 1650) nombrados `<slug>.jpg`. Mientras no
existan, IRIS dibuja una representación estructural en su lugar.

Las fotografías de tus tiradas son tuyas y viven en tu bucket privado.

---

## Corpus

Dos capas, nunca mezcladas sin marcar el origen.

**Capa 1 — base estructurada** (`src/lib/knowledge/`). Redacción original con
atribución explícita de escuela. Determinista y siempre disponible.

**Capa 2 — corpus privado** (`corpus/`, desactivada por defecto). Pipeline RAG
sobre tus propios PDFs, para uso personal. Ver
[`corpus/README.md`](corpus/README.md).

---

## Estructura

```
src/
├── app/
│   ├── page.tsx                  Home
│   ├── entrar/                   Acceso por enlace mágico
│   ├── tirada/nueva/             Flujo de seis pasos
│   ├── tirada/[id]/              Lectura, Aprender, Arquetipos, Diario
│   ├── diario/                   Mías | Invitados | Todas
│   ├── biblioteca/               78 fichas
│   └── api/                      detect · reflect · learn · archetypes · export
├── components/                   CardFace · CardPicker · primitivas
└── lib/
    ├── types.ts                  Modelo portable. Fuente de verdad.
    ├── knowledge/                Capa 1 + lectura estructural + retrieval
    ├── iris/                     Voz, prompts, esquemas, motor
    ├── actions/                  Server actions
    └── supabase/                 Clientes y middleware
supabase/migrations/              Esquema y RLS
docs/                            Análisis de producto y notas de arquitectura
```

---

## Principios que el código debe respetar

1. **Nunca interpretar antes de confirmar** las cartas y su orden.
2. **Lo calculable no se le pregunta al modelo.** Palos, números y progresiones
   se resuelven en `readout.ts`.
3. **Toda afirmación lleva procedencia:** fuente, estructura, interpretación o
   lente psicológica.
4. **Nunca inventar una página** ni atribuir a un autor algo que no dijo.
5. **Dos memorias que no se suman:** patrones personales ≠ progreso de estudio.
6. **Los datos son del usuario.** Exportación completa desde el primer día.
