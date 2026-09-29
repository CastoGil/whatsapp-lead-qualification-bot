import type {
  NextFunction,
  Request,
  Response
} from "express";
import {
  eliminarCookieSesionAdmin,
  obtenerTokenSesionAdmin,
  validarTokenSesionAdmin
} from "../services/admin-session.service.js";

export function requerirAdministrador(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token =
    obtenerTokenSesionAdmin(req);

  if (!validarTokenSesionAdmin(token)) {
    eliminarCookieSesionAdmin(
      req,
      res
    );

    res.setHeader(
      "Cache-Control",
      "no-store"
    );

    res.status(401).json({
      error:
        "La sesión administrativa no es válida o ha expirado."
    });

    return;
  }

  next();
}