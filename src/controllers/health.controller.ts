import type {
    Request,
    Response
} from "express";

export function obtenerEstadoServidor(
    _solicitud: Request,
    respuesta: Response
): void {
    respuesta.status(200).json({
        estado: "ok",
        servicio: "bot-postulaciones-whatsapp",
        fecha: new Date().toISOString()
    });
}