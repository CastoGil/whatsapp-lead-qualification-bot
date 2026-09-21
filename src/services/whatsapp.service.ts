import type {
  MensajeEntrante,
  WhatsAppContact,
  WhatsAppWebhookPayload
} from "../types/whatsapp.types.js";

function obtenerNombre(
  contactos: WhatsAppContact[] | undefined,
  telefono: string
): string {
  const contacto = contactos?.find(
    (elemento) => elemento.wa_id === telefono
  );

  return contacto?.profile?.name?.trim() || "Sin nombre";
}

function convertirFecha(timestamp: string): Date {
  const segundos = Number(timestamp);

  if (!Number.isFinite(segundos)) {
    return new Date();
  }

  return new Date(segundos * 1000);
}

export function extraerMensajesEntrantes(
  evento: WhatsAppWebhookPayload
): MensajeEntrante[] {
  const mensajesEntrantes: MensajeEntrante[] = [];

  for (const entrada of evento.entry ?? []) {
    for (const cambio of entrada.changes ?? []) {
      if (cambio.field !== "messages") {
        continue;
      }

      const valor = cambio.value;
      const phoneNumberId =
        valor?.metadata?.phone_number_id?.trim();

      if (!valor || !phoneNumberId) {
        continue;
      }

      for (const mensaje of valor.messages ?? []) {
        const id = mensaje.id?.trim();
        const telefono = mensaje.from?.trim();
        const timestamp = mensaje.timestamp?.trim();
        const texto = mensaje.text?.body?.trim();

        if (
          mensaje.type !== "text" ||
          !id ||
          !telefono ||
          !timestamp ||
          !texto
        ) {
          continue;
        }

        mensajesEntrantes.push({
          id,
          telefono,
          nombre: obtenerNombre(
            valor.contacts,
            telefono
          ),
          texto,
          fecha: convertirFecha(timestamp),
          phoneNumberId
        });
      }
    }
  }

  return mensajesEntrantes;
}