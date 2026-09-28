import mongoose, {
  type HydratedDocument
} from "mongoose";
import { LeadModel } from "../models/lead.model.js";
import type { Conversacion } from "../types/conversation.types.js";
import type {
  EstadoGestionLead,
  Lead,
  NuevoLead
} from "../types/lead.types.js";

function convertirLead(
  documento: HydratedDocument<NuevoLead>
): Lead {
  return {
    id: documento._id.toString(),
    telefono: documento.telefono,
    datos: { ...documento.datos },
    estadoGestion: documento.estadoGestion,
    conversacionCreadaEn:
      documento.conversacionCreadaEn,
    creadoEn: documento.creadoEn,
    actualizadoEn: documento.actualizadoEn,
    contactadoEn: documento.contactadoEn
  };
}

export async function guardarLeadCalificadoMongo(
  conversacion: Conversacion
): Promise<Lead> {
  const ahora = new Date();

  const documento = await LeadModel.findOneAndUpdate(
    {
      telefono: conversacion.telefono,
      conversacionCreadaEn: conversacion.creadaEn
    },
    {
      $setOnInsert: {
        telefono: conversacion.telefono,
        datos: { ...conversacion.datos },
        estadoGestion: "pendiente",
        conversacionCreadaEn: conversacion.creadaEn,
        creadoEn: ahora,
        actualizadoEn: ahora
      }
    },
    {
      upsert: true,
      returnDocument: "after",
      runValidators: true,
      setDefaultsOnInsert: true
    }
  ).exec();

  if (!documento) {
    throw new Error("No se pudo guardar el lead.");
  }

  return convertirLead(documento);
}

export async function listarLeadsMongo(): Promise<Lead[]> {
  const documentos = await LeadModel
    .find()
    .sort({ creadoEn: -1 })
    .limit(500)
    .exec();

  return documentos.map((documento) =>
    convertirLead(documento)
  );
}

export async function actualizarEstadoGestionLeadMongo(
  id: string,
  estadoGestion: EstadoGestionLead
): Promise<Lead | undefined> {
  if (!mongoose.isValidObjectId(id)) {
    return undefined;
  }

  const ahora = new Date();

  const actualizacion =
    estadoGestion === "contactado"
      ? {
          $set: {
            estadoGestion,
            contactadoEn: ahora,
            actualizadoEn: ahora
          }
        }
      : {
          $set: {
            estadoGestion,
            actualizadoEn: ahora
          },
          $unset: {
            contactadoEn: 1
          }
        };

  const documento = await LeadModel
    .findByIdAndUpdate(
      id,
      actualizacion,
      {
        returnDocument: "after",
        runValidators: true
      }
    )
    .exec();

  return documento
    ? convertirLead(documento)
    : undefined;
}