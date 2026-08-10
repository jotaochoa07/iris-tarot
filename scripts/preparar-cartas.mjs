/**
 * Copia las ilustraciones del archivo maestro a lo que sirve la aplicación.
 *
 * Se ejecuta solo con `npm run build`, antes del build de Next.
 *
 * `public/cards/` está en el .gitignore a propósito: ahí puede haber
 * fotografías de la baraja física de quien usa IRIS, y esas no salen de su
 * disco. Pero en producción sí hacen falta las 22 ilustraciones propias, que sí
 * están versionadas en IMG_Baraja/. Este script hace de puente.
 *
 * No sobrescribe lo que ya haya: si alguien puso su propia foto de una carta,
 * su foto manda.
 */

import { readdirSync, copyFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";

const origen = resolve(process.cwd(), "IMG_Baraja");
const destino = resolve(process.cwd(), "public/cards");

if (!existsSync(origen)) {
  console.log("  IMG_Baraja/ no existe. Nada que copiar.");
  process.exit(0);
}

mkdirSync(destino, { recursive: true });

const imagenes = readdirSync(origen).filter((f) =>
  /^arcano-\d{2}\.(png|jpg|jpeg|webp)$/i.test(f),
);

let copiadas = 0;
let respetadas = 0;

for (const nombre of imagenes) {
  const fin = join(destino, nombre);
  if (existsSync(fin)) {
    respetadas++;
    continue;
  }
  copyFileSync(join(origen, nombre), fin);
  copiadas++;
}

console.log(
  `  Cartas: ${copiadas} copiadas` +
    (respetadas ? `, ${respetadas} ya estaban y se respetan` : "") +
    ` · ${imagenes.length} de 22 en el archivo`,
);

if (imagenes.length < 22) {
  console.log(
    `  Faltan ${22 - imagenes.length} ilustraciones en IMG_Baraja/. Las que falten se dibujarán en SVG.`,
  );
}
