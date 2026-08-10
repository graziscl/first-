import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Modelo, Pedido, Settings, StatusPedido } from "./types";
import { calcularPrecoSugerido } from "./utils/pricing";
import { hojeISO } from "./utils/dates";

function gerarId(): string {
  return crypto.randomUUID();
}

interface AppState {
  settings: Settings;
  modelos: Modelo[];
  pedidos: Pedido[];

  setValorHora: (valorHora: number) => void;

  addModelo: (dados: {
    nome: string;
    custoMaterial: number;
    tempoProducaoHoras: number;
    margemLucro: number;
  }) => void;
  updateModelo: (
    id: string,
    dados: {
      nome: string;
      custoMaterial: number;
      tempoProducaoHoras: number;
      margemLucro: number;
    },
  ) => void;
  removeModelo: (id: string) => void;

  addPedido: (dados: {
    clienteNome: string;
    clienteContato: string;
    itens: { modeloId: string; modeloNome: string; precoUnitario: number; quantidade: number }[];
    dataPedido: string;
    prazoEntrega: string;
    observacoes: string;
  }) => void;
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
  ) => void;
  moverPedido: (id: string, status: StatusPedido) => void;
  removePedido: (id: string) => void;
}

const modelosIniciais: Modelo[] = [
  {
    id: gerarId(),
    nome: "Sapatinho Ouriço",
    custoMaterial: 12,
    tempoProducaoHoras: 3,
    margemLucro: 40,
    precoSugerido: calcularPrecoSugerido(12, 3, 40, 15),
    criadoEm: hojeISO(),
  },
  {
    id: gerarId(),
    nome: "Amigurumi Ursinho",
    custoMaterial: 18,
    tempoProducaoHoras: 5,
    margemLucro: 50,
    precoSugerido: calcularPrecoSugerido(18, 5, 50, 15),
    criadoEm: hojeISO(),
  },
];

function calcularValorTotal(itens: { precoUnitario: number; quantidade: number }[]): number {
  const total = itens.reduce((soma, item) => soma + item.precoUnitario * item.quantidade, 0);
  return Math.round(total * 100) / 100;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      settings: { valorHora: 15 },
      modelos: modelosIniciais,
      pedidos: [],

      setValorHora: (valorHora) =>
        set((state) => ({ settings: { ...state.settings, valorHora } })),

      addModelo: (dados) =>
        set((state) => ({
          modelos: [
            ...state.modelos,
            {
              id: gerarId(),
              nome: dados.nome,
              custoMaterial: dados.custoMaterial,
              tempoProducaoHoras: dados.tempoProducaoHoras,
              margemLucro: dados.margemLucro,
              precoSugerido: calcularPrecoSugerido(
                dados.custoMaterial,
                dados.tempoProducaoHoras,
                dados.margemLucro,
                state.settings.valorHora,
              ),
              criadoEm: hojeISO(),
            },
          ],
        })),

      updateModelo: (id, dados) =>
        set((state) => ({
          modelos: state.modelos.map((m) =>
            m.id === id
              ? {
                  ...m,
                  nome: dados.nome,
                  custoMaterial: dados.custoMaterial,
                  tempoProducaoHoras: dados.tempoProducaoHoras,
                  margemLucro: dados.margemLucro,
                  precoSugerido: calcularPrecoSugerido(
                    dados.custoMaterial,
                    dados.tempoProducaoHoras,
                    dados.margemLucro,
                    state.settings.valorHora,
                  ),
                }
              : m,
          ),
        })),

      removeModelo: (id) =>
        set((state) => ({ modelos: state.modelos.filter((m) => m.id !== id) })),

      addPedido: (dados) =>
        set((state) => ({
          pedidos: [
            ...state.pedidos,
            {
              id: gerarId(),
              clienteNome: dados.clienteNome,
              clienteContato: dados.clienteContato,
              itens: dados.itens,
              dataPedido: dados.dataPedido,
              prazoEntrega: dados.prazoEntrega,
              observacoes: dados.observacoes,
              valorTotal: calcularValorTotal(dados.itens),
              status: "encomendado",
              criadoEm: hojeISO(),
            },
          ],
        })),

      updatePedido: (id, dados) =>
        set((state) => ({
          pedidos: state.pedidos.map((p) =>
            p.id === id
              ? {
                  ...p,
                  clienteNome: dados.clienteNome,
                  clienteContato: dados.clienteContato,
                  itens: dados.itens,
                  dataPedido: dados.dataPedido,
                  prazoEntrega: dados.prazoEntrega,
                  observacoes: dados.observacoes,
                  valorTotal: calcularValorTotal(dados.itens),
                }
              : p,
          ),
        })),

      moverPedido: (id, status) =>
        set((state) => ({
          pedidos: state.pedidos.map((p) => (p.id === id ? { ...p, status } : p)),
        })),

      removePedido: (id) =>
        set((state) => ({ pedidos: state.pedidos.filter((p) => p.id !== id) })),
    }),
    { name: "crochela-storage" },
  ),
);
