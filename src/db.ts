// src/db.ts

import mongoose from "mongoose";

// conecta ao MongoDB usando a URL do .env
// chamado uma única vez no server.ts antes de abrir o servidor
export async function connectDB(): Promise<void> {
  const uri = process.env.MONGO_URL;

  if (!uri) {
    throw new Error("MONGO_URL não definida no .env");
  }

  await mongoose.connect(uri);
  console.log("MongoDB conectado");
}
