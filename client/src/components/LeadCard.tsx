import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  LoaderCircle,
  MapPin,
  MessageCircle,
  RotateCcw,
  User
} from "lucide-react";
import type {
  Lead
} from "../types/lead";

type LeadCardProps = {
  lead: Lead;
  actualizando: boolean;
  onCambiarEstado: (lead: Lead) => void;
};

function mostrarValor(
  valor: string | number | undefined,
  alternativo = "No indicado"
): string {
  if (
    valor === undefined ||
    valor === null ||
    String(valor).trim() === ""
  ) {
    return alternativo;
  }

  return String(valor);
}

function formatearFecha(fecha: string): string {
  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(valor);
}

function crearEnlaceWhatsApp(
  telefono: string
): string {
  const numero = telefono.replace(/\D/g, "");

  return `https://wa.me/${numero}`;
}

export function LeadCard({
  lead,
  actualizando,
  onCambiarEstado
}: LeadCardProps) {
  const esPendiente =
    lead.estadoGestion === "pendiente";

  const nombre = mostrarValor(
    lead.datos.nombre,
    "Lead sin nombre"
  );

  const detalles = [
    {
      etiqueta: "Edad",
      valor: lead.datos.edad
        ? `${lead.datos.edad} años`
        : "No indicada",
      Icono: User
    },
    {
      etiqueta: "Situación laboral",
      valor: mostrarValor(
        lead.datos.situacionLaboral
      ),
      Icono: Briefcase
    },
    {
      etiqueta: "Tiempo sin empleo",
      valor: mostrarValor(
        lead.datos.tiempoSinEmpleo,
        "No aplica"
      ),
      Icono: Clock
    },
    {
      etiqueta: "País o región",
      valor: mostrarValor(
        lead.datos.paisBusqueda
      ),
      Icono: MapPin
    }
  ];

  return (
    <article className="lead-card">
      <header className="lead-card__header">
        <div className="lead-card__identity">
          <div className="lead-card__avatar">
            {nombre.charAt(0).toUpperCase()}
          </div>

          <div>
            <p className="lead-card__eyebrow">
              Lead calificado
            </p>
            <h2>{nombre}</h2>
          </div>
        </div>

        <span
          className={`status-badge status-badge--${lead.estadoGestion}`}
        >
          <span aria-hidden="true" />
          {esPendiente
            ? "Pendiente"
            : "Contactado"}
        </span>
      </header>

      <a
        className="lead-card__phone"
        href={crearEnlaceWhatsApp(
          lead.telefono
        )}
        target="_blank"
        rel="noreferrer"
      >
        <MessageCircle size={18} />
        <span>{lead.telefono}</span>
        <ExternalLink size={15} />
      </a>

      <dl className="lead-details">
        {detalles.map(
          ({ etiqueta, valor, Icono }) => (
            <div
              className="lead-details__item"
              key={etiqueta}
            >
              <dt>
                <Icono size={16} />
                {etiqueta}
              </dt>
              <dd>{valor}</dd>
            </div>
          )
        )}
      </dl>

      <section className="lead-service">
        <p>Servicio de interés</p>
        <strong>
          {mostrarValor(
            lead.datos.servicioInteres
          )}
        </strong>
      </section>

      <footer className="lead-card__footer">
        <div className="lead-card__date">
          <Calendar size={16} />
          <span>
            Recibido {formatearFecha(lead.creadoEn)}
          </span>
        </div>

        <button
          className={
            esPendiente
              ? "action-button action-button--primary"
              : "action-button action-button--secondary"
          }
          type="button"
          disabled={actualizando}
          aria-busy={actualizando}
          onClick={() => onCambiarEstado(lead)}
        >
          {actualizando ? (
            <>
              <LoaderCircle
                className="spin"
                size={17}
              />
              Guardando
            </>
          ) : esPendiente ? (
            <>
              <CheckCircle2 size={17} />
              Marcar contactado
            </>
          ) : (
            <>
              <RotateCcw size={17} />
              Volver a pendiente
            </>
          )}
        </button>
      </footer>
    </article>
  );
}