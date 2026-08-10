import { useEffect, useState } from "react";
import { useAppStore } from "../store";
import type { ItemPedido, Pedido, StatusPedido } from "../types";
import { formatarMoeda } from "../utils/pricing";
import { hojeISO } from "../utils/dates";
import Modal from "./Modal";
import { IconLixeira, IconMais } from "./icons";

interface PedidoModalProps {
  aberto: boolean;
  onFechar: () => void;
  pedido: Pedido | null;
}

const statusLabel: Record<StatusPedido, string> = {
  encomendado: "Encomendado",
  producao: "Em Produção",
  pronto: "Pronto",
  entregue: "Entregue",
};

function estadoInicial(pedido: Pedido | null) {
  if (pedido) {
    return {
      clienteNome: pedido.clienteNome,
      clienteContato: pedido.clienteContato,
      itens: pedido.itens,
      dataPedido: pedido.dataPedido,
      prazoEntrega: pedido.prazoEntrega,
      observacoes: pedido.observacoes,
      status: pedido.status,
    };
  }
  return {
    clienteNome: "",
    clienteContato: "",
    itens: [] as ItemPedido[],
    dataPedido: hojeISO(),
    prazoEntrega: "",
    observacoes: "",
    status: "encomendado" as StatusPedido,
  };
}

export default function PedidoModal({ aberto, onFechar, pedido }: PedidoModalProps) {
  const modelos = useAppStore((s) => s.modelos);
  const addPedido = useAppStore((s) => s.addPedido);
  const updatePedido = useAppStore((s) => s.updatePedido);
  const moverPedido = useAppStore((s) => s.moverPedido);
  const removePedido = useAppStore((s) => s.removePedido);

  const [form, setForm] = useState(estadoInicial(pedido));

  useEffect(() => {
    if (aberto) setForm(estadoInicial(pedido));
  }, [aberto, pedido]);

  const valorTotal = form.itens.reduce((soma, item) => soma + item.precoUnitario * item.quantidade, 0);

  function adicionarItem() {
    if (modelos.length === 0) return;
    const primeiro = modelos[0];
    setForm({
      ...form,
      itens: [
        ...form.itens,
        { modeloId: primeiro.id, modeloNome: primeiro.nome, precoUnitario: primeiro.precoSugerido, quantidade: 1 },
      ],
    });
  }

  function atualizarItem(index: number, mudanca: Partial<ItemPedido>) {
    setForm({
      ...form,
      itens: form.itens.map((item, i) => (i === index ? { ...item, ...mudanca } : item)),
    });
  }

  function trocarModeloDoItem(index: number, modeloId: string) {
    const modelo = modelos.find((m) => m.id === modeloId);
    if (!modelo) return;
    atualizarItem(index, { modeloId: modelo.id, modeloNome: modelo.nome, precoUnitario: modelo.precoSugerido });
  }

  function removerItem(index: number) {
    setForm({ ...form, itens: form.itens.filter((_, i) => i !== index) });
  }

  function salvar() {
    if (!form.clienteNome.trim() || !form.prazoEntrega || form.itens.length === 0) return;
    const dados = {
      clienteNome: form.clienteNome.trim(),
      clienteContato: form.clienteContato.trim(),
      itens: form.itens,
      dataPedido: form.dataPedido,
      prazoEntrega: form.prazoEntrega,
      observacoes: form.observacoes.trim(),
    };
    if (pedido) {
      updatePedido(pedido.id, dados);
      if (form.status !== pedido.status) moverPedido(pedido.id, form.status);
    } else {
      addPedido(dados);
    }
    onFechar();
  }

  function excluir() {
    if (!pedido) return;
    if (confirm(`Excluir o pedido de ${pedido.clienteNome}?`)) {
      removePedido(pedido.id);
      onFechar();
    }
  }

  const podeSalvar = form.clienteNome.trim() && form.prazoEntrega && form.itens.length > 0;

  return (
    <Modal titulo={pedido ? "Editar pedido" : "Novo pedido"} aberto={aberto} onFechar={onFechar}>
      <div className="space-y-4">
        {modelos.length === 0 ? (
          <p className="rounded-2xl bg-peach-50 p-3 text-sm text-ink-600">
            Cadastre um modelo primeiro na aba "Modelos" para conseguir criar um pedido.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-ink-700">Nome do cliente</label>
                <input
                  type="text"
                  value={form.clienteNome}
                  onChange={(e) => setForm({ ...form, clienteNome: e.target.value })}
                  placeholder="Ex: Maria Silva"
                  className="w-full rounded-2xl border border-lilac-200 bg-lilac-50/40 px-4 py-2.5 text-ink-800 outline-none focus:border-lilac-400 focus:ring-2 focus:ring-lilac-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink-700">WhatsApp / contato</label>
                <input
                  type="text"
                  value={form.clienteContato}
                  onChange={(e) => setForm({ ...form, clienteContato: e.target.value })}
                  placeholder="(11) 99999-0000"
                  className="w-full rounded-2xl border border-lilac-200 bg-lilac-50/40 px-4 py-2.5 text-ink-800 outline-none focus:border-lilac-400 focus:ring-2 focus:ring-lilac-200"
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-sm font-medium text-ink-700">Peças encomendadas</label>
                <button
                  onClick={adicionarItem}
                  className="flex items-center gap-1 rounded-full bg-lilac-100 px-3 py-1 text-xs font-semibold text-lilac-700 hover:bg-lilac-200"
                >
                  <IconMais className="h-3.5 w-3.5" /> Adicionar peça
                </button>
              </div>

              {form.itens.length === 0 && (
                <p className="rounded-2xl bg-lilac-50/60 px-3 py-4 text-center text-xs text-ink-400">
                  Nenhuma peça adicionada ainda
                </p>
              )}

              <div className="space-y-2">
                {form.itens.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 rounded-2xl border border-lilac-100 p-2">
                    <select
                      value={item.modeloId}
                      onChange={(e) => trocarModeloDoItem(index, e.target.value)}
                      className="min-w-0 flex-1 rounded-xl border border-lilac-200 bg-white px-2 py-1.5 text-sm text-ink-800 outline-none"
                    >
                      {modelos.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nome}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={item.quantidade}
                      onChange={(e) =>
                        atualizarItem(index, { quantidade: Math.max(1, Number(e.target.value) || 1) })
                      }
                      className="w-14 rounded-xl border border-lilac-200 bg-white px-2 py-1.5 text-center text-sm text-ink-800 outline-none"
                    />
                    <span className="w-20 shrink-0 text-right text-sm font-medium text-ink-700">
                      {formatarMoeda(item.precoUnitario * item.quantidade)}
                    </span>
                    <button
                      onClick={() => removerItem(index)}
                      className="shrink-0 rounded-full p-1 text-ink-400 hover:bg-rose-50 hover:text-rose-500"
                      aria-label="Remover peça"
                    >
                      <IconLixeira className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-ink-700">Data do pedido</label>
                <input
                  type="date"
                  value={form.dataPedido}
                  onChange={(e) => setForm({ ...form, dataPedido: e.target.value })}
                  className="w-full rounded-2xl border border-lilac-200 bg-lilac-50/40 px-3 py-2.5 text-sm text-ink-800 outline-none focus:border-lilac-400 focus:ring-2 focus:ring-lilac-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink-700">Prazo de entrega</label>
                <input
                  type="date"
                  value={form.prazoEntrega}
                  onChange={(e) => setForm({ ...form, prazoEntrega: e.target.value })}
                  className="w-full rounded-2xl border border-lilac-200 bg-lilac-50/40 px-3 py-2.5 text-sm text-ink-800 outline-none focus:border-lilac-400 focus:ring-2 focus:ring-lilac-200"
                />
              </div>
            </div>

            {pedido && (
              <div>
                <label className="mb-1 block text-sm font-medium text-ink-700">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as StatusPedido })}
                  className="w-full rounded-2xl border border-lilac-200 bg-lilac-50/40 px-4 py-2.5 text-ink-800 outline-none focus:border-lilac-400 focus:ring-2 focus:ring-lilac-200"
                >
                  {(Object.keys(statusLabel) as StatusPedido[]).map((s) => (
                    <option key={s} value={s}>
                      {statusLabel[s]}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-ink-700">Observações</label>
              <textarea
                value={form.observacoes}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                placeholder="Ex: cor rosa claro, entregar embrulhado para presente"
                rows={2}
                className="w-full resize-none rounded-2xl border border-lilac-200 bg-lilac-50/40 px-4 py-2.5 text-sm text-ink-800 outline-none focus:border-lilac-400 focus:ring-2 focus:ring-lilac-200"
              />
            </div>

            <div className="rounded-2xl bg-mint-50 p-4 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-mint-600">Valor total do pedido</p>
              <p className="text-3xl font-bold text-mint-600">{formatarMoeda(valorTotal)}</p>
            </div>

            <div className="flex gap-2">
              {pedido && (
                <button
                  onClick={excluir}
                  className="rounded-2xl border border-red-200 px-4 py-3 font-semibold text-red-500 transition hover:bg-red-50"
                  aria-label="Excluir pedido"
                >
                  <IconLixeira className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={salvar}
                disabled={!podeSalvar}
                className="flex-1 rounded-2xl bg-rose-500 py-3 font-semibold text-white transition hover:bg-rose-600 disabled:opacity-40"
              >
                Salvar pedido
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
