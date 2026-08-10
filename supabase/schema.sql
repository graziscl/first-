-- PontoCerto — estrutura do banco de dados
-- Rode este script inteiro no SQL Editor do seu projeto Supabase
-- (Project > SQL Editor > New query > colar e rodar).

create table if not exists public.modelos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nome text not null,
  custo_material numeric not null default 0,
  tempo_producao_horas numeric not null default 0,
  margem_lucro numeric not null default 0,
  preco_sugerido numeric not null default 0,
  criado_em timestamptz not null default now()
);

create table if not exists public.pedidos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  cliente_nome text not null,
  cliente_contato text not null default '',
  itens jsonb not null default '[]',
  data_pedido date not null,
  prazo_entrega date not null,
  valor_total numeric not null default 0,
  observacoes text not null default '',
  status text not null default 'encomendado' check (status in ('encomendado', 'producao', 'pronto', 'entregue')),
  criado_em timestamptz not null default now()
);

create table if not exists public.configuracoes (
  user_id uuid primary key references auth.users (id) on delete cascade,
  valor_hora numeric not null default 15
);

alter table public.modelos enable row level security;
alter table public.pedidos enable row level security;
alter table public.configuracoes enable row level security;

-- Cada usuária só enxerga e mexe nos próprios dados.
create policy "modelos: só a dona" on public.modelos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "pedidos: só a dona" on public.pedidos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "configuracoes: só a dona" on public.configuracoes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists modelos_user_id_idx on public.modelos (user_id);
create index if not exists pedidos_user_id_idx on public.pedidos (user_id);

-- Cria a linha de configurações automaticamente quando alguém se cadastra.
create or replace function public.handle_novo_usuario()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.configuracoes (user_id, valor_hora) values (new.id, 15);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_novo_usuario();
