import type { Conversacion } from "../types/conversation.types.js";

const conversaciones = new Map<string, Conversacion>();

function copiarConversacion(conversacion: Conversacion): Conversacion {
  return {
    ...conversacion,
    datos: { ...conversacion.datos }
  };
}

export function obtenerConversacion(
  telefono: string
): Conversacion | undefined {
  const conversacion = conversaciones.get(telefono);

  return conversacion
    ? copiarConversacion(conversacion)
    : undefined;
}

export function guardarConversacion(
  conversacion: Conversacion
): Conversacion {
  const copia = copiarConversacion(conversacion);

  conversaciones.set(conversacion.telefono, copia);

  return copiarConversacion(copia);
}

export function eliminarConversacion(telefono: string): boolean {
  return conversaciones.delete(telefono);
}