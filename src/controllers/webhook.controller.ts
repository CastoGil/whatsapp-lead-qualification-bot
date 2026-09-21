import type {
  Request,
  Response
} from "express";

import { env } from "../config/env.js";

import {
  extraerMensajesEntrantes
} from "../services/whatsapp.service.js";

import type {
  WhatsAppWebhookPayload
} from "../types/whatsapp.types.js";

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
    console.log(
      "✅ Webhook verificado correctamente."
    );

    respuesta.status(200).send(desafio);
    return;
  }

  console.warn(
    "❌ Verificación del webhook rechazada."
  );

  respuesta.sendStatus(403);
}

export function recibirEventoWebhook(
  solicitud: Request,
  respuesta: Response
): void {
  const evento =
    solicitud.body as WhatsAppWebhookPayload;

  if (
    evento.object !==
    "whatsapp_business_account"
  ) {
    console.warn(
      "⚠️ Evento desconocido rechazado."
    );

    respuesta.sendStatus(404);
    return;
  }

  // Meta necesita recibir rápidamente una respuesta 200.
  respuesta.sendStatus(200);

  const mensajes =
    extraerMensajesEntrantes(evento);

  if (mensajes.length === 0) {
    console.log(
      "ℹ️ Evento recibido sin mensajes de texto."
    );

    return;
  }

  for (const mensaje of mensajes) {
    console.log(
      "📩 Mensaje de WhatsApp procesado:",
      {
        id: mensaje.id,
        telefono: mensaje.telefono,
        nombre: mensaje.nombre,
        texto: mensaje.texto,
        fecha: mensaje.fecha.toISOString(),
        phoneNumberId: mensaje.phoneNumberId
      }
    );
  }
}