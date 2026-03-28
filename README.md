# 🐾 Abrigo Mãozinhas — Website de Adoção

Site para o Abrigo Mãozinhas (Alhos Vedros, Moita) — construído com React + Vite + Supabase.

---

## Stack

- **Frontend**: React 18 + Vite + React Router v6
- **Base de dados + Auth + Storage**: Supabase (gratuito)
- **Hosting**: Cloudflare Pages (gratuito)
- **Fonts**: Playfair Display + DM Sans (@fontsource)

---

## Setup inicial (só uma vez)

### 1. Clonar e instalar

```bash
git clone https://github.com/SEU_USER/maozinhas.git
cd maozinhas
npm install
```

### 2. Criar projeto no Supabase

1. Vai a https://supabase.com e cria uma conta gratuita
2. Cria um novo projeto (ex: `maozinhas`)
3. Guarda a **URL** e a **anon key** (Settings → API)

### 3. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edita o ficheiro `.env` com os teus valores:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

### 4. Criar a base de dados

No painel do Supabase → **SQL Editor** → colar e executar o ficheiro:

```
supabase/schema.sql
```

Isto cria todas as tabelas, políticas de segurança, bucket de fotos, e os 104 animais iniciais.

### 5. Criar os 3 utilizadores (voluntárias)

No painel do Supabase → **Authentication** → **Users** → **Invite user**:

Cria as 3 contas com os emails das voluntárias. Cada uma receberá um email com link para definir password.

Depois, no **SQL Editor**, promove os roles:

```sql
-- Substituir pelos emails reais
UPDATE profiles SET role = 'admin'     WHERE email = 'catia@email.com';
UPDATE profiles SET role = 'volunteer' WHERE email = 'voluntaria2@email.com';
UPDATE profiles SET role = 'volunteer' WHERE email = 'voluntaria3@email.com';
```

**Importante**: desligar o signup público em Supabase → Authentication → Settings → desativar "Enable Signups".

### 6. Correr em desenvolvimento

```bash
npm run dev
```

Abre http://localhost:5173

---

## Deploy no Cloudflare Pages

1. Faz push para o GitHub
2. Vai a https://pages.cloudflare.com → **Create a project** → ligar ao repositório
3. Configurações de build:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Em **Environment variables**, adicionar:
   - `VITE_SUPABASE_URL` = URL do Supabase
   - `VITE_SUPABASE_ANON_KEY` = anon key do Supabase
5. Clicar **Save and Deploy** ✅

O ficheiro `public/_redirects` já garante que o React Router funciona corretamente.

---

## Estrutura do projeto

```
src/
  lib/
    supabase.js          ← cliente Supabase
  hooks/
    useAnimals.js        ← hooks para ler/gerir animais
  components/
    Navbar.jsx / .css
    Footer.jsx / .css
    AnimalCard.jsx / .css
    ProtectedRoute.jsx
  pages/
    Home.jsx / .css      ← página principal com filtros
    AnimalDetail.jsx / .css  ← ficha do animal + formulário de adoção
    AdminLogin.jsx / .css    ← login das voluntárias
    AdminPanel.jsx / .css    ← painel de gestão (CRUD + pedidos)
  App.jsx                ← layout + contexto de autenticação
  main.jsx               ← rotas
  index.css              ← variáveis globais CSS
supabase/
  schema.sql             ← base de dados completa (tabelas + seed)
public/
  _redirects             ← routing SPA para Cloudflare Pages
```

---

## Funcionalidades

### Site público
- Grid de animais com filtros por tipo, tamanho, e pesquisa por nome
- Página de detalhe de cada animal com galeria de fotos
- Formulário de pedido de adoção (gravado na DB)
- Skeleton loading, estado vazio, responsive

### Painel admin (`/admin`)
- Login com email + password (invite-only, sem signup público)
- Adicionar / editar animais com upload de fotos
- Mudar estado (disponível → reservado → adotado)
- Ver e gerir todos os pedidos de adoção
- Admin pode apagar; volunteer só pode adicionar/editar os seus

---

## Atualizar descrições dos animais

Os 104 animais foram importados do site Wix com nome, foto e ano.
As descrições precisam de ser preenchidas manualmente no painel admin.

Alternativamente, podes preencher diretamente na tabela `animals` no Supabase → Table Editor.

---

## Perguntas?

Fala com a Mónica 🐾
