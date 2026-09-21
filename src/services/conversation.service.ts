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