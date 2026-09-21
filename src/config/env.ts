import "dotenv/config";

const puerto = Number(process.env.PORT ?? "3000");
const tokenVerificacion =
  process.env.VERIFY_TOKEN?.trim();

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

export const env = Object.freeze({
  puerto,
  tokenVerificacion
});