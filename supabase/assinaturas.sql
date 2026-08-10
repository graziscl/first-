-- PontoCerto — controle de assinatura paga (Cakto)
-- Rode este script no SQL Editor do Supabase (é uma adição ao schema.sql,
-- não precisa rodar o schema.sql de novo).

create table if not exists public.assinaturas (
  email text primary key,
  status text not null default 'inativo' check (status in ('ativo', 'inativo')),
  cakto_customer_id text,
  ultimo_evento text,
  atualizado_em timestamptz not null default now()
);

alter table public.assinaturas enable row level security;

-- Cada usuária só consegue LER a própria linha (pelo e-mail da conta).
-- Só a Edge Function (com a chave service_role, que ignora RLS) pode escrever aqui.
create policy "assinaturas: só a dona pode ler a própria" on public.assinaturas
  for select using (lower(email) = lower(auth.jwt() ->> 'email'));
