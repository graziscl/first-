import { useState } from "react";
import { useAppStore } from "../store";
import { formatarMoeda } from "../utils/pricing";

export default function ConfiguracoesPage() {
  const valorHora = useAppStore((s) => s.settings.valorHora);
  const setValorHora = useAppStore((s) => s.setValorHora);
  const email = useAppStore((s) => s.session?.user.email);
  const sair = useAppStore((s) => s.sair);
  const trocarSenha = useAppStore((s) => s.trocarSenha);
  const [valor, setValor] = useState(String(valorHora));
  const [salvo, setSalvo] = useState(false);
  const [novaSenha, setNovaSenha] = useState("");
  const [senhaAlterada, setSenhaAlterada] = useState(false);

  function salvar() {
    const numero = Number(valor);
    if (Number.isNaN(numero) || numero < 0) return;
    setValorHora(numero);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2000);
  }

  async function salvarNovaSenha() {
    if (novaSenha.length < 6) return;
    const ok = await trocarSenha(novaSenha);
    if (ok) {
      setNovaSenha("");
      setSenhaAlterada(true);
      setTimeout(() => setSenhaAlterada(false), 2000);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-4">
      <h1 className="mb-1 text-xl font-extrabold text-ink-800">Configurações</h1>
      <p className="mb-5 text-sm text-ink-400">
        Ajuste aqui o valor que você quer ganhar por hora de trabalho. Ele é usado para calcular o preço
        sugerido dos seus modelos.
      </p>

      <div className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm shadow-ink-800/[0.03]">
        <label className="mb-1 block text-sm font-medium text-ink-700">Valor da sua hora (R$)</label>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="0.5"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className="w-full rounded-2xl border border-sand-300 bg-sand-50 px-4 py-2.5 text-lg font-semibold tabular-nums text-ink-800 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
        />
        <p className="mt-2 text-xs text-ink-400">Hoje: {formatarMoeda(valorHora)} por hora</p>

        <button
          onClick={salvar}
          className="mt-4 w-full rounded-2xl bg-rose-500 py-3 font-semibold text-white shadow-sm shadow-rose-500/30 transition hover:bg-rose-600 active:scale-[0.98]"
        >
          {salvo ? "Salvo! ✓" : "Salvar"}
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-peach-100 bg-peach-50 p-4 text-sm text-ink-600">
        💡 Dica: pense em quanto você gostaria de ganhar por hora considerando seu tempo, esforço e
        experiência — não precisa ser o salário mínimo dividido pelas horas!
      </div>

      <div className="mt-4 rounded-2xl border border-sand-200 bg-white p-5 shadow-sm shadow-ink-800/[0.03]">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Sua conta</p>
        <p className="mt-1 text-sm text-ink-700">{email}</p>

        <label className="mb-1 mt-4 block text-sm font-medium text-ink-700">Trocar senha</label>
        <div className="flex gap-2">
          <input
            type="password"
            minLength={6}
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            placeholder="Nova senha"
            className="min-w-0 flex-1 rounded-2xl border border-sand-300 bg-sand-50 px-4 py-2.5 text-sm text-ink-800 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
          />
          <button
            onClick={salvarNovaSenha}
            disabled={novaSenha.length < 6}
            className="shrink-0 rounded-2xl bg-ink-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
          >
            {senhaAlterada ? "✓" : "Trocar"}
          </button>
        </div>

        <button
          onClick={sair}
          className="mt-4 w-full rounded-2xl border border-red-200 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-50"
        >
          Sair da conta
        </button>
      </div>
    </div>
  );
}
