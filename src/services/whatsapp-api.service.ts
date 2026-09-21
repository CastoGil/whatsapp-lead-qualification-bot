import { env } from "../config/env.js";

type ParametrosMensajeTexto = {
  destinatario: string;
  texto: string;
  phoneNumberId?: string;
};

type RespuestaEnvioWhatsApp = {
  messaging_product?: string;
  contacts?: Array<{
    input?: string;
    wa_id?: string;
  }>;
  messages?: Array<{
    id?: string;
    message_status?: string;
  }>;
  error?: {
    message?: string;
    type?: string;
    code?: number;
    fbtrace_id?: string;
  };
};

export async function enviarMensajeTexto({
  destinatario,
  texto,
  phoneNumberId = env.phoneNumberIdWhatsApp
}: ParametrosMensajeTexto): Promise<string> {
  const numeroDestino = destinatario.trim();
  const contenido = texto.trim();
  const numeroEmisorId = phoneNumberId.trim();

  if (!numeroDestino) {
    throw new Error(
      "El destinatario de WhatsApp es obligatorio."
    );
  }

  if (!contenido) {
    throw new Error(
      "El texto del mensaje es obligatorio."
    );
  }

  if (!numeroEmisorId) {
    throw new Error(
      "El Phone Number ID de WhatsApp es obligatorio."
    );
  }

  const url =
    `https://graph.facebook.com/` +
    `${env.versionApiWhatsApp}/` +
    `${numeroEmisorId}/messages`;

  const respuesta = await fetch(url, {
    method: "POST",
    headers: {
      Authorization:
        `Bearer ${env.tokenAccesoWhatsApp}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: numeroDestino,
      type: "text",
      text: {
        preview_url: false,
        body: contenido
      }
    })
  });

  const datos =
    await respuesta.json() as RespuestaEnvioWhatsApp;

  if (!respuesta.ok) {
    const detalle =
      datos.error?.message ??
      `Error HTTP ${respuesta.status}`;

    throw new Error(
      `WhatsApp rechazó el mensaje: ${detalle}`
    );
  }

  const mensajeId = datos.messages?.[0]?.id;

  if (!mensajeId) {
    throw new Error(
      "WhatsApp no devolvió el ID del mensaje enviado."
    );
  }

  return mensajeId;
}