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

## Cobrança (Cakto) e liberação de acesso

O acesso ao app é liberado por assinatura: quem não pagou vê uma tela
pedindo pra assinar em vez do app. Isso funciona assim:

1. **Crie a tabela de assinaturas**: no SQL Editor do Supabase, rode o
   conteúdo de [`supabase/assinaturas.sql`](supabase/assinaturas.sql).
2. **Publique a Edge Function**: no painel do Supabase, vá em **Edge
   Functions → Deploy a new function → Via Editor**, nomeie como
   `cakto-webhook` e cole o conteúdo de
   [`supabase/functions/cakto-webhook/index.ts`](supabase/functions/cakto-webhook/index.ts).
   Não precisa de terminal nem CLI.
3. **Defina o segredo**: em **Edge Functions → Secrets**, adicione
   `CAKTO_WEBHOOK_SECRET` com uma senha aleatória que só você conhece.
4. **Configure o webhook na Cakto**: no painel da Cakto, vá em
   **Integrações → Webhooks → Adicionar**, cole a URL da função (algo
   como `https://SEU-PROJETO.supabase.co/functions/v1/cakto-webhook`),
   selecione o produto e marque os eventos: Compra aprovada, Assinatura
   criada, Assinatura renovada, Assinatura cancelada, Reembolso,
   Chargeback e Compra recusada. No campo de segredo/secret do webhook,
   use o mesmo valor do passo 3.
5. Atualize `LINK_CHECKOUT` em
   [`src/pages/PaywallPage.tsx`](src/pages/PaywallPage.tsx) com o link
   real de checkout do produto na Cakto.

Assim que alguém paga, a Cakto avisa a função, que libera o e-mail da
compradora na tabela `assinaturas`. Quando ela cria a conta (ou faz
login) com o mesmo e-mail, o acesso já está liberado. Cancelamento,
reembolso e chargeback bloqueiam o acesso automaticamente pelo mesmo
caminho.
