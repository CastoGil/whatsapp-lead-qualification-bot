import { Router } from "express";

import {
  recibirEventoWebhook,
  verificarWebhook
} from "../controllers/webhook.controller.js";

export const webhookRouter = Router();

webhookRouter.get("/", verificarWebhook);
webhookRouter.post("/", recibirEventoWebhook);