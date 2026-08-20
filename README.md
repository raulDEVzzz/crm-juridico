# CRM Jurídico

Sistema web de gestão para advogados — Fases 1 a 4.

## Stack

- **Next.js 15** (App Router)
- **TypeScript** (strict)
- **Tailwind CSS** + **Shadcn UI**
- **PostgreSQL** + **Prisma ORM**
- **NextAuth.js v5** (Auth.js) — autenticação
- **Cloudflare R2** (S3-compatible) para documentos
- **Lucide React**

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

# 4. (Opcional) Popular dados de exemplo (somente desenvolvimento)
# Defina uma senha exclusiva, com pelo menos 12 caracteres, em SEED_DEMO_PASSWORD
npm run db:seed

# 5. Iniciar o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Funcionalidades

### Fase 1
- **CRUD de clientes** — Nome, CPF/CNPJ, telefone, WhatsApp, data de nascimento
- **Dashboard de aniversariantes** — Hoje e próximos 7 dias
- **Botão WhatsApp** — Link `wa.me` com mensagem de parabéns

### Fase 2
- **CRUD de processos** — Número CNJ, vara, área, status, valor
- **Linha do tempo** — Andamentos cronológicos por processo
- **Agenda** — Audiências, prazos e reuniões

### Fase 3 — Upload de documentos
- **Storage híbrido** — Filesystem local (dev) ou Cloudflare R2 (produção)
- **Upload com drag & drop** — PDF, DOCX, JPG, PNG (máx. 10 MB)
- **Download seguro** — Presigned URLs (R2) ou stream autenticado (local)

### Fase 4 — Autenticação
- **Login com e-mail e senha** — NextAuth.js v5 + Credentials provider
- **Middleware** — Rotas protegidas; redirecionamento para `/login`
- **Sessão JWT** — Nome do usuário na sidebar + botão Sair
- **Usuário demo** — criado somente em desenvolvimento; a senha é definida em `SEED_DEMO_PASSWORD` antes de rodar o seed
- **Validação** — Tamanho e MIME type via Zod antes do upload

## Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Dashboard de aniversariantes |
| `/clients` | Gestão de clientes |
| `/processes` | Listagem de processos com busca |
| `/processes/[id]` | Detalhes com abas (Detalhes, Andamentos, Documentos) |
| `/agenda` | Compromissos ordenados por data |
| `/login` | Tela de autenticação |
| `/api/auth/[...nextauth]` | Endpoints do NextAuth.js |
| `/api/documents/[id]/download` | Download autenticado (redirect presigned ou stream) |

## Fase 3 — Configuração do Storage

### Comandos de instalação

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner react-dropzone
```

### Variáveis de ambiente (`.env`)

```env
# Desenvolvimento local
STORAGE_DRIVER=local
STORAGE_LOCAL_PATH=./storage/uploads

# Produção (Vercel + Cloudflare R2)
STORAGE_DRIVER=s3
S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=<sua_access_key>
S3_SECRET_ACCESS_KEY=<sua_secret_key>
S3_BUCKET_NAME=crm-juridico-docs
S3_REGION=auto
S3_SIGNED_URL_EXPIRES=900
```

### Como obter credenciais do Cloudflare R2

1. Acesse o [dashboard Cloudflare](https://dash.cloudflare.com/) → **R2**
2. Crie um bucket (ex: `crm-juridico-docs`)
3. Vá em **Manage R2 API Tokens** → **Create API Token**
4. Permissão: **Object Read & Write** no bucket criado
5. Copie **Access Key ID**, **Secret Access Key** e o **Endpoint** (formato: `https://<account_id>.r2.cloudflarestorage.com`)
6. Configure as variáveis na Vercel em **Settings → Environment Variables**

> Na Vercel, defina `STORAGE_DRIVER=s3`. Sem filesystem persistente, o driver local não funciona em produção.

### Arquitetura de storage

```
src/lib/storage/
├── index.ts    # Factory (local | s3)
├── types.ts    # Interface StorageAdapter
├── local.ts    # Filesystem (dev)
└── s3.ts       # Cloudflare R2 via @aws-sdk/client-s3
```

O campo `Document.fileUrl` no banco armazena a **storage key** (ex: `uploads/{userId}/{processId}/{timestamp}-arquivo.pdf`), nunca uma URL pública.

## Fase 4 — Autenticação (NextAuth.js)

### Instalação

```bash
npm install next-auth@beta @auth/prisma-adapter bcryptjs
npm install -D @types/bcryptjs
```

### Variáveis de ambiente

```env
AUTH_SECRET=sua_chave_secreta_aqui
AUTH_URL=http://localhost:3000
```

Gere o `AUTH_SECRET` com:

```bash
npx auth secret
```

Ou:

```bash
openssl rand -base64 32
```

Na **Vercel**, configure `AUTH_SECRET` e `AUTH_URL` (ex: `https://seu-app.vercel.app`) em Environment Variables.

### Criar usuário demo

O seed é bloqueado em produção e exige uma senha exclusiva de, no mínimo, 12 caracteres em `SEED_DEMO_PASSWORD`:

```bash
npm run db:seed
```

O usuário criado é `advogado@crm.local`. A senha é a que foi definida em `SEED_DEMO_PASSWORD` e nunca é exibida pela aplicação.

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run db:migrate` | Rodar migrações |
| `npm run db:studio` | Abrir Prisma Studio |
| `npm run db:seed` | Popular dados de exemplo |
