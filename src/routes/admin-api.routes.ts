import { Router } from "express";
import {
  cambiarEstadoLeadApi,
  listarLeadsApi
} from "../controllers/admin-api.controller.js";
import {
  requerirAdministrador
} from "../middleware/admin-auth.middleware.js";

export const adminApiRouter = Router();

adminApiRouter.use(requerirAdministrador);

adminApiRouter.get("/leads", listarLeadsApi);

adminApiRouter.patch(
  "/leads/:id/estado",
  cambiarEstadoLeadApi
);