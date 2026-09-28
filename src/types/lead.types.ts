import type { DatosLead } from "./conversation.types.js";

export type EstadoGestionLead =
  | "pendiente"
  | "contactado";

export type Lead = {
  id: string;
  telefono: string;
  datos: DatosLead;
  estadoGestion: EstadoGestionLead;
  conversacionCreadaEn: Date;
  creadoEn: Date;
  actualizadoEn: Date;
  contactadoEn?: Date;
};

export type NuevoLead = Omit<Lead, "id">;