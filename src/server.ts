import "dotenv/config";
import { app } from "./app.js";
import {
  conectarBaseDatos,
  desconectarBaseDatos
} from "./config/database.js";
import { env } from "./config/env.js";

async function iniciarServidor(): Promise<void> {
  try {
    await conectarBaseDatos();

    const servidor = app.listen(env.puerto, () => {
      console.log(
        `🚀 Servidor activo en http://localhost:${env.puerto}`
      );
    });

    async function cerrarServidor(señal: string): Promise<void> {
      console.log(`\n🛑 Señal ${señal} recibida. Cerrando servidor...`);

      servidor.close(async () => {
        await desconectarBaseDatos();
        console.log("✅ Servidor cerrado correctamente.");
        process.exit(0);
      });
    }

    process.once("SIGINT", () => {
      void cerrarServidor("SIGINT");
    });

    process.once("SIGTERM", () => {
      void cerrarServidor("SIGTERM");
    });
  } catch (error) {
    const detalle =
      error instanceof Error ? error.message : "Error desconocido";

    console.error(
      "❌ No se pudo iniciar la aplicación:",
      detalle
    );

    process.exit(1);
  }
}

void iniciarServidor();