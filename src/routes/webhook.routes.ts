import { Router } from "express";

import {
  verificarWebhook
} from "../controllers/webhook.controller.js";

export const webhookRouter = Router();

webhookRouter.get("/", verificarWebhook);