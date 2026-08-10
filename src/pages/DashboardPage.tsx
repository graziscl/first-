import { useMemo } from "react";
import { useAppStore } from "../store";
import type { StatusPedido } from "../types";
import { formatarMoeda } from "../utils/pricing";

const statusInfo: { id: StatusPedido; titulo: string; cor: string }[] = [
  { id: "encomendado", titulo: "Encomendado", cor: "bg-lilac-100 text-lilac-700" },
  { id: "producao", titulo: "Em Produção", cor: "bg-peach-100 text-peach-600" },
  { id: "pronto", titulo: "Pronto", cor: "bg-mint-100 text-mint-600" },
  { id: "entregue", titulo: "Entregue", cor: "bg-stone-100 text-stone-600" },
];

export default function DashboardPage() {
  const pedidos = useAppStore((s) => s.pedidos);

  const contagemPorStatus = useMemo(() => {
    const mapa: Record<StatusPedido, number> = { encomendado: 0, producao: 0, pronto: 0, entregue: 0 };
    for (const pedido of pedidos) mapa[pedido.status]++;
    return mapa;
  }, [pedidos]);

  const faturamentoDoMes = useMemo(() => {
    const agora = new Date();
    return pedidos
      .filter((p) => {
        if (p.status !== "entregue") return false;
        const [ano, mes] = p.prazoEntrega.split("-").map(Number);
        return ano === agora.getFullYear() && mes === agora.getMonth() + 1;
      })
      .reduce((soma, p) => soma + p.valorTotal, 0);
  }, [pedidos]);

  const modeloMaisVendido = useMemo(() => {
    const contagem = new Map<string, number>();
    for (const pedido of pedidos) {
      for (const item of pedido.itens) {
        contagem.set(item.modeloNome, (contagem.get(item.modeloNome) ?? 0) + item.quantidade);
      }
    }
    let melhor: { nome: string; quantidade: number } | null = null;
    for (const [nome, quantidade] of contagem) {
      if (!melhor || quantidade > melhor.quantidade) melhor = { nome, quantidade };
    }
    return melhor;
  }, [pedidos]);

  const pedidosAtivos = contagemPorStatus.encomendado + contagemPorStatus.producao + contagemPorStatus.pronto;

  return (
    <div className="mx-auto max-w-lg px-4 py-4">
      <h1 className="mb-1 text-xl font-extrabold text-ink-800">Painel</h1>
      <p className="mb-4 text-sm text-ink-400">Um resumo rápido do seu ateliê.</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 rounded-2xl border border-sand-200 bg-white p-5 shadow-sm shadow-ink-800/[0.03]">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Faturamento do mês</p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums tracking-tight text-mint-600">
            {formatarMoeda(faturamentoDoMes)}
          </p>
          <p className="mt-1 text-xs text-ink-400">Soma dos pedidos entregues com prazo neste mês</p>
        </div>

        <div className="col-span-2 rounded-2xl border border-sand-200 bg-white p-5 shadow-sm shadow-ink-800/[0.03]">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Pedidos ativos</p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums tracking-tight text-rose-500">{pedidosAtivos}</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {statusInfo
              .filter((s) => s.id !== "entregue")
              .map((s) => (
                <div key={s.id} className={`rounded-xl px-2 py-2 text-center ${s.cor}`}>
                  <p className="text-lg font-bold tabular-nums">{contagemPorStatus[s.id]}</p>
                  <p className="text-[11px] font-semibold">{s.titulo}</p>
                </div>
              ))}
          </div>
        </div>

        <div className="col-span-2 rounded-2xl border border-sand-200 bg-white p-5 shadow-sm shadow-ink-800/[0.03]">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Modelo mais vendido</p>
          {modeloMaisVendido ? (
            <>
              <p className="mt-1 text-2xl font-extrabold tracking-tight text-lilac-600">{modeloMaisVendido.nome}</p>
              <p className="mt-1 text-xs text-ink-400">
                {modeloMaisVendido.quantidade} unidade{modeloMaisVendido.quantidade === 1 ? "" : "s"} pedida
                {modeloMaisVendido.quantidade === 1 ? "" : "s"}
              </p>
            </>
          ) : (
            <p className="mt-1 text-sm text-ink-400">Nenhum pedido registrado ainda.</p>
          )}
        </div>

        <div className="col-span-2 rounded-2xl border border-stone-100 bg-stone-50 p-3 text-center text-xs font-semibold text-stone-600">
          Pedidos entregues no total: {contagemPorStatus.entregue}
        </div>
      </div>
    </div>
  );
}
