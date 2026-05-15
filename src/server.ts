// src/server.ts

import "dotenv/config"; // carrega o .env antes de qualquer import que use process.env
import express from "express";
import cors from "cors";
import { connectDB } from "./db";
import { connectRedis } from "./lib/redis";
import { urlRoutes } from "./routes/urlRoutes";
import { redirecionar } from "./controllers/urlController";
import path from "path";

const app = express();

app.use(express.static(path.join(__dirname, "../")));

// ----- middlewares globais -----

// cors libera o acesso à API de qualquer origem em desenvolvimento
// em produção, substitua por { origin: "https://seudominio.com" }
app.use(cors());

// parseia o body das requisições como JSON
// sem isso, req.body seria undefined nos controllers
app.use(express.json());

// ----- rotas -----

// rotas da API — prefixadas com /api para separar da rota de redirect
app.use("/api", urlRoutes);

// GET /:code — rota de redirect, registrada diretamente no app (fora do prefixo /api)
// fica por último para não interceptar rotas que ainda não existem
app.get("/:code", redirecionar);

// ----- inicialização -----

const PORT = process.env.PORT ?? 3000;

async function main() {
  try {
    // conecta ao banco e ao cache antes de abrir o servidor
    // se qualquer um falhar, o processo encerra com erro
    await connectDB();
    await connectRedis();

    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
      console.log(`  POST   http://localhost:${PORT}/api/urls`);
      console.log(`  GET    http://localhost:${PORT}/api/urls`);
      console.log(`  GET    http://localhost:${PORT}/api/urls/:code`);
      console.log(`  DELETE http://localhost:${PORT}/api/urls/:code`);
      console.log(`  GET    http://localhost:${PORT}/:code  → redirect`);
    });
  } catch (err) {
    console.error("Falha ao iniciar o servidor:", err);
    process.exit(1);
  }
}

main();
