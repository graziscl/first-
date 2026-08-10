import { useState } from "react";
import { useAppStore } from "../store";

// TODO: trocar pelo link de checkout real do produto na Cakto.
const LINK_CHECKOUT = "https://pay.cakto.com.br/SEU-PRODUTO-AQUI";

export default function PaywallPage() {
  const email = useAppStore((s) => s.session?.user.email);
  const sair = useAppStore((s) => s.sair);
  const verificarAssinatura = useAppStore((s) => s.verificarAssinatura);
  const verificando = useAppStore((s) => s.verificandoAssinatura);
  const [jaTentou, setJaTentou] = useState(false);

  async function checarDeNovo() {
    await verificarAssinatura();
    setJaTentou(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500 text-2xl shadow-sm shadow-rose-500/30">
            🧶
          </span>
          <h1 className="text-xl font-extrabold tracking-tight text-ink-800">Falta pouco!</h1>
        </div>

        <div className="rounded-2xl border border-sand-200 bg-white p-5 text-center shadow-sm shadow-ink-800/[0.04]">
          <p className="text-sm text-ink-600">
            Não encontramos uma assinatura ativa do PontoCerto pra <strong>{email}</strong>.
          </p>
          <p className="mt-2 text-sm text-ink-600">
            Assine por R$ 19,90/mês pra liberar o acesso — leva menos de um minuto.
          </p>

          <a
            href={LINK_CHECKOUT}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 block w-full rounded-2xl bg-rose-500 py-3 text-center font-semibold text-white shadow-sm shadow-rose-500/30 transition hover:bg-rose-600 active:scale-[0.98]"
          >
            Assinar agora — R$ 19,90/mês
          </a>

          <button
            onClick={checarDeNovo}
            disabled={verificando}
            className="mt-3 w-full rounded-2xl border border-sand-300 py-2.5 text-sm font-semibold text-ink-700 transition hover:bg-sand-50 disabled:opacity-50"
          >
            {verificando ? "Verificando..." : "Já paguei, verificar de novo"}
          </button>

          {jaTentou && !verificando && (
            <p className="mt-3 text-xs text-ink-400">
              Ainda não encontramos o pagamento. Se você acabou de pagar, aguarde um instante — a
              confirmação pode levar alguns segundos.
            </p>
          )}

          <button onClick={sair} className="mt-4 text-xs text-ink-400 underline underline-offset-2">
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
