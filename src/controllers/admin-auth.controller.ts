import type {
  Request,
  Response
} from "express";
import { env } from "../config/env.js";
import {
  crearTokenSesionAdmin,
  eliminarCookieSesionAdmin,
  establecerCookieSesionAdmin,
  obtenerTokenSesionAdmin,
  validarCredencialesAdmin,
  validarTokenSesionAdmin
} from "../services/admin-session.service.js";

type RegistroIntentos = {
  cantidad: number;
  expiraEn: number;
};

const MAXIMO_INTENTOS = 5;
const VENTANA_INTENTOS_MS =
  15 * 60 * 1000;

const intentosPorIp =
  new Map<string, RegistroIntentos>();

function aplicarNoCache(
  res: Response
): void {
  res.setHeader(
    "Cache-Control",
    "no-store"
  );
}

function rechazarSolicitudCruzada(
  req: Request,
  res: Response
): boolean {
  if (
    req.get("sec-fetch-site") !==
    "cross-site"
  ) {
    return false;
  }

  aplicarNoCache(res);

  res.status(403).json({
    error: "Solicitud no permitida."
  });

  return true;
}

function obtenerClaveCliente(
  req: Request
): string {
  return (
    req.ip ||
    req.socket.remoteAddress ||
    "desconocido"
  );
}

function obtenerRegistroVigente(
  clave: string,
  ahora: number
): RegistroIntentos | undefined {
  const registro =
    intentosPorIp.get(clave);

  if (
    !registro ||
    registro.expiraEn <= ahora
  ) {
    intentosPorIp.delete(clave);
    return undefined;
  }

  return registro;
}

function registrarIntentoFallido(
  clave: string,
  ahora: number
): RegistroIntentos {
  const registroActual =
    obtenerRegistroVigente(
      clave,
      ahora
    );

  const registro: RegistroIntentos = {
    cantidad:
      (registroActual?.cantidad ?? 0) +
      1,
    expiraEn:
      registroActual?.expiraEn ??
      ahora + VENTANA_INTENTOS_MS
  };

  intentosPorIp.set(
    clave,
    registro
  );

  if (intentosPorIp.size > 1000) {
    for (
      const [claveGuardada, valor]
      of intentosPorIp
    ) {
      if (valor.expiraEn <= ahora) {
        intentosPorIp.delete(
          claveGuardada
        );
      }
    }
  }

  return registro;
}

function responderBloqueo(
  res: Response,
  expiraEn: number
): void {
  const segundosRestantes =
    Math.max(
      1,
      Math.ceil(
        (expiraEn - Date.now()) /
          1000
      )
    );

  aplicarNoCache(res);

  res.setHeader(
    "Retry-After",
    String(segundosRestantes)
  );

  res.status(429).json({
    error:
      "Demasiados intentos fallidos. Intenta nuevamente en unos minutos."
  });
}

export function consultarSesionAdmin(
  req: Request,
  res: Response
): void {
  aplicarNoCache(res);

  const token =
    obtenerTokenSesionAdmin(req);

  const autenticado =
    validarTokenSesionAdmin(token);

  if (!autenticado && token) {
    eliminarCookieSesionAdmin(
      req,
      res
    );
  }

  res.status(200).json({
    autenticado,
    usuario:
      autenticado
        ? env.usuarioAdmin
        : null
  });
}

export function iniciarSesionAdmin(
  req: Request,
  res: Response
): void {
  aplicarNoCache(res);

  if (
    rechazarSolicitudCruzada(
      req,
      res
    )
  ) {
    return;
  }

  const usuarioRecibido =
    req.body?.usuario as unknown;

  const passwordRecibido =
    req.body?.password as unknown;

  if (
    typeof usuarioRecibido !==
      "string" ||
    typeof passwordRecibido !==
      "string"
  ) {
    res.status(400).json({
      error:
        "Debes indicar usuario y contraseña."
    });

    return;
  }

  const usuario =
    usuarioRecibido.trim();

  const password =
    passwordRecibido;

  if (
    !usuario ||
    !password ||
    usuario.length > 100 ||
    password.length > 256
  ) {
    res.status(400).json({
      error:
        "Las credenciales proporcionadas no son válidas."
    });

    return;
  }

  const ahora = Date.now();

  const claveCliente =
    obtenerClaveCliente(req);

  const registro =
    obtenerRegistroVigente(
      claveCliente,
      ahora
    );

  if (
    registro &&
    registro.cantidad >=
      MAXIMO_INTENTOS
  ) {
    responderBloqueo(
      res,
      registro.expiraEn
    );

    return;
  }

  if (
    !validarCredencialesAdmin(
      usuario,
      password
    )
  ) {
    const nuevoRegistro =
      registrarIntentoFallido(
        claveCliente,
        ahora
      );

    if (
      nuevoRegistro.cantidad >=
        MAXIMO_INTENTOS
    ) {
      responderBloqueo(
        res,
        nuevoRegistro.expiraEn
      );

      return;
    }

    res.status(401).json({
      error:
        "Usuario o contraseña incorrectos."
    });

    return;
  }

  intentosPorIp.delete(
    claveCliente
  );

  const token =
    crearTokenSesionAdmin();

  establecerCookieSesionAdmin(
    req,
    res,
    token
  );

  res.status(200).json({
    autenticado: true,
    usuario: env.usuarioAdmin
  });
}

export function cerrarSesionAdmin(
  req: Request,
  res: Response
): void {
  aplicarNoCache(res);

  if (
    rechazarSolicitudCruzada(
      req,
      res
    )
  ) {
    return;
  }

  eliminarCookieSesionAdmin(
    req,
    res
  );

  res.sendStatus(204);
}