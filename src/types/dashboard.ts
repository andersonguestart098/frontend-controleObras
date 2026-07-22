export interface DashboardFilters {
  codproj: number;
  dtneg_inicial: string | null;
  dtneg_final: string | null;
  nunota: number | null;
}

export interface VendasKpis {
  total_vendas: number;
  total_devolucoes: number;
  vendas_liquidas: number;
  custo_total: number;
}

export interface InternoObrasKpis {
  total: number;
}

export interface RemessaFuturaKpis {
  total_faturamento: number;
  total_entregue: number;
  saldo: number;

  custo_total: number;
  custo_entregue: number;
  saldo_custo: number;
}

export interface ImpostoGrupoKpis {
  icms: number;
  pis: number;
  cofins: number;
  federais: number;
  total_tributos: number;
  comissao: number;
}

export interface ImpostosKpis {
  vendas: ImpostoGrupoKpis;
  devolucoes: ImpostoGrupoKpis;
  interno_obras: ImpostoGrupoKpis;
  remessa_futura: ImpostoGrupoKpis;
  consolidado_liquido: ImpostoGrupoKpis;
}

export interface DashboardKpis {
  vendas: VendasKpis;
  interno_obras: InternoObrasKpis;
  remessa_futura: RemessaFuturaKpis;
  impostos: ImpostosKpis;
}

export interface DashboardResponse {
  filters: DashboardFilters;
  kpis: DashboardKpis;
  projeto: ProjetoResumo;
}

export interface RemessaNota {
  nunota: number;
  numnota: number;
  dtneg: string | null;

  codproj: number;
  projeto: string;

  codparc: number;
  parceiro: string;
  cgc_cpf: string;

  codtipoper: number;
  descroper: string;
  tipo_movimento: string;

  codtipvenda: number;
  tipo_negociacao: string;

  vlrnota: number;
  vlricms: number;
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

export interface RemessaItem {
  nunota: number;
  numnota: number;
  sequencia: number;

  codprod: number;
  descrprod: string;
  codvol: string;

  qtd_total: number;
  qtd_entregue: number;
  qtd_pendente: number;

  preco_liq_unitario: number;

  custo_medio_sem_icms: number;
  custo_total: number;
  custo_entregue: number;
  custo_pendente: number;

  vlr_total_item: number;
  vlr_entregue_item: number;
  vlr_saldo_item: number;

  perc_entrega: number;
  status_item: string;
}

export interface RemessaControlResumo {
  qtd_total: number;
  qtd_entregue: number;
  qtd_pendente: number;

  vlr_total_item: number;
  vlr_entregue_item: number;
  vlr_saldo_item: number;

  custo_total: number;
  custo_entregue: number;
  custo_pendente: number;

  perc_entrega: number;
}

export interface RemessaControlResponse {
  filters: DashboardFilters;

  count_remessas: number;
  count_itens: number;

  remessas: RemessaNota[];
  resumo: RemessaControlResumo;
  itens: RemessaItem[];
}

export interface ProjetoResumo {
  codproj: number;
  nome_projeto: string;
}