// src/controllers/urlController.ts

import { Request, Response } from "express";
import { Url } from "../models/Url";
import { redisGet, redisSet, redisDel } from "../lib/redis";
import { nanoid } from "nanoid";

// TTL em segundos para o cache do redirect
// 10 minutos — curto o suficiente pra não servir URLs deletadas por muito tempo
const TTL_REDIRECT = 10 * 60;

// POST /api/urls
// cria um link encurtado e retorna o objeto completo com a URL curta montada
export async function criarUrl(req: Request, res: Response): Promise<void> {
  try {
    const { url: originalUrl } = req.body; // body já validado pelo middleware validateUrl

    // nanoid(6) gera um código aleatório de 6 caracteres (ex: "aB3xYz")
    // com 64 caracteres possíveis e 6 posições, são ~68 bilhões de combinações
    // colisões são improváveis mas tratadas pelo índice unique do MongoDB
    const code = nanoid(6);

    const urlDoc = await Url.create({ originalUrl, code, clicks: 0 });

    // monta a URL curta usando a BASE_URL do .env
    // ex: http://localhost:3000/aB3xYz
    const shortUrl = `${process.env.BASE_URL}/${code}`;

    res.status(201).json({
      id: urlDoc._id,
      originalUrl: urlDoc.originalUrl,
      shortUrl,
      code: urlDoc.code,
      clicks: urlDoc.clicks,
      createdAt: urlDoc.createdAt,
    });
  } catch {
    res.status(500).json({ error: "Erro ao criar URL encurtada" });
  }
}

// GET /:code
// redireciona para a URL original, incrementa cliques e usa Redis como cache
export async function redirecionar(req: Request, res: Response): Promise<void> {
  try {
    const { code } = req.params;

    // tenta o cache primeiro — a grande maioria dos redirects passa por aqui
    // sem tocar no MongoDB, o que é muito mais rápido
    const cached = await redisGet<string>(code);

    if (cached) {
      // incrementa cliques no banco de forma assíncrona
      // não aguarda — o redirect acontece sem esperar a escrita no banco
      Url.updateOne({ code }, { $inc: { clicks: 1 } }).exec();

      res.redirect(302, cached);
      return;
    }

    // cache miss — busca no banco e cacheia para as próximas requisições
    const urlDoc = await Url.findOneAndUpdate(
      { code },
      { $inc: { clicks: 1 } }, // já incrementa enquanto busca (operação atômica)
      { new: true }, // retorna o documento atualizado
    );

    if (!urlDoc) {
      res.status(404).json({ error: "URL não encontrada" });
      return;
    }

    // cacheia só a originalUrl — é a única informação que o redirect precisa
    await redisSet(code, urlDoc.originalUrl, TTL_REDIRECT);

    res.redirect(302, urlDoc.originalUrl);
  } catch {
    res.status(500).json({ error: "Erro ao redirecionar" });
  }
}

// GET /api/urls
// lista todas as URLs criadas, ordenadas da mais recente pra mais antiga
export async function listarUrls(_req: Request, res: Response): Promise<void> {
  try {
    const urls = await Url.find().sort({ createdAt: -1 });

    // monta o shortUrl em cada item da lista pra facilitar o uso no frontend
    const resultado = urls.map((u) => ({
      id: u._id,
      originalUrl: u.originalUrl,
      shortUrl: `${process.env.BASE_URL}/${u.code}`,
      code: u.code,
      clicks: u.clicks,
      createdAt: u.createdAt,
    }));

    res.json({ urls: resultado, total: resultado.length });
  } catch {
    res.status(500).json({ error: "Erro ao listar URLs" });
  }
}

// GET /api/urls/:code
// retorna os dados de uma URL específica pelo código (sem redirecionar)
// útil pra mostrar estatísticas de cliques
export async function buscarUrl(req: Request, res: Response): Promise<void> {
  try {
    const { code } = req.params;

    const urlDoc = await Url.findOne({ code });

    if (!urlDoc) {
      res.status(404).json({ error: "URL não encontrada" });
      return;
    }

    res.json({
      id: urlDoc._id,
      originalUrl: urlDoc.originalUrl,
      shortUrl: `${process.env.BASE_URL}/${urlDoc.code}`,
      code: urlDoc.code,
      clicks: urlDoc.clicks,
      createdAt: urlDoc.createdAt,
      updatedAt: urlDoc.updatedAt,
    });
  } catch {
    res.status(500).json({ error: "Erro ao buscar URL" });
  }
}

// DELETE /api/urls/:code
// remove a URL do banco e invalida o cache do Redis
export async function deletarUrl(req: Request, res: Response): Promise<void> {
  try {
    const { code } = req.params;

    const urlDoc = await Url.findOneAndDelete({ code });

    if (!urlDoc) {
      res.status(404).json({ error: "URL não encontrada" });
      return;
    }

    // remove do cache para que redirects futuros não sirvam uma URL deletada
    await redisDel(code);

    res.json({ ok: true, message: `URL "${code}" removida` });
  } catch {
    res.status(500).json({ error: "Erro ao deletar URL" });
  }
}
