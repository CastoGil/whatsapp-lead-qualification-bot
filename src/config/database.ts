import mongoose from "mongoose";
import { env } from "./env.js";

mongoose.set("bufferCommands", false);

export async function conectarBaseDatos(): Promise<void> {
  await mongoose.connect(env.uriMongoDB, {
    user: env.usuarioMongoDB,
    pass: env.passwordMongoDB,
    dbName: env.nombreBaseMongoDB,
    authSource: "admin",
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 10
  });

  console.log(
    `✅ MongoDB conectado a la base ${env.nombreBaseMongoDB}.`
  );
}

export async function desconectarBaseDatos(): Promise<void> {
  await mongoose.disconnect();
}