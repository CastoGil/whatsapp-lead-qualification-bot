import mongoose, {
  Schema,
  model,
  type Model
} from "mongoose";
import type {
  Conversacion,
  DatosLead,
  EstadoConversacion
} from "../types/conversation.types.js";

const estadosConversacion: EstadoConversacion[] = [
  "esperando_interes",
  "esperando_nombre",
  "esperando_edad",
  "esperando_situacion_laboral",
  "esperando_tiempo_sin_empleo",
  "esperando_pais",
  "esperando_servicio",
  "derivacion_humana",
  "finalizada"
];

const datosLeadSchema = new Schema<DatosLead>(
  {
    nombre: {
      type: String,
      trim: true,
      maxlength: 80
    },
    edad: {
      type: Number,
      min: 16,
      max: 100
    },
    situacionLaboral: {
      type: String,
      trim: true
    },
    tiempoSinEmpleo: {
      type: String,
      trim: true
    },
    paisBusqueda: {
      type: String,
      trim: true,
      maxlength: 80
    },
    servicioInteres: {
      type: String,
      trim: true
    }
  },
  {
    _id: false
  }
);

const conversacionSchema = new Schema<Conversacion>(
  {
    telefono: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    estado: {
      type: String,
      required: true,
      enum: estadosConversacion,
      index: true
    },
    datos: {
      type: datosLeadSchema,
      required: true,
      default: () => ({})
    },
    creadaEn: {
      type: Date,
      required: true,
      default: Date.now
    },
    actualizadaEn: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    }
  },
  {
    collection: "conversaciones",
    versionKey: false
  }
);

export const ConversacionModel: Model<Conversacion> =
 (mongoose.models.Conversacion as Model<Conversacion> | undefined) ??
  model<Conversacion>("Conversacion", conversacionSchema);