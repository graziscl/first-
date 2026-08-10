# PontoCerto 🧶

Web app de gestão de pedidos para artesãs de crochê, com calculadora de
precificação integrada. Pensado para quem hoje organiza tudo pelo
WhatsApp ou no papel.

## Funcionalidades

- **Login/cadastro**: cada artesã tem sua própria conta e só vê os
  próprios dados.
- **Modelos**: cadastro de peças com cálculo automático do preço sugerido
  `(custo material + tempo × valor hora) × (1 + margem)`.
- **Pedidos**: Kanban com 4 colunas (Encomendado → Em Produção → Pronto →
  Entregue), cards arrastáveis, alerta visual de prazo próximo/atrasado.
- **Prazos**: lista de pedidos em aberto ordenada por data de entrega.
- **Clientes**: histórico montado a partir dos pedidos, com destaque para
  clientes recorrentes.
- **Painel**: pedidos ativos por status, faturamento do mês e modelo mais
  vendido.
- **Configurações**: valor da hora de trabalho, troca de senha e logout.

Os dados ficam salvos no Supabase (Postgres), um por conta — não é mais
só local no navegador.

## Stack

React + TypeScript + Vite, Tailwind CSS v4, Zustand, `@hello-pangea/dnd`
para o drag and drop do Kanban, e Supabase (banco de dados + autenticação)
como backend.

## Configurando o backend (Supabase)

1. Crie uma conta gratuita em [supabase.com](https://supabase.com) e um
   novo projeto.
2. No painel do projeto, vá em **SQL Editor → New query**, cole o
   conteúdo de [`supabase/schema.sql`](supabase/schema.sql) e rode. Isso
   cria as tabelas (`modelos`, `pedidos`, `configuracoes`) já com as
   regras de segurança que garantem que cada usuária só acessa os
   próprios dados.
3. Vá em **Project Settings → API** e copie a **Project URL** e a chave
   **anon public**.
4. Na raiz do projeto, copie `.env.example` para `.env.local` e preencha:
   ```
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
   ```
5. (Opcional, útil para testar rápido) Em **Authentication → Providers →
   Email**, desligue "Confirm email" para não depender de um servidor de
   e-mail configurado enquanto testa localmente. Em produção, é
   recomendável manter ligado.

## Rodando localmente

```bash
npm install
npm run dev
```

## Build de produção

```bash
npm run build
npm run preview
```

## Publicando (deploy)

Qualquer host de site estático funciona (Vercel, Netlify, Cloudflare
Pages...). Nas configurações do projeto no host, adicione as mesmas duas
variáveis de ambiente do `.env.local` (`VITE_SUPABASE_URL` e
`VITE_SUPABASE_ANON_KEY`) e configure o comando de build como
`npm run build` com pasta de saída `dist`.

Depois do deploy, em **Authentication → URL Configuration** no Supabase,
atualize a **Site URL** para o endereço público do app — isso garante que
o link de "esqueci minha senha" volte para o lugar certo.
