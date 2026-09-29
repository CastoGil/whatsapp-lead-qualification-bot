import { Router } from "express";
import {
  cerrarSesionAdmin,
  consultarSesionAdmin,
  iniciarSesionAdmin
} from "../controllers/admin-auth.controller.js";
import {
  cambiarEstadoLeadApi,
  listarLeadsApi
} from "../controllers/admin-api.controller.js";
import {
  requerirAdministrador
} from "../middleware/admin-auth.middleware.js";

export const adminApiRouter =
  Router();

adminApiRouter.get(
  "/auth/session",
  consultarSesionAdmin
);

adminApiRouter.post(
  "/auth/login",
  iniciarSesionAdmin
);

adminApiRouter.post(
  "/auth/logout",
  cerrarSesionAdmin
);

adminApiRouter.use(
  requerirAdministrador
);

adminApiRouter.get(
  "/leads",
  listarLeadsApi
);

adminApiRouter.patch(
  "/leads/:id/estado",
  cambiarEstadoLeadApi
);