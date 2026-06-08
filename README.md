# NewRoad

Plataforma web de **visualização e gestão operacional de tráfego rodoviário**, com dashboard, planejamento de obras, mural de avisos, simulações e carga de dados via ETL Java.

Desenvolvido no contexto acadêmico (São Paulo Tech School / Bandtec Digital School).

---

## Visão geral

| Camada | Tecnologia | Responsabilidade |
|--------|------------|------------------|
| Frontend | HTML, CSS, JavaScript | Interface operacional (dashboard, obras, mural, etc.) |
| API | Node.js + Express | CRUD, autenticação, preferências, notificações |
| Banco | MySQL 8 | Dados operacionais, usuários, obras, tráfego |
| ETL | Java 17 (`etl-v3`) | Importação de planilhas (S3/local) → MySQL |
| Infra | Docker Compose | MySQL, web e ETL containerizados |

---

## Estrutura do repositório

```
New-Road/
├── database/
│   └── init.sql              # Schema completo + seeds (Docker)
├── docker-compose.yml        # MySQL + web + ETL (profile)
├── web-data-viz-main/        # Aplicação web (Node + frontend)
│   ├── app.js                # Entry point da API
│   ├── public/               # Páginas e assets estáticos
│   └── src/
│       ├── routes/           # Rotas HTTP
│       ├── controllers/      # Regras de negócio
│       ├── models/           # Queries SQL
│       └── database/         # Config de conexão
└── etl-v3/                   # ETL Java (carga de tráfego)
    └── src/main/java/...     # Extract, transform, load + Slack
```

---

## Módulos funcionais

| Módulo | Descrição |
|--------|-----------|
| **Dashboard** | KPIs, gráficos de fluxo, mapa operacional |
| **Planejamento de Obras** | CRUD de obras por empresa |
| **Simulações** | Cenários de impacto operacional |
| **Mural de Avisos** | Avisos, curtidas, comentários e chat |
| **Usuários** | Gestão de usuários por empresa (Gestor) |
| **Configurações** | Perfil, região padrão, notificações ETL, modo escuro |
| **Notificações** | Sino alimentado pela tabela `notificacoes` (ETL) |
| **ETL** | Carga de dados + alertas Slack + gravação de notificações |

---

## Perfis de acesso

| Perfil | Páginas |
|--------|---------|
| **Gestor** | Dashboard, Obras, Simulações, Mural, Usuários, Configurações |
| **Analista** | Dashboard, Obras, Mural, Configurações |
| **Operador** | Dashboard, Mural, Configurações |

Controle implementado em `web-data-viz-main/public/js/auth-permissoes.js`.

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- [Docker](https://www.docker.com/) e Docker Compose (recomendado)
- [Java 17+](https://adoptium.net/) e Maven (apenas para rodar ETL fora do Docker)

---

## Configuração rápida (Docker)

### 1. Variáveis de ambiente na raiz

Crie um arquivo `.env` na raiz do projeto (usado pelo `docker-compose.yml`):

```env
MYSQL_ROOT_PASSWORD=sua_senha
MYSQL_DATABASE=newroad_db

S3_BUCKET=seu-bucket
S3_PREFIXO=pasta/entrada/
S3_REGIAO=us-east-1
ETL_FONTE=s3
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

### 2. Variáveis da aplicação web

Crie `web-data-viz-main/.env.dev`:

```env
AMBIENTE_PROCESSO=desenvolvimento
APP_PORT=3333
APP_HOST=0.0.0.0

DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=newroad_db
DB_USER=root
DB_PASSWORD=sua_senha
```

> **Nota:** `.env` e `.env.dev` estão no `.gitignore` — não vão para o repositório.

### 3. Subir os serviços

```bash
# MySQL + aplicação web
docker compose up -d mysql web

# ETL (sob demanda)
docker compose --profile etl up etl
```

Acesse: **http://localhost:3333**

---

## Configuração local (sem Docker)

```bash
# 1. Banco — execute database/init.sql no MySQL

# 2. API web
cd web-data-viz-main
npm install
npm start
```

Em `app.js`, confirme o ambiente:

```js
var ambiente_processo = 'desenvolvimento'; // usa .env.dev
// var ambiente_processo = 'producao';    // usa .env
```

---

## Usuários de teste (seed)

Senha padrão para todos: **`123456`**

| E-mail | Perfil | Empresa |
|--------|--------|---------|
| samara@ccr.com | Gestor | CCR AutoBAn |
| gustavo@ccr.com | Analista | CCR AutoBAn |
| giovanna@ccr.com | Analista | CCR AutoBAn |
| marcos@ccr.com | Operador | CCR AutoBAn |

---

## API — principais rotas

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/usuarios/autenticar` | Login |
| GET | `/usuarios?empresaId=` | Listar usuários |
| GET/PUT | `/preferencias/:idUsuario` | Preferências do usuário |
| GET | `/notificacoes?limit=&idUsuario=` | Notificações ETL (sino) |
| GET/POST/PUT/DELETE | `/obras?empresaId=` | CRUD de obras |
| GET | `/dashboard/*` | Dados do dashboard |
| GET/POST | `/mural/*` | Mural e chat |

Padrão interno: **routes → controllers → models → MySQL**.

---

## Notificações e Slack

```text
ETL Java (Main.java)
    └── ServicoSlack.enviarAlerta()
            ├── INSERT → tabela notificacoes  (sino do dashboard)
            └── POST   → Slack Webhook (opcional)
```

- O **sino** lê `GET /notificacoes` → `SELECT` em `notificacoes`.
- Em **Configurações**, o toggle **Notificações ETL** grava em `preferencia.notif_critica`. Se desativado, o sino não exibe alertas.
- O Slack é configurado via `SLACK_WEBHOOK_URL` no container ETL (`etl-v3/entrypoint.sh`).

---

## ETL (`etl-v3`)

Pipeline Java que:

1. Lê arquivos `.xlsx` de **S3** ou pasta **local**
2. Transforma e carrega em `registro_trafego` e tabelas relacionadas
3. Dispara alertas de início, sucesso ou falha (banco + Slack)

```bash
# Via Docker
docker compose --profile etl up etl

# Logs
docker logs etl-newroad
```

Configuração em `etl-v3/src/main/resources/database.properties` (gerado em runtime pelo `entrypoint.sh` no Docker).

---

## Modo escuro

- Toggle em **Configurações** → salvo em `preferencia.dark_mode`
- CSS em `web-data-viz-main/public/css/dark-theme.css`
- Script: `web-data-viz-main/public/js/theme.js`

---

## Scripts úteis

```bash
# Desenvolvimento com reload
cd web-data-viz-main && npm run dev

# Status dos containers
docker compose ps

# Recriar banco do zero (apaga volume MySQL)
docker compose down -v
docker compose up -d mysql web
```

---

## Documentação adicional

- `web-data-viz-main/README.md` — guia acadêmico original (CRUD, rotas, npm)
- `web-data-viz-main/DOCUMENTOS_DE_APOIO/` — exemplos e passo a passo de rotas
- `web-data-viz-main/src/database/script-tabelas.sql` — DDL das tabelas

---

## Licença

MIT — ver `web-data-viz-main/package.json`.
