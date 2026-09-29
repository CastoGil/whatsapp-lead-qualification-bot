import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Inbox,
  LayoutDashboard,
  MessageCircle,
  RefreshCw,
  Search,
  UsersRound,
  Wifi
} from "lucide-react";
import {
  useEffect,
  useState
} from "react";
import type {
  LucideIcon
} from "lucide-react";
import {
  useCambiarEstadoLead,
  useLeads
} from "../hooks/useLeads";
import type {
  FiltroEstadoLead,
  Lead
} from "../types/lead";
import {
  LeadCard
} from "../components/LeadCard";

type StatCardProps = {
  etiqueta: string;
  valor: number;
  descripcion: string;
  Icono: LucideIcon;
  tono: "total" | "pendiente" | "contactado";
  activo: boolean;
  onClick: () => void;
};

function StatCard({
  etiqueta,
  valor,
  descripcion,
  Icono,
  tono,
  activo,
  onClick
}: StatCardProps) {
  return (
    <button
      className={`stat-card stat-card--${tono} ${
        activo ? "stat-card--active" : ""
      }`}
      type="button"
      aria-pressed={activo}
      onClick={onClick}
    >
      <div className="stat-card__icon">
        <Icono size={22} />
      </div>

      <div className="stat-card__content">
        <span>{etiqueta}</span>
        <strong>{valor}</strong>
        <small>{descripcion}</small>
      </div>
    </button>
  );
}

function formatearHora(fecha?: string): string {
  if (!fecha) {
    return "Esperando datos";
  }

  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    return "Hora no disponible";
  }

  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(valor);
}

export function LeadsDashboard() {
  const [estado, setEstado] =
    useState<FiltroEstadoLead>("todos");

  const [busqueda, setBusqueda] =
    useState("");

  const [busquedaAplicada, setBusquedaAplicada] =
    useState("");

  const [errorAccion, setErrorAccion] =
    useState("");

  useEffect(() => {
    const temporizador = window.setTimeout(
      () => {
        setBusquedaAplicada(
          busqueda.trim()
        );
      },
      350
    );

    return () => {
      window.clearTimeout(temporizador);
    };
  }, [busqueda]);

  const consulta = useLeads({
    estado,
    buscar: busquedaAplicada
  });

  const cambiarEstado =
    useCambiarEstadoLead();

  const totales = consulta.data?.totales ?? {
    todos: 0,
    pendientes: 0,
    contactados: 0
  };

  async function manejarCambioEstado(
    lead: Lead
  ): Promise<void> {
    setErrorAccion("");

    const estadoGestion =
      lead.estadoGestion === "pendiente"
        ? "contactado"
        : "pendiente";

    try {
      await cambiarEstado.mutateAsync({
        id: lead.id,
        estadoGestion
      });
    } catch (error) {
      setErrorAccion(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el lead."
      );
    }
  }

  function limpiarFiltros(): void {
    setEstado("todos");
    setBusqueda("");
    setBusquedaAplicada("");
  }

  const leads = consulta.data?.leads ?? [];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand__icon">
            <MessageCircle size={25} />
          </div>

          <div>
            <strong>WhatsApp Leads</strong>
            <span>Gestión comercial</span>
          </div>
        </div>

        <nav
          className="sidebar__navigation"
          aria-label="Navegación principal"
        >
          <div className="sidebar__item sidebar__item--active">
            <LayoutDashboard size={19} />
            <span>Leads</span>
            <strong>{totales.todos}</strong>
          </div>
        </nav>

        <div className="sidebar__status">
          <div className="sidebar__status-title">
            <Wifi size={17} />
            <strong>Sincronización activa</strong>
          </div>
          <p>
            Los datos se actualizan automáticamente
            cada cinco segundos.
          </p>
        </div>
      </aside>

      <main className="dashboard">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-header__eyebrow">
              Panel administrativo
            </p>
            <h1>Leads de WhatsApp</h1>
            <p>
              Seguimiento de personas calificadas
              automáticamente por el bot.
            </p>
          </div>

          <div className="sync-status">
            <span
              className={
                consulta.isFetching
                  ? "sync-status__dot sync-status__dot--loading"
                  : "sync-status__dot"
              }
            />
            <div>
              <strong>
                {consulta.isFetching
                  ? "Actualizando"
                  : "Datos sincronizados"}
              </strong>
              <span>
                {formatearHora(
                  consulta.data?.actualizadoEn
                )}
              </span>
            </div>
          </div>
        </header>

        <section
          className="stats-grid"
          aria-label="Resumen de leads"
        >
          <StatCard
            etiqueta="Todos los leads"
            valor={totales.todos}
            descripcion="Personas registradas"
            Icono={UsersRound}
            tono="total"
            activo={estado === "todos"}
            onClick={() => setEstado("todos")}
          />

          <StatCard
            etiqueta="Pendientes"
            valor={totales.pendientes}
            descripcion="Esperan ser contactados"
            Icono={Clock3}
            tono="pendiente"
            activo={estado === "pendiente"}
            onClick={() =>
              setEstado("pendiente")
            }
          />

          <StatCard
            etiqueta="Contactados"
            valor={totales.contactados}
            descripcion="Seguimiento iniciado"
            Icono={CheckCircle2}
            tono="contactado"
            activo={estado === "contactado"}
            onClick={() =>
              setEstado("contactado")
            }
          />
        </section>

        <section className="leads-section">
          <div className="leads-toolbar">
            <div>
              <h2>Directorio de leads</h2>
              <p>
                {consulta.isLoading
                  ? "Consultando información..."
                  : `${leads.length} resultado${
                      leads.length === 1 ? "" : "s"
                    } en este filtro`}
              </p>
            </div>

            <div className="leads-toolbar__actions">
              <label className="search-box">
                <Search size={18} />
                <span className="sr-only">
                  Buscar leads
                </span>
                <input
                  type="search"
                  value={busqueda}
                  placeholder="Buscar nombre, país, teléfono..."
                  onChange={(event) =>
                    setBusqueda(event.target.value)
                  }
                />
              </label>

              <button
                className="refresh-button"
                type="button"
                disabled={consulta.isFetching}
                aria-label="Actualizar listado"
                title="Actualizar listado"
                onClick={() => {
                  void consulta.refetch();
                }}
              >
                <RefreshCw
                  className={
                    consulta.isFetching
                      ? "spin"
                      : ""
                  }
                  size={19}
                />
              </button>
            </div>
          </div>

          {errorAccion && (
            <div
              className="inline-alert"
              role="alert"
            >
              <AlertTriangle size={18} />
              <span>{errorAccion}</span>
            </div>
          )}

          {consulta.isLoading ? (
            <div
              className="leads-grid"
              aria-label="Cargando leads"
            >
              {[1, 2, 3].map((elemento) => (
                <div
                  className="lead-skeleton"
                  key={elemento}
                >
                  <div />
                  <div />
                  <div />
                  <div />
                </div>
              ))}
            </div>
          ) : consulta.isError ? (
            <div
              className="empty-state empty-state--error"
              role="alert"
            >
              <div className="empty-state__icon">
                <AlertTriangle size={28} />
              </div>
              <h3>No pudimos cargar los leads</h3>
              <p>
                {consulta.error instanceof Error
                  ? consulta.error.message
                  : "Ocurrió un error inesperado."}
              </p>
              <button
                type="button"
                onClick={() => {
                  void consulta.refetch();
                }}
              >
                Intentar nuevamente
              </button>
            </div>
          ) : leads.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">
                <Inbox size={29} />
              </div>
              <h3>No encontramos leads</h3>
              <p>
                No hay resultados para la búsqueda
                o el filtro seleccionado.
              </p>
              <button
                type="button"
                onClick={limpiarFiltros}
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="leads-grid">
              {leads.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  actualizando={
                    cambiarEstado.isPending &&
                    cambiarEstado.variables?.id ===
                      lead.id
                  }
                  onCambiarEstado={
                    manejarCambioEstado
                  }
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}