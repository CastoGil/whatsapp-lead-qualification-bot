import express from "express";
import {
  adminApiRouter
} from "./routes/admin-api.routes.js";
import {
  adminRouter
} from "./routes/admin.routes.js";
import {
  healthRouter
} from "./routes/health.routes.js";
import {
  webhookRouter
} from "./routes/webhook.routes.js";

export const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(express.json({ limit: "1mb" }));
app.use(
  express.urlencoded({
    extended: false,
    limit: "10kb"
  })
);

app.use(healthRouter);
app.use("/webhook", webhookRouter);
app.use("/api/admin", adminApiRouter);
app.use("/admin", adminRouter);