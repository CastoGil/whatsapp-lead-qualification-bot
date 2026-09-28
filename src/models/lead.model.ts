import mongoose, {
  Schema,
  model,
  type Model
} from "mongoose";
import type { DatosLead } from "../types/conversation.types.js";
import type {
  EstadoGestionLead,
  NuevoLead
} from "../types/lead.types.js";

const estadosGestion: EstadoGestionLead[] = [
  "pendiente",
  "contactado"
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

const leadSchema = new Schema<NuevoLead>(
  {
    telefono: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    datos: {
      type: datosLeadSchema,
      required: true
    },
    estadoGestion: {
      type: String,
      required: true,
      enum: estadosGestion,
      default: "pendiente",
      index: true
    },
    conversacionCreadaEn: {
      type: Date,
      required: true
    },
    creadoEn: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    },
    actualizadoEn: {
      type: Date,
      required: true,
      default: Date.now
    },
    contactadoEn: {
      type: Date
    }
  },
  {
    collection: "leads",
    versionKey: false
  }
);

leadSchema.index(
  {
    telefono: 1,
    conversacionCreadaEn: 1
  },
  {
    unique: true
  }
);

export const LeadModel: Model<NuevoLead> =
  (mongoose.models.Lead as Model<NuevoLead> | undefined) ??
  model<NuevoLead>("Lead", leadSchema);