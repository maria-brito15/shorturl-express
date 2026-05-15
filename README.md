# 🔗 ShortURL

Encurtador de URLs com rastreamento de cliques, construído com **Node.js**, **TypeScript**, **MongoDB** e **Redis**.

[![CI](https://github.com/seu-usuario/shorturl/actions/workflows/ci.yml/badge.svg)](https://github.com/seu-usuario/shorturl/actions/workflows/ci.yml)

---

## ✨ Funcionalidades

- **Encurtamento de URLs** — gera códigos curtos únicos de 6 caracteres via [nanoid](https://github.com/ai/nanoid)
- **Redirecionamento rápido** — cache em Redis com TTL de 10 minutos para alta performance
- **Rastreamento de cliques** — contador atômico atualizado a cada acesso
- **Validação de entrada** — middleware com [Zod](https://zod.dev) rejeita URLs malformadas antes de chegar ao controller
- **API REST completa** — CRUD de URLs com respostas padronizadas em JSON
- **Frontend incluído** — interface web servida como estático pelo próprio servidor
- **Containerizado** — sobe tudo com um único `docker compose up`

---

## 🛠 Tecnologias

| Camada            | Tecnologia                |
| ----------------- | ------------------------- |
| Runtime           | Node.js 20 + TypeScript 5 |
| Framework         | Express 4                 |
| Banco de dados    | MongoDB 7 (Mongoose 8)    |
| Cache             | Redis 7                   |
| Geração de código | nanoid 3                  |
| Validação         | Zod                       |
| Containerização   | Docker + Docker Compose   |
| CI                | GitHub Actions            |

---

## 📐 Arquitetura

```
src/
├── server.ts          # Ponto de entrada — inicializa Express, MongoDB e Redis
├── db.ts              # Conexão com o MongoDB
├── routes/
│   └── urlRoutes.ts   # Definição das rotas da API
├── controllers/
│   └── urlController.ts  # Lógica de negócio (criar, redirecionar, listar, deletar)
├── middleware/
│   └── validateUrl.ts    # Validação do body com Zod
├── models/
│   └── Url.ts            # Schema Mongoose (originalUrl, code, clicks)
└── lib/
    └── redis.ts          # Cliente Redis com helpers get/set/del
```

**Fluxo de redirecionamento:**

```
GET /:code
    │
    ├─ Redis HIT  →  redirect 302  (async: incrementa cliques no MongoDB)
    │
    └─ Redis MISS →  MongoDB findOneAndUpdate ($inc clicks)
                          │
                          ├─ Não encontrado → 404
                          └─ Encontrado → cacheia no Redis → redirect 302
```

---

## 🚀 Como Rodar

### Com Docker (recomendado)

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/shorturl.git
cd shorturl

# Copie o arquivo de variáveis de ambiente
cp .env.example .env

# Suba todos os serviços (API + MongoDB + Redis)
docker compose up
```

A API estará disponível em `http://localhost:3000`.

---

### Localmente (sem Docker)

**Pré-requisitos:** Node.js 20+, MongoDB e Redis rodando localmente.

```bash
# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas URLs locais de MongoDB e Redis

# Inicie em modo de desenvolvimento (hot reload)
npm run dev
```

---

## ⚙️ Variáveis de Ambiente

Copie `.env.example` para `.env` e ajuste conforme necessário:

| Variável    | Descrição                                   | Padrão                               |
| ----------- | ------------------------------------------- | ------------------------------------ |
| `PORT`      | Porta do servidor                           | `3000`                               |
| `MONGO_URL` | URI de conexão com o MongoDB                | `mongodb://localhost:27017/shorturl` |
| `REDIS_URL` | URI de conexão com o Redis                  | `redis://localhost:6379`             |
| `BASE_URL`  | URL base usada para montar o link encurtado | `http://localhost:3000`              |

---

## 📡 Endpoints da API

### `POST /api/urls`

Cria um novo link encurtado.

**Body:**

```json
{ "url": "https://exemplo.com/minha-url-longa" }
```

**Resposta `201`:**

```json
{
  "id": "664f...",
  "originalUrl": "https://exemplo.com/minha-url-longa",
  "shortUrl": "http://localhost:3000/aB3xYz",
  "code": "aB3xYz",
  "clicks": 0,
  "createdAt": "2024-05-14T20:00:00.000Z"
}
```

---

### `GET /api/urls`

Lista todas as URLs criadas, ordenadas da mais recente.

**Resposta `200`:**

```json
{
  "urls": [ ...objetos de URL... ],
  "total": 42
}
```

---

### `GET /api/urls/:code`

Retorna dados de uma URL específica pelo código (sem redirecionar).

**Resposta `200`:** objeto de URL completo com `updatedAt`.

---

### `DELETE /api/urls/:code`

Remove a URL do banco e invalida o cache no Redis.

**Resposta `200`:**

```json
{ "ok": true, "message": "URL \"aB3xYz\" removida" }
```

---

### `GET /:code`

Redireciona para a URL original (`302`). Incrementa o contador de cliques.

---

## 🧪 Scripts Disponíveis

```bash
npm run dev        # Inicia com hot reload (tsx watch)
npm run build      # Compila o TypeScript para dist/
npm start          # Executa o build de produção
npm run typecheck  # Checa tipos sem emitir arquivos
npm run lint       # Lint com ESLint
```

---

## 🔄 CI/CD

O pipeline de CI roda automaticamente em todo push e pull request para a branch `main` via **GitHub Actions**:

1. Instala dependências
2. Checa tipos com TypeScript (`tsc --noEmit`)
3. Compila o projeto (`tsc`)

---

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais e de portfólio.
