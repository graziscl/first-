// Edge Function que recebe os avisos (webhooks) da Cakto quando alguém
// compra, renova ou cancela a assinatura do PontoCerto, e atualiza a
// tabela `assinaturas` de acordo — é isso que libera ou bloqueia o
// acesso ao app.
//
// Como publicar: Supabase Dashboard → Edge Functions → Deploy a new
// function → Via Editor → cola este arquivo inteiro, nome da função:
// "cakto-webhook".
//
// Depois, em Edge Functions → Secrets, adicione CAKTO_WEBHOOK_SECRET
// com o mesmo valor que você configurar como "secret" no webhook lá na
// Cakto (Integrações → Webhooks).

import { createClient } from "npm:@supabase/supabase-js@2";

const EVENTOS_QUE_ATIVAM = ["purchase_approved", "subscription_created", "subscription_renewed"];
const EVENTOS_QUE_DESATIVAM = ["subscription_canceled", "refund", "chargeback", "purchase_refused"];

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let corpo: {
    secret?: string;
    event?: string;
    data?: { id?: string; customer?: { email?: string } };
  };

  try {
    corpo = await req.json();
  } catch {
    return new Response("JSON inválido", { status: 400 });
  }

  const segredoEsperado = Deno.env.get("CAKTO_WEBHOOK_SECRET");
  if (!segredoEsperado || corpo.secret !== segredoEsperado) {
    return new Response("Não autorizado", { status: 401 });
  }

  const email = corpo.data?.customer?.email?.trim().toLowerCase();
  const evento = corpo.event ?? "";

  if (!email) {
    return new Response("Sem e-mail no payload", { status: 400 });
  }

  let novoStatus: "ativo" | "inativo" | null = null;
  if (EVENTOS_QUE_ATIVAM.includes(evento)) novoStatus = "ativo";
  else if (EVENTOS_QUE_DESATIVAM.includes(evento)) novoStatus = "inativo";

  // Evento que não muda status (ex: pix gerado, checkout abandonado) — só confirma o recebimento.
  if (!novoStatus) {
    return new Response(JSON.stringify({ ok: true, ignorado: evento }), { status: 200 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { error } = await supabase.from("assinaturas").upsert(
    {
      email,
      status: novoStatus,
      cakto_customer_id: corpo.data?.id ?? null,
      ultimo_evento: evento,
      atualizado_em: new Date().toISOString(),
    },
    { onConflict: "email" },
  );

  if (error) {
    console.error("Erro ao salvar assinatura:", error.message);
    return new Response("Erro interno", { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true, email, status: novoStatus }), { status: 200 });
});
