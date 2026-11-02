# TODOapp

Aplicação de lista de tarefas (To-Do) composta por:

- **Frontend:** Angular 22 (build de produção servido por Nginx)
- **Backend:** Node.js 24 + Express 5 + Mongoose (MongoDB)
- **Banco de dados:** MongoDB 8 (serviço local do Docker Compose ou instância externa/Atlas)

O projeto está totalmente dockerizado: toda a aplicação pode ser iniciada com **um único comando**.

---

## Pré-requisitos

| Ferramenta | Versão mínima | Observação |
|---|---|---|
| Docker Engine | 20.10+ | [Instalar Docker](https://docs.docker.com/engine/install/) |
| Docker Compose | v2+ | Incluído no Docker Desktop e nos pacotes oficiais do Docker Engine |
| Git | 2.x | Somente para clonar o repositório |
| Node.js *(opcional)* | 24.x | Apenas para rodar o projeto **sem** Docker (desenvolvimento) |
| npm *(opcional)* | 11.x | Gerenciador de pacotes do Node |

> Para apenas **baixar e rodar as imagens publicadas**, basta ter o Docker instalado.

---

## Estrutura dos containers

| Serviço | Imagem | Porta no container | Porta no host (padrão) | Descrição |
|---|---|---|---|---|
| `frontend` | `and5reas/todoapp-frontend:latest` | `8080/tcp` | `80` | Nginx servindo o Angular + proxy reverso `/api` |
| `backend` | `and5reas/todoapp-backend:latest` | `3000/tcp` | `3000` | API Express (executa como usuário não-root) |
| `mongodb` | `mongo:8` | `27017/tcp` | *(não exposta)* | Banco de dados, somente na rede interna |

```
Navegador ──:80──▶ [ frontend / Nginx ] ──rede interna todoapp-net──▶ [ backend / Express ] ──▶ [ mongodb ]
                           │                                              │
                           └──────── /api/* (proxy reverso) ───────────────┘
```

- Rede interna: `todoapp-net` (bridge) — os containers se comunicam pelos nomes de serviço (`backend`, `mongodb`).
- Volume persistente do banco: `todoapp-mongo-data`.
- Todos os serviços usam `restart: unless-stopped` e possuem `healthcheck`.

---

## Configuração das variáveis de ambiente

Copie o arquivo de exemplo e ajuste conforme necessário:

```bash
cp .env.example .env
```

| Variável | Padrão | Descrição |
|---|---|---|
| `DOCKERHUB_USER` | `and5reas` | Usuário do Docker Hub (define o prefixo das imagens) |
| `PROJECT_NAME` | `todoapp` | Nome do projeto nas imagens (`<projeto>-frontend` / `<projeto>-backend`) |
| `FRONTEND_PORT` | `80` | Porta do Nginx exposta no host |
| `BACKEND_PORT` | `3000` | Porta da API Express exposta no host |
| `MONGO_URL` | `mongodb://mongodb:27017/todoapp` | String de conexão do MongoDB (local ou Atlas) |

Variáveis usadas **dentro** dos containers (já definidas no `docker-compose.yml`):

| Variável | Valor | Onde | Descrição |
|---|---|---|---|
| `NODE_ENV` | `production` | backend | Modo de produção do Node/Express |
| `PORT` | `3000` | backend | Porta interna do Express |
| `HOST` | `0.0.0.0` | backend | Garante aceitação de conexões externas ao container |
| `MONGO_URL` | via `.env` | backend | Conexão com o MongoDB |
| `BACKEND_UPSTREAM` | `http://backend:3000` | frontend | Destino do proxy reverso do Nginx (`/api/*`) |

> ⚠️ O arquivo `.env` é ignorado pelo Git (`.gitignore`) e **não é copiado para as imagens**.
> Nunca versione credenciais reais. Use o `.env.example` como referência.

---

## Como executar localmente com Docker Compose

```bash
# 1) Clonar o repositório
git clone <url-do-repositorio>
cd TODOapp_unisanta

# 2) Criar o arquivo de ambiente
cp .env.example .env

# 3) Build + inicialização de toda a aplicação (um único comando)
docker compose up -d --build
```

Verificar o estado:

```bash
docker compose ps
```

Saída esperada (todos `Up` / `healthy`):

```
NAME                 STATUS                    PORTS
todoapp-frontend     Up (healthy)              0.0.0.0:80->8080/tcp
todoapp-backend      Up (healthy)              0.0.0.0:3000->3000/tcp
todoapp-mongodb      Up (healthy)              27017/tcp
```

---

## Endereços e portas de acesso

| Recurso | Endereço |
|---|---|
| Aplicação (Frontend) | <http://localhost/> (ou `http://localhost:${FRONTEND_PORT}`) |
| API direta (Backend) | <http://localhost:3000/api/getAll> |
| Healthcheck do Backend | <http://localhost:3000/api/health> |
| Healthcheck do Frontend | <http://localhost/healthz> |
| Rota SPA de exemplo | <http://localhost/qualquer-rota> (cai no `index.html`) |

---

## Como visualizar os logs

```bash
# Logs de todos os serviços (modo contínuo)
docker compose logs -f

# Logs de um serviço específico
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongodb

# Últimas 100 linhas
docker compose logs --tail=100 backend
```

---

## Como reiniciar e parar os containers

```bash
# Parar (mantém os containers e o volume do banco)
docker compose stop

# Iniciar novamente
docker compose start

# Reiniciar os serviços
docker compose restart backend

# Parar e REMOVER containers, rede e dados do banco (volume é mantido)
docker compose down

# Parar e remover também o volume do banco (apaga os dados!)
docker compose down -v
```

---

## Como realizar build manual das imagens

```bash
# Build de ambas as imagens
docker compose build

# Build individual
docker build -t and5reas/todoapp-backend:latest ./backend
docker build -t and5reas/todoapp-frontend:latest ./frontend

# Build sem cache (do zero)
docker compose build --no-cache
```

Tamanhos aproximados das imagens finais:

| Imagem | Tamanho | Composição |
|---|---|---|
| `and5reas/todoapp-backend:latest` | **264 MB** | base `node:24-alpine` (243 MB) + deps de produção (17 MB) + app (~40 kB) |
| `and5reas/todoapp-frontend:latest` | **91,4 MB** | base `nginxinc/nginx-unprivileged:alpine` (91 MB) + build Angular (~209 kB) |

---

## Publicação no Docker Hub

As imagens são publicadas com a convenção:

```
USUARIO_DOCKERHUB/NOME_PROJETO-frontend:latest
USUARIO_DOCKERHUB/NOME_PROJETO-backend:latest
```

Neste projeto:

- `and5reas/todoapp-frontend:latest`
- `and5reas/todoapp-backend:latest`

### Build e push

```bash
# Login (informe a senha/token apenas no prompt do terminal; nunca em arquivos do projeto)
docker login

# Build
docker compose build

# Push das duas imagens
docker compose push
```

### Baixar e executar direto do Docker Hub

```bash
# Criar rede compartilhada
docker network create todoapp-net

# MongoDB (ou use um MongoDB Atlas externo)
docker run -d --name todoapp-mongodb \
  --network todoapp-net \
  -v todoapp-mongo-data:/data/db \
  mongo:8

# Backend
docker run -d --name todoapp-backend \
  --network todoapp-net \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e HOST=0.0.0.0 \
  -e MONGO_URL=mongodb://todoapp-mongodb:27017/todoapp \
  -p 3000:3000 \
  --restart unless-stopped \
  and5reas/todoapp-backend:latest

# Frontend (o nome do container deve bater com BACKEND_UPSTREAM)
docker run -d --name todoapp-frontend \
  --network todoapp-net \
  -e BACKEND_UPSTREAM=http://todoapp-backend:3000 \
  -p 80:8080 \
  --restart unless-stopped \
  and5reas/todoapp-frontend:latest
```

Depois acesse: <http://localhost/>

---

## Usando um MongoDB externo (opcional)

Para usar MongoDB Atlas ou outra instância, aponte `MONGO_URL` no `.env` e suba **apenas** os serviços da aplicação (sem o MongoDB local):

```bash
# .env
MONGO_URL=mongodb+srv://usuario:senha@cluster.example.mongodb.net/todoapp

# Só frontend e backend (não inicia o serviço mongodb)
docker compose up -d --no-deps frontend backend
```

---

## Desenvolvimento local (sem Docker)

```bash
# Backend (porta 3000) — requer um MongoDB acessível via variável MONGO_URL
cd backend
npm install
npx nodemon index        # ou: node index

# Frontend (porta 4200, aponta para http://localhost:3000)
cd frontend
npm install
npm start                # ng serve
```

> Em desenvolvimento o Angular usa `src/environments/environment.development.ts`
> (`apiURL = http://localhost:3000`). Em produção é usado `src/environments/environment.ts`
> (`apiURL = ''`, requisições relativas encaminhadas pelo Nginx) — nenhuma URL
> `localhost` fica fixada no código de produção.

### Comandos úteis do Angular

```bash
npm run build            # build de produção (usado dentro do Docker)
npm test                 # testes unitários (Vitest)
ng generate component x  # scaffolding
```

---

## Estrutura do projeto

```
TODOapp_unisanta/
├── docker-compose.yml          # Orquestração: frontend, backend e mongodb
├── .env.example                # Exemplo de variáveis de ambiente
├── .gitignore                  # Ignora .env, node_modules, dist etc.
├── README.md
├── backend/                    # API Node.js + Express
│   ├── Dockerfile              # Multi-stage (deps -> runtime não-root)
│   ├── .dockerignore
│   ├── index.js                # Servidor + /api/health + conexão Mongoose
│   ├── package.json
│   └── api/
│       ├── routes/routes.js    # /api/post, /getAll, /update, /delete
│       └── models/tarefa.js    # Modelo Mongoose
└── frontend/                   # Aplicação Angular
    ├── Dockerfile              # Multi-stage (build Angular -> Nginx)
    ├── .dockerignore
    ├── nginx/default.conf.template  # SPA fallback + proxy /api + /healthz
    ├── angular.json
    └── src/
        ├── app/                # Componentes (App, TarefaItem)
        └── environments/       # environment.ts (prod) / environment.development.ts
```

---

## Segurança e boas práticas aplicadas

- Imagens oficiais: `node:24-alpine`, `nginxinc/nginx-unprivileged:alpine`, `mongo:8`.
- Containers de aplicação executam **como usuário não-root** (nginx uid 101, usuário `node`).
- `.env` **não** é copiado para as imagens (`.dockerignore`) e está no `.gitignore`.
- Nenhuma credencial/token versionada ou embutida nas imagens.
- MongoDB **sem porta exposta** ao host (somente rede interna).
- Imagens enxutas: multi-stage build, apenas dependências de produção no Backend,
  arquivos estáticos no Frontend (sem `node_modules` na imagem final).
- `healthcheck` em todos os serviços + `restart: unless-stopped`.
- Nenhuma regra de negócio existente foi alterada.

---

## Comandos de resumo

```bash
docker compose up -d --build   # Build e subir tudo
docker compose ps              # Status dos containers
docker compose logs -f         # Logs em tempo real
docker compose down            # Parar e remover containers
docker compose push            # Publicar imagens no Docker Hub
```
