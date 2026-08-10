import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAppStore } from "../store";
import { calcularPrecoSugerido, formatarMoeda } from "../utils/pricing";
import Modal from "../components/Modal";
import { IconLapis, IconLixeira, IconMais } from "../components/icons";
import type { Modelo } from "../types";

const formVazio = { nome: "", custoMaterial: "", tempoProducaoHoras: "", margemLucro: "50" };

export default function ModelosPage() {
  const modelos = useAppStore((s) => s.modelos);
  const valorHora = useAppStore((s) => s.settings.valorHora);
  const addModelo = useAppStore((s) => s.addModelo);
  const updateModelo = useAppStore((s) => s.updateModelo);
  const removeModelo = useAppStore((s) => s.removeModelo);

  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState(formVazio);

  const custoMaterial = Number(form.custoMaterial) || 0;
  const tempo = Number(form.tempoProducaoHoras) || 0;
  const margem = Number(form.margemLucro) || 0;
  const precoCalculado = useMemo(
    () => calcularPrecoSugerido(custoMaterial, tempo, margem, valorHora),
    [custoMaterial, tempo, margem, valorHora],
  );

  function abrirNovo() {
    setEditandoId(null);
    setForm(formVazio);
    setModalAberto(true);
  }

  function abrirEdicao(modelo: Modelo) {
    setEditandoId(modelo.id);
    setForm({
      nome: modelo.nome,
      custoMaterial: String(modelo.custoMaterial),
      tempoProducaoHoras: String(modelo.tempoProducaoHoras),
      margemLucro: String(modelo.margemLucro),
    });
    setModalAberto(true);
  }

  function salvar() {
    if (!form.nome.trim()) return;
    const dados = {
      nome: form.nome.trim(),
      custoMaterial,
      tempoProducaoHoras: tempo,
      margemLucro: margem,
    };
    if (editandoId) {
      updateModelo(editandoId, dados);
    } else {
      addModelo(dados);
    }
    setModalAberto(false);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-800">Seus modelos</h1>
          <p className="text-sm text-ink-400">
            Valor da sua hora hoje: <strong className="text-ink-600">{formatarMoeda(valorHora)}</strong>{" "}
            <Link to="/configuracoes" className="text-rose-500 underline underline-offset-2">
              alterar
            </Link>
          </p>
        </div>
      </div>

      {modelos.length === 0 && (
        <div className="rounded-3xl bg-lilac-50 p-6 text-center text-ink-600">
          Você ainda não cadastrou nenhum modelo. Toque no botão + para começar!
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {modelos.map((modelo) => (
          <div key={modelo.id} className="rounded-3xl border border-lilac-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-ink-800">{modelo.nome}</h3>
              <div className="flex shrink-0 gap-1">
                <button
                  onClick={() => abrirEdicao(modelo)}
                  className="rounded-full p-1.5 text-ink-400 hover:bg-lilac-50 hover:text-lilac-600"
                  aria-label={`Editar ${modelo.nome}`}
                >
                  <IconLapis className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Excluir o modelo "${modelo.nome}"?`)) removeModelo(modelo.id);
                  }}
                  className="rounded-full p-1.5 text-ink-400 hover:bg-rose-50 hover:text-rose-500"
                  aria-label={`Excluir ${modelo.nome}`}
                >
                  <IconLixeira className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-mint-600">{formatarMoeda(modelo.precoSugerido)}</p>
            <dl className="mt-2 space-y-0.5 text-xs text-ink-400">
              <div className="flex justify-between">
                <dt>Material</dt>
                <dd>{formatarMoeda(modelo.custoMaterial)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Tempo</dt>
                <dd>{modelo.tempoProducaoHoras}h</dd>
              </div>
              <div className="flex justify-between">
                <dt>Margem</dt>
                <dd>{modelo.margemLucro}%</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>

      <button
        onClick={abrirNovo}
        className="fixed bottom-24 right-4 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg shadow-rose-500/30 transition hover:bg-rose-600 sm:right-[calc(50%-16rem)]"
        aria-label="Novo modelo"
      >
        <IconMais className="h-7 w-7" />
      </button>

      <Modal titulo={editandoId ? "Editar modelo" : "Novo modelo"} aberto={modalAberto} onFechar={() => setModalAberto(false)}>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Nome do modelo</label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Ex: Sapatinho Ouriço"
              className="w-full rounded-2xl border border-lilac-200 bg-lilac-50/40 px-4 py-2.5 text-ink-800 outline-none focus:border-lilac-400 focus:ring-2 focus:ring-lilac-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-700">Custo do material (R$)</label>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={form.custoMaterial}
                onChange={(e) => setForm({ ...form, custoMaterial: e.target.value })}
                placeholder="0,00"
                className="w-full rounded-2xl border border-lilac-200 bg-lilac-50/40 px-4 py-2.5 text-ink-800 outline-none focus:border-lilac-400 focus:ring-2 focus:ring-lilac-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-700">Tempo de produção (h)</label>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                value={form.tempoProducaoHoras}
                onChange={(e) => setForm({ ...form, tempoProducaoHoras: e.target.value })}
                placeholder="0"
                className="w-full rounded-2xl border border-lilac-200 bg-lilac-50/40 px-4 py-2.5 text-ink-800 outline-none focus:border-lilac-400 focus:ring-2 focus:ring-lilac-200"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Margem de lucro desejada (%)</label>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={form.margemLucro}
              onChange={(e) => setForm({ ...form, margemLucro: e.target.value })}
              className="w-full rounded-2xl border border-lilac-200 bg-lilac-50/40 px-4 py-2.5 text-ink-800 outline-none focus:border-lilac-400 focus:ring-2 focus:ring-lilac-200"
            />
          </div>

          <div className="rounded-2xl bg-mint-50 p-4 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-mint-600">Preço sugerido de venda</p>
            <p className="text-3xl font-bold text-mint-600">{formatarMoeda(precoCalculado)}</p>
            <p className="mt-1 text-xs text-ink-400">
              (material + tempo × sua hora) + margem de lucro
            </p>
          </div>

          <button
            onClick={salvar}
            disabled={!form.nome.trim()}
            className="w-full rounded-2xl bg-rose-500 py-3 font-semibold text-white transition hover:bg-rose-600 disabled:opacity-40"
          >
            Salvar modelo
          </button>
        </div>
      </Modal>
    </div>
  );
}
