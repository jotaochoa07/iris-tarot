"use client";

import { useSyncExternalStore } from "react";
import {
  DEFAULT_DECK_STYLE,
  PALETTES,
  type DeckPalette,
  type DeckStyleId,
} from "./palettes";

/**
 * Qué tirada de imprenta está puesta.
 *
 * Es una preferencia de mirada, no un dato de la lectura: no viaja a la base de
 * datos ni entra en la exportación. Vive en el navegador y se avisa a todos los
 * naipes a la vez, para que cambien juntos y no uno detrás de otro.
 */

const KEY = "iris:mazo";
const EVENT = "iris:mazo-cambiado";

const listeners = new Set<() => void>();

function read(): DeckStyleId {
  if (typeof window === "undefined") return DEFAULT_DECK_STYLE;
  const v = window.localStorage.getItem(KEY);
  return v === "iluminacion" || v === "nocturno" ? v : DEFAULT_DECK_STYLE;
}

export function setDeckStyle(id: DeckStyleId) {
  window.localStorage.setItem(KEY, id);
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener(EVENT, cb);
  // Otra pestaña abierta también cuenta.
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useDeckStyle(): DeckStyleId {
  return useSyncExternalStore(subscribe, read, () => DEFAULT_DECK_STYLE);
}

export function useDeckPalette(): DeckPalette {
  return PALETTES[useDeckStyle()];
}
