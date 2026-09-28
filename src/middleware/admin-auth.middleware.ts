import { timingSafeEqual } from "node:crypto";
import type {
  NextFunction,
  Request,
  Response
} from "express";
import { env } from "../config/env.js";

function compararSeguro(
  recibido: string,
  esperado: string
): boolean {
  const bufferRecibido = Buffer.from(recibido);
  const bufferEsperado = Buffer.from(esperado);

  return (
    bufferRecibido.length === bufferEsperado.length &&
    timingSafeEqual(bufferRecibido, bufferEsperado)
  );
}

function rechazarAcceso(res: Response): void {
  res.setHeader(
    "WWW-Authenticate",
    'Basic realm="Panel administrativo", charset="UTF-8"'
  );
  res.setHeader("Cache-Control", "no-store");

  res
    .status(401)
    .type("text/plain")
    .send("Usuario o contraseña incorrectos.");
}

export function requerirAdministrador(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const usuarioConfigurado = env.usuarioAdmin;
  const passwordConfigurado = env.passwordAdmin;

  if (!usuarioConfigurado || !passwordConfigurado) {
    res
      .status(503)
      .type("text/plain")
      .send("El panel administrativo no está configurado.");
    return;
  }

  const cabecera = req.get("authorization");
  const coincidencia = cabecera
    ? /^Basic\s+(.+)$/i.exec(cabecera)
    : null;

  if (!coincidencia) {
    rechazarAcceso(res);
    return;
  }

  try {
    const credenciales = Buffer
      .from(coincidencia[1], "base64")
      .toString("utf8");

    const separador = credenciales.indexOf(":");

    if (separador < 0) {
      rechazarAcceso(res);
      return;
    }

    const usuario = credenciales.slice(0, separador);
    const password = credenciales.slice(separador + 1);

    if (
      !compararSeguro(usuario, usuarioConfigurado) ||
      !compararSeguro(password, passwordConfigurado)
    ) {
      rechazarAcceso(res);
      return;
    }

    next();
  } catch {
    rechazarAcceso(res);
  }
}