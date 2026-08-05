-- ===========================================================================
-- IRIS — tiradas simuladas
--
-- Sacar cartas al azar no es echar las cartas: falta el gesto de barajar con
-- la pregunta en la cabeza. Se puede practicar así, y está bien que se pueda,
-- pero mezclarlas con las reales en el Diario destruiría el único registro
-- honesto que tiene el producto.
--
-- Por defecto false, que es lo que ya son todas las tiradas existentes.
-- ===========================================================================

alter table public.readings
  add column if not exists simulated boolean not null default false;

comment on column public.readings.simulated is
  'true si las cartas salieron de un reparto aleatorio y no de una baraja física.';
