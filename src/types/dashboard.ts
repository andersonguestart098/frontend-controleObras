export interface DashboardFilters {
  codproj: number;
  dtneg_inicial: string | null;
  dtneg_final: string | null;
}

export interface VendasKpis {
  total_vendas: number;
  total_devolucoes: number;
  vendas_liquidas: number;

  custo_total: number;
  custo_devolucoes: number;
  custo_liquido: number;
}

export interface InternoObrasKpis {
  total_bruto: number;
  custo_bruto: number;
  resultado_apos_custo_bruto: number;

  total_devolucoes: number;
  custo_devolucoes: number;
  resultado_apos_custo_devolucoes: number;

  total: number;
  custo_total: number;
  resultado_apos_custo: number;
}

export interface DevolucoesInternoObrasKpis {
  quantidade_notas: number;

  total: number;
  custo_total: number;
  resultado_apos_custo: number;

  icms: number;
  pis: number;
  cofins: number;
  federais: number;
  total_tributos: number;

  gasto_fixo: number;
  irpj_cssl: number;
  comissao: number;

  gasto_total: number;
  valor_liquido: number;
}

/*
 * Resumo de notas no formato que o backend
 * devolve para compras, bonificados e
 * remessa de transporte.
 */
export interface NotasResumoKpis {
  quantidade_notas: number;

  valor_nota: number;

  valor_icms: number;
  valor_pis: number;
  valor_cofins: number;
  valor_impostos: number;

  perc_gasto_fixo: number;
  perc_irpj_cssl: number;
  perc_comissao: number;

  valor_gasto_fixo: number;
  valor_irpj_cssl: number;
  valor_comissao: number;

  valor_gasto_total: number;
  valor_liquido: number;

  custo_medio_sem_icms_total: number;
  custo_total?: number;
}

export interface RemessaFuturaKpis {
  total_faturamento: number;
  total_entregue: number;
  saldo: number;

  custo_total: number;
  custo_entregue: number;
  saldo_custo: number;

  /*
   * Quantidades das notas filhas.
   * Opcionais enquanto o backend não envia.
   */
  qtd_total?: number;
  qtd_entregue?: number;
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
  devolucoes_interno_obras: ImpostoGrupoKpis;

  remessa_futura: ImpostoGrupoKpis;
  consolidado_liquido: ImpostoGrupoKpis;
}

export interface DashboardKpis {
  vendas: VendasKpis;

  interno_obras: InternoObrasKpis;

  devolucoes_interno_obras:
    DevolucoesInternoObrasKpis;

  compras?: NotasResumoKpis;
  bonificados?: NotasResumoKpis;

  remessa_futura: RemessaFuturaKpis;

  /*
   * Dados reais das notas filhas TOP 1157,
   * vindos de remessas_transporte.sql.
   */
  remessa_transporte: NotasResumoKpis;

  impostos: ImpostosKpis;
}

export interface ProjetoResumo {
  codproj: number;
  nome_projeto: string;
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