export function calcularPrecoSugerido(
  custoMaterial: number,
  tempoProducaoHoras: number,
  margemLucro: number,
  valorHora: number,
): number {
  const custoBase = custoMaterial + tempoProducaoHoras * valorHora;
  const preco = custoBase * (1 + margemLucro / 100);
  return Math.round(preco * 100) / 100;
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
