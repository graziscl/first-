import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./lib/supabaseClient";
import type { Modelo, Pedido, Settings, StatusPedido } from "./types";
import { calcularPrecoSugerido } from "./utils/pricing";

function modeloFromRow(row: Record<string, unknown>): Modelo {
  return {
    id: row.id as string,
    nome: row.nome as string,
    custoMaterial: Number(row.custo_material),
    tempoProducaoHoras: Number(row.tempo_producao_horas),
    margemLucro: Number(row.margem_lucro),
    precoSugerido: Number(row.preco_sugerido),
    criadoEm: row.criado_em as string,
  };
}

function pedidoFromRow(row: Record<string, unknown>): Pedido {
  return {
    id: row.id as string,
    clienteNome: row.cliente_nome as string,
    clienteContato: row.cliente_contato as string,
    itens: row.itens as Pedido["itens"],
    dataPedido: row.data_pedido as string,
    prazoEntrega: row.prazo_entrega as string,
    valorTotal: Number(row.valor_total),
    observacoes: row.observacoes as string,
    status: row.status as StatusPedido,
    criadoEm: row.criado_em as string,
  };
}

function calcularValorTotal(itens: { precoUnitario: number; quantidade: number }[]): number {
  const total = itens.reduce((soma, item) => soma + item.precoUnitario * item.quantidade, 0);
  return Math.round(total * 100) / 100;
}

interface AppState {
  session: Session | null;
  carregando: boolean;
  erroAuth: string | null;
  assinaturaAtiva: boolean;
  verificandoAssinatura: boolean;

  settings: Settings;
  modelos: Modelo[];
  pedidos: Pedido[];

  inicializar: () => void;
  entrar: (email: string, senha: string) => Promise<boolean>;
  cadastrar: (email: string, senha: string) => Promise<boolean>;
  sair: () => Promise<void>;
  recuperarSenha: (email: string) => Promise<boolean>;
  trocarSenha: (novaSenha: string) => Promise<boolean>;
  verificarAssinatura: () => Promise<void>;

  setValorHora: (valorHora: number) => Promise<void>;

  addModelo: (dados: {
    nome: string;
    custoMaterial: number;
    tempoProducaoHoras: number;
    margemLucro: number;
  }) => Promise<void>;
  updateModelo: (
    id: string,
    dados: { nome: string; custoMaterial: number; tempoProducaoHoras: number; margemLucro: number },
  ) => Promise<void>;
  removeModelo: (id: string) => Promise<void>;

  addPedido: (dados: {
    clienteNome: string;
    clienteContato: string;
    itens: { modeloId: string; modeloNome: string; precoUnitario: number; quantidade: number }[];
    dataPedido: string;
    prazoEntrega: string;
    observacoes: string;
  }) => Promise<void>;
  updatePedido: (
    id: string,
    dados: {
      clienteNome: string;
      clienteContato: string;
      itens: { modeloId: string; modeloNome: string; precoUnitario: number; quantidade: number }[];
      dataPedido: string;
      prazoEntrega: string;
      observacoes: string;
    },
  ) => Promise<void>;
  moverPedido: (id: string, status: StatusPedido) => Promise<void>;
  removePedido: (id: string) => Promise<void>;
}

async function buscarAssinaturaAtiva(email: string): Promise<boolean> {
  const { data } = await supabase
    .from("assinaturas")
    .select("status")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();
  return data?.status === "ativo";
}

async function carregarDadosDaUsuaria(
  userId: string,
  email: string,
  set: (partial: Partial<AppState>) => void,
) {
  const [modelosRes, pedidosRes, configRes, assinaturaAtiva] = await Promise.all([
    supabase.from("modelos").select("*").order("criado_em", { ascending: true }),
    supabase.from("pedidos").select("*").order("criado_em", { ascending: true }),
    supabase.from("configuracoes").select("valor_hora").eq("user_id", userId).maybeSingle(),
    buscarAssinaturaAtiva(email),
  ]);

  set({
    modelos: (modelosRes.data ?? []).map(modeloFromRow),
    pedidos: (pedidosRes.data ?? []).map(pedidoFromRow),
    settings: { valorHora: Number(configRes.data?.valor_hora ?? 15) },
    assinaturaAtiva,
    carregando: false,
  });
}

export const useAppStore = create<AppState>()((set, get) => ({
  session: null,
  carregando: true,
  erroAuth: null,
  assinaturaAtiva: false,
  verificandoAssinatura: false,
  settings: { valorHora: 15 },
  modelos: [],
  pedidos: [],

  inicializar: () => {
    supabase.auth.getSession().then(({ data }) => {
      set({ session: data.session });
      if (data.session?.user.email) {
        carregarDadosDaUsuaria(data.session.user.id, data.session.user.email, set);
      } else {
        set({ carregando: false });
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session });
      if (session?.user.email) {
        set({ carregando: true });
        carregarDadosDaUsuaria(session.user.id, session.user.email, set);
      } else {
        set({
          modelos: [],
          pedidos: [],
          settings: { valorHora: 15 },
          assinaturaAtiva: false,
          carregando: false,
        });
      }
    });
  },

  verificarAssinatura: async () => {
    const email = get().session?.user.email;
    if (!email) return;
    set({ verificandoAssinatura: true });
    const assinaturaAtiva = await buscarAssinaturaAtiva(email);
    set({ assinaturaAtiva, verificandoAssinatura: false });
  },

  entrar: async (email, senha) => {
    set({ erroAuth: null });
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) {
      set({ erroAuth: traduzErro(error.message) });
      return false;
    }
    return true;
  },

  cadastrar: async (email, senha) => {
    set({ erroAuth: null });
    const { error } = await supabase.auth.signUp({ email, password: senha });
    if (error) {
      set({ erroAuth: traduzErro(error.message) });
      return false;
    }
    return true;
  },

  sair: async () => {
    await supabase.auth.signOut();
  },

  recuperarSenha: async (email) => {
    set({ erroAuth: null });
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      set({ erroAuth: traduzErro(error.message) });
      return false;
    }
    return true;
  },

  trocarSenha: async (novaSenha) => {
    set({ erroAuth: null });
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    if (error) {
      set({ erroAuth: traduzErro(error.message) });
      return false;
    }
    return true;
  },

  setValorHora: async (valorHora) => {
    const userId = get().session?.user.id;
    if (!userId) return;
    set((state) => ({ settings: { ...state.settings, valorHora } }));
    await supabase.from("configuracoes").upsert({ user_id: userId, valor_hora: valorHora });
  },

  addModelo: async (dados) => {
    const userId = get().session?.user.id;
    if (!userId) return;
    const precoSugerido = calcularPrecoSugerido(
      dados.custoMaterial,
      dados.tempoProducaoHoras,
      dados.margemLucro,
      get().settings.valorHora,
    );
    const { data, error } = await supabase
      .from("modelos")
      .insert({
        user_id: userId,
        nome: dados.nome,
        custo_material: dados.custoMaterial,
        tempo_producao_horas: dados.tempoProducaoHoras,
        margem_lucro: dados.margemLucro,
        preco_sugerido: precoSugerido,
      })
      .select()
      .single();
    if (!error && data) {
      set((state) => ({ modelos: [...state.modelos, modeloFromRow(data)] }));
    }
  },

  updateModelo: async (id, dados) => {
    const precoSugerido = calcularPrecoSugerido(
      dados.custoMaterial,
      dados.tempoProducaoHoras,
      dados.margemLucro,
      get().settings.valorHora,
    );
    const { data, error } = await supabase
      .from("modelos")
      .update({
        nome: dados.nome,
        custo_material: dados.custoMaterial,
        tempo_producao_horas: dados.tempoProducaoHoras,
        margem_lucro: dados.margemLucro,
        preco_sugerido: precoSugerido,
      })
      .eq("id", id)
      .select()
      .single();
    if (!error && data) {
      const atualizado = modeloFromRow(data);
      set((state) => ({ modelos: state.modelos.map((m) => (m.id === id ? atualizado : m)) }));
    }
  },

  removeModelo: async (id) => {
    const { error } = await supabase.from("modelos").delete().eq("id", id);
    if (!error) {
      set((state) => ({ modelos: state.modelos.filter((m) => m.id !== id) }));
    }
  },

  addPedido: async (dados) => {
    const userId = get().session?.user.id;
    if (!userId) return;
    const { data, error } = await supabase
      .from("pedidos")
      .insert({
        user_id: userId,
        cliente_nome: dados.clienteNome,
        cliente_contato: dados.clienteContato,
        itens: dados.itens,
        data_pedido: dados.dataPedido,
        prazo_entrega: dados.prazoEntrega,
        observacoes: dados.observacoes,
        valor_total: calcularValorTotal(dados.itens),
        status: "encomendado",
      })
      .select()
      .single();
    if (!error && data) {
      set((state) => ({ pedidos: [...state.pedidos, pedidoFromRow(data)] }));
    }
  },

  updatePedido: async (id, dados) => {
    const { data, error } = await supabase
      .from("pedidos")
      .update({
        cliente_nome: dados.clienteNome,
        cliente_contato: dados.clienteContato,
        itens: dados.itens,
        data_pedido: dados.dataPedido,
        prazo_entrega: dados.prazoEntrega,
        observacoes: dados.observacoes,
        valor_total: calcularValorTotal(dados.itens),
      })
      .eq("id", id)
      .select()
      .single();
    if (!error && data) {
      const atualizado = pedidoFromRow(data);
      set((state) => ({ pedidos: state.pedidos.map((p) => (p.id === id ? atualizado : p)) }));
    }
  },

  moverPedido: async (id, status) => {
    set((state) => ({ pedidos: state.pedidos.map((p) => (p.id === id ? { ...p, status } : p)) }));
    await supabase.from("pedidos").update({ status }).eq("id", id);
  },

  removePedido: async (id) => {
    const { error } = await supabase.from("pedidos").delete().eq("id", id);
    if (!error) {
      set((state) => ({ pedidos: state.pedidos.filter((p) => p.id !== id) }));
    }
  },
}));

function traduzErro(mensagem: string): string {
  if (mensagem.includes("Invalid login credentials")) return "E-mail ou senha incorretos.";
  if (mensagem.includes("User already registered")) return "Já existe uma conta com esse e-mail.";
  if (mensagem.includes("Password should be at least")) return "A senha precisa ter pelo menos 6 caracteres.";
  if (mensagem.includes("Unable to validate email address")) return "Digite um e-mail válido.";
  return mensagem;
}
