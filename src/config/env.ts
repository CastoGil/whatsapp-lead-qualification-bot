function obtenerVariableObligatoria(
  nombre: string,
  preservarEspacios = false
): string {
  const valor = process.env[nombre];

  if (!valor || valor.trim().length === 0) {
    throw new Error(
      `Falta la variable de entorno obligatoria: ${nombre}`
    );
  }

  return preservarEspacios ? valor : valor.trim();
}

const puerto = Number(process.env.PORT ?? 3000);

if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) {
  throw new Error("PORT debe ser un número válido entre 1 y 65535.");
}

const versionApiWhatsApp =
  process.env.WHATSAPP_API_VERSION?.trim() || "v26.0";

if (!/^v\d+\.\d+$/.test(versionApiWhatsApp)) {
  throw new Error(
    "WHATSAPP_API_VERSION debe tener un formato como v26.0."
  );
}

const uriMongoDB = obtenerVariableObligatoria("MONGODB_URI");

if (!/^mongodb(\+srv)?:\/\//.test(uriMongoDB)) {
  throw new Error("MONGODB_URI no tiene un formato válido.");
}

export const env = Object.freeze({
  puerto,
  tokenVerificacion:
    obtenerVariableObligatoria("VERIFY_TOKEN"),
  tokenAccesoWhatsApp:
    obtenerVariableObligatoria("WHATSAPP_ACCESS_TOKEN"),
  phoneNumberIdWhatsApp:
    obtenerVariableObligatoria("WHATSAPP_PHONE_NUMBER_ID"),
  versionApiWhatsApp,
  uriMongoDB,
  usuarioMongoDB:
    obtenerVariableObligatoria("MONGODB_USERNAME"),
  passwordMongoDB:
    obtenerVariableObligatoria("MONGODB_PASSWORD", true),
  nombreBaseMongoDB:
    obtenerVariableObligatoria("MONGODB_DB_NAME")
});