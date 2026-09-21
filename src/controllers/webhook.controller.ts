import type {
    Request,
    Response
} from "express";

import { env } from "../config/env.js";

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
        console.log("✅ Webhook verificado correctamente.");

        respuesta.status(200).send(desafio);
        return;
    }

    console.warn("❌ Verificación del webhook rechazada.");

    respuesta.sendStatus(403);
}