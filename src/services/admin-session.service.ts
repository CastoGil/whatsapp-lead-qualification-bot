import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual
} from "node:crypto";
import type {
  Request,
  Response
} from "express";
import { env } from "../config/env.js";

export const NOMBRE_COOKIE_SESION_ADMIN =
  "admin_session";

export const DURACION_SESION_ADMIN_MS =
  8 * 60 * 60 * 1000;

const MARGEN_RELOJ_MS = 60_000;

type DatosSesionAdmin = {
  version: 1;
  usuario: string;
  emitidaEn: number;
  expiraEn: number;
  identificador: string;
};

function crearHuella(valor: string): Buffer {
  return createHash("sha256")
    .update(valor, "utf8")
    .digest();
}

export function compararTextoSeguro(
  recibido: string,
  esperado: string
): boolean {
  return timingSafeEqual(
    crearHuella(recibido),
    crearHuella(esperado)
  );
}

export function validarCredencialesAdmin(
  usuario: string,
  password: string
): boolean {
  return (
    compararTextoSeguro(
      usuario,
      env.usuarioAdmin
    ) &&
    compararTextoSeguro(
      password,
      env.passwordAdmin
    )
  );
}

function firmar(contenido: string): Buffer {
  return createHmac(
    "sha256",
    env.secretoSesionAdmin
  )
    .update(contenido, "utf8")
    .digest();
}

export function crearTokenSesionAdmin(): string {
  const ahora = Date.now();

  const datos: DatosSesionAdmin = {
    version: 1,
    usuario: env.usuarioAdmin,
    emitidaEn: ahora,
    expiraEn:
      ahora + DURACION_SESION_ADMIN_MS,
    identificador:
      randomBytes(16).toString("base64url")
  };

  const contenido = Buffer
    .from(
      JSON.stringify(datos),
      "utf8"
    )
    .toString("base64url");

  const firma = firmar(contenido)
    .toString("base64url");

  return `${contenido}.${firma}`;
}

function esDatosSesionAdmin(
  valor: unknown
): valor is DatosSesionAdmin {
  if (
    !valor ||
    typeof valor !== "object"
  ) {
    return false;
  }

  const datos =
    valor as Partial<DatosSesionAdmin>;

  return (
    datos.version === 1 &&
    typeof datos.usuario === "string" &&
    typeof datos.emitidaEn === "number" &&
    typeof datos.expiraEn === "number" &&
    typeof datos.identificador === "string"
  );
}

export function validarTokenSesionAdmin(
  token: string | undefined
): boolean {
  if (
    !token ||
    token.length > 4096
  ) {
    return false;
  }

  const partes = token.split(".");

  if (partes.length !== 2) {
    return false;
  }

  const [contenido, firmaCodificada] =
    partes;

  try {
    const firmaRecibida = Buffer.from(
      firmaCodificada,
      "base64url"
    );

    const firmaEsperada =
      firmar(contenido);

    if (
      firmaRecibida.length !==
        firmaEsperada.length ||
      !timingSafeEqual(
        firmaRecibida,
        firmaEsperada
      )
    ) {
      return false;
    }

    const datos = JSON.parse(
      Buffer
        .from(
          contenido,
          "base64url"
        )
        .toString("utf8")
    ) as unknown;

    if (!esDatosSesionAdmin(datos)) {
      return false;
    }

    const ahora = Date.now();

    return (
      compararTextoSeguro(
        datos.usuario,
        env.usuarioAdmin
      ) &&
      Number.isSafeInteger(
        datos.emitidaEn
      ) &&
      Number.isSafeInteger(
        datos.expiraEn
      ) &&
      datos.emitidaEn <=
        ahora + MARGEN_RELOJ_MS &&
      datos.expiraEn > ahora &&
      datos.expiraEn >
        datos.emitidaEn &&
      datos.expiraEn -
        datos.emitidaEn <=
        DURACION_SESION_ADMIN_MS +
          MARGEN_RELOJ_MS
    );
  } catch {
    return false;
  }
}

export function obtenerTokenSesionAdmin(
  req: Request
): string | undefined {
  const cabecera = req.get("cookie");

  if (!cabecera) {
    return undefined;
  }

  for (const segmento of cabecera.split(";")) {
    const separador =
      segmento.indexOf("=");

    if (separador < 0) {
      continue;
    }

    const nombre = segmento
      .slice(0, separador)
      .trim();

    if (
      nombre !==
      NOMBRE_COOKIE_SESION_ADMIN
    ) {
      continue;
    }

    const valor = segmento
      .slice(separador + 1)
      .trim();

    try {
      return decodeURIComponent(valor);
    } catch {
      return undefined;
    }
  }

  return undefined;
}

export function establecerCookieSesionAdmin(
  req: Request,
  res: Response,
  token: string
): void {
  res.cookie(
    NOMBRE_COOKIE_SESION_ADMIN,
    token,
    {
      httpOnly: true,
      secure: req.secure,
      sameSite: "strict",
      path: "/",
      maxAge:
        DURACION_SESION_ADMIN_MS
    }
  );
}

export function eliminarCookieSesionAdmin(
  req: Request,
  res: Response
): void {
  res.clearCookie(
    NOMBRE_COOKIE_SESION_ADMIN,
    {
      httpOnly: true,
      secure: req.secure,
      sameSite: "strict",
      path: "/"
    }
  );
}