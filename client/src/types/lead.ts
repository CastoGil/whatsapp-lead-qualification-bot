export type EstadoGestionLead =
  | "pendiente"
  | "contactado";

export type FiltroEstadoLead =
  | EstadoGestionLead
  | "todos";

export type DatosLead = {
  nombre?: string;
  edad?: number;
  situacionLaboral?: string;
  tiempoSinEmpleo?: string;
  paisBusqueda?: string;
  servicioInteres?: string;
};

export type Lead = {
  id: string;
  telefono: string;
  datos: DatosLead;
  estadoGestion: EstadoGestionLead;
  conversacionCreadaEn: string;
  creadoEn: string;
  actualizadoEn: string;
  contactadoEn: string | null;
};

export type TotalesLeads = {
  todos: number;
  pendientes: number;
  contactados: number;
};

export type RespuestaLeads = {
  leads: Lead[];
  totales: TotalesLeads;
  filtros: {
    estado: FiltroEstadoLead;
    buscar: string;
  };
  actualizadoEn: string;
};

export type RespuestaActualizarLead = {
  lead: Lead;
};

export type FiltrosLeads = {
  estado: FiltroEstadoLead;
  buscar: string;
};