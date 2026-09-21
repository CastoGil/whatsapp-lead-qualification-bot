import "dotenv/config";

const puerto = Number(
  process.env.PORT ?? "3000"
);

const tokenVerificacion =
  process.env.VERIFY_TOKEN?.trim();

const tokenAccesoWhatsApp =
  process.env.WHATSAPP_ACCESS_TOKEN?.trim();

const phoneNumberIdWhatsApp =
  process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();

const versionApiWhatsApp =
  process.env.WHATSAPP_API_VERSION?.trim() ||
  "v26.0";

if (
  !Number.isInteger(puerto) ||
  puerto < 1 ||
  puerto > 65535
) {
  throw new Error(
    "La variable PORT debe contener un puerto válido."
  );
}

if (!tokenVerificacion) {
  throw new Error(
    "La variable VERIFY_TOKEN es obligatoria."
  );
}

if (!tokenAccesoWhatsApp) {
  throw new Error(
    "La variable WHATSAPP_ACCESS_TOKEN es obligatoria."
  );
}

if (!phoneNumberIdWhatsApp) {
  throw new Error(
    "La variable WHATSAPP_PHONE_NUMBER_ID es obligatoria."
  );
}

if (
  !/^v\d+\.\d+$/.test(versionApiWhatsApp)
) {
  throw new Error(
    "La variable WHATSAPP_API_VERSION debe tener un formato como v26.0."
  );
}

export const env = Object.freeze({
  puerto,
  tokenVerificacion,
  tokenAccesoWhatsApp,
  phoneNumberIdWhatsApp,
  versionApiWhatsApp
});