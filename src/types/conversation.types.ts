export type EstadoConversacion =
  | "esperando_interes"
  | "esperando_nombre"
  | "esperando_edad"
  | "esperando_situacion_laboral"
  | "esperando_tiempo_sin_empleo"
  | "esperando_pais"
  | "esperando_servicio"
  | "derivacion_humana"
  | "finalizada";

export type DatosLead = {
  nombre?: string;
  edad?: number;
  situacionLaboral?: string;
  tiempoSinEmpleo?: string;
  paisBusqueda?: string;
  servicioInteres?: string;
};

export type Conversacion = {
  telefono: string;
  estado: EstadoConversacion;
  datos: DatosLead;
  creadaEn: Date;
  actualizadaEn: Date;
};