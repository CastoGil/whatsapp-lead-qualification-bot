import { Router } from "express";
import {
  cambiarEstadoLead,
  mostrarPanelLeads
} from "../controllers/admin.controller.js";
import {
  requerirAdministrador
} from "../middleware/admin-auth.middleware.js";

export const adminRouter = Router();

adminRouter.use(requerirAdministrador);

adminRouter.get("/", (_req, res): void => {
  res.redirect("/admin/leads");
});

adminRouter.get("/leads", mostrarPanelLeads);

adminRouter.post(
  "/leads/:id/estado",
  cambiarEstadoLead
);