import { Router } from "express";

import {
  obtenerEstadoServidor
} from "../controllers/health.controller.js";

export const healthRouter = Router();

healthRouter.get("/", obtenerEstadoServidor);
healthRouter.get("/health", obtenerEstadoServidor);