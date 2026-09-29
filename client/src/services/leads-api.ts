import {
  notificarSesionAdminExpirada
} from "./auth-api";

import type {
  EstadoGestionLead,
  FiltrosLeads,
  RespuestaActualizarLead,
  RespuestaLeads
} from "../types/lead";

type ErrorApi = {
  error?: string;
};

async function procesarRespuesta<T>(
  respuesta: Response
): Promise<T> {
  const datos = await respuesta
    .json()
    .catch(() => null) as (T & ErrorApi) | null;

  if (!respuesta.ok) {
  if (respuesta.status === 401) {
    notificarSesionAdminExpirada();
  }

  throw new Error(
    datos?.error ??
      `La solicitud falló con estado ${respuesta.status}.`
  );
}

  if (!datos) {
    throw new Error(
      "El servidor devolvió una respuesta vacía."
    );
  }

  return datos;
}

export async function obtenerLeads(
  filtros: FiltrosLeads,
  signal?: AbortSignal
): Promise<RespuestaLeads> {
  const parametros = new URLSearchParams();

  parametros.set("estado", filtros.estado);

  if (filtros.buscar.trim()) {
    parametros.set(
      "buscar",
      filtros.buscar.trim()
    );
  }

  const respuesta = await fetch(
    `/api/admin/leads?${parametros.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json"
      },
      credentials: "same-origin",
      signal
    }
  );

  return procesarRespuesta<RespuestaLeads>(
    respuesta
  );
}

export async function actualizarEstadoLead(
  id: string,
  estadoGestion: EstadoGestionLead
): Promise<RespuestaActualizarLead> {
  const respuesta = await fetch(
    `/api/admin/leads/${encodeURIComponent(id)}/estado`,
    {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      credentials: "same-origin",
      body: JSON.stringify({
        estadoGestion
      })
    }
  );

  return procesarRespuesta<RespuestaActualizarLead>(
    respuesta
  );
}