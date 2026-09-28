import type { Request, Response } from "express";
import {
  actualizarEstadoGestionLeadMongo,
  listarLeadsMongo
} from "../repositories/mongo-lead.repository.js";
import type {
  EstadoGestionLead,
  Lead
} from "../types/lead.types.js";

type FiltroLead =
  | "todos"
  | EstadoGestionLead;

const formateadorFecha = new Intl.DateTimeFormat(
  "es-AR",
  {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Argentina/Buenos_Aires"
  }
);

function escaparHtml(valor: unknown): string {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function obtenerFiltro(valor: unknown): FiltroLead {
  if (valor === "pendiente" || valor === "contactado") {
    return valor;
  }

  return "todos";
}

function esEstadoGestion(
  valor: unknown
): valor is EstadoGestionLead {
  return valor === "pendiente" || valor === "contactado";
}

function formatearFecha(fecha?: Date): string {
  return fecha
    ? formateadorFecha.format(fecha)
    : "—";
}

function renderizarDato(
  etiqueta: string,
  valor: unknown
): string {
  return `
    <div class="dato">
      <dt>${escaparHtml(etiqueta)}</dt>
      <dd>${escaparHtml(valor ?? "No indicado")}</dd>
    </div>
  `;
}

function renderizarLead(
  lead: Lead,
  filtro: FiltroLead
): string {
  const esPendiente =
    lead.estadoGestion === "pendiente";

  const nuevoEstado: EstadoGestionLead =
    esPendiente ? "contactado" : "pendiente";

  const textoAccion =
    esPendiente
      ? "Marcar como contactado"
      : "Volver a pendiente";

  const telefono =
    lead.telefono.replace(/\D/g, "");

  const tiempoSinEmpleo =
    lead.datos.tiempoSinEmpleo &&
    lead.datos.tiempoSinEmpleo !== "No aplica"
      ? renderizarDato(
          "Tiempo sin empleo",
          lead.datos.tiempoSinEmpleo
        )
      : "";

  const fechaContacto = lead.contactadoEn
    ? `<p class="fecha">Contactado: ${
        escaparHtml(formatearFecha(lead.contactadoEn))
      }</p>`
    : "";

  return `
    <article class="lead">
      <div class="encabezado-lead">
        <h2>
          ${escaparHtml(
            lead.datos.nombre ?? "Lead sin nombre"
          )}
        </h2>

        <span class="estado ${lead.estadoGestion}">
          ${esPendiente ? "Pendiente" : "Contactado"}
        </span>
      </div>

      <dl>
        ${renderizarDato("WhatsApp", lead.telefono)}
        ${renderizarDato("Edad", lead.datos.edad)}
        ${renderizarDato(
          "Situación laboral",
          lead.datos.situacionLaboral
        )}
        ${tiempoSinEmpleo}
        ${renderizarDato(
          "País o región",
          lead.datos.paisBusqueda
        )}
        ${renderizarDato(
          "Servicio de interés",
          lead.datos.servicioInteres
        )}
      </dl>

      <p class="fecha">
        Recibido: ${
          escaparHtml(formatearFecha(lead.creadoEn))
        }
      </p>
      ${fechaContacto}

      <div class="acciones">
        <a
          class="boton whatsapp"
          href="https://wa.me/${telefono}"
          target="_blank"
          rel="noopener noreferrer"
        >
          Abrir WhatsApp
        </a>

        <form
          method="post"
          action="/admin/leads/${
            encodeURIComponent(lead.id)
          }/estado"
        >
          <input
            type="hidden"
            name="estadoGestion"
            value="${nuevoEstado}"
          >
          <input
            type="hidden"
            name="filtro"
            value="${filtro}"
          >
          <button class="boton secundario" type="submit">
            ${textoAccion}
          </button>
        </form>
      </div>
    </article>
  `;
}

function renderizarPagina(
  leads: Lead[],
  filtro: FiltroLead,
  totales: {
    todos: number;
    pendientes: number;
    contactados: number;
  }
): string {
  const contenido = leads.length > 0
    ? leads
        .map((lead) => renderizarLead(lead, filtro))
        .join("")
    : `
      <section class="vacio">
        <h2>No hay leads en este filtro</h2>
        <p>
          Los nuevos leads aparecerán cuando completen
          la conversación de WhatsApp.
        </p>
      </section>
    `;

  function enlaceFiltro(
    valor: FiltroLead,
    etiqueta: string,
    cantidad: number
  ): string {
    const activo = filtro === valor ? "activo" : "";

    return `
      <a
        class="filtro ${activo}"
        href="/admin/leads?estado=${valor}"
      >
        ${etiqueta}
        <span>${cantidad}</span>
      </a>
    `;
  }

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1"
  >
  <title>Leads de WhatsApp</title>
  <style>
    :root {
      color-scheme: light;
      font-family:
        Inter, system-ui, -apple-system, BlinkMacSystemFont,
        "Segoe UI", sans-serif;
      background: #f4f7f6;
      color: #17211e;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: #f4f7f6;
    }

    main {
      width: min(1180px, calc(100% - 32px));
      margin: 0 auto;
      padding: 36px 0 60px;
    }

    .titulo {
      margin-bottom: 24px;
    }

    .titulo h1 {
      margin: 0 0 8px;
      font-size: clamp(28px, 5vw, 42px);
    }

    .titulo p {
      margin: 0;
      color: #5c6c67;
    }

    .filtros {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 24px;
    }

    .filtro {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      border: 1px solid #cad5d1;
      border-radius: 999px;
      background: white;
      color: #263c35;
      text-decoration: none;
      font-weight: 650;
    }

    .filtro span {
      min-width: 24px;
      padding: 2px 7px;
      border-radius: 999px;
      background: #edf2f0;
      text-align: center;
    }

    .filtro.activo {
      border-color: #087f5b;
      background: #087f5b;
      color: white;
    }

    .filtro.activo span {
      background: rgba(255, 255, 255, 0.18);
    }

    .grilla {
      display: grid;
      grid-template-columns:
        repeat(auto-fit, minmax(300px, 1fr));
      gap: 18px;
    }

    .lead,
    .vacio {
      border: 1px solid #dbe3e0;
      border-radius: 18px;
      background: white;
      box-shadow: 0 8px 25px rgba(18, 50, 40, 0.06);
    }

    .lead {
      padding: 20px;
    }

    .encabezado-lead {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 18px;
    }

    .encabezado-lead h2 {
      margin: 0;
      font-size: 20px;
      overflow-wrap: anywhere;
    }

    .estado {
      flex: 0 0 auto;
      padding: 5px 9px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 750;
    }

    .estado.pendiente {
      background: #fff3bf;
      color: #8f5c00;
    }

    .estado.contactado {
      background: #d3f9d8;
      color: #166534;
    }

    dl {
      display: grid;
      gap: 10px;
      margin: 0 0 18px;
    }

    .dato {
      display: grid;
      grid-template-columns: 125px 1fr;
      gap: 12px;
    }

    dt {
      color: #6a7874;
      font-size: 14px;
    }

    dd {
      margin: 0;
      font-weight: 600;
      overflow-wrap: anywhere;
    }

    .fecha {
      margin: 5px 0;
      color: #71807b;
      font-size: 13px;
    }

    .acciones {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 18px;
    }

    .acciones form {
      display: contents;
    }

    .boton {
      flex: 1 1 150px;
      border: 0;
      border-radius: 10px;
      padding: 11px 14px;
      font: inherit;
      font-weight: 700;
      text-align: center;
      text-decoration: none;
      cursor: pointer;
    }

    .whatsapp {
      background: #16a66a;
      color: white;
    }

    .secundario {
      background: #e9efed;
      color: #263c35;
    }

    .vacio {
      grid-column: 1 / -1;
      padding: 42px 24px;
      text-align: center;
    }

    .vacio h2 {
      margin-top: 0;
    }

    .vacio p {
      margin-bottom: 0;
      color: #61706b;
    }

    @media (max-width: 520px) {
      main {
        width: min(100% - 20px, 1180px);
        padding-top: 24px;
      }

      .dato {
        grid-template-columns: 1fr;
        gap: 2px;
      }
    }
  </style>
</head>
<body>
  <main>
    <header class="titulo">
      <h1>Leads de WhatsApp</h1>
      <p>
        Seguimiento de personas calificadas por el bot.
      </p>
    </header>

    <nav class="filtros" aria-label="Filtros de leads">
      ${enlaceFiltro(
        "todos",
        "Todos",
        totales.todos
      )}
      ${enlaceFiltro(
        "pendiente",
        "Pendientes",
        totales.pendientes
      )}
      ${enlaceFiltro(
        "contactado",
        "Contactados",
        totales.contactados
      )}
    </nav>

    <section class="grilla">
      ${contenido}
    </section>
  </main>
</body>
</html>`;
}

function aplicarCabecerasSeguridad(res: Response): void {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'none'; " +
      "style-src 'unsafe-inline'; " +
      "form-action 'self'; " +
      "base-uri 'none'; " +
      "frame-ancestors 'none'"
  );
}

export async function mostrarPanelLeads(
  req: Request,
  res: Response
): Promise<void> {
  aplicarCabecerasSeguridad(res);

  try {
    const filtro = obtenerFiltro(req.query.estado);
    const todosLosLeads = await listarLeadsMongo();

    const leadsVisibles =
      filtro === "todos"
        ? todosLosLeads
        : todosLosLeads.filter(
            (lead) => lead.estadoGestion === filtro
          );

    const pendientes = todosLosLeads.filter(
      (lead) => lead.estadoGestion === "pendiente"
    ).length;

    const contactados = todosLosLeads.filter(
      (lead) => lead.estadoGestion === "contactado"
    ).length;

    res
      .status(200)
      .type("html")
      .send(
        renderizarPagina(
          leadsVisibles,
          filtro,
          {
            todos: todosLosLeads.length,
            pendientes,
            contactados
          }
        )
      );
  } catch (error) {
    const detalle =
      error instanceof Error
        ? error.message
        : "Error desconocido";

    console.error(
      "❌ No se pudo cargar el panel de leads:",
      detalle
    );

    res
      .status(500)
      .type("text/plain")
      .send("No se pudo cargar el panel.");
  }
}
export async function cambiarEstadoLead(
  req: Request,
  res: Response
): Promise<void> {
  aplicarCabecerasSeguridad(res);

  if (req.get("sec-fetch-site") === "cross-site") {
    res
      .status(403)
      .type("text/plain")
      .send("Solicitud no permitida.");
    return;
  }

  const estadoGestion =
    req.body?.estadoGestion as unknown;

  if (!esEstadoGestion(estadoGestion)) {
    res
      .status(400)
      .type("text/plain")
      .send("Estado de gestión inválido.");
    return;
  }

  const parametroId = req.params.id;

  const idLead = Array.isArray(parametroId)
    ? parametroId[0]
    : parametroId;

  if (!idLead) {
    res
      .status(400)
      .type("text/plain")
      .send("El identificador del lead es obligatorio.");
    return;
  }

  try {
    const lead =
      await actualizarEstadoGestionLeadMongo(
        idLead,
        estadoGestion
      );

    if (!lead) {
      res
        .status(404)
        .type("text/plain")
        .send("Lead no encontrado.");
      return;
    }

    const filtro = obtenerFiltro(req.body?.filtro);

    res.redirect(
      303,
      `/admin/leads?estado=${filtro}`
    );
  } catch (error) {
    const detalle =
      error instanceof Error
        ? error.message
        : "Error desconocido";

    console.error(
      "❌ No se pudo actualizar el lead:",
      detalle
    );

    res
      .status(500)
      .type("text/plain")
      .send("No se pudo actualizar el lead.");
  }
}
