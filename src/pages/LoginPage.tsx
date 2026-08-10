import { useState } from "react";
import { useAppStore } from "../store";

type Modo = "entrar" | "cadastrar" | "recuperar";

export default function LoginPage() {
  const entrar = useAppStore((s) => s.entrar);
  const cadastrar = useAppStore((s) => s.cadastrar);
  const recuperarSenha = useAppStore((s) => s.recuperarSenha);
  const erroAuth = useAppStore((s) => s.erroAuth);

  const [modo, setModo] = useState<Modo>("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  async function enviar() {
    setMensagem(null);
    setEnviando(true);
    try {
      if (modo === "entrar") {
        await entrar(email, senha);
      } else if (modo === "cadastrar") {
        const ok = await cadastrar(email, senha);
        if (ok) setMensagem("Conta criada! Verifique seu e-mail para confirmar, depois é só entrar.");
      } else {
        const ok = await recuperarSenha(email);
        if (ok) setMensagem("Te mandamos um e-mail com o link para trocar a senha.");
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500 text-2xl shadow-sm shadow-rose-500/30">
            🧶
          </span>
          <h1 className="text-xl font-extrabold tracking-tight text-ink-800">PontoCerto</h1>
          <p className="text-center text-sm text-ink-400">Gestão de pedidos para o seu ateliê de crochê</p>
        </div>

        <div className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm shadow-ink-800/[0.04]">
          <div className="mb-4 flex gap-1 rounded-xl bg-sand-100 p-1">
            <button
              onClick={() => {
                setModo("entrar");
                setMensagem(null);
              }}
              className={`flex-1 rounded-lg py-1.5 text-sm font-semibold transition ${
                modo === "entrar" ? "bg-white text-ink-800 shadow-sm" : "text-ink-400"
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => {
                setModo("cadastrar");
                setMensagem(null);
              }}
              className={`flex-1 rounded-lg py-1.5 text-sm font-semibold transition ${
                modo === "cadastrar" ? "bg-white text-ink-800 shadow-sm" : "text-ink-400"
              }`}
            >
              Criar conta
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              enviar();
            }}
            className="space-y-3"
          >
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-700">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@exemplo.com"
                className="w-full rounded-2xl border border-sand-300 bg-sand-50 px-4 py-2.5 text-ink-800 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
              />
            </div>

            {modo !== "recuperar" && (
              <div>
                <label className="mb-1 block text-sm font-medium text-ink-700">Senha</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Pelo menos 6 caracteres"
                  className="w-full rounded-2xl border border-sand-300 bg-sand-50 px-4 py-2.5 text-ink-800 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
                />
              </div>
            )}

            {erroAuth && <p className="text-sm text-red-600">{erroAuth}</p>}
            {mensagem && <p className="text-sm text-mint-600">{mensagem}</p>}

            <button
              type="submit"
              disabled={enviando}
              className="w-full rounded-2xl bg-rose-500 py-3 font-semibold text-white shadow-sm shadow-rose-500/30 transition hover:bg-rose-600 active:scale-[0.98] disabled:opacity-50"
            >
              {enviando
                ? "Aguarde..."
                : modo === "entrar"
                  ? "Entrar"
                  : modo === "cadastrar"
                    ? "Criar minha conta"
                    : "Enviar link de recuperação"}
            </button>
          </form>

          {modo === "entrar" && (
            <button
              onClick={() => {
                setModo("recuperar");
                setMensagem(null);
              }}
              className="mt-3 w-full text-center text-xs text-ink-400 underline underline-offset-2"
            >
              Esqueci minha senha
            </button>
          )}
          {modo === "recuperar" && (
            <button
              onClick={() => {
                setModo("entrar");
                setMensagem(null);
              }}
              className="mt-3 w-full text-center text-xs text-ink-400 underline underline-offset-2"
            >
              Voltar para o login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
