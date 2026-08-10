export function formatarData(iso: string): string {
  if (!iso) return "";
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function hojeISO(): string {
  const hoje = new Date();
  return dataParaISO(hoje);
}

export function dataParaISO(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function diasAteOPrazo(prazoISO: string): number {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const prazo = new Date(prazoISO + "T00:00:00");
  const diffMs = prazo.getTime() - hoje.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export type UrgenciaPrazo = "atrasado" | "proximo" | "normal";

export function urgenciaDoPrazo(prazoISO: string): UrgenciaPrazo {
  const dias = diasAteOPrazo(prazoISO);
  if (dias < 0) return "atrasado";
  if (dias <= 2) return "proximo";
  return "normal";
}
