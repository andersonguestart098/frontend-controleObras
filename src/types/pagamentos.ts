import type {
  DashboardFilters,
} from '@/types/dashboard';

export type PagamentoStatus =
  | 'PAGO'
  | 'VENCIDO'
  | 'EM ABERTO'
  | string;

export interface PagamentoTitulo {
  nunota: number | null;
  nufin: number | null;
  parcela: string | number | null;

  dtneg: string | null;
  dtvenc: string | null;
  dhbaixa: string | null;

  codproj: number | null;
  projeto: string | null;

  codtipoper: number | null;
  descroper: string | null;

  codtipvenda: number | null;
  tipo_negociacao: string | null;

  parceiro: string | null;
  cgc_cpf: string | null;

  valor_titulo: number;
  valor_baixa: number;
  saldo_aberto: number;
  status_titulo: PagamentoStatus;

  historico: string | null;
  vlrlanc: number | null;
  dtlanc: string | null;
  recdesp: number | null;
  origmov: string | null;
  nubco: number | null;
}

export interface PagamentosResponse {
  filters: DashboardFilters;
  count: number;
  pagamentos: PagamentoTitulo[];
}