import type { Request, Response } from "express";
import {
  actualizarEstadoGestionLeadMongo,
  listarLeadsMongo
} from "../repositories/mongo-lead.repository.js";
import type {
  EstadoGestionLead,
  Lead
} from "../types/lead.types.js";

type FiltroEstado = EstadoGestionLead | "todos";

function esEstadoGestion(
  valor: unknown
): valor is EstadoGestionLead {
  return valor === "pendiente" || valor === "contactado";
}

function obtenerPrimerValor(
  valor: unknown
): string | undefined {
  if (typeof valor === "string") {
    return valor;
  }

  if (Array.isArray(valor)) {
    const primerValor = valor[0];

    return typeof primerValor === "string"
      ? primerValor
      : undefined;
  }

  return undefined;
}

function obtenerFiltroEstado(valor: unknown): FiltroEstado {
  const estado = obtenerPrimerValor(valor);

  return esEstadoGestion(estado)
    ? estado
    : "todos";
}

function normalizarTexto(
  valor: string | number | undefined
): string {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function coincideConBusqueda(
  lead: Lead,
  busqueda: string
): boolean {
  if (!busqueda) {
    return true;
  }

  const campos = [
    lead.telefono,
    lead.datos.nombre,
    lead.datos.edad,
    lead.datos.situacionLaboral,
    lead.datos.tiempoSinEmpleo,
    lead.datos.paisBusqueda,
    lead.datos.servicioInteres
  ];

  return campos.some((campo) =>
    normalizarTexto(campo).includes(busqueda)
  );
}

function serializarLead(lead: Lead) {
  return {
    id: lead.id,
    telefono: lead.telefono,
    datos: { ...lead.datos },
    estadoGestion: lead.estadoGestion,
    conversacionCreadaEn:
      lead.conversacionCreadaEn.toISOString(),
    creadoEn: lead.creadoEn.toISOString(),
    actualizadoEn: lead.actualizadoEn.toISOString(),
    contactadoEn:
      lead.contactadoEn?.toISOString() ?? null
  };
}

function aplicarCabecerasApi(res: Response): void {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
}

export async function listarLeadsApi(
  req: Request,
  res: Response
): Promise<void> {
  aplicarCabecerasApi(res);

  try {
    const estado = obtenerFiltroEstado(req.query.estado);

    const textoBusqueda = (
      obtenerPrimerValor(req.query.buscar) ?? ""
    )
      .trim()
      .slice(0, 100);

    const busquedaNormalizada =
      normalizarTexto(textoBusqueda);

    const todosLosLeads = await listarLeadsMongo();

    const leadsFiltrados = todosLosLeads.filter((lead) => {
      const coincideEstado =
        estado === "todos" ||
        lead.estadoGestion === estado;

      return (
        coincideEstado &&
        coincideConBusqueda(
          lead,
          busquedaNormalizada
        )
      );
    });

    const pendientes = todosLosLeads.filter(
      (lead) => lead.estadoGestion === "pendiente"
    ).length;

    const contactados = todosLosLeads.filter(
      (lead) => lead.estadoGestion === "contactado"
    ).length;

    res.status(200).json({
      leads: leadsFiltrados.map(serializarLead),
      totales: {
        todos: todosLosLeads.length,
        pendientes,
        contactados
      },
      filtros: {
        estado,
        buscar: textoBusqueda
      },
      actualizadoEn: new Date().toISOString()
    });
  } catch (error) {
    const detalle =
      error instanceof Error
        ? error.message
        : "Error desconocido";

    console.error(
      "❌ No se pudieron consultar los leads:",
      detalle
    );

    res.status(500).json({
      error: "No se pudieron consultar los leads."
    });
  }
}

export async function cambiarEstadoLeadApi(
  req: Request,
  res: Response
): Promise<void> {
  aplicarCabecerasApi(res);

  if (req.get("sec-fetch-site") === "cross-site") {
    res.status(403).json({
      error: "Solicitud no permitida."
    });
    return;
  }

  const estadoGestion =
    req.body?.estadoGestion as unknown;

  if (!esEstadoGestion(estadoGestion)) {
    res.status(400).json({
      error: "Estado de gestión inválido."
    });
    return;
  }

  const parametroId = req.params.id;

  const idLead = Array.isArray(parametroId)
    ? parametroId[0]
    : parametroId;

  if (!idLead) {
    res.status(400).json({
      error: "El identificador del lead es obligatorio."
    });
    return;
  }

  try {
    const lead =
      await actualizarEstadoGestionLeadMongo(
        idLead,
        estadoGestion
      );

    if (!lead) {
      res.status(404).json({
        error: "Lead no encontrado."
      });
      return;
    }

    res.status(200).json({
      lead: serializarLead(lead)
    });
  } catch (error) {
    const detalle =
      error instanceof Error
        ? error.message
        : "Error desconocido";

    console.error(
      "❌ No se pudo actualizar el lead:",
      detalle
    );

    res.status(500).json({
      error: "No se pudo actualizar el lead."
    });
  }
}