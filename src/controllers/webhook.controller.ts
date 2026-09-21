import type {
  Request,
  Response
} from "express";

import { env } from "../config/env.js";

type EventoWebhook = {
  object?: string;
  entry?: unknown[];
};

export function verificarWebhook(
  solicitud: Request,
  respuesta: Response
): void {
  const modo = solicitud.query["hub.mode"];
  const token = solicitud.query["hub.verify_token"];
  const desafio = solicitud.query["hub.challenge"];

  const solicitudValida =
    modo === "subscribe" &&
    token === env.tokenVerificacion &&
    typeof desafio === "string";

  if (solicitudValida) {
    console.log("✅ Webhook verificado correctamente.");

    respuesta.status(200).send(desafio);
    return;
  }

  console.warn("❌ Verificación del webhook rechazada.");

  respuesta.sendStatus(403);
}

export function recibirEventoWebhook(
  solicitud: Request,
  respuesta: Response
): void {
  const evento = solicitud.body as EventoWebhook;

  if (
    evento.object !==
    "whatsapp_business_account"
  ) {
    console.warn("⚠️ Evento desconocido rechazado.");

    respuesta.sendStatus(404);
    return;
  }

  respuesta.sendStatus(200);

  const cantidadEntradas = Array.isArray(evento.entry)
    ? evento.entry.length
    : 0;

  console.log(
    `📩 Evento de WhatsApp recibido: ${cantidadEntradas} entrada(s).`
  );
}