// src/lib/redis.ts

import { createClient } from "redis";

// cria o cliente usando a URL do .env
// o cliente só conecta de fato quando connectRedis() é chamado no server.ts
const client = createClient({ url: process.env.REDIS_URL });

// propaga erros de conexão pro console sem derrubar o processo
client.on("error", (err) => console.error("Redis erro:", err));

// conecta ao Redis — chamado no server.ts junto com o connectDB()
export async function connectRedis(): Promise<void> {
  await client.connect();
  console.log("Redis conectado");
}

// retorna o valor cacheado ou null se a chave não existir
// o JSON.parse reconstrói o objeto original (set sempre serializa com JSON.stringify)
export async function redisGet<T>(chave: string): Promise<T | null> {
  const valor = await client.get(chave);
  if (!valor) return null;
  return JSON.parse(valor) as T;
}

// armazena qualquer valor como JSON com TTL em segundos
export async function redisSet(
  chave: string,
  valor: unknown,
  ttlSegundos: number,
): Promise<void> {
  await client.set(chave, JSON.stringify(valor), { EX: ttlSegundos });
}

// remove uma chave específica do cache
// usado após incrementar cliques pra não manter contagem desatualizada
export async function redisDel(chave: string): Promise<void> {
  await client.del(chave);
}
