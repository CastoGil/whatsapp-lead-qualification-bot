import {
  eliminarConversacionMongo as eliminarConversacion,
  guardarConversacionMongo as guardarConversacion,
  obtenerConversacionMongo as obtenerConversacion
} from "../repositories/mongo-conversation.repository.js";
import type {
  Conversacion,
  DatosLead,
  EstadoConversacion
} from "../types/conversation.types.js";
import type { MensajeEntrante } from "../types/whatsapp.types.js";

const situacionesLaborales: Record<string, string> = {
  "1": "Empleado/a buscando un cambio",
  "2": "Desempleado/a",
  "3": "Buscando el primer empleo",
  "4": "Independiente o freelance"
};

const tiemposSinEmpleo: Record<string, string> = {
  "1": "Menos de 3 meses",
  "2": "Entre 3 y 6 meses",
  "3": "Entre 6 y 12 meses",
  "4": "Más de 1 año"
};

const servicios: Record<string, string> = {
  "1": "Optimización de CV y perfil profesional",
  "2": "Estrategia y acompañamiento en postulaciones",
  "3": "Servicio integral de postulación laboral",
  "4": "Consultoría de management"
};

function normalizarTexto(texto: string): string {
  return texto
    .trim()
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function obtenerPrimerNombre(nombreCompleto: string): string {
  const nombreLimpio = nombreCompleto.trim();

  if (!nombreLimpio || nombreLimpio === "Sin nombre") {
    return "";
  }

  return nombreLimpio.split(/\s+/)[0] ?? "";
}

export function crearMensajeBienvenida(nombreCompleto: string): string {
  const primerNombre = obtenerPrimerNombre(nombreCompleto);

  const saludo = primerNombre
    ? `Hola, ${primerNombre} 👋`
    : "Hola 👋";

  return [
    saludo,
    "",
    "Gracias por escribirnos.",
    "",
    "Somos un servicio profesional y pago de asesoría para procesos de postulación laboral.",
    "No somos una agencia de empleo y no ofrecemos vacantes directamente.",
    "",
    "¿Deseas conocer cómo podemos ayudarte?",
    "",
    "Responde:",
    "1. Sí, quiero información",
    "2. No por ahora"
  ].join("\n");
}

async function actualizarConversacion(
  conversacion: Conversacion,
  estado: EstadoConversacion,
  datos: Partial<DatosLead> = {}
): Promise<Conversacion> {
  return guardarConversacion({
    ...conversacion,
    estado,
    datos: {
      ...conversacion.datos,
      ...datos
    },
    actualizadaEn: new Date()
  });
}

async function iniciarConversacion(
  mensaje: MensajeEntrante
): Promise<string> {
  const ahora = new Date();

  await guardarConversacion({
    telefono: mensaje.telefono,
    estado: "esperando_interes",
    datos: {},
    creadaEn: ahora,
    actualizadaEn: ahora
  });

  return crearMensajeBienvenida(mensaje.nombre);
}

async function procesarInteres(
  conversacion: Conversacion,
  respuesta: string
): Promise<string> {
  if (
    ["1", "si", "si quiero informacion", "quiero informacion"].includes(
      respuesta
    )
  ) {
    await actualizarConversacion(
      conversacion,
      "esperando_nombre"
    );

    return [
      "¡Excelente! Para comenzar necesito algunos datos.",
      "",
      "¿Cuál es tu nombre y apellido?"
    ].join("\n");
  }

  if (["2", "no", "no por ahora"].includes(respuesta)) {
    await actualizarConversacion(conversacion, "finalizada");

    return [
      "Entendido. Gracias por comunicarte con nosotros.",
      "",
      "Si más adelante deseas conocer nuestros servicios, escribe INICIO."
    ].join("\n");
  }

  return [
    "No pude identificar tu respuesta.",
    "",
    "Responde con una opción:",
    "1. Sí, quiero información",
    "2. No por ahora"
  ].join("\n");
}

async function procesarNombre(
  conversacion: Conversacion,
  texto: string
): Promise<string> {
  const nombre = texto.trim().replace(/\s+/g, " ");

  if (nombre.length < 2 || nombre.length > 80 || /^\d+$/.test(nombre)) {
    return "Escribe tu nombre y apellido usando texto, por favor.";
  }

  await actualizarConversacion(
    conversacion,
    "esperando_edad",
    { nombre }
  );

  return `Gracias, ${nombre}. ¿Qué edad tienes?`;
}

async function procesarEdad(
  conversacion: Conversacion,
  texto: string
): Promise<string> {
  const valor = texto.trim();

  if (!/^\d{1,3}$/.test(valor)) {
    return "Indica tu edad utilizando solamente números.";
  }

  const edad = Number(valor);

  if (edad < 16 || edad > 100) {
    return "Ingresa una edad válida entre 16 y 100 años.";
  }

  await actualizarConversacion(
    conversacion,
    "esperando_situacion_laboral",
    { edad }
  );

  return [
    "¿Cuál es tu situación laboral actual?",
    "",
    "1. Tengo empleo y busco un cambio",
    "2. Estoy desempleado/a",
    "3. Busco mi primer empleo",
    "4. Trabajo de manera independiente o freelance"
  ].join("\n");
}

async function procesarSituacionLaboral(
  conversacion: Conversacion,
  respuesta: string
): Promise<string> {
  const situacionLaboral = situacionesLaborales[respuesta];

  if (!situacionLaboral) {
    return "Selecciona una opción válida del 1 al 4.";
  }

  if (respuesta === "2") {
    await actualizarConversacion(
      conversacion,
      "esperando_tiempo_sin_empleo",
      { situacionLaboral }
    );

    return [
      "¿Cuánto tiempo llevas sin empleo?",
      "",
      "1. Menos de 3 meses",
      "2. Entre 3 y 6 meses",
      "3. Entre 6 y 12 meses",
      "4. Más de 1 año"
    ].join("\n");
  }

  await actualizarConversacion(conversacion, "esperando_pais", {
    situacionLaboral,
    tiempoSinEmpleo: "No aplica"
  });

  return "¿En qué país deseas buscar oportunidades laborales?";
}

async function procesarTiempoSinEmpleo(
  conversacion: Conversacion,
  respuesta: string
): Promise<string> {
  const tiempoSinEmpleo = tiemposSinEmpleo[respuesta];

  if (!tiempoSinEmpleo) {
    return "Selecciona una opción válida del 1 al 4.";
  }

  await actualizarConversacion(conversacion, "esperando_pais", {
    tiempoSinEmpleo
  });

  return "¿En qué país deseas buscar oportunidades laborales?";
}

async function procesarPais(
  conversacion: Conversacion,
  texto: string
): Promise<string> {
  const paisBusqueda = texto.trim().replace(/\s+/g, " ");

  if (paisBusqueda.length < 2 || paisBusqueda.length > 80) {
    return "Escribe un país o región válido.";
  }

  await actualizarConversacion(
    conversacion,
    "esperando_servicio",
    { paisBusqueda }
  );

  return [
    "¿Qué tipo de ayuda te interesa?",
    "",
    "1. Optimización de CV y perfil profesional",
    "2. Estrategia y acompañamiento en postulaciones",
    "3. Servicio integral de postulación laboral",
    "4. Consultoría de management"
  ].join("\n");
}

async function procesarServicio(
  conversacion: Conversacion,
  respuesta: string
): Promise<string> {
  const servicioInteres = servicios[respuesta];

  if (!servicioInteres) {
    return "Selecciona una opción válida del 1 al 4.";
  }

  const conversacionActualizada = await actualizarConversacion(
    conversacion,
    "derivacion_humana",
    { servicioInteres }
  );

  const datos = conversacionActualizada.datos;
  const mostrarTiempo =
    datos.tiempoSinEmpleo &&
    datos.tiempoSinEmpleo !== "No aplica";

  return [
    `Gracias, ${datos.nombre ?? "hemos registrado tus datos"}.`,
    "",
    "Resumen de tu solicitud:",
    `• Edad: ${datos.edad ?? "No indicada"}`,
    `• Situación laboral: ${datos.situacionLaboral ?? "No indicada"}`,
    ...(mostrarTiempo
      ? [`• Tiempo sin empleo: ${datos.tiempoSinEmpleo}`]
      : []),
    `• País o región: ${datos.paisBusqueda ?? "No indicado"}`,
    `• Servicio de interés: ${servicioInteres}`,
    "",
    "Un asesor revisará tu información y continuará la atención.",
    "Recuerda que nuestros servicios son pagos.",
    "",
    "Para comenzar nuevamente, escribe INICIO."
  ].join("\n");
}

export async function procesarMensajeConversacion(
  mensaje: MensajeEntrante
): Promise<string> {
  const textoNormalizado = normalizarTexto(mensaje.texto);

  if (["inicio", "menu", "reiniciar"].includes(textoNormalizado)) {
    await eliminarConversacion(mensaje.telefono);
    return iniciarConversacion(mensaje);
  }

  const conversacion = await obtenerConversacion(mensaje.telefono);

  if (!conversacion) {
    return iniciarConversacion(mensaje);
  }

  switch (conversacion.estado) {
    case "esperando_interes":
      return procesarInteres(conversacion, textoNormalizado);

    case "esperando_nombre":
      return procesarNombre(conversacion, mensaje.texto);

    case "esperando_edad":
      return procesarEdad(conversacion, mensaje.texto);

    case "esperando_situacion_laboral":
      return procesarSituacionLaboral(
        conversacion,
        textoNormalizado
      );

    case "esperando_tiempo_sin_empleo":
      return procesarTiempoSinEmpleo(
        conversacion,
        textoNormalizado
      );

    case "esperando_pais":
      return procesarPais(conversacion, mensaje.texto);

    case "esperando_servicio":
      return procesarServicio(conversacion, textoNormalizado);

    case "derivacion_humana":
      return [
        "Tu solicitud ya fue registrada.",
        "Un asesor continuará la atención.",
        "",
        "Si deseas comenzar nuevamente, escribe INICIO."
      ].join("\n");

    case "finalizada":
      return "Si deseas comenzar nuevamente, escribe INICIO.";
  }
}