import {
  useCallback,
  useEffect,
  useState
} from "react";
import {
  LoaderCircle,
  LogOut,
  UserRound
} from "lucide-react";
import {
  useQueryClient
} from "@tanstack/react-query";
import {
  LoginPage
} from "./pages/LoginPage";
import {
  LeadsDashboard
} from "./pages/LeadsDashboard";
import {
  cerrarSesionAdmin,
  consultarSesionAdmin,
  EVENTO_SESION_ADMIN_EXPIRADA,
  type SesionAdmin
} from "./services/auth-api";
import "./styles/dashboard.css";
import "./styles/auth.css";

type EstadoAutenticacion =
  | "verificando"
  | "autenticado"
  | "no-autenticado";

function App() {
  const queryClient = useQueryClient();

  const [
    estadoAutenticacion,
    setEstadoAutenticacion
  ] = useState<EstadoAutenticacion>(
    "verificando"
  );

  const [usuario, setUsuario] =
    useState<string | null>(null);

  const [cerrandoSesion, setCerrandoSesion] =
    useState(false);

  const finalizarSesionLocal =
    useCallback((): void => {
      queryClient.clear();
      setUsuario(null);
      setEstadoAutenticacion(
        "no-autenticado"
      );
    }, [queryClient]);

  useEffect(() => {
    const controlador =
      new AbortController();

    void consultarSesionAdmin(
      controlador.signal
    )
      .then((sesion) => {
        if (
          controlador.signal.aborted
        ) {
          return;
        }

        setUsuario(sesion.usuario);

        setEstadoAutenticacion(
          sesion.autenticado
            ? "autenticado"
            : "no-autenticado"
        );
      })
      .catch(() => {
        if (
          !controlador.signal.aborted
        ) {
          setEstadoAutenticacion(
            "no-autenticado"
          );
        }
      });

    return () => {
      controlador.abort();
    };
  }, []);

  useEffect(() => {
    function manejarSesionExpirada(): void {
      finalizarSesionLocal();
    }

    window.addEventListener(
      EVENTO_SESION_ADMIN_EXPIRADA,
      manejarSesionExpirada
    );

    return () => {
      window.removeEventListener(
        EVENTO_SESION_ADMIN_EXPIRADA,
        manejarSesionExpirada
      );
    };
  }, [finalizarSesionLocal]);

  function manejarAutenticacion(
    sesion: SesionAdmin
  ): void {
    setUsuario(sesion.usuario);

    setEstadoAutenticacion(
      sesion.autenticado
        ? "autenticado"
        : "no-autenticado"
    );
  }

  async function manejarCerrarSesion(): Promise<void> {
    setCerrandoSesion(true);

    try {
      await cerrarSesionAdmin();
      finalizarSesionLocal();
    } catch (error) {
      const detalle =
        error instanceof Error
          ? error.message
          : "No se pudo cerrar la sesión.";

      window.alert(detalle);
    } finally {
      setCerrandoSesion(false);
    }
  }

  if (
    estadoAutenticacion ===
    "verificando"
  ) {
    return (
      <main
        className="auth-loading"
        role="status"
        aria-live="polite"
      >
        <div className="auth-loading__icon">
          <LoaderCircle size={28} />
        </div>

        <strong>Verificando sesión</strong>
        <span>
          Estamos preparando tu panel.
        </span>
      </main>
    );
  }

  if (
    estadoAutenticacion ===
    "no-autenticado"
  ) {
    return (
      <LoginPage
        onAuthenticated={
          manejarAutenticacion
        }
      />
    );
  }

  return (
    <>
      <LeadsDashboard />

      <div className="admin-session">
        <UserRound
          size={19}
          aria-hidden="true"
        />

        <div className="admin-session__identity">
          <span>Sesión activa</span>
          <strong>
            {usuario ?? "Administrador"}
          </strong>
        </div>

        <button
          type="button"
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
          disabled={cerrandoSesion}
          onClick={() => {
            void manejarCerrarSesion();
          }}
        >
          {cerrandoSesion ? (
            <LoaderCircle
              className="login-spinner"
              size={18}
            />
          ) : (
            <LogOut size={18} />
          )}
        </button>
      </div>
    </>
  );
}

export default App;