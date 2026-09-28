import { createTransport } from "nodemailer";
import { env } from "../config/env.js";
import type { Conversacion } from "../types/conversation.types.js";
import { enviarMensajeTexto } from "./whatsapp-api.service.js";

function crearResumenLead(conversacion: Conversacion): string {
  const datos = conversacion.datos;

  const lineas = [
    "🔔 NUEVO LEAD CALIFICADO",
    "",
    `Nombre: ${datos.nombre ?? "No indicado"}`,
    `WhatsApp: ${conversacion.telefono}`,
    `Edad: ${datos.edad ?? "No indicada"}`,
    `Situación laboral: ${
      datos.situacionLaboral ?? "No indicada"
    }`
  ];

  if (
    datos.tiempoSinEmpleo &&
    datos.tiempoSinEmpleo !== "No aplica"
  ) {
    lineas.push(
      `Tiempo sin empleo: ${datos.tiempoSinEmpleo}`
    );
  }

  lineas.push(
    `País o región: ${datos.paisBusqueda ?? "No indicado"}`,
    `Servicio de interés: ${
      datos.servicioInteres ?? "No indicado"
    }`,
    "",
    "El lead está esperando ser contactado por un asesor."
  );

  return lineas.join("\n");
}

async function notificarPorWhatsApp(
  resumen: string
): Promise<void> {
  const numeroAsesor = env.numeroAsesorWhatsApp;

  if (!numeroAsesor) {
    console.warn(
      "⚠️ Notificación por WhatsApp desactivada: falta WHATSAPP_ADVISOR_NUMBER."
    );
    return;
  }

  const mensajeId = await enviarMensajeTexto({
    destinatario: numeroAsesor,
    texto: resumen
  });

  console.log(
    "✅ Asesor notificado por WhatsApp:",
    mensajeId
  );
}

async function notificarPorCorreo(
  resumen: string
): Promise<void> {
  const {
    correoAsesor,
    hostSmtp,
    puertoSmtp,
    smtpSeguro,
    usuarioSmtp,
    passwordSmtp,
    nombreRemitenteSmtp
  } = env;

  if (
    !correoAsesor ||
    !hostSmtp ||
    !usuarioSmtp ||
    !passwordSmtp
  ) {
    console.warn(
      "⚠️ Notificación por correo desactivada: faltan variables SMTP."
    );
    return;
  }

  const transportador = createTransport({
    host: hostSmtp,
    port: puertoSmtp,
    secure: smtpSeguro,
    auth: {
      user: usuarioSmtp,
      pass: passwordSmtp
    }
  });

  const resultado = await transportador.sendMail({
    from: {
      name: nombreRemitenteSmtp,
      address: usuarioSmtp
    },
    to: correoAsesor,
    subject: "Nuevo lead calificado desde WhatsApp",
    text: resumen
  });

  console.log(
    "✅ Asesor notificado por correo:",
    resultado.messageId
  );
}

export async function notificarNuevoLead(
  conversacion: Conversacion
): Promise<void> {
  const resumen = crearResumenLead(conversacion);
  const canales = ["WhatsApp", "correo"] as const;

  const resultados = await Promise.allSettled([
    notificarPorWhatsApp(resumen),
    notificarPorCorreo(resumen)
  ]);

  resultados.forEach((resultado, indice) => {
    if (resultado.status === "rejected") {
      const detalle =
        resultado.reason instanceof Error
          ? resultado.reason.message
          : String(resultado.reason);

      console.error(
        `❌ No se pudo notificar al asesor por ${canales[indice]}:`,
        detalle
      );
    }
  });
}