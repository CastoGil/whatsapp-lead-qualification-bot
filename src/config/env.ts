import "dotenv/config";

const puerto = Number(process.env.PORT ?? "3000");

if (
  !Number.isInteger(puerto) ||
  puerto < 1 ||
  puerto > 65535
) {
  throw new Error(
    "La variable PORT debe contener un puerto válido."
  );
}

export const env = Object.freeze({
  puerto
});