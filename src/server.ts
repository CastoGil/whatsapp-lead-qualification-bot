import { app } from "./app.js";
import { env } from "./config/env.js";

app.listen(env.puerto, () => {
  console.log(
    `\n🚀 Servidor activo en http://localhost:${env.puerto}`
  );
});