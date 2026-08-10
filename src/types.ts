export type StatusPedido = "encomendado" | "producao" | "pronto" | "entregue";

export interface Modelo {
  id: string;
  nome: string;
  custoMaterial: number;
  tempoProducaoHoras: number;
  margemLucro: number;
  precoSugerido: number;
  criadoEm: string;
}

export interface ItemPedido {
  modeloId: string;
  modeloNome: string;
  precoUnitario: number;
  quantidade: number;
}

export interface Pedido {
  id: string;
  clienteNome: string;
  clienteContato: string;
  itens: ItemPedido[];
  dataPedido: string;
  prazoEntrega: string;
  valorTotal: number;
  observacoes: string;
  status: StatusPedido;
  criadoEm: string;
}

export interface Settings {
  valorHora: number;
}
