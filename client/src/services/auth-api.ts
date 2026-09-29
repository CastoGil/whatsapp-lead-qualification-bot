export const EVENTO_SESION_ADMIN_EXPIRADA =
  "admin-session-expired";

export type SesionAdmin = {
  autenticado: boolean;
  usuario: string | null;
};

type RespuestaError = {
  error?: string;
};

async function obtenerMensajeError(
  respuesta: Response
): Promise<string> {
  const datos = await respuesta
    .json()
    .catch(() => null) as RespuestaError | null;

  return (
    datos?.error ??
    `La solicitud falló con estado ${respuesta.status}.`
  );
}

export function notificarSesionAdminExpirada(): void {
  window.dispatchEvent(
    new Event(
      EVENTO_SESION_ADMIN_EXPIRADA
    )
  );
}

export async function consultarSesionAdmin(
  signal?: AbortSignal
): Promise<SesionAdmin> {
  const respuesta = await fetch(
    "/api/admin/auth/session",
    {
      method: "GET",
      headers: {
        Accept: "application/json"
      },
      credentials: "same-origin",
      signal
    }
  );

  if (!respuesta.ok) {
    throw new Error(
      await obtenerMensajeError(
        respuesta
      )
    );
  }

  return respuesta.json() as
    Promise<SesionAdmin>;
}

export async function iniciarSesionAdmin(
  usuario: string,
  password: string
): Promise<SesionAdmin> {
  const respuesta = await fetch(
    "/api/admin/auth/login",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      credentials: "same-origin",
      body: JSON.stringify({
        usuario,
        password
      })
    }
  );

  if (!respuesta.ok) {
    throw new Error(
      await obtenerMensajeError(
        respuesta
      )
    );
  }

  return respuesta.json() as
    Promise<SesionAdmin>;
}

export async function cerrarSesionAdmin(): Promise<void> {
  const respuesta = await fetch(
    "/api/admin/auth/logout",
    {
      method: "POST",
      headers: {
        Accept: "application/json"
      },
      credentials: "same-origin"
    }
  );

  if (!respuesta.ok) {
    throw new Error(
      await obtenerMensajeError(
        respuesta
      )
    );
  }
}