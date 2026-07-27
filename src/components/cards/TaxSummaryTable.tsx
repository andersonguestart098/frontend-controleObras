import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import {
  Box,
  Card,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import type {
  DashboardKpis,
  ImpostoGrupoKpis,
  ImpostosKpis,
} from '@/types/dashboard';
import { formatCurrency } from '@/utils/formatters';

interface TaxSummaryTableProps {
  kpis: DashboardKpis | null | undefined;
}

interface TaxTableRow {
  key: string;
  label: string;

  valor: number;
  valorCusto: number | null;
  valorCustoEntregue: number | null;
  saldoCusto: number | null;

  impostos: ImpostoGrupoKpis;

  irpjCssl: number | null;
  comissao: number | null;

  negative?: boolean;
  consolidated?: boolean;
  remessa?: boolean;
  entrega?: boolean;
  bonificado?: boolean;
  internalReturn?: boolean;

  /*
   * A linha continua positiva para valor/custo,
   * mas os encargos são exibidos como abatimento.
   */
  taxNegative?: boolean;
}

interface SummaryItemProps {
  title: string;
  value: number;
  color: string;
  backgroundColor: string;
}

const IRPJ_CSSL_PERCENTUAL = 3.35;
const IRPJ_CSSL_RATE = 0.0335;

const taxColors = {
  valor: '#0f766e',
  custo: '#dc2626',
  custoEntregue: '#0284c7',
  saldoCusto: '#C18D34',

  icms: '#4f6edb',
  pis: '#84a914',
  cofins: '#575b7c',

  irpjCssl: '#9333ea',
  tributos: '#d97706',
  comissao: '#f97316',

  bonificado: '#C96A16',

  negative: '#dc2626',
  normal: '#0f172a',
  muted: '#94a3b8',
};

const emptyTaxGroup: ImpostoGrupoKpis = {
  icms: 0,
  pis: 0,
  cofins: 0,
  federais: 0,
  total_tributos: 0,
  comissao: 0,
};

const emptyImpostos: ImpostosKpis = {
  vendas: { ...emptyTaxGroup },
  devolucoes: { ...emptyTaxGroup },

  interno_obras: { ...emptyTaxGroup },

  devolucoes_interno_obras: {
    ...emptyTaxGroup,
  },

  remessa_futura: { ...emptyTaxGroup },

  consolidado_liquido: {
    ...emptyTaxGroup,
  },
};

const headerCellSx = {
  px: 1.1,
  py: 2.2,

  color: '#64748b',
  backgroundColor: '#f8fafc',

  borderBottom:
    '1px solid rgba(148, 163, 184, 0.20)',

  fontSize: '0.76rem',
  fontWeight: 900,
  letterSpacing: '0.02em',
  whiteSpace: 'nowrap',
};

const bodyCellSx = {
  px: 1.1,
  py: 2.4,

  color: taxColors.normal,

  borderBottom:
    '1px solid rgba(148, 163, 184, 0.13)',

  fontSize: '0.95rem',
  fontWeight: 600,
  whiteSpace: 'nowrap',
};

/*
 * A coluna de origem fica fixa na esquerda
 * quando ainda sobra scroll horizontal.
 */
const stickyCellSx = {
  position: 'sticky',
  left: 0,
  zIndex: 2,
};

function safeNumber(
  value: number | null | undefined,
): number {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : 0;
}

function negativeValue(
  value: number,
): number {
  const safeValue = safeNumber(value);

  if (safeValue === 0) {
    return 0;
  }

  return -Math.abs(safeValue);
}

/*
 * SALDO CUSTO:
 *
 * Valor custo - Valor custo entregue.
 *
 * Representa o custo que ainda não foi
 * baixado pela entrega.
 *
 * Quando a linha não possui nenhum dos
 * dois valores, o saldo não se aplica.
 */

function calculateSaldoCusto(
  custo: number | null,
  custoEntregue: number | null,
): number | null {
  if (
    custo === null &&
    custoEntregue === null
  ) {
    return null;
  }

  return Number(
    (
      safeNumber(custo) -
      safeNumber(custoEntregue)
    ).toFixed(2),
  );
}

function normalizeTaxGroup(
  group:
    | ImpostoGrupoKpis
    | null
    | undefined,
): ImpostoGrupoKpis {
  return {
    icms: safeNumber(group?.icms),
    pis: safeNumber(group?.pis),
    cofins: safeNumber(group?.cofins),
    federais: safeNumber(group?.federais),

    total_tributos: safeNumber(
      group?.total_tributos,
    ),

    comissao: safeNumber(
      group?.comissao,
    ),
  };
}

function negativeTaxGroup(
  group:
    | ImpostoGrupoKpis
    | null
    | undefined,
): ImpostoGrupoKpis {
  const normalized =
    normalizeTaxGroup(group);

  return {
    icms: negativeValue(
      normalized.icms,
    ),

    pis: negativeValue(
      normalized.pis,
    ),

    cofins: negativeValue(
      normalized.cofins,
    ),

    federais: negativeValue(
      normalized.federais,
    ),

    total_tributos: negativeValue(
      normalized.total_tributos,
    ),

    comissao: negativeValue(
      normalized.comissao,
    ),
  };
}

function sumTaxGroups(
  ...groups: Array<
    ImpostoGrupoKpis | null | undefined
  >
): ImpostoGrupoKpis {
  return groups.reduce<ImpostoGrupoKpis>(
    (total, group) => {
      const normalized =
        normalizeTaxGroup(group);

      return {
        icms:
          total.icms +
          normalized.icms,

        pis:
          total.pis +
          normalized.pis,

        cofins:
          total.cofins +
          normalized.cofins,

        federais:
          total.federais +
          normalized.federais,

        total_tributos:
          total.total_tributos +
          normalized.total_tributos,

        comissao:
          total.comissao +
          normalized.comissao,
      };
    },
    {
      ...emptyTaxGroup,
    },
  );
}

function calculateIrpjCssl(
  value: number,
): number {
  return Number(
    (
      safeNumber(value) *
      IRPJ_CSSL_RATE
    ).toFixed(2),
  );
}

function SummaryItem({
  title,
  value,
  color,
  backgroundColor,
}: SummaryItemProps) {
  return (
    <Box
      sx={{
        minWidth: {
          xs: '100%',
          sm: 190,
        },

        px: 2,
        py: 1.3,

        borderRadius: 2.5,

        backgroundColor,

        border:
          '1px solid rgba(148, 163, 184, 0.12)',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          display: 'block',

          color: '#64748b',

          fontWeight: 700,
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          mt: 0.35,

          color,

          fontSize: '1.05rem',
          lineHeight: 1.2,
          fontWeight: 900,
          letterSpacing: '-0.02em',
        }}
      >
        {formatCurrency(
          safeNumber(value),
        )}
      </Typography>
    </Box>
  );
}

function CurrencyCell({
  value,
  color,
  emphasized = false,
  negative = false,
}: {
  value: number | null;
  color: string;
  emphasized?: boolean;
  negative?: boolean;
}) {
  const finalColor = negative
    ? taxColors.negative
    : emphasized
      ? color
      : taxColors.normal;

  return (
    <TableCell
      align="right"
      sx={{
        ...bodyCellSx,

        color: finalColor,

        fontWeight: emphasized
          ? 900
          : negative
            ? 800
            : 650,
      }}
    >
      {value === null ? (
        <Typography
          component="span"
          sx={{
            color: taxColors.muted,
            fontSize: '0.82rem',
            fontWeight: 700,
          }}
        >
          —
        </Typography>
      ) : (
        formatCurrency(
          safeNumber(value),
        )
      )}
    </TableCell>
  );
}

function SaldoCustoCell({
  value,
  consolidated = false,
}: {
  value: number | null;
  consolidated?: boolean;
}) {
  if (value === null) {
    return (
      <TableCell
        align="right"
        sx={bodyCellSx}
      >
        <Typography
          component="span"
          sx={{
            color: taxColors.muted,
            fontSize: '0.82rem',
            fontWeight: 700,
          }}
        >
          —
        </Typography>
      </TableCell>
    );
  }

  const safeValue =
    safeNumber(value);

  const finalColor =
    safeValue < 0
      ? taxColors.negative
      : safeValue === 0
        ? taxColors.muted
        : taxColors.saldoCusto;

  return (
    <TableCell
      align="right"
      sx={{
        ...bodyCellSx,

        color: finalColor,

        fontWeight: consolidated
          ? 900
          : 750,
      }}
    >
      {formatCurrency(safeValue)}
    </TableCell>
  );
}

function TaxCell({
  value,
  color,
  consolidated = false,
  negative = false,
}: {
  value: number | null;
  color: string;
  consolidated?: boolean;
  negative?: boolean;
}) {
  if (value === null) {
    return (
      <TableCell
        align="right"
        sx={bodyCellSx}
      >
        <Chip
          size="small"
          label="Não se aplica"
          sx={{
            height: 24,

            color: '#64748b',

            backgroundColor:
              'rgba(100, 116, 139, 0.09)',

            fontSize: '0.68rem',
            fontWeight: 800,
          }}
        />
      </TableCell>
    );
  }

  const finalColor = negative
    ? taxColors.negative
    : consolidated
      ? color
      : taxColors.normal;

  return (
    <TableCell
      align="right"
      sx={{
        ...bodyCellSx,

        color: finalColor,

        fontWeight: consolidated
          ? 900
          : negative
            ? 800
            : 650,
      }}
    >
      {formatCurrency(
        safeNumber(value),
      )}
    </TableCell>
  );
}

function IrpjCsslCell({
  value,
  consolidated = false,
  negative = false,
}: {
  value: number | null;
  consolidated?: boolean;
  negative?: boolean;
}) {
  if (value === null) {
    return (
      <TableCell
        align="right"
        sx={bodyCellSx}
      >
        <Chip
          size="small"
          label="Não se aplica"
          sx={{
            height: 24,

            color: '#64748b',

            backgroundColor:
              'rgba(100, 116, 139, 0.09)',

            fontSize: '0.68rem',
            fontWeight: 800,
          }}
        />
      </TableCell>
    );
  }

  const finalColor = negative
    ? taxColors.negative
    : consolidated
      ? taxColors.irpjCssl
      : taxColors.normal;

  return (
    <TableCell
      align="right"
      sx={{
        ...bodyCellSx,

        color: finalColor,

        fontWeight: consolidated
          ? 900
          : negative
            ? 800
            : 650,
      }}
    >
      {formatCurrency(
        safeNumber(value),
      )}
    </TableCell>
  );
}

export function TaxSummaryTable({
  kpis,
}: TaxSummaryTableProps) {
  if (!kpis) {
    return (
      <Card
        component="section"
        sx={{
          width: {
            xs: '100%',
            lg: 'min(1800px, calc(100vw - 32px))',
          },

          maxWidth: 'none',

          position: {
            lg: 'relative',
          },

          left: {
            lg: '50%',
          },

          transform: {
            lg: 'translateX(-50%)',
          },

          border: 'none',
          borderRadius: 3,

          backgroundColor: '#ffffff',

          boxShadow:
            '0 3px 10px rgba(15, 23, 42, 0.07), ' +
            '0 12px 30px rgba(15, 23, 42, 0.06)',

          overflow: 'hidden',
        }}
      >
        <Typography
          sx={{
            color: '#b91c1c',
            fontWeight: 800,
          }}
        >
          Os dados de tributos ainda não estão
          disponíveis.
        </Typography>
      </Card>
    );
  }

  const impostos =
    kpis.impostos ??
    emptyImpostos;

  /*
   * VALORES
   */

  const valorVendas =
    safeNumber(
      kpis.vendas?.total_vendas,
    );

  const valorDevolucoes =
    negativeValue(
      safeNumber(
        kpis.vendas?.total_devolucoes,
      ),
    );

  const valorInternoObrasBruto =
    safeNumber(
      kpis.interno_obras
        ?.total_bruto ??
      kpis.interno_obras?.total,
    );

  const valorDevolucoesInternoObras =
    negativeValue(
      safeNumber(
        kpis.devolucoes_interno_obras
          ?.total,
      ),
    );

  /*
   * BONIFICAÇÕES:
   *
   * valor da nota, sem receita efetiva,
   * mas dentro da base de IRPJ/CSLL.
   */

  const valorBonificados =
    safeNumber(
      kpis.bonificados?.valor_nota,
    );

  /*
   * REMESSA FUTURA:
   * valor faturado da nota principal.
   */

  const valorRemessaFutura =
    safeNumber(
      kpis.remessa_futura
        ?.total_faturamento,
    );

  /*
   * REMESSA TRANSPORTE:
   * valor real das notas filhas TOP 1157,
   * vindo de remessas_transporte.sql.
   */

  const valorRemessaTransporte =
    safeNumber(
      kpis.remessa_transporte
        ?.valor_nota,
    );

  /*
   * CONSOLIDADO:
   *
   * Vendas
   * - devoluções
   * + Bonificações
   * + Interno Obras
   * + Remessa futura
   *
   * A bonificação entra porque compõe a base
   * de IRPJ/CSLL, mesmo sem receita efetiva.
   *
   * A Remessa transporte fica de fora:
   * ela é a entrega das notas filhas da
   * própria Remessa futura, cujo valor
   * já foi faturado e contado acima.
   *
   * Mesma regra usada nos impostos, no
   * IRPJ/CSLL e na comissão.
   */

  const valorConsolidado =
    valorVendas +
    valorDevolucoes +
    valorBonificados +
    valorInternoObrasBruto +
    valorDevolucoesInternoObras +
    valorRemessaFutura;

  /*
   * CUSTOS
   */

  const custoVendas =
    safeNumber(
      kpis.vendas?.custo_total,
    );

  /*
   * DEVOLUÇÕES:
   *
   * mesmo custo médio dos itens da nota,
   * separado apenas pelas TOPs 12xx.
   *
   * A mercadoria voltou, então o custo
   * entregue é estornado.
   */

  const custoDevolucoes =
    safeNumber(
      kpis.vendas?.custo_devolucoes,
    );

  const custoInternoObrasBruto =
    safeNumber(
      kpis.interno_obras
        ?.custo_bruto ??
      kpis.interno_obras
        ?.custo_total,
    );

  const custoDevolucoesInternoObras =
    negativeValue(
      safeNumber(
        kpis.devolucoes_interno_obras
          ?.custo_total,
      ),
    );

  /*
   * BONIFICADOS:
   *
   * o contrário da devolução.
   *
   * A mercadoria sai e não volta, então o
   * custo soma em vez de estornar.
   */

  const custoBonificados =
    safeNumber(
      kpis.bonificados
        ?.custo_medio_sem_icms_total,
    );

  const custoRemessaFutura =
    safeNumber(
      kpis.remessa_futura
        ?.custo_total,
    );

  const custoRemessaTransporte =
    safeNumber(
      kpis.remessa_transporte
        ?.custo_medio_sem_icms_total ??
      kpis.remessa_transporte
        ?.custo_total,
    );

  /*
   * CUSTO ENTREGUE:
   *
   * Vendas e Interno Obras são entregues
   * no ato, então o custo aparece apenas
   * como custo entregue, nunca nas duas
   * colunas ao mesmo tempo.
   *
   * Remessa futura ainda não teve entrega,
   * a baixa acontece na Remessa transporte.
   */

  const custoEntregueVendas =
    custoVendas;

  const custoEntregueDevolucoes =
    negativeValue(custoDevolucoes);

  const custoEntregueInternoObras =
    custoInternoObrasBruto;

  const custoEntregueDevolucoesInternoObras =
    custoDevolucoesInternoObras;

  const custoEntregueRemessaTransporte =
    custoRemessaTransporte;

  const custoEntregueBonificados =
    custoBonificados;

  const custoEntregueConsolidado =
    custoEntregueVendas +
    custoEntregueDevolucoes +
    custoEntregueInternoObras +
    custoEntregueDevolucoesInternoObras +
    custoEntregueBonificados +
    custoEntregueRemessaTransporte;

  /*
   * VALOR CUSTO (coluna):
   *
   * Custo total da nota, seja remessa ou não.
   *
   * As três colunas respondem coisas
   * diferentes:
   *
   * - Valor custo: quanto a operação custou
   * - Custo entregue: quanto já saiu
   * - Saldo custo: quanto falta sair
   *
   * A Remessa transporte não tem custo próprio:
   * ela apenas entrega o custo que já está na
   * Remessa futura.
   */

  const custoConsolidado =
    custoVendas +
    custoEntregueDevolucoes +
    custoBonificados +
    custoInternoObrasBruto +
    custoDevolucoesInternoObras +
    custoRemessaFutura;

  /*
   * SALDO DE CUSTO POR LINHA:
   *
   * Valor custo menos custo entregue.
   *
   * Vendas, Devoluções, Bonificações e Interno
   * Obras entregam no ato, logo saldo zero.
   *
   * Remessa futura carrega o custo pendente
   * e a Remessa transporte abate esse custo
   * conforme entrega as notas filhas.
   */

  const saldoCustoVendas =
    calculateSaldoCusto(
      custoVendas,
      custoEntregueVendas,
    );

  const saldoCustoDevolucoes =
    calculateSaldoCusto(
      custoEntregueDevolucoes,
      custoEntregueDevolucoes,
    );

  const saldoCustoInternoObras =
    calculateSaldoCusto(
      custoInternoObrasBruto,
      custoEntregueInternoObras,
    );

  const saldoCustoDevolucoesInternoObras =
    calculateSaldoCusto(
      custoDevolucoesInternoObras,
      custoEntregueDevolucoesInternoObras,
    );

  /*
   * A bonificação entrega no ato, então não
   * sobra saldo.
   */

  const saldoCustoBonificados =
    calculateSaldoCusto(
      custoBonificados,
      custoEntregueBonificados,
    );

  const saldoCustoRemessaFutura =
    calculateSaldoCusto(
      custoRemessaFutura,
      null,
    );

  const saldoCustoRemessaTransporte =
    calculateSaldoCusto(
      null,
      custoEntregueRemessaTransporte,
    );

  const saldoCustoConsolidado =
    Number(
      (
        safeNumber(
          saldoCustoVendas,
        ) +
        safeNumber(
          saldoCustoDevolucoes,
        ) +
        safeNumber(
          saldoCustoInternoObras,
        ) +
        safeNumber(
          saldoCustoDevolucoesInternoObras,
        ) +
        safeNumber(
          saldoCustoBonificados,
        ) +
        safeNumber(
          saldoCustoRemessaFutura,
        ) +
        safeNumber(
          saldoCustoRemessaTransporte,
        )
      ).toFixed(2),
    );

  /*
   * IRPJ/CSLL = 3,35% SOBRE O VALOR.
   *
   * APLICA-SE:
   * - Vendas
   * - Devoluções, subtraindo
   * - Bonificações
   * - Interno Obras
   * - Remessa futura
   *
   * REMESSA TRANSPORTE:
   * abate proporcionalmente o IRPJ/CSLL
   * correspondente ao valor já entregue.
   */

  const irpjCsslVendas =
    calculateIrpjCssl(
      valorVendas,
    );

  const irpjCsslDevolucoes =
    negativeValue(
      calculateIrpjCssl(
        Math.abs(
          valorDevolucoes,
        ),
      ),
    );

  const irpjCsslBonificados =
    calculateIrpjCssl(
      valorBonificados,
    );

  const irpjCsslInternoObras =
    calculateIrpjCssl(
      valorInternoObrasBruto,
    );

  const irpjCsslDevolucoesInternoObras =
    negativeValue(
      kpis.devolucoes_interno_obras
        ?.irpj_cssl == null
        ? calculateIrpjCssl(
            Math.abs(
              valorDevolucoesInternoObras,
            ),
          )
        : safeNumber(
            kpis.devolucoes_interno_obras
              .irpj_cssl,
          ),
    );

  const irpjCsslRemessaFutura =
    calculateIrpjCssl(
      valorRemessaFutura,
    );

  const irpjCsslConsolidado =
    irpjCsslVendas +
    irpjCsslDevolucoes +
    irpjCsslBonificados +
    irpjCsslInternoObras +
    irpjCsslDevolucoesInternoObras +
    irpjCsslRemessaFutura;

  /*
   * IMPOSTOS
   */

  const impostosVendas =
    normalizeTaxGroup(
      impostos.vendas,
    );

  const impostosDevolucoes =
    negativeTaxGroup(
      impostos.devolucoes,
    );

  const impostosInternoObrasLiquido =
    normalizeTaxGroup(
      impostos.interno_obras,
    );

  const impostosDevolucoesInternoObrasPositivos =
    normalizeTaxGroup(
      impostos.devolucoes_interno_obras,
    );

  /*
   * O backend entrega Interno Obras líquido.
   *
   * líquido + devolução = valor bruto.
   */
  const impostosInternoObrasBruto =
    sumTaxGroups(
      impostosInternoObrasLiquido,
      impostosDevolucoesInternoObrasPositivos,
    );

  const impostosDevolucoesInternoObras =
    negativeTaxGroup(
      impostos.devolucoes_interno_obras,
    );

  /*
   * Os impostos da operação permanecem
   * na Remessa futura.
   */

  const impostosRemessaFutura =
    normalizeTaxGroup(
      impostos.remessa_futura,
    );

  /*
   * A Remessa transporte usa os impostos reais
   * das notas filhas TOP 1157, retornados pelo
   * grupo próprio remessa_transporte.
   *
   * Os valores são mantidos positivos no backend
   * e exibidos como abatimento nesta tabela.
   */
  const impostosRemessaTransporte =
    negativeTaxGroup({
      icms: safeNumber(
        kpis.remessa_transporte
          ?.valor_icms,
      ),

      pis: safeNumber(
        kpis.remessa_transporte
          ?.valor_pis,
      ),

      cofins: safeNumber(
        kpis.remessa_transporte
          ?.valor_cofins,
      ),

      federais:
        safeNumber(
          kpis.remessa_transporte
            ?.valor_pis,
        ) +
        safeNumber(
          kpis.remessa_transporte
            ?.valor_cofins,
        ),

      total_tributos: safeNumber(
        kpis.remessa_transporte
          ?.valor_impostos,
      ),

      comissao: safeNumber(
        kpis.remessa_transporte
          ?.valor_comissao,
      ),
    });

  /*
   * O ICMS da bonificação é pago pela
   * empresa, então entra como imposto real.
   */

  const impostosBonificados =
    normalizeTaxGroup({
      icms: safeNumber(
        kpis.bonificados?.valor_icms,
      ),

      pis: safeNumber(
        kpis.bonificados?.valor_pis,
      ),

      cofins: safeNumber(
        kpis.bonificados?.valor_cofins,
      ),

      federais: 0,

      total_tributos: safeNumber(
        kpis.bonificados?.valor_impostos,
      ),

      comissao: 0,
    });

  /*
   * O consolidado do backend ainda não
   * considera os bonificados, então somamos
   * aqui para a coluna fechar.
   */

  const impostosConsolidado =
    sumTaxGroups(
      impostosVendas,
      impostosDevolucoes,
      impostosBonificados,

      impostosInternoObrasBruto,
      impostosDevolucoesInternoObras,

      impostosRemessaFutura,
      impostosRemessaTransporte,
    );

  const rows: TaxTableRow[] = [
    {
      key: 'vendas',
      label: 'Vendas',

      valor: valorVendas,

      valorCusto:
        custoVendas,

      valorCustoEntregue:
        custoEntregueVendas,

      saldoCusto:
        saldoCustoVendas,

      impostos:
        impostosVendas,

      irpjCssl:
        irpjCsslVendas,

      comissao:
        impostosVendas.comissao,
    },

    {
      key: 'devolucoes',
      label: 'Devoluções',

      valor:
        valorDevolucoes,

      valorCusto:
        custoEntregueDevolucoes,

      valorCustoEntregue:
        custoEntregueDevolucoes,

      saldoCusto:
        saldoCustoDevolucoes,

      impostos:
        impostosDevolucoes,

      irpjCssl:
        irpjCsslDevolucoes,

      comissao:
        impostosDevolucoes.comissao,

      negative: true,
    },

    {
      key: 'bonificados',
      label: 'Bonificações',

      valor: valorBonificados,

      valorCusto:
        custoBonificados,

      valorCustoEntregue:
        custoEntregueBonificados,

      saldoCusto:
        saldoCustoBonificados,

      impostos:
        impostosBonificados,

      irpjCssl:
        irpjCsslBonificados,

      comissao: null,

      bonificado: true,
    },

    {
      key: 'interno_obras',
      label: 'Interno Obras',

      valor:
        valorInternoObrasBruto,

      valorCusto:
        custoInternoObrasBruto,

      valorCustoEntregue:
        custoEntregueInternoObras,

      saldoCusto:
        saldoCustoInternoObras,

      impostos:
        impostosInternoObrasBruto,

      irpjCssl:
        irpjCsslInternoObras,

      comissao:
        impostosInternoObrasBruto.comissao,
    },

    {
      key: 'devolucoes_interno_obras',
      label: 'Devoluções Interno Obras',

      valor:
        valorDevolucoesInternoObras,

      valorCusto:
        custoDevolucoesInternoObras,

      valorCustoEntregue:
        custoEntregueDevolucoesInternoObras,

      saldoCusto:
        saldoCustoDevolucoesInternoObras,

      impostos:
        impostosDevolucoesInternoObras,

      irpjCssl:
        irpjCsslDevolucoesInternoObras,

      comissao:
        impostosDevolucoesInternoObras.comissao,

      negative: true,
      internalReturn: true,
    },

    {
      key: 'remessa_futura',
      label: 'Remessa futura',

      valor:
        valorRemessaFutura,

      valorCusto:
        custoRemessaFutura,

      valorCustoEntregue:
        null,

      saldoCusto:
        saldoCustoRemessaFutura,

      impostos:
        impostosRemessaFutura,

      irpjCssl:
        irpjCsslRemessaFutura,

      comissao:
        impostosRemessaFutura.comissao,

      remessa: true,
    },

    {
      key: 'remessa_transporte',
      label: 'Remessa transporte',

      valor:
        valorRemessaTransporte,

      valorCusto:
        null,

      valorCustoEntregue:
        custoEntregueRemessaTransporte,

      saldoCusto:
        saldoCustoRemessaTransporte,

      impostos:
        impostosRemessaTransporte,

      irpjCssl: null,
      comissao: null,

      remessa: true,
      entrega: true,
      taxNegative: true,
    },

    {
      key: 'consolidado_liquido',
      label: 'Consolidado líquido',

      valor:
        valorConsolidado,

      valorCusto:
        custoConsolidado,

      valorCustoEntregue:
        custoEntregueConsolidado,

      saldoCusto:
        saldoCustoConsolidado,

      impostos:
        impostosConsolidado,

      irpjCssl:
        irpjCsslConsolidado,

      comissao:
        impostosConsolidado.comissao,

      consolidated: true,
    },
  ];

  return (
    <Card
      component="section"
      sx={{
        width: {
          xs: '100%',
          lg: 'min(1800px, calc(100vw - 32px))',
        },

        maxWidth: 'none',

        position: {
          lg: 'relative',
        },

        left: {
          lg: '50%',
        },

        transform: {
          lg: 'translateX(-50%)',
        },

        border: 'none',
        borderRadius: 3,

        backgroundColor: '#ffffff',

        boxShadow:
          '0 3px 10px rgba(15, 23, 42, 0.07), ' +
          '0 12px 30px rgba(15, 23, 42, 0.06)',

        overflow: 'hidden',
      }}
    >
      {/* CABEÇALHO */}

      <Box
        sx={{
          display: 'flex',

          alignItems: {
            xs: 'flex-start',
            md: 'center',
          },

          justifyContent:
            'space-between',

          flexDirection: {
            xs: 'column',
            md: 'row',
          },

          gap: 2.5,

          px: {
            xs: 2,
            md: 2.5,
          },

          pt: {
            xs: 2,
            md: 2.5,
          },

          pb: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.3,
          }}
        >
          <Box
            sx={{
              width: 42,
              height: 42,

              display: 'grid',
              placeItems: 'center',

              flexShrink: 0,

              borderRadius: 2.5,

              color: '#4f6edb',

              backgroundColor:
                'rgba(79, 110, 219, 0.11)',
            }}
          >
            <AccountBalanceRoundedIcon />
          </Box>

          <Box>
            <Typography
              component="h2"
              sx={{
                color: '#0f172a',

                fontSize: {
                  xs: '1.05rem',
                  md: '1.2rem',
                },

                fontWeight: 900,

                letterSpacing:
                  '-0.025em',
              }}
            >
              Tributos, custos e comissão
            </Typography>

            <Typography
              sx={{
                mt: 0.3,

                color: '#64748b',

                fontSize: '0.875rem',

                fontWeight: 500,
              }}
            >
              Valores, custos e encargos
              separados por origem.
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'stretch',
            flexWrap: 'wrap',
            gap: 1.2,

            width: {
              xs: '100%',
              md: 'auto',
            },
          }}
        >
          <SummaryItem
            title="Tributos consolidados"
            value={
              impostosConsolidado
                .total_tributos +
              irpjCsslConsolidado
            }
            color={
              taxColors.tributos
            }
            backgroundColor="rgba(245, 158, 11, 0.08)"
          />

          <SummaryItem
            title="Comissão consolidada"
            value={
              impostosConsolidado
                .comissao
            }
            color={
              taxColors.comissao
            }
            backgroundColor="rgba(249, 115, 22, 0.08)"
          />
        </Box>
      </Box>

      {/* LEGENDA */}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,

          px: {
            xs: 2,
            md: 2.5,
          },

          pb: 2,
        }}
      >
        <Chip
          size="small"
          label="Valor"
          sx={{
            color: taxColors.valor,

            backgroundColor:
              'rgba(15, 118, 110, 0.10)',

            fontWeight: 800,
          }}
        />

        <Chip
          size="small"
          label="Valor custo"
          sx={{
            color: taxColors.custo,

            backgroundColor:
              'rgba(220, 38, 38, 0.09)',

            fontWeight: 800,
          }}
        />

        <Chip
          size="small"
          label="Custo entregue"
          sx={{
            color:
              taxColors.custoEntregue,

            backgroundColor:
              'rgba(2, 132, 199, 0.09)',

            fontWeight: 800,
          }}
        />

        <Chip
          size="small"
          label="Saldo custo"
          sx={{
            color:
              taxColors.saldoCusto,

            backgroundColor:
              'rgba(193, 141, 52, 0.12)',

            fontWeight: 800,
          }}
        />

        <Chip
          size="small"
          label="ICMS"
          sx={{
            color: taxColors.icms,

            backgroundColor:
              'rgba(79, 110, 219, 0.10)',

            fontWeight: 800,
          }}
        />

        <Chip
          size="small"
          label="PIS"
          sx={{
            color: taxColors.pis,

            backgroundColor:
              'rgba(132, 169, 20, 0.10)',

            fontWeight: 800,
          }}
        />

        <Chip
          size="small"
          label="COFINS"
          sx={{
            color: taxColors.cofins,

            backgroundColor:
              'rgba(87, 91, 124, 0.10)',

            fontWeight: 800,
          }}
        />

        <Chip
          size="small"
          label={`IRPJ/CSLL ${IRPJ_CSSL_PERCENTUAL}%`}
          sx={{
            color:
              taxColors.irpjCssl,

            backgroundColor:
              'rgba(147, 51, 234, 0.09)',

            fontWeight: 800,
          }}
        />

        <Chip
          size="small"
          label="Tributos"
          sx={{
            color:
              taxColors.tributos,

            backgroundColor:
              'rgba(245, 158, 11, 0.10)',

            fontWeight: 800,
          }}
        />

        <Chip
          size="small"
          label="Comissão"
          sx={{
            color:
              taxColors.comissao,

            backgroundColor:
              'rgba(249, 115, 22, 0.10)',

            fontWeight: 800,
          }}
        />
      </Box>

      {/* TABELA */}

      <TableContainer
        sx={{
          mx: {
            xs: 1.5,
            md: 2,
          },

          mb: {
            xs: 1.5,
            md: 2,
          },

          width: 'auto',

          overflowX: 'auto',

          borderRadius: 2.5,

          border:
            '1px solid rgba(148, 163, 184, 0.16)',
        }}
      >
        <Table
          size="small"
          sx={{
            width: '100%',

            minWidth: {
              xs: 1360,
              lg: 1280,
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  ...headerCellSx,
                  ...stickyCellSx,
                }}
              >
                Origem
              </TableCell>

              <TableCell
                align="right"
                sx={{
                  ...headerCellSx,
                  color:
                    taxColors.valor,
                }}
              >
                Valor
              </TableCell>

              <TableCell
                align="right"
                sx={{
                  ...headerCellSx,
                  color:
                    taxColors.custo,
                }}
              >
                Valor custo
              </TableCell>

              <TableCell
                align="right"
                sx={{
                  ...headerCellSx,

                  color:
                    taxColors
                      .custoEntregue,
                }}
              >
                Custo entregue
              </TableCell>

              <TableCell
                align="right"
                sx={{
                  ...headerCellSx,

                  color:
                    taxColors
                      .saldoCusto,
                }}
              >
                Saldo custo
              </TableCell>

              <TableCell
                align="right"
                sx={{
                  ...headerCellSx,
                  color:
                    taxColors.icms,
                }}
              >
                ICMS
              </TableCell>

              <TableCell
                align="right"
                sx={{
                  ...headerCellSx,
                  color:
                    taxColors.pis,
                }}
              >
                PIS
              </TableCell>

              <TableCell
                align="right"
                sx={{
                  ...headerCellSx,
                  color:
                    taxColors.cofins,
                }}
              >
                COFINS
              </TableCell>

              <TableCell
                align="right"
                sx={{
                  ...headerCellSx,

                  color:
                    taxColors
                      .irpjCssl,
                }}
              >
                IRPJ/CSLL 3,35%
              </TableCell>

              <TableCell
                align="right"
                sx={{
                  ...headerCellSx,

                  color:
                    taxColors
                      .tributos,
                }}
              >
                Tributos
              </TableCell>

              <TableCell
                align="right"
                sx={{
                  ...headerCellSx,

                  color:
                    taxColors
                      .comissao,
                }}
              >
                Comissão
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row) => {
              const consolidated =
                row.consolidated ===
                true;

              const negative =
                row.negative === true;

              const internalReturn =
                row.internalReturn === true;

              const taxNegative =
                row.taxNegative === true;

              /*
               * A célula fixa precisa repetir o
               * fundo da linha, senão o conteúdo
               * passa por baixo dela no scroll.
               */
              const rowBackground =
                consolidated
                  ? '#eef1fb'
                  : negative
                    ? '#fdf3f3'
                    : '#ffffff';

              const rowHoverBackground =
                consolidated
                  ? '#e7ebf8'
                  : negative
                    ? '#fbebeb'
                    : '#f2f9fe';

              return (
                <TableRow
                  key={row.key}
                  hover={!consolidated}
                  sx={{
                    backgroundColor:
                      rowBackground,

                    '&:hover': {
                      backgroundColor:
                        rowHoverBackground,

                      '& td.origem-fixa': {
                        backgroundColor:
                          rowHoverBackground,
                      },
                    },

                    '&:last-child td': {
                      borderBottom:
                        'none',
                    },
                  }}
                >
                  <TableCell
                    className="origem-fixa"
                    sx={{
                      ...bodyCellSx,
                      ...stickyCellSx,

                      backgroundColor:
                        rowBackground,

                      color: negative
                        ? taxColors
                            .negative
                        : consolidated
                          ? '#0f172a'
                          : taxColors
                              .normal,

                      fontWeight:
                        consolidated
                          ? 900
                          : 750,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',

                        alignItems:
                          'center',

                        gap: 1.1,
                      }}
                    >
                      <Box
                        sx={{
                          width:
                            consolidated
                              ? 9
                              : 7,

                          height:
                            consolidated
                              ? 9
                              : 7,

                          flexShrink: 0,

                          borderRadius:
                            '50%',

                          backgroundColor:
                            negative
                              ? taxColors
                                  .negative
                              : consolidated
                                ? '#4f6edb'
                                : row.bonificado
                                  ? taxColors
                                      .bonificado
                                  : row.remessa
                                    ? '#0284c7'
                                    : '#cbd5e1',
                        }}
                      />

                      <Typography
                        component="span"
                        sx={{
                          color:
                            'inherit',

                          fontSize:
                            'inherit',

                          fontWeight:
                            'inherit',
                        }}
                      >
                        {row.label}
                      </Typography>

                      {negative ? (
                        <Chip
                          label={
                            internalReturn
                              ? 'ABATE INTERNO'
                              : 'SUBTRAI'
                          }
                          size="small"
                          sx={{
                            height: 21,
                            ml: 0.4,

                            color:
                              taxColors
                                .negative,

                            backgroundColor:
                              'rgba(220, 38, 38, 0.09)',

                            fontSize:
                              '0.60rem',

                            fontWeight:
                              900,
                          }}
                        />
                      ) : null}

                      {row.entrega ? (
                        <Chip
                          label={
                            row.bonificado
                              ? 'SÓ CUSTO'
                              : 'NÃO SOMA VALOR'
                          }
                          size="small"
                          sx={{
                            height: 21,
                            ml: 0.4,

                            color:
                              row.bonificado
                                ? taxColors
                                    .bonificado
                                : '#0284c7',

                            backgroundColor:
                              row.bonificado
                                ? 'rgba(201, 106, 22, 0.10)'
                                : 'rgba(2, 132, 199, 0.10)',

                            fontSize:
                              '0.60rem',

                            fontWeight:
                              900,
                          }}
                        />
                      ) : null}

                      {taxNegative ? (
                        <Chip
                          label="ABATE ENCARGOS"
                          size="small"
                          sx={{
                            height: 21,
                            ml: 0.4,

                            color:
                              taxColors.negative,

                            backgroundColor:
                              'rgba(220, 38, 38, 0.09)',

                            fontSize:
                              '0.60rem',

                            fontWeight:
                              900,
                          }}
                        />
                      ) : null}

                      {consolidated ? (
                        <Chip
                          label="TOTAL"
                          size="small"
                          sx={{
                            height: 21,
                            ml: 0.4,

                            color:
                              '#4f6edb',

                            backgroundColor:
                              'rgba(79, 110, 219, 0.11)',

                            fontSize:
                              '0.62rem',

                            fontWeight:
                              900,
                          }}
                        />
                      ) : null}
                    </Box>
                  </TableCell>

                  <CurrencyCell
                    value={row.valor}
                    color={
                      taxColors.valor
                    }
                    emphasized={
                      consolidated
                    }
                    negative={
                      negative
                    }
                  />

                  <CurrencyCell
                    value={
                      row.valorCusto
                    }
                    color={
                      taxColors.custo
                    }
                    emphasized={
                      consolidated
                    }
                  />

                  <CurrencyCell
                    value={
                      row
                        .valorCustoEntregue
                    }
                    color={
                      taxColors
                        .custoEntregue
                    }
                    emphasized={
                      consolidated
                    }
                    negative={
                      negative
                    }
                  />

                  <SaldoCustoCell
                    value={
                      row.saldoCusto
                    }
                    consolidated={
                      consolidated
                    }
                  />

                  <TaxCell
                    value={
                      row.impostos.icms
                    }
                    color={
                      taxColors.icms
                    }
                    consolidated={
                      consolidated
                    }
                    negative={
                      negative ||
                      taxNegative
                    }
                  />

                  <TaxCell
                    value={
                      row.impostos.pis
                    }
                    color={
                      taxColors.pis
                    }
                    consolidated={
                      consolidated
                    }
                    negative={
                      negative ||
                      taxNegative
                    }
                  />

                  <TaxCell
                    value={
                      row.impostos
                        .cofins
                    }
                    color={
                      taxColors.cofins
                    }
                    consolidated={
                      consolidated
                    }
                    negative={
                      negative ||
                      taxNegative
                    }
                  />

                  <IrpjCsslCell
                    value={
                      row.irpjCssl
                    }
                    consolidated={
                      consolidated
                    }
                    negative={
                      negative ||
                      taxNegative
                    }
                  />

                  <TaxCell
                    value={
                      consolidated
                        ? row.impostos
                            .total_tributos +
                          safeNumber(
                            row.irpjCssl,
                          )
                        : row.impostos
                            .total_tributos
                    }
                    color={
                      taxColors
                        .tributos
                    }
                    consolidated={
                      consolidated
                    }
                    negative={
                      negative ||
                      taxNegative
                    }
                  />

                  <TaxCell
                    value={
                      row.comissao
                    }
                    color={
                      taxColors
                        .comissao
                    }
                    consolidated={
                      consolidated
                    }
                    negative={
                      negative ||
                      taxNegative
                    }
                  />
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}