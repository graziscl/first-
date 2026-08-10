import { useMemo, useState } from "react";
import { useAppStore } from "../store";
import type { Pedido } from "../types";
import { formatarMoeda } from "../utils/pricing";
import { formatarData } from "../utils/dates";
import Modal from "../components/Modal";

interface Cliente {
  chave: string;
  nome: string;
  contato: string;
  pedidos: Pedido[];
  totalGasto: number;
}

const statusLabel: Record<string, string> = {
  encomendado: "Encomendado",
  producao: "Em Produção",
  pronto: "Pronto",
  entregue: "Entregue",
};

export default function ClientesPage() {
  const pedidos = useAppStore((s) => s.pedidos);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);

  const clientes = useMemo(() => {
    const mapa = new Map<string, Cliente>();
    for (const pedido of pedidos) {
      const chave = `${pedido.clienteNome.trim().toLowerCase()}|${pedido.clienteContato.trim().toLowerCase()}`;
      const existente = mapa.get(chave);
      if (existente) {
        existente.pedidos.push(pedido);
        existente.totalGasto += pedido.valorTotal;
      } else {
        mapa.set(chave, {
          chave,
          nome: pedido.clienteNome,
          contato: pedido.clienteContato,
          pedidos: [pedido],
          totalGasto: pedido.valorTotal,
        });
      }
    }
    return Array.from(mapa.values()).sort((a, b) => b.totalGasto - a.totalGasto);
  }, [pedidos]);

  return (
    <div className="mx-auto max-w-lg px-4 py-4">
      <h1 className="mb-1 text-xl font-extrabold text-ink-800">Seus clientes</h1>
      <p className="mb-4 text-sm text-ink-400">Histórico de compras, montado a partir dos seus pedidos.</p>

      {clientes.length === 0 && (
        <div className="rounded-2xl border border-dashed border-sand-300 bg-sand-50 p-6 text-center text-ink-600">
          Assim que você criar pedidos, seus clientes vão aparecer aqui.
        </div>
      )}

      <div className="space-y-2">
        {clientes.map((cliente) => (
          <button
            key={cliente.chave}
            onClick={() => setClienteSelecionado(cliente)}
            className="w-full rounded-2xl border border-sand-200 bg-white p-3 text-left shadow-sm shadow-ink-800/[0.03] transition hover:border-rose-200 hover:shadow-md hover:shadow-ink-800/[0.06]"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-ink-800">{cliente.nome}</p>
                {cliente.contato && <p className="text-xs text-ink-400">{cliente.contato}</p>}
              </div>
              {cliente.pedidos.length > 1 && (
                <span className="shrink-0 rounded-full bg-mint-100 px-2 py-1 text-[11px] font-semibold text-mint-600">
                  Cliente recorrente
                </span>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-ink-400">
                {cliente.pedidos.length} pedido{cliente.pedidos.length === 1 ? "" : "s"}
              </span>
              <span className="text-sm font-bold text-ink-700">{formatarMoeda(cliente.totalGasto)}</span>
            </div>
          </button>
        ))}
      </div>

      <Modal
        titulo={clienteSelecionado?.nome ?? ""}
        aberto={!!clienteSelecionado}
        onFechar={() => setClienteSelecionado(null)}
      >
        {clienteSelecionado && (
          <div className="space-y-3">
            {clienteSelecionado.contato && (
              <p className="text-sm text-ink-500">📞 {clienteSelecionado.contato}</p>
            )}
            <div className="rounded-2xl bg-mint-50 p-3 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-mint-600">Total gasto</p>
              <p className="text-2xl font-bold text-mint-600">{formatarMoeda(clienteSelecionado.totalGasto)}</p>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-ink-700">Pedidos anteriores</p>
              <div className="space-y-2">
                {clienteSelecionado.pedidos
                  .slice()
                  .sort((a, b) => b.dataPedido.localeCompare(a.dataPedido))
                  .map((pedido) => (
                    <div key={pedido.id} className="rounded-2xl border border-sand-200 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-ink-400">{formatarData(pedido.dataPedido)}</span>
                        <span className="rounded-full bg-lilac-50 px-2 py-0.5 text-[11px] font-semibold text-lilac-600">
                          {statusLabel[pedido.status]}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-ink-700">
                        {pedido.itens.map((i) => `${i.quantidade}x ${i.modeloNome}`).join(", ")}
                      </p>
                      <p className="mt-1 text-sm font-bold text-ink-800">{formatarMoeda(pedido.valorTotal)}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
