import express from "express";

import {
  healthRouter
} from "./routes/health.routes.js";

import {
  webhookRouter
} from "./routes/webhook.routes.js";

export const app = express();

app.use(express.json({ limit: "1mb" }));

app.use(healthRouter);
app.use("/webhook", webhookRouter);