import "dotenv/config";
import { notificarNuevoLead } from "../services/lead-notification.service.js";

const ahora = new Date();

await notificarNuevoLead({
  telefono:
    process.env.WHATSAPP_ADVISOR_NUMBER?.trim() ||
    "numero-de-prueba",
  estado: "derivacion_humana",
  datos: {
    nombre: "Lead de prueba técnica",
    edad: 33,
    situacionLaboral: "Independiente o freelance",
    tiempoSinEmpleo: "No aplica",
    paisBusqueda: "Argentina",
    servicioInteres: "Consultoría de management"
  },
  creadaEn: ahora,
  actualizadaEn: ahora
});

console.log("✅ Prueba de notificaciones finalizada.");