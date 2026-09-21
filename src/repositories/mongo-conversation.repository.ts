import { ConversacionModel } from "../models/conversation.model.js";
import type { Conversacion } from "../types/conversation.types.js";

function copiarConversacion(
  conversacion: Conversacion
): Conversacion {
  return {
    telefono: conversacion.telefono,
    estado: conversacion.estado,
    datos: { ...conversacion.datos },
    creadaEn: conversacion.creadaEn,
    actualizadaEn: conversacion.actualizadaEn
  };
}

export async function obtenerConversacionMongo(
  telefono: string
): Promise<Conversacion | undefined> {
  const conversacion = await ConversacionModel
    .findOne({ telefono })
    .lean<Conversacion>()
    .exec();

  return conversacion
    ? copiarConversacion(conversacion)
    : undefined;
}

export async function guardarConversacionMongo(
  conversacion: Conversacion
): Promise<Conversacion> {
  const conversacionGuardada = await ConversacionModel
    .findOneAndUpdate(
      { telefono: conversacion.telefono },
      {
        $set: {
          estado: conversacion.estado,
          datos: conversacion.datos,
          actualizadaEn: conversacion.actualizadaEn
        },
        $setOnInsert: {
          telefono: conversacion.telefono,
          creadaEn: conversacion.creadaEn
        }
      },
      {
        upsert: true,
       returnDocument: "after",
        runValidators: true,
        setDefaultsOnInsert: true
      }
    )
    .lean<Conversacion>()
    .exec();

  if (!conversacionGuardada) {
    throw new Error("No se pudo guardar la conversación.");
  }

  return copiarConversacion(conversacionGuardada);
}

export async function eliminarConversacionMongo(
  telefono: string
): Promise<boolean> {
  const resultado = await ConversacionModel
    .deleteOne({ telefono })
    .exec();

  return resultado.deletedCount === 1;
}