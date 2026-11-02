# syntax=docker/dockerfile:1
# ============================================================
# Backend - Node.js + Express (API de tarefas)
# Estratégia: multi-stage build
#   Stage 1 (deps):    instala apenas dependências de produção
#   Stage 2 (runtime): copia app + node_modules e roda como não-root
# ============================================================

# ---------- Stage 1: dependências de produção ----------
FROM node:24-alpine AS deps

WORKDIR /app

# Copia apenas os manifests para aproveitar o cache de camadas
COPY package.json package-lock.json ./

# Instala somente o que é necessário para produção
RUN npm ci --omit=dev --no-audit --no-fund

# ---------- Stage 2: runtime ----------
FROM node:24-alpine AS runtime

ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

WORKDIR /app

# Dependências de produção já resolvidas no stage anterior
COPY --from=deps /app/node_modules ./node_modules

# Apenas os arquivos necessários para executar a API
COPY package.json package-lock.json ./
COPY index.js ./
COPY api ./api

# Usuário não-root padrão da imagem oficial do Node
USER node

EXPOSE 3000

# Verifica o endpoint de saúde criado para os healthchecks
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=5 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Executa em modo produção (nodemon é apenas para desenvolvimento)
CMD ["node", "index.js"]
