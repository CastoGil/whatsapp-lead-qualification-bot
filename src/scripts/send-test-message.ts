import "dotenv/config";

import {
  enviarMensajeTexto
} from "../services/whatsapp-api.service.js";

async function ejecutarPrueba(): Promise<void> {
  const destinatario =
    process.env.WHATSAPP_TEST_RECIPIENT?.trim();

  if (!destinatario) {
    throw new Error(
      "WHATSAPP_TEST_RECIPIENT es obligatorio para esta prueba."
    );
  }

  const mensajeId = await enviarMensajeTexto({
    destinatario,
    texto:
      "✅ Prueba técnica exitosa.\n\n" +
      "Este mensaje fue enviado desde el bot " +
      "desarrollado con Node.js, TypeScript y " +
      "WhatsApp Cloud API."
  });

  console.log(
    `✅ Mensaje enviado correctamente: ${mensajeId}`
  );
}

try {
  await ejecutarPrueba();
} catch (error: unknown) {
  const detalle =
    error instanceof Error
      ? error.message
      : "Error desconocido.";

  console.error(
    `❌ No se pudo enviar el mensaje: ${detalle}`
  );

  process.exitCode = 1;
}