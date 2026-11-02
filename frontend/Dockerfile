# syntax=docker/dockerfile:1
# ============================================================
# Frontend - Angular 22 (build de produção) + Nginx (servidor)
# Estratégia: multi-stage build
#   Stage 1 (build): compila o Angular em modo produção
#   Stage 2 (runtime): serve os arquivos estáticos com Nginx
#                     (imagem unprivileged = executa como não-root)
# ============================================================

# ---------- Stage 1: build de produção do Angular ----------
FROM node:24-alpine AS build

WORKDIR /app

# Copia apenas os manifests para aproveitar o cache de camadas
COPY package.json package-lock.json ./

# Instala todas as dependências (build exige devDependencies)
RUN npm ci --no-audit --no-fund

# Copia o código-fonte e as configurações do projeto
COPY . .

# Build de produção (ng build -> configuration "production")
RUN npm run build

# ---------- Stage 2: servidor estático ----------
# Imagem oficial unprivileged: roda com UID não-root e escuta em 8080
FROM nginxinc/nginx-unprivileged:alpine AS runtime

# Endereço do backend usado pelo proxy reverso do Nginx.
# Pode ser sobrescrito em tempo de execução (-e BACKEND_UPSTREAM=...)
ENV BACKEND_UPSTREAM=http://backend:3000

# Confirma que o usuário do container pode gravar a config gerada pelo entrypoint
USER root
RUN chown -R nginx:nginx /etc/nginx/conf.d /etc/nginx/templates 2>/dev/null || true
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
RUN chown nginx:nginx /etc/nginx/templates/default.conf.template
USER nginx

# Artefatos da build de produção (browser output do @angular/build)
COPY --from=build --chown=nginx:nginx /app/dist/TODOapp/browser /usr/share/nginx/html

EXPOSE 8080

# Liveness check no endpoint /healthz do Nginx
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=5 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1

# Comando padrão da imagem nginx (entrypoint aplica os templates com envsubst)
