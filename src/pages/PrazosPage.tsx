import { useMemo, useState } from "react";
import { useAppStore } from "../store";
import type { Pedido } from "../types";
import { formatarMoeda } from "../utils/pricing";
import { formatarData, urgenciaDoPrazo, diasAteOPrazo } from "../utils/dates";
import PedidoModal from "../components/PedidoModal";

const statusLabel: Record<string, string> = {
  encomendado: "Encomendado",
  producao: "Em Produção",
  pronto: "Pronto",
  entregue: "Entregue",
};

function textoPrazo(pedido: Pedido): { texto: string; classe: string } {
  const dias = diasAteOPrazo(pedido.prazoEntrega);
  const urgencia = urgenciaDoPrazo(pedido.prazoEntrega);

  if (urgencia === "atrasado") {
    const diasAtraso = Math.abs(dias);
    return {
      texto: `⚠️ Atrasado há ${diasAtraso} dia${diasAtraso === 1 ? "" : "s"}`,
      classe: "text-red-600",
    };
  }
  if (dias === 0) return { texto: "⏰ Entrega é hoje!", classe: "text-amber-600" };
  if (urgencia === "proximo") return { texto: `⏰ Faltam ${dias} dias`, classe: "text-amber-600" };
  return { texto: `Faltam ${dias} dias`, classe: "text-ink-400" };
}

export default function PrazosPage() {
  const pedidos = useAppStore((s) => s.pedidos);
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null);

  const pedidosOrdenados = useMemo(() => {
    return pedidos
      .filter((p) => p.status !== "entregue")
      .slice()
      .sort((a, b) => a.prazoEntrega.localeCompare(b.prazoEntrega));
  }, [pedidos]);

  return (
    <div className="mx-auto max-w-lg px-4 py-4">
      <h1 className="mb-1 text-xl font-bold text-ink-800">Prazos de entrega</h1>
      <p className="mb-4 text-sm text-ink-400">Pedidos em aberto, do mais urgente para o mais distante.</p>

      {pedidosOrdenados.length === 0 && (
        <div className="rounded-3xl bg-lilac-50 p-6 text-center text-ink-600">
          Nenhum pedido em aberto no momento. 🎉
        </div>
      )}

      <div className="space-y-2">
        {pedidosOrdenados.map((pedido) => {
          const { texto, classe } = textoPrazo(pedido);
          const urgencia = urgenciaDoPrazo(pedido.prazoEntrega);
          const borda =
            urgencia === "atrasado" ? "border-red-300 bg-red-50" : urgencia === "proximo" ? "border-amber-300 bg-amber-50" : "border-lilac-100 bg-white";
          return (
            <button
              key={pedido.id}
              onClick={() => setPedidoSelecionado(pedido)}
              className={`w-full rounded-2xl border p-3 text-left shadow-sm transition ${borda}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-ink-800">{pedido.clienteNome}</p>
                  <p className="text-xs text-ink-500">{pedido.itens.map((i) => `${i.quantidade}x ${i.modeloNome}`).join(", ")}</p>
                </div>
                <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[11px] font-medium text-ink-500">
                  {statusLabel[pedido.status]}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className={`text-xs font-semibold ${classe}`}>{texto}</span>
                <span className="text-xs text-ink-400">Entrega: {formatarData(pedido.prazoEntrega)}</span>
              </div>
              <p className="mt-1 text-sm font-bold text-ink-700">{formatarMoeda(pedido.valorTotal)}</p>
            </button>
          );
        })}
      </div>

      <PedidoModal aberto={!!pedidoSelecionado} onFechar={() => setPedidoSelecionado(null)} pedido={pedidoSelecionado} />
    </div>
  );
}
