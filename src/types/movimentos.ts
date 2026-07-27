import type { DashboardFilters } from './dashboard';

export type TipoMovimento =
  | 'VENDA'
  | 'DEVOLUCAO'
  | 'OUTRO';

export interface Movimento {
  nunota: number;
  numnota: number;
  dtneg: string | null;

  codproj: number;
  projeto: string;

  codparc: number;
  parceiro: string;
  cgc_cpf: string | null;

  codtipoper: number;
  descroper: string;
  tipo_movimento: TipoMovimento;

  codtipvenda: number | null;
  tipo_negociacao: string | null;

  vlrnota: number;
  vlricms: number | null;
  vlrpis: number | null;
  vlrcofins: number | null;

  perc_gasto_fixo: number;
  perc_irpj_cssl: number;
  perc_comissao: number;

  vlr_gasto_fixo: number;
  vlr_irpj_cssl: number;
  vlr_comissao: number;
  vlr_gasto_total: number;
  vlr_liquido: number;
}

export interface MovimentosResponse {
  filters: DashboardFilters;
  count: number;
  movimentos: Movimento[];
}