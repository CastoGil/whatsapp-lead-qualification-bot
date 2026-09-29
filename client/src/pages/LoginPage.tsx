import {
  useState,
  type FormEvent
} from "react";
import {
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  UserRound
} from "lucide-react";
import {
  iniciarSesionAdmin,
  type SesionAdmin
} from "../services/auth-api";

type LoginPageProps = {
  onAuthenticated: (
    sesion: SesionAdmin
  ) => void;
};

export function LoginPage({
  onAuthenticated
}: LoginPageProps) {
  const [usuario, setUsuario] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [mostrarPassword, setMostrarPassword] =
    useState(false);

  const [enviando, setEnviando] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function manejarEnvio(
    evento: FormEvent<HTMLFormElement>
  ): Promise<void> {
    evento.preventDefault();

    if (
      !usuario.trim() ||
      !password
    ) {
      setError(
        "Ingresa tu usuario y contraseña."
      );

      return;
    }

    setEnviando(true);
    setError(null);

    try {
      const sesion =
        await iniciarSesionAdmin(
          usuario.trim(),
          password
        );

      setPassword("");
      onAuthenticated(sesion);
    } catch (errorDesconocido) {
      setError(
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "No se pudo iniciar sesión."
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="login-page">
      <section
        className="login-showcase"
        aria-label="Presentación del panel"
      >
        <div className="login-showcase__glow" />

        <div className="login-brand">
          <div className="login-brand__icon">
            <MessageCircle size={28} />
          </div>

          <div>
            <strong>WhatsApp Leads</strong>
            <span>Gestión comercial</span>
          </div>
        </div>

        <div className="login-showcase__content">
          <p className="login-showcase__eyebrow">
            Panel administrativo
          </p>

          <h1>
            Convierte conversaciones en
            oportunidades reales.
          </h1>

          <p>
            Consulta, organiza y gestiona los
            leads calificados automáticamente
            por tu bot de WhatsApp.
          </p>

          <div className="login-benefits">
            <div>
              <ShieldCheck size={21} />
              <span>Acceso privado y seguro</span>
            </div>

            <div>
              <MessageCircle size={21} />
              <span>
                Información actualizada en tiempo real
              </span>
            </div>
          </div>
        </div>

        <p className="login-showcase__footer">
          Automatización y seguimiento comercial
        </p>
      </section>

      <section className="login-access">
        <div className="login-card">
          <div className="login-card__badge">
            <LockKeyhole size={18} />
          </div>

          <div className="login-card__heading">
            <p>Acceso restringido</p>
            <h2>Iniciar sesión</h2>
            <span>
              Ingresa tus credenciales para acceder
              al panel.
            </span>
          </div>

          <form
            className="login-form"
            onSubmit={manejarEnvio}
            noValidate
          >
            <label htmlFor="admin-usuario">
              Usuario
            </label>

            <div className="login-input">
              <UserRound
                size={19}
                aria-hidden="true"
              />

              <input
                id="admin-usuario"
                name="usuario"
                type="text"
                autoComplete="username"
                placeholder="Tu usuario"
                value={usuario}
                disabled={enviando}
                maxLength={100}
                onChange={(evento) =>
                  setUsuario(
                    evento.target.value
                  )
                }
              />
            </div>

            <label htmlFor="admin-password">
              Contraseña
            </label>

            <div className="login-input">
              <LockKeyhole
                size={19}
                aria-hidden="true"
              />

              <input
                id="admin-password"
                name="password"
                type={
                  mostrarPassword
                    ? "text"
                    : "password"
                }
                autoComplete="current-password"
                placeholder="Tu contraseña"
                value={password}
                disabled={enviando}
                maxLength={256}
                onChange={(evento) =>
                  setPassword(
                    evento.target.value
                  )
                }
              />

              <button
                type="button"
                className="login-input__visibility"
                aria-label={
                  mostrarPassword
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
                onClick={() =>
                  setMostrarPassword(
                    (valor) => !valor
                  )
                }
              >
                {mostrarPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            {error && (
              <div
                className="login-error"
                role="alert"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={enviando}
            >
              {enviando ? (
                <>
                  <LoaderCircle
                    className="login-spinner"
                    size={19}
                  />
                  Verificando…
                </>
              ) : (
                <>
                  Ingresar al panel
                  <ShieldCheck size={19} />
                </>
              )}
            </button>
          </form>

          <p className="login-card__security">
            <ShieldCheck size={15} />
            Sesión protegida mediante cookie segura.
          </p>
        </div>
      </section>
    </main>
  );
}