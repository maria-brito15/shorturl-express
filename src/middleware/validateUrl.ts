// src/middleware/validateUrl.ts

import { Request, Response, NextFunction } from "express";
import { z } from "zod";

const urlSchema = z.object({
  // z.string().url() rejeita strings que não são URLs válidas
  // ex: "google.com" falha, "https://google.com" passa
  url: z.string().url({ message: "URL inválida — inclua http:// ou https://" }),
});

// middleware de validação — roda antes do controller nas rotas POST
// se o body for inválido, responde 400 e não chama next()
// se for válido, chama next() e o controller assume
export function validateUrl(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const parsed = urlSchema.safeParse(req.body);

  if (!parsed.success) {
    // flatten() transforma os erros do Zod num objeto legível
    // ex: { fieldErrors: { url: ["URL inválida"] } }
    res.status(400).json({
      error: "Dados inválidos",
      detalhes: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  // sobrescreve req.body com o valor já validado e tipado pelo Zod
  // assim o controller pode confiar em req.body.url sem validar de novo
  req.body = parsed.data;
  next();
}
