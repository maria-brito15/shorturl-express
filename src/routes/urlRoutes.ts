// src/routes/urlRoutes.ts

import { Router } from "express";
import {
  criarUrl,
  listarUrls,
  buscarUrl,
  deletarUrl,
} from "../controllers/urlController";
import { validateUrl } from "../middleware/validateUrl";

export const urlRoutes = Router();

// ----- rotas da API (/api/urls) -----

// GET  /api/urls → lista todas as URLs com estatísticas de cliques
urlRoutes.get("/urls", listarUrls);

// POST /api/urls → cria um link encurtado (valida o body antes)
urlRoutes.post("/urls", validateUrl, criarUrl);

// GET  /api/urls/:code → retorna dados de uma URL pelo código (sem redirecionar)
urlRoutes.get("/urls/:code", buscarUrl);

// DELETE /api/urls/:code → remove a URL e invalida o cache
urlRoutes.delete("/urls/:code", deletarUrl);
