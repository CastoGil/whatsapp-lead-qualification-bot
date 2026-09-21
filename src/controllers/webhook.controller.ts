import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { crearMensajeBienvenida } from "../services/conversation.service.js";
import { enviarMensajeTexto } from "../services/whatsapp-api.service.js";
import { extraerMensajesEntrantes } from "../services/whatsapp.service.js";
import type {
  MensajeEntrante,
  WhatsAppWebhookPayload
} from "../types/whatsapp.types.js";

export function verificarWebhook(req: Request, res: Response): void {
  const modo = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const desafio = req.query["hub.challenge"];

  if (modo === "subscribe" && token === env.tokenVerificacion) {
    console.log("✅ Webhook verificado correctamente.");
    res.status(200).send(desafio);
    return;
  }

  console.warn("❌ Falló la verificación del webhook.");
  res.sendStatus(403);
}

async function responderMensajeEntrante(
  mensaje: MensajeEntrante
): Promise<void> {
  console.log("📩 Mensaje de WhatsApp procesado:", {
    id: mensaje.id,
    telefono: mensaje.telefono,
    nombre: mensaje.nombre,
    texto: mensaje.texto,
    fecha: mensaje.fecha.toISOString(),
    phoneNumberId: mensaje.phoneNumberId
  });

  try {
    const textoRespuesta = crearMensajeBienvenida(mensaje.nombre);

    const mensajeSalienteId = await enviarMensajeTexto({
      destinatario: mensaje.telefono,
      texto: textoRespuesta,
      phoneNumberId: mensaje.phoneNumberId
    });

    console.log("✅ Respuesta automática enviada:", {
      mensajeEntranteId: mensaje.id,
      mensajeSalienteId
    });
  } catch (error) {
    const detalle =
      error instanceof Error ? error.message : "Error desconocido";

    console.error("❌ No se pudo enviar la respuesta automática:", detalle);
  }
}

export function recibirEventoWebhook(req: Request, res: Response): void {
  const payload = req.body as WhatsAppWebhookPayload;

  if (payload.object !== "whatsapp_business_account") {
    res.sendStatus(404);
    return;
  }

  // Respondemos inmediatamente para que Meta confirme la recepción.
  res.sendStatus(200);

  const mensajes = extraerMensajesEntrantes(payload);

  console.log(
    `📥 Evento de WhatsApp recibido: ${payload.entry?.length ?? 0} entrada(s).`
  );

  for (const mensaje of mensajes) {
    void responderMensajeEntrante(mensaje);
  }
}