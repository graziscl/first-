import { useState } from "react";
import { useAppStore } from "../store";
import { formatarMoeda } from "../utils/pricing";

export default function ConfiguracoesPage() {
  const valorHora = useAppStore((s) => s.settings.valorHora);
  const setValorHora = useAppStore((s) => s.setValorHora);
  const [valor, setValor] = useState(String(valorHora));
  const [salvo, setSalvo] = useState(false);

  function salvar() {
    const numero = Number(valor);
    if (Number.isNaN(numero) || numero < 0) return;
    setValorHora(numero);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2000);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-4">
      <h1 className="mb-1 text-xl font-bold text-ink-800">Configurações</h1>
      <p className="mb-5 text-sm text-ink-400">
        Ajuste aqui o valor que você quer ganhar por hora de trabalho. Ele é usado para calcular o preço
        sugerido dos seus modelos.
      </p>

      <div className="rounded-3xl border border-lilac-100 bg-white p-5 shadow-sm">
        <label className="mb-1 block text-sm font-medium text-ink-700">Valor da sua hora (R$)</label>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="0.5"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className="w-full rounded-2xl border border-lilac-200 bg-lilac-50/40 px-4 py-2.5 text-lg text-ink-800 outline-none focus:border-lilac-400 focus:ring-2 focus:ring-lilac-200"
        />
        <p className="mt-2 text-xs text-ink-400">Hoje: {formatarMoeda(valorHora)} por hora</p>

        <button
          onClick={salvar}
          className="mt-4 w-full rounded-2xl bg-rose-500 py-3 font-semibold text-white transition hover:bg-rose-600"
        >
          {salvo ? "Salvo! ✓" : "Salvar"}
        </button>
      </div>

      <div className="mt-4 rounded-3xl bg-peach-50 p-4 text-sm text-ink-600">
        💡 Dica: pense em quanto você gostaria de ganhar por hora considerando seu tempo, esforço e
        experiência — não precisa ser o salário mínimo dividido pelas horas!
      </div>
    </div>
  );
}
