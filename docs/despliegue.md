# Antes de desplegar en Vercel

Ordenado por riesgo, no por esfuerzo. Los tres primeros son bloqueantes de
verdad; el resto se puede asumir a sabiendas.

---

## 1. El build nunca se ha verificado

`npm run typecheck` pasa, pero **eso no es lo mismo que `npm run build`**. Next
hace en el build cosas que el compilador no mira: fronteras entre servidor y
cliente, prerenderizado de páginas estáticas, imports que solo fallan al
empaquetar. Desde que empezaron los cambios grandes solo se ha comprobado el
typecheck.

```powershell
cd D:\jota-os\Iris-tarot
npm run build
```

Si esto no pasa en local, no va a pasar en Vercel. Es lo primero.

---

## 2. El corpus es un problema legal si la app sale de tu máquina

Los libros de `corpus/` no son tuyos. En tu ordenador, para estudiar, es un uso
privado y no se lo discute nadie. Pero al desplegar cambian dos cosas:

- Los fragmentos ya están **en tu Supabase**, no en tu disco.
- La política de `corpus_chunks` es «lectura autenticada»: cualquiera que se
  registre en la app puede recibir párrafos literales de esos libros.

Eso ya no es uso privado, es distribución. Tres salidas:

| Opción | Qué implica |
|---|---|
| Desplegar con `IRIS_CORPUS_RAG_ENABLED=false` | La capa 2 se apaga en producción y sigue activa en tu local. IRIS pierde las citas literales pero conserva la capa 1 entera. **Es lo que yo haría.** |
| Restringir la app a tu cuenta | Sigue habiendo distribución, pero solo a ti. Aceptable si nadie más entra nunca |
| Sustituir el corpus por fuentes libres | Lo correcto a largo plazo, y trabajo aparte |

---

## 3. Las llamadas a Anthropic las paga tu tarjeta, y el registro está abierto

Supabase Auth acepta a cualquiera que ponga un correo. Una vez dentro, cada
tirada dispara una llamada de visión y otra de lectura con presupuesto de 6.000
tokens. No hay límite por usuario ni por día.

Alguien que descubra la URL puede quemarte la clave en una tarde. Antes de que
sea pública, una de estas:

- Lista blanca de correos en el `proxy.ts`, comprobando `user.email`.
- Desactivar el registro en Supabase (Authentication → Providers → Email →
  «Allow new users to sign up» en off) y crear tú las cuentas.
- Un contador de tiradas por usuario y día en la base de datos.

La primera son diez líneas y resuelve el caso real, que eres tú y quizá dos
personas más.

---

## 4. `maxDuration = 120` puede pasarse del límite del plan

`/api/reflect`, `/api/learn` y `/api/detect` declaran 120 segundos. El plan
gratuito de Vercel corta antes. Si el plan no da para 120, hay que bajarlo y
reducir `maxTokens`, o la lectura se cortará a media generación —y el mensaje
que verás será el de «la respuesta se cortó por longitud», que ya existe.

Compruébalo contra tu plan antes de subir.

---

## 5. Las 22 ilustraciones no van a estar en producción

`public/cards/` está en el `.gitignore`, así que Vercel desplegará sin ellas y
los Arcanos Mayores se verán con el marcador SVG. Hay que decidir:

- **Commitear `IMG_Baraja/` y copiar de ahí a `public/cards/` en el build.**
  Son ilustraciones originales tuyas: puedes versionarlas sin problema.
- O subirlas a Supabase Storage y servirlas desde ahí.

La primera es más simple y no añade infraestructura.

---

## 6. Variables de entorno en Vercel

Van estas:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
ANTHROPIC_API_KEY
IRIS_ANTHROPIC_BASE_URL=https://api.anthropic.com
IRIS_MODEL_READING
IRIS_MODEL_VISION
NEXT_PUBLIC_SITE_URL=https://tu-dominio.vercel.app
IRIS_CORPUS_RAG_ENABLED=false
```

**No subas `SUPABASE_SERVICE_ROLE_KEY`.** Ninguna ruta de la aplicación la usa:
solo la necesitan los scripts de ingesta y de enlace, que se ejecutan en tu
máquina. Es una credencial de administrador que salta la RLS; en Vercel solo
sería superficie de ataque.

`IRIS_ANTHROPIC_BASE_URL` va explícita a propósito, por lo que ya pasó una vez:
el SDK lee `ANTHROPIC_BASE_URL` del entorno sin avisar.

---

## 7. Supabase: URLs de retorno

Authentication → URL Configuration:

- **Site URL**: `https://tu-dominio.vercel.app`
- **Redirect URLs**: añadir `https://tu-dominio.vercel.app/auth/callback` sin
  quitar `http://localhost:3000/auth/callback`

Si no, el enlace de acceso devuelve a localhost desde producción.

---

## 8. El correo de Supabase no sirve para usuarios reales

El SMTP incluido permite unos pocos envíos por hora. Para ti da igual —tienes
`scripts/enlace.mjs`—, pero cualquier otra persona se quedará esperando un
correo que no llega. Si va a entrar alguien más, hay que configurar un SMTP
propio en Authentication → Emails.

---

## 9. Páginas que no deberían ser públicas

- **`/diagnostico`** enseña qué modelos tienes configurados, a qué URL apuntan
  las llamadas y si las claves están puestas. Útil en local, información de más
  en producción.
- **`/tipografia`** es un banco de pruebas y ya cumplió su función.

Las dos se pueden dejar detrás de `process.env.NODE_ENV === "development"` con
un `notFound()`.

---

## 10. Suelto

- Falta `docs/master/MASTER_REFERENCE.png`. `npm run estado` lo recuerda.
- Quedan retoques de numeral en varias cartas; la lista sale del mismo comando.
- Las migraciones `0001`, `0002` y `0003` tienen que estar aplicadas en el
  proyecto de Supabase que use producción. Si es el mismo que usas en local, ya
  lo están.
