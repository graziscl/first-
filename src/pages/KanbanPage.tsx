import { useMemo, useState } from "react";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { useAppStore } from "../store";
import type { Pedido, StatusPedido } from "../types";
import { formatarMoeda } from "../utils/pricing";
import { formatarData, urgenciaDoPrazo } from "../utils/dates";
import { IconMais } from "../components/icons";
import PedidoModal from "../components/PedidoModal";

const colunas: { id: StatusPedido; titulo: string; corPonto: string; corTopo: string }[] = [
  { id: "encomendado", titulo: "Encomendado", corPonto: "bg-lilac-500", corTopo: "bg-lilac-400" },
  { id: "producao", titulo: "Em Produção", corPonto: "bg-peach-500", corTopo: "bg-peach-400" },
  { id: "pronto", titulo: "Pronto", corPonto: "bg-mint-500", corTopo: "bg-mint-400" },
  { id: "entregue", titulo: "Entregue", corPonto: "bg-stone-500", corTopo: "bg-stone-300" },
];

function corDoCard(pedido: Pedido) {
  if (pedido.status === "entregue") {
    return "border-stone-200 bg-stone-50/70";
  }
  const urgencia = urgenciaDoPrazo(pedido.prazoEntrega);
  if (urgencia === "atrasado") return "border-red-300 bg-red-50";
  if (urgencia === "proximo") return "border-amber-300 bg-amber-50";
  return "border-sand-200 bg-white";
}

function PedidoCard({ pedido, index, onClick }: { pedido: Pedido; index: number; onClick: () => void }) {
  const urgencia = pedido.status !== "entregue" ? urgenciaDoPrazo(pedido.prazoEntrega) : "normal";
  return (
    <Draggable draggableId={pedido.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`mb-3 cursor-pointer rounded-2xl border p-3 shadow-sm shadow-ink-800/[0.03] transition hover:shadow-md hover:shadow-ink-800/[0.07] ${corDoCard(pedido)} ${
            snapshot.isDragging ? "rotate-1 shadow-lg" : ""
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-ink-800">{pedido.clienteNome || "Cliente sem nome"}</h4>
            <span className="shrink-0 text-sm font-bold text-ink-700">{formatarMoeda(pedido.valorTotal)}</span>
          </div>
          <p className="mt-1 text-xs text-ink-600">
            {pedido.itens.map((i) => `${i.quantidade}x ${i.modeloNome}`).join(", ") || "Sem peças"}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span
              className={`text-xs font-medium ${
                urgencia === "atrasado"
                  ? "text-red-600"
                  : urgencia === "proximo"
                    ? "text-amber-600"
                    : "text-ink-400"
              }`}
            >
              {urgencia === "atrasado" ? "⚠️ Atrasado — " : urgencia === "proximo" ? "⏰ " : ""}
              Prazo: {formatarData(pedido.prazoEntrega)}
            </span>
          </div>
        </div>
      )}
    </Draggable>
  );
}

export default function KanbanPage() {
  const pedidos = useAppStore((s) => s.pedidos);
  const moverPedido = useAppStore((s) => s.moverPedido);

  const [modalAberto, setModalAberto] = useState(false);
  const [pedidoEditando, setPedidoEditando] = useState<Pedido | null>(null);

  const pedidosPorColuna = useMemo(() => {
    const mapa: Record<StatusPedido, Pedido[]> = {
      encomendado: [],
      producao: [],
      pronto: [],
      entregue: [],
    };
    for (const pedido of pedidos) {
      mapa[pedido.status].push(pedido);
    }
    for (const status of Object.keys(mapa) as StatusPedido[]) {
      mapa[status].sort((a, b) => a.prazoEntrega.localeCompare(b.prazoEntrega));
    }
    return mapa;
  }, [pedidos]);

  function onDragEnd(result: DropResult) {
    const { destination, draggableId } = result;
    if (!destination) return;
    const novoStatus = destination.droppableId as StatusPedido;
    moverPedido(draggableId, novoStatus);
  }

  function abrirNovo() {
    setPedidoEditando(null);
    setModalAberto(true);
  }

  function abrirEdicao(pedido: Pedido) {
    setPedidoEditando(pedido);
    setModalAberto(true);
  }

  return (
    <div className="px-4 py-4">
      <h1 className="mb-3 px-0.5 text-xl font-extrabold text-ink-800">Seus pedidos</h1>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-4 sm:overflow-visible">
          {colunas.map((coluna) => (
            <div
              key={coluna.id}
              className="w-[82vw] shrink-0 snap-center overflow-hidden rounded-2xl border border-sand-200 bg-sand-100/60 sm:w-auto"
            >
              <div className={`h-1 ${coluna.corTopo}`} />
              <div className="p-3">
                <div className="mb-2 flex items-center gap-2 px-1">
                  <span className={`h-2 w-2 rounded-full ${coluna.corPonto}`} />
                  <h2 className="text-sm font-bold tracking-tight text-ink-700">{coluna.titulo}</h2>
                  <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-xs font-semibold tabular-nums text-ink-500 shadow-sm shadow-ink-800/[0.03]">
                    {pedidosPorColuna[coluna.id].length}
                  </span>
                </div>
                <Droppable droppableId={coluna.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[120px] rounded-xl p-1 transition ${
                        snapshot.isDraggingOver ? "bg-rose-50 ring-2 ring-rose-200" : ""
                      }`}
                    >
                      {pedidosPorColuna[coluna.id].length === 0 && !snapshot.isDraggingOver && (
                        <p className="px-2 py-6 text-center text-xs text-ink-400">Nenhum pedido aqui</p>
                      )}
                      {pedidosPorColuna[coluna.id].map((pedido, index) => (
                        <PedidoCard key={pedido.id} pedido={pedido} index={index} onClick={() => abrirEdicao(pedido)} />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          ))}
        </div>
      </DragDropContext>

      <button
        onClick={abrirNovo}
        className="fixed bottom-24 right-4 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg shadow-rose-500/35 transition hover:bg-rose-600 active:scale-95 sm:right-[calc(50%-16rem)]"
        aria-label="Novo pedido"
      >
        <IconMais className="h-7 w-7" />
      </button>

      <PedidoModal aberto={modalAberto} onFechar={() => setModalAberto(false)} pedido={pedidoEditando} />
    </div>
  );
}
