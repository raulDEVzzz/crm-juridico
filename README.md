# CRM Jurídico & Landing Page Institucional

Plataforma completa para advocacia — Landing Page pública do Dr. Erick do Carmo e sistema web de gestão interna (CRM).

## Stack

- **Next.js 15** (App Router)
- **TypeScript** (strict)
- **Tailwind CSS** + **Shadcn UI**
- **PostgreSQL** + **Prisma ORM**
- **NextAuth.js v5** (Auth.js) — autenticação com rate limiting
- **Cloudflare R2** (S3-compatible) para documentos
- **Lucide React**
- **Vercel Cron** — rotinas automáticas de limpeza

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- PostgreSQL rodando localmente ou em nuvem
- Conta Cloudflare R2 (produção na Vercel)

## Instalação

```bash
# 1. Instalar dependências (inclui AWS SDK e react-dropzone)
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Edite DATABASE_URL, AUTH_SECRET e variáveis de storage no .env
# Gere AUTH_SECRET com: npx auth secret

# 3. Rodar migrações do banco
npx prisma migrate dev

# 4. Criar o usuário administrador (produção ou primeiro acesso)
# Defina ADMIN_USERNAME, ADMIN_PASSWORD e ADMIN_EMAIL no .env
npm run db:create-admin

# 5. (Opcional) Popular dados de exemplo (somente desenvolvimento)
# Defina uma senha exclusiva, com pelo menos 12 caracteres, em SEED_DEMO_PASSWORD
npm run db:seed

# 6. Iniciar o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Funcionalidades

### Landing Page Institucional (Pública)
- **Apresentação Profissional** — Hero section com chamada de autoridade e foto executiva
- **Métricas de Destaque** — Faixa de autoridade (+300 clientes, atuação nacional, especializações)
- **Áreas de Atuação** — Especialização em Direito Imobiliário, Marítimo, Portuário e Aduaneiro, Cível, etc.
- **O Escritório** — Perfil institucional com fotos oficiais e credenciais
- **FAQ (Perguntas Frequentes)** — Esclarecimentos sobre atendimento online e procedimentos
- **Conversão Direta** — Botão flutuante do WhatsApp, links de e-mail e redes sociais
- **Animações & UX** — Rolagem suave (`scroll-smooth`), revelação ao rolar (`FadeIn`) e micro-interações

### Gestão de Clientes & Aniversariantes
- **CRUD de clientes** — Nome, CPF/CNPJ (validação com dígito verificador), telefone, WhatsApp e data de nascimento
- **Dashboard de aniversariantes** — Lista os aniversariantes dos próximos 7 dias
- **Envio de Parabéns pelo WhatsApp** — Botão habilitado exclusivamente no dia exato do aniversário

### Gestão de Processos & Prazos
- **CRUD de processos** — Número CNJ (busca exata ou formatada), vara, área jurídica, status e valor da causa
- **Linha do tempo** — Histórico cronológico de andamentos por processo
- **Agenda** — Audiências, prazos e reuniões com suporte ao fuso horário de Brasília (-03:00)
- **Próximos compromissos** — Card no dashboard com os eventos mais próximos

### Upload & Gestão de Documentos
- **Storage híbrido** — Filesystem local (dev) ou Cloudflare R2 (produção)
- **Upload com drag & drop** — PDF, DOCX, JPG, PNG (máx. 10 MB)
- **Download seguro** — Presigned URLs (R2) ou stream autenticado (local)
- **Exclusão segura** — Fila assíncrona de limpeza de storage sem vazamento de memória

### Autenticação & Segurança
- **Login com usuário e senha** — NextAuth.js v5 + Credentials provider com proteção contra timing attack
- **Rate limiting** — Bloqueio progressivo após tentativas excessivas de login (`LoginAttempt`)
- **Middleware Edge-ready** — Rotas do CRM protegidas com redirecionamento para `/login`
- **Cabeçalhos de Segurança** — HSTS, X-Frame-Options, CSP, COOP e MIME protection
- **Prevenção de Open Redirect** — Validação estrita de parâmetros de retorno

### SEO
- **robots.txt** — Gerado dinamicamente, permite crawling da landing page e bloqueia `/login` e `/api/`
- **sitemap.xml** — Gerado dinamicamente com a URL da landing page

### Rotinas Automáticas (Cron)
- **Limpeza de storage** — Drena fila de exclusão de arquivos pendentes (até 50 por execução)
- **Purga de jobs concluídos** — Remove registros de exclusão já processados com mais de 24h
- **Purga de tentativas de login** — Remove registros expirados de rate limiting com mais de 24h
- Execução automática diária às 03:00 UTC via **Vercel Cron**

## Rotas

| Rota | Acesso | Descrição |
|------|--------|-----------|
| `/` | Público | Landing Page institucional do Dr. Erick do Carmo |
| `/login` | Público | Tela de autenticação do CRM |
| `/dashboard` | Restrito | Painel do CRM (aniversariantes, compromissos e métricas) |
| `/clients` | Restrito | Gestão de clientes (PF/PJ) com busca e validações |
| `/clients/new` | Restrito | Cadastro de novo cliente |
| `/clients/[id]/edit` | Restrito | Edição de dados do cliente |
| `/processes` | Restrito | Listagem e busca de processos por número CNJ |
| `/processes/new` | Restrito | Cadastro de processo e vinculação com cliente |
| `/processes/[id]` | Restrito | Detalhes com abas (Detalhes, Andamentos, Documentos) |
| `/processes/[id]/edit` | Restrito | Edição de processo |
| `/agenda` | Restrito | Compromissos e prazos ordenados por data |
| `/api/auth/[...nextauth]` | Sistema | Endpoints de autenticação do NextAuth.js |
| `/api/documents/[id]/download` | Restrito | Download autenticado de documentos |
| `/api/cron/cleanup` | Sistema | Rotina de limpeza (protegida por `CRON_SECRET`) |
| `/robots.txt` | Público | Regras de crawling para motores de busca |
| `/sitemap.xml` | Público | Mapa do site para indexação |

## Variáveis de Ambiente

```env
# ─── Banco de Dados ──────────────────────────────────────────────────
DATABASE_URL="postgresql://usuario:senha@localhost:5432/crm_juridico?schema=public"

# ─── Autenticação (NextAuth.js) ──────────────────────────────────────
# Gere com: npx auth secret   ou   openssl rand -base64 32
AUTH_SECRET=sua_chave_secreta_aqui

# URL base da aplicação (obrigatório em produção na Vercel)
AUTH_URL=http://localhost:3000

# ─── URL Pública do Site ─────────────────────────────────────────────
# Usada pelo sitemap.xml e robots.txt. Padrão: https://www.erickdocarmo.com.br
NEXT_PUBLIC_APP_URL=https://www.erickdocarmo.com.br

# ─── Seed (somente desenvolvimento) ─────────────────────────────────
# Senha exclusiva de, no mínimo, 12 caracteres antes de rodar `npm run db:seed`
SEED_DEMO_PASSWORD=

# ─── Administrador (provisionamento pontual) ────────────────────────
# Defina e execute `npm run db:create-admin`. Não envie para a Vercel.
ADMIN_USERNAME=
ADMIN_PASSWORD=
ADMIN_EMAIL=

# ─── Storage ─────────────────────────────────────────────────────────
# Driver: "local" (dev) ou "s3" (produção / Cloudflare R2)
STORAGE_DRIVER=local

# Pasta local para uploads em desenvolvimento
STORAGE_LOCAL_PATH=./storage/uploads

# Cloudflare R2 (S3-compatible) — necessário quando STORAGE_DRIVER=s3
S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=sua_access_key
S3_SECRET_ACCESS_KEY=sua_secret_key
S3_BUCKET_NAME=crm-juridico-docs
S3_REGION=auto

# Tempo de expiração das URLs assinadas (segundos) — padrão: 900 (15 min)
S3_SIGNED_URL_EXPIRES=900

# ─── Cron / Rotinas de Limpeza ───────────────────────────────────────
# Chave de segurança para invocar GET /api/cron/cleanup via Vercel Cron ou curl
CRON_SECRET=
```

### Como obter credenciais do Cloudflare R2

1. Acesse o [dashboard Cloudflare](https://dash.cloudflare.com/) → **R2**
2. Crie um bucket (ex: `crm-juridico-docs`)
3. Vá em **Manage R2 API Tokens** → **Create API Token**
4. Permissão: **Object Read & Write** no bucket criado
5. Copie **Access Key ID**, **Secret Access Key** e o **Endpoint** (formato: `https://<account_id>.r2.cloudflarestorage.com`)
6. Configure as variáveis na Vercel em **Settings → Environment Variables**

> Na Vercel, defina `STORAGE_DRIVER=s3`. Sem filesystem persistente, o driver local não funciona em produção.

## Arquitetura de Storage

```
src/lib/storage/
├── index.ts      # Factory (local | s3)
├── types.ts      # Interface StorageAdapter
├── local.ts      # Filesystem (dev)
├── s3.ts         # Cloudflare R2 via @aws-sdk/client-s3
└── cleanup.ts    # Fila de exclusão assíncrona + purge de jobs
```

O campo `Document.fileUrl` no banco armazena a **storage key** (ex: `uploads/{userId}/{processId}/{timestamp}-arquivo.pdf`), nunca uma URL pública.

## Criação de Usuários

### Administrador (produção)

Defina `ADMIN_USERNAME`, `ADMIN_PASSWORD` (mín. 10 caracteres) e `ADMIN_EMAIL` no `.env` e execute:

```bash
npm run db:create-admin
```

O script faz `upsert` — se o username já existir, atualiza a senha e o e-mail.

### Usuário demo (desenvolvimento)

O seed é bloqueado em produção e exige uma senha exclusiva de, no mínimo, 12 caracteres em `SEED_DEMO_PASSWORD`:

```bash
npm run db:seed
```

O usuário criado é `advogado`; o e-mail cadastrado é `advogado@crm.local`. A senha é a que foi definida em `SEED_DEMO_PASSWORD` e nunca é exibida pela aplicação.

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção (`prisma generate` + `next build`) |
| `npm run start` | Iniciar servidor de produção |
| `npm run lint` | Verificar linting com ESLint |
| `npm run db:generate` | Gerar Prisma Client |
| `npm run db:migrate` | Rodar migrações |
| `npm run db:push` | Sincronizar schema sem criar migração |
| `npm run db:studio` | Abrir Prisma Studio |
| `npm run db:seed` | Popular dados de exemplo (dev) |
| `npm run db:create-admin` | Criar/atualizar usuário administrador |
