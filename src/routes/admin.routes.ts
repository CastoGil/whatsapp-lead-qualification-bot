import path from "node:path";
import { fileURLToPath } from "node:url";
import express, {
  Router,
  type NextFunction,
  type Request,
  type Response
} from "express";
import {
  requerirAdministrador
} from "../middleware/admin-auth.middleware.js";

const directorioActual = path.dirname(
  fileURLToPath(import.meta.url)
);

const directorioPanel = path.resolve(
  directorioActual,
  "../../public/admin"
);

const archivoIndex = path.join(
  directorioPanel,
  "index.html"
);

function aplicarSeguridadPanel(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const esRecursoVersionado =
    req.path.startsWith("/assets/");

  res.setHeader(
    "Cache-Control",
    esRecursoVersionado
      ? "public, max-age=31536000, immutable"
      : "no-store"
  );

  res.setHeader(
    "X-Content-Type-Options",
    "nosniff"
  );

  res.setHeader(
    "Referrer-Policy",
    "no-referrer"
  );

  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self'",
      "img-src 'self' data:",
      "font-src 'self'",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'"
    ].join("; ")
  );

  next();
}

function enviarPanel(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  res.sendFile(archivoIndex, (error) => {
    if (error) {
      next(error);
    }
  });
}

export const adminRouter = Router();

adminRouter.use(requerirAdministrador);
adminRouter.use(aplicarSeguridadPanel);

adminRouter.use(
  "/assets",
  express.static(
    path.join(directorioPanel, "assets"),
    {
      index: false,
      fallthrough: true,
      maxAge: "1y",
      immutable: true
    }
  )
);

adminRouter.get("/", enviarPanel);
adminRouter.get("/leads", enviarPanel);