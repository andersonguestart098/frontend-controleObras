export interface DashboardFilters {
  codproj: number;
  dtneg_inicial: string | null;
  dtneg_final: string | null;
}

export interface ProjetoFiltro {
  codproj: number;
  identificacao: string | null;
  abreviatura: string | null;
  nome_projeto: string;
  label_projeto: string;
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
  valor_federais?: number;

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

export interface MaoDeObraKpis {
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
}

export interface PagamentosKpis {
  quantidade_titulos: number;
  quantidade_pagos: number;
  quantidade_vencidos: number;
  quantidade_em_aberto: number;

  valor_titulos: number;
  valor_pago: number;
  saldo_aberto: number;
  valor_vencido: number;
  valor_em_aberto: number;
}

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

export interface CompraItemDetalhado {
  sequencia: number;
  codprod: number;
  descrprod: string;
  unidade: string;
  controle: string;

  qtdneg: number;
  vlrunit: number;
  vlrtot: number;
  vlrdesc: number;
  vlr_item_liquido: number;

  cussemicm: number;
  custo_total_item: number;
}

export interface CompraPedidoDetalhado {
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
  vlrpis: number;
  vlrcofins: number;

  itens: CompraItemDetalhado[];
}

export interface ComprasDetalhesResponse {
  filters: DashboardFilters;
  count_compras: number;
  count_itens: number;
  compras: CompraPedidoDetalhado[];
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

export interface DespesasGeraisKpis {
  quantidade_despesas: number;
  quantidade_pagas: number;
  quantidade_vencidas: number;
  quantidade_em_aberto: number;

  total_despesas: number;
  total_pago: number;
  total_em_aberto: number;
  total_vencido: number;
}

export type DespesaGeralStatus =
  | 'PAGA'
  | 'VENCIDA'
  | 'EM ABERTO'
  | string;

export interface DespesaGeralItem {
  nufin: number;
  nunota: number | null;
  parcela: string | number | null;

  dtneg: string | null;
  dtvenc: string | null;
  dhbaixa: string | null;

  codproj: number;
  projeto: string;

  codnat: number;
  natureza: string;

  codparc: number;
  parceiro: string;
  cgc_cpf: string | null;

  historico: string | null;

  valor_despesa: number;
  valor_pago: number;
  valor_em_aberto: number;
  valor_vencido: number;

  status_despesa: DespesaGeralStatus;

  valor_movimento_bancario: number | null;
  data_movimento: string | null;
  mbc_recdesp: number | null;
  origmov: string | null;
  nubco: number | null;
}

export interface DespesasGeraisResponse {
  filters: DashboardFilters;
  count: number;
  despesas: DespesaGeralItem[];
}

export interface DashboardKpis {
  vendas: VendasKpis;

  interno_obras: InternoObrasKpis;

  devolucoes_interno_obras:
    DevolucoesInternoObrasKpis;

  compras?: NotasResumoKpis;
  bonificados?: NotasResumoKpis;

  mao_de_obra?: MaoDeObraKpis;
  pagamentos?: PagamentosKpis;

  despesas_gerais?: DespesasGeraisKpis;

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