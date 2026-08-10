# PontoCerto 🧶

MVP web de gestão de pedidos para artesãs de crochê, com calculadora de
precificação integrada. Pensado para quem hoje organiza tudo pelo
WhatsApp ou no papel.

## Funcionalidades

- **Modelos**: cadastro de peças com cálculo automático do preço sugerido
  `(custo material + tempo × valor hora) × (1 + margem)`.
- **Pedidos**: Kanban com 4 colunas (Encomendado → Em Produção → Pronto →
  Entregue), cards arrastáveis, alerta visual de prazo próximo/atrasado.
- **Prazos**: lista de pedidos em aberto ordenada por data de entrega.
- **Clientes**: histórico montado a partir dos pedidos, com destaque para
  clientes recorrentes.
- **Painel**: pedidos ativos por status, faturamento do mês e modelo mais
  vendido.
- **Configurações**: valor da hora de trabalho usado na calculadora.

Todos os dados ficam salvos no `localStorage` do navegador — não há
backend nesta versão.

## Stack

React + TypeScript + Vite, Tailwind CSS v4, Zustand (com persistência em
localStorage) e `@hello-pangea/dnd` para o drag and drop do Kanban.

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
