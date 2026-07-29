import type { ReactNode } from 'react';

import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import PriceCheckOutlinedIcon from '@mui/icons-material/PriceCheckOutlined';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Tooltip,
  Typography,
} from '@mui/material';

import { RollingCurrency } from '@/components/common/RollingCurrency';
import type {
  DashboardKpis,
  ImpostoGrupoKpis,
} from '@/types/dashboard';
import {
  formatCurrency,
  formatPercentRatio,
} from '@/utils/formatters';

interface SummarySectionProps {
  kpis: DashboardKpis;
}

interface TwoColumnMetricProps {
  title: string;
  leftLabel: string;
  leftValue: number;
  leftColor: string;
  rightLabel: string;
  rightValue: number;
  rightColor: string;
  caption: string;
  icon: ReactNode;
  iconColor: string;
  backgroundColor: string;
}

interface OperationsBreakdownCardProps {
  salesValue: number;
  netSalesValue: number;

  returnsValue: number;
  returnsSalesValue: number;
  returnsSalesCost: number;
  returnsInternalValue: number;
  returnsInternalCost: number;

  totalCost: number;
  totalTaxes: number;
  totalCommission: number;

  internalValue: number;
  internalGrossValue: number;
  internalCost: number;
  internalReturnsValue: number;

  bonusValue: number;

  rollDelay?: number;
}

interface ResultBreakdownCardProps {
  grossMargin: number;
  netResult: number;
  operationalCost: number;

  consolidatedValue: number;
  totalCost: number;
  totalTaxes: number;
  totalCommission: number;

  rollDelay?: number;
}

const BUBBLE_COLOR = '#C96A16';

/*
 * Mesma alíquota usada na tabela de
 * "Tributos, custos e comissão" para o
 * IRPJ/CSLL sobre o valor de cada origem.
 */
const IRPJ_CSSL_RATE = 0.0335;
const OPERATIONAL_COST_RATE = 0.17;
const OPERATIONAL_COST_PERCENTUAL = 17;

function safeNumber(
  value: number | null | undefined,
): number {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : 0;
}

function roundMoney(value: number): number {
  return Number(safeNumber(value).toFixed(2));
}

const emptyTaxGroup: ImpostoGrupoKpis = {
  icms: 0,
  pis: 0,
  cofins: 0,
  federais: 0,
  total_tributos: 0,
  comissao: 0,
};

/*
 * Helpers de grupo de impostos idênticos aos
 * usados na TaxSummaryTable, para que os dois
 * componentes sempre fechem no mesmo total.
 */

function normalizeTaxGroup(
  group: ImpostoGrupoKpis | null | undefined,
): ImpostoGrupoKpis {
  return {
    icms: safeNumber(group?.icms),
    pis: safeNumber(group?.pis),
    cofins: safeNumber(group?.cofins),
    federais: safeNumber(group?.federais),

    total_tributos: safeNumber(
      group?.total_tributos,
    ),

    comissao: safeNumber(group?.comissao),
  };
}

function negativeTaxGroup(
  group: ImpostoGrupoKpis | null | undefined,
): ImpostoGrupoKpis {
  const normalized = normalizeTaxGroup(group);

  const negate = (value: number) =>
    value === 0 ? 0 : -Math.abs(value);

  return {
    icms: negate(normalized.icms),
    pis: negate(normalized.pis),
    cofins: negate(normalized.cofins),
    federais: negate(normalized.federais),

    total_tributos: negate(
      normalized.total_tributos,
    ),

    comissao: negate(normalized.comissao),
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
        icms: total.icms + normalized.icms,
        pis: total.pis + normalized.pis,
        cofins:
          total.cofins + normalized.cofins,
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
    { ...emptyTaxGroup },
  );
}

function safeRatio(
  numerator: number,
  denominator: number,
): number {
  if (!denominator) {
    return 0;
  }

  return numerator / denominator;
}

/*
 * Margem e resultado em um único card.
 *
 * Cada indicador assume verde quando positivo
 * e vermelho quando negativo. O custo operacional
 * de 17% aparece no rodapé como memória de cálculo.
 */
function ResultBreakdownCard({
  grossMargin,
  netResult,
  operationalCost,

  consolidatedValue,
  totalCost,
  totalTaxes,
  totalCommission,

  rollDelay = 300,
}: ResultBreakdownCardProps) {
  const netResultPositive = netResult >= 0;

  const netResultPercent = safeRatio(
    netResult,
    consolidatedValue,
  );

  const netResultColor = netResultPositive
    ? '#16a34a'
    : '#dc2626';

  const accentColor = netResultPositive
    ? '#16a34a'
    : '#dc2626';

  const backgroundColor = netResultPositive
    ? 'rgba(22, 163, 74, 0.055)'
    : 'rgba(220, 38, 38, 0.055)';

  return (
    <Tooltip
      title={
        <ResultBreakdownTooltip
          consolidatedValue={consolidatedValue}
          totalCost={totalCost}
          totalTaxes={totalTaxes}
          totalCommission={totalCommission}
          grossMargin={grossMargin}
          operationalCost={operationalCost}
          netResult={netResult}
        />
      }
      arrow
      placement="top"
      slotProps={richTooltipSlotProps}
    >
    <Card
      sx={{
        height: '100%',

        cursor: 'help',

        borderRadius: 2.5,
        border: 'none',
        backgroundColor: '#ffffff',

        boxShadow:
          '0 3px 10px rgba(15, 23, 42, 0.07), ' +
          '0 12px 30px rgba(15, 23, 42, 0.06)',

        transition:
          'transform 180ms ease, box-shadow 180ms ease',

        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow:
            '0 7px 20px rgba(15, 23, 42, 0.11), ' +
            '0 18px 38px rgba(15, 23, 42, 0.08)',
        },
      }}
    >
      <CardContent
        sx={{
          height: '100%',

          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',

          p: 1.6,

          backgroundColor,

          '&:last-child': {
            pb: 1.6,
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 1.1,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontWeight: 700,
              lineHeight: 1.25,
            }}
          >
            Resultado da obra
          </Typography>

          <Box
            sx={{
              width: 32,
              height: 32,

              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,

              borderRadius: 2,
              color: accentColor,
              backgroundColor: netResultPositive
                ? 'rgba(22, 163, 74, 0.11)'
                : 'rgba(220, 38, 38, 0.10)',

              '& svg': {
                fontSize: 18,
              },
            }}
          >
            <PriceCheckOutlinedIcon />
          </Box>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(2, minmax(0, 1fr))',
            gap: 1.5,
            mt: 0.85,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                color: '#64748b',
                fontSize: '0.61rem',
                fontWeight: 900,
                lineHeight: 1.15,
                textTransform: 'uppercase',
              }}
            >
              Vlr. custo op.
            </Typography>

            <Typography
              component="div"
              sx={{
                mt: 0.2,
                color: '#64748b',
                fontSize: {
                  xs: '1.02rem',
                  md: '1.2rem',
                },
                lineHeight: 1.15,
                fontWeight: 900,
                letterSpacing: '-0.025em',
                whiteSpace: 'nowrap',
              }}
            >
              <RollingCurrency
                value={operationalCost}
                startDelay={rollDelay}
                delayStep={55}
              />
            </Typography>

            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mt: 0.2,
                color: '#94a3b8',
                fontSize: '0.6rem',
                fontWeight: 750,
                whiteSpace: 'nowrap',
              }}
            >
              {OPERATIONAL_COST_PERCENTUAL}% do consolidado
            </Typography>
          </Box>

          <Box
            sx={{
              minWidth: 0,
              pl: 0.9,
              borderLeft:
                '1px solid rgba(148, 163, 184, 0.20)',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                color: '#64748b',
                fontSize: '0.61rem',
                fontWeight: 900,
                lineHeight: 1.15,
                textTransform: 'uppercase',
              }}
            >
              Resultado líquido
            </Typography>

            <Typography
              component="div"
              sx={{
                mt: 0.2,
                color: netResultColor,
                fontSize: {
                  xs: '1.02rem',
                  md: '1.2rem',
                },
                lineHeight: 1.15,
                fontWeight: 900,
                letterSpacing: '-0.025em',
                whiteSpace: 'nowrap',
              }}
            >
              <RollingCurrency
                value={netResult}
                startDelay={rollDelay + 160}
                delayStep={55}
              />
            </Typography>

            <Typography
              component="div"
              sx={{
                mt: 0.2,
                color: netResultColor,
                opacity: 0.72,
                fontSize: '0.65rem',
                fontWeight: 800,
                whiteSpace: 'nowrap',
              }}
            >
              ({formatPercentRatio(
                netResultPercent,
              )})
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
    </Tooltip>
  );
}


/*
 * Conteúdo do tooltip que explica como o valor
 * de "Devoluções" é composto: devolução normal
 * (vendas) + devolução de Interno Obras.
 */
function ReturnsBreakdownTooltip({
  salesValue,
  salesCost,
  internalValue,
  internalCost,
}: {
  salesValue: number;
  salesCost: number;
  internalValue: number;
  internalCost: number;
}) {
  const rows = [
    {
      key: 'vendas',
      label: 'Devolução de vendas',
      value: salesValue,
      cost: salesCost,
      color: '#dc2626',
    },
    {
      key: 'interno_obras',
      label: 'Devolução Interno Obras',
      value: internalValue,
      cost: internalCost,
      color: '#b91c1c',
    },
  ];

  const totalValue =
    salesValue + internalValue;

  const totalCost =
    salesCost + internalCost;

  return (
    <Box
      sx={{
        minWidth: 250,
        p: 0.5,
      }}
    >
      <Typography
        sx={{
          color: '#94a3b8',
          fontSize: '0.66rem',
          fontWeight: 900,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        Composição da devolução
      </Typography>

      <Box
        sx={{
          mt: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.9,
        }}
      >
        {rows.map((row) => (
          <Box
            key={row.key}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,

              pb: 0.9,

              borderBottom:
                '1px solid rgba(148, 163, 184, 0.18)',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.8,
              }}
            >
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  flexShrink: 0,
                  borderRadius: '50%',
                  backgroundColor: row.color,
                }}
              />

              <Typography
                sx={{
                  color: '#334155',
                  fontSize: '0.76rem',
                  fontWeight: 750,
                }}
              >
                {row.label}
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'right' }}>
              <Typography
                sx={{
                  color: row.color,
                  fontSize: '0.82rem',
                  fontWeight: 900,
                  whiteSpace: 'nowrap',
                }}
              >
                -{formatCurrency(
                  Math.abs(row.value),
                )}
              </Typography>

              <Typography
                sx={{
                  mt: 0.15,
                  color: '#94a3b8',
                  fontSize: '0.66rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}
              >
                Estornado: {formatCurrency(row.cost)}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          mt: 0.9,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Typography
          sx={{
            color: '#0f172a',
            fontSize: '0.72rem',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          Total
        </Typography>

        <Box sx={{ textAlign: 'right' }}>
          <Typography
            sx={{
              color: '#dc2626',
              fontSize: '0.85rem',
              fontWeight: 900,
              whiteSpace: 'nowrap',
            }}
          >
            -{formatCurrency(
              Math.abs(totalValue),
            )}
          </Typography>

          <Typography
            sx={{
              mt: 0.15,
              color: '#94a3b8',
              fontSize: '0.66rem',
              fontWeight: 700,
              whiteSpace: 'nowrap',
            }}
          >
            Estornado: {formatCurrency(totalCost)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

/*
 * Conteúdo do tooltip que explica como o
 * "Interno Obras Líquido" é composto: valor
 * bruto, custo e devolução até chegar no líquido.
 */
function InternalWorksBreakdownTooltip({
  grossValue,
  cost,
  returnsValue,
  netValue,
}: {
  grossValue: number;
  cost: number;
  returnsValue: number;
  netValue: number;
}) {
  const rows = [
    {
      key: 'bruto',
      label: 'Valor bruto',
      value: grossValue,
      color: '#0d9488',
    },
    {
      key: 'custo',
      label: 'Custo',
      value: cost,
      color: '#0f766e',
    },
    {
      key: 'devolucao',
      label: 'Devolução',
      value: -Math.abs(returnsValue),
      color: '#dc2626',
    },
  ];

  return (
    <Box
      sx={{
        minWidth: 230,
        p: 0.5,
      }}
    >
      <Typography
        sx={{
          color: '#94a3b8',
          fontSize: '0.66rem',
          fontWeight: 900,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        Composição Interno Obras
      </Typography>

      <Box
        sx={{
          mt: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.7,
        }}
      >
        {rows.map((row) => (
          <Box
            key={row.key}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,

              pb: 0.7,

              borderBottom:
                '1px solid rgba(148, 163, 184, 0.18)',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.8,
              }}
            >
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  flexShrink: 0,
                  borderRadius: '50%',
                  backgroundColor: row.color,
                }}
              />

              <Typography
                sx={{
                  color: '#334155',
                  fontSize: '0.76rem',
                  fontWeight: 750,
                }}
              >
                {row.label}
              </Typography>
            </Box>

            <Typography
              sx={{
                color: row.color,
                fontSize: '0.82rem',
                fontWeight: 900,
                whiteSpace: 'nowrap',
              }}
            >
              {row.value < 0 ? '-' : ''}
              {formatCurrency(Math.abs(row.value))}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          mt: 0.9,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Typography
          sx={{
            color: '#0f172a',
            fontSize: '0.72rem',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          Líquido
        </Typography>

        <Typography
          sx={{
            color: netValue >= 0
              ? '#16a34a'
              : '#dc2626',
            fontSize: '0.85rem',
            fontWeight: 900,
            whiteSpace: 'nowrap',
          }}
        >
          {formatCurrency(netValue)}
        </Typography>
      </Box>
    </Box>
  );
}

const richTooltipSlotProps = {
  tooltip: {
    sx: {
      backgroundColor: '#ffffff',
      color: '#0f172a',

      borderRadius: 2.5,
      border:
        '1px solid rgba(148, 163, 184, 0.16)',

      boxShadow:
        '0 16px 36px rgba(15, 23, 42, 0.18), ' +
        '0 4px 12px rgba(15, 23, 42, 0.08)',

      px: 1.6,
      py: 1.4,
    },
  },

  arrow: {
    sx: {
      color: '#ffffff',

      '&::before': {
        border:
          '1px solid rgba(148, 163, 184, 0.16)',
      },
    },
  },
} as const;

/*
 * Conteúdo do tooltip que explica, em cascata,
 * como o valor consolidado vira margem bruta e,
 * depois, resultado líquido.
 */
function ResultBreakdownTooltip({
  consolidatedValue,
  totalCost,
  totalTaxes,
  totalCommission,
  grossMargin,
  operationalCost,
  netResult,
}: {
  consolidatedValue: number;
  totalCost: number;
  totalTaxes: number;
  totalCommission: number;
  grossMargin: number;
  operationalCost: number;
  netResult: number;
}) {
  const netResultPercent = safeRatio(
    netResult,
    consolidatedValue,
  );

  const deductions = [
    {
      key: 'custo',
      label: 'Custo total',
      value: totalCost,
    },
    {
      key: 'tributos',
      label: 'Tributos',
      value: totalTaxes,
    },
    {
      key: 'comissao',
      label: 'Comissão',
      value: totalCommission,
    },
  ];

  const rowLabelSx = {
    color: '#64748b',
    fontSize: '0.73rem',
    fontWeight: 700,
  };

  const rowValueSx = {
    color: '#dc2626',
    fontSize: '0.78rem',
    fontWeight: 850,
    whiteSpace: 'nowrap',
  };

  return (
    <Box
      sx={{
        minWidth: 270,
        p: 0.5,
      }}
    >
      <Typography
        sx={{
          color: '#94a3b8',
          fontSize: '0.66rem',
          fontWeight: 900,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        Composição do resultado
      </Typography>

      <Box
        sx={{
          mt: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Typography
          sx={{
            color: '#334155',
            fontSize: '0.76rem',
            fontWeight: 800,
          }}
        >
          Valor consolidado
        </Typography>

        <Typography
          sx={{
            color: '#0f172a',
            fontSize: '0.82rem',
            fontWeight: 900,
            whiteSpace: 'nowrap',
          }}
        >
          {formatCurrency(consolidatedValue)}
        </Typography>
      </Box>

      <Box
        sx={{
          mt: 0.75,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.6,

          pl: 1,
          borderLeft:
            '2px solid rgba(220, 38, 38, 0.18)',
        }}
      >
        {deductions.map((row) => (
          <Box
            key={row.key}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
            }}
          >
            <Typography sx={rowLabelSx}>
              ({'−'}) {row.label}
            </Typography>

            <Typography sx={rowValueSx}>
              -{formatCurrency(
                Math.abs(row.value),
              )}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          mt: 0.9,
          pt: 0.8,

          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,

          borderTop:
            '1px solid rgba(148, 163, 184, 0.22)',
        }}
      >
        <Typography
          sx={{
            color: '#0f172a',
            fontSize: '0.74rem',
            fontWeight: 900,
          }}
        >
          Margem bruta
        </Typography>

        <Typography
          sx={{
            color: grossMargin >= 0
              ? '#16a34a'
              : '#dc2626',
            fontSize: '0.84rem',
            fontWeight: 900,
            whiteSpace: 'nowrap',
          }}
        >
          {formatCurrency(grossMargin)}
        </Typography>
      </Box>

      <Box
        sx={{
          mt: 0.6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,

          pl: 1,
          borderLeft:
            '2px solid rgba(220, 38, 38, 0.18)',
        }}
      >
        <Typography sx={rowLabelSx}>
          ({'−'}) Custo operacional (
          {OPERATIONAL_COST_PERCENTUAL}%)
        </Typography>

        <Typography sx={rowValueSx}>
          -{formatCurrency(
            Math.abs(operationalCost),
          )}
        </Typography>
      </Box>

      <Box
        sx={{
          mt: 0.9,
          pt: 0.8,

          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,

          borderTop:
            '1px solid rgba(148, 163, 184, 0.22)',
        }}
      >
        <Typography
          sx={{
            color: '#0f172a',
            fontSize: '0.76rem',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
          }}
        >
          Resultado líquido
        </Typography>

        <Box sx={{ textAlign: 'right' }}>
          <Typography
            sx={{
              color: netResult >= 0
                ? '#16a34a'
                : '#dc2626',
              fontSize: '0.9rem',
              fontWeight: 900,
              whiteSpace: 'nowrap',
            }}
          >
            {formatCurrency(netResult)}
          </Typography>

          <Typography
            sx={{
              color: netResult >= 0
                ? '#16a34a'
                : '#dc2626',
              opacity: 0.72,
              fontSize: '0.68rem',
              fontWeight: 800,
              whiteSpace: 'nowrap',
            }}
          >
            {formatPercentRatio(
              netResultPercent,
            )}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

/*
 * Card unificado das operações.
 *
 * Reúne Vendas normais, Interno Obras e o total
 * das devoluções no mesmo formato visual usado
 * pelo card unificado de remessas.
 */
function OperationsBreakdownCard({
  salesValue,
  netSalesValue,

  returnsValue,
  returnsSalesValue,
  returnsSalesCost,
  returnsInternalValue,
  returnsInternalCost,

  totalCost,
  totalTaxes,
  totalCommission,

  internalValue,
  internalGrossValue,
  internalCost,
  internalReturnsValue,

  bonusValue,

  rollDelay = 210,
}: OperationsBreakdownCardProps) {
  const items: Array<{
    key: string;
    label: string;
    value: number;
    color: string;
    breakdown?: ReactNode;
  }> = [
    {
      key: 'venda',
      label: 'Total venda',
      value: salesValue,
      color: '#0284c7',
    },
    {
      key: 'devolucoes',
      label: 'Total devoluções',
      value: returnsValue,
      color: '#dc2626',
      breakdown: (
        <ReturnsBreakdownTooltip
          salesValue={returnsSalesValue}
          salesCost={returnsSalesCost}
          internalValue={returnsInternalValue}
          internalCost={returnsInternalCost}
        />
      ),
    },
    {
      key: 'liquido',
      label: 'Total líquido',
      value: netSalesValue,
      color: netSalesValue >= 0
        ? '#16a34a'
        : '#dc2626',
    },
    {
      key: 'custo',
      label: 'Total custo',
      value: totalCost,
      color: '#b45309',
    },
    {
      key: 'encargos',
      label: 'Encargos',
      value: totalTaxes,
      color: '#d97706',
    },
    {
      key: 'comissao',
      label: 'Comissão',
      value: totalCommission,
      color: '#f97316',
    },
    {
      key: 'interno_obras',
      label: 'Interno Obras líquido',
      value: internalValue,
      color: '#0d9488',
      breakdown: (
        <InternalWorksBreakdownTooltip
          grossValue={internalGrossValue}
          cost={internalCost}
          returnsValue={internalReturnsValue}
          netValue={internalValue}
        />
      ),
    },
    {
      key: 'bonificacoes',
      label: 'Bonificação',
      value: bonusValue,
      color: BUBBLE_COLOR,
    },
  ];

  return (
    <Card
      sx={{
        height: '100%',

        borderRadius: 2.5,
        border: 'none',
        backgroundColor: '#ffffff',

        boxShadow:
          '0 3px 10px rgba(15, 23, 42, 0.07), ' +
          '0 12px 30px rgba(15, 23, 42, 0.06)',

        transition:
          'transform 180ms ease, box-shadow 180ms ease',

        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow:
            '0 7px 20px rgba(15, 23, 42, 0.11), ' +
            '0 18px 38px rgba(15, 23, 42, 0.08)',
        },
      }}
    >
      <CardContent
        sx={{
          height: '100%',

          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',

          p: 2.25,

          '&:last-child': {
            pb: 2.25,
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 1.25,
          }}
        >
          <Box>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontWeight: 700,
                lineHeight: 1.25,
              }}
            >
              Operações
            </Typography>

            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mt: 0.15,
                color: '#94a3b8',
                fontSize: '0.62rem',
                fontWeight: 700,
              }}
            >
              Vendas, Interno Obras, Bonificações e devoluções
            </Typography>
          </Box>

          <Box
            sx={{
              width: 38,
              height: 38,

              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,

              borderRadius: 2,
              color: '#0284c7',
              backgroundColor:
                'rgba(2, 132, 199, 0.10)',

              '& svg': {
                fontSize: 21,
              },
            }}
          >
            <PaymentsOutlinedIcon />
          </Box>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(4, minmax(0, 1fr))',
            },

            gap: {
              xs: 1.15,
              sm: 0,
            },

            mt: 1.15,
          }}
        >
          {items.map((item, index) => {
            const isFirstInRow = index % 4 === 0;
            const isFirstRow = index < 4;

            const itemBox = (
              <Box
                key={item.key}
                sx={{
                  minWidth: 0,

                  px: {
                    xs: 0,
                    sm: isFirstInRow ? 0 : 1.35,
                  },

                  borderLeft: {
                    xs: 'none',
                    sm: isFirstInRow
                      ? 'none'
                      : '1px solid rgba(148, 163, 184, 0.20)',
                  },

                  borderTop: {
                    xs:
                      index === 0
                        ? 'none'
                        : '1px solid rgba(148, 163, 184, 0.14)',
                    sm: isFirstRow
                      ? 'none'
                      : '1px solid rgba(148, 163, 184, 0.14)',
                  },

                  pt: {
                    xs: index === 0 ? 0 : 1,
                    sm: isFirstRow ? 0 : 1,
                  },

                  cursor: item.breakdown
                    ? 'help'
                    : 'default',

                  transition:
                    'background-color 150ms ease',

                  ...(item.breakdown
                    ? {
                        '&:hover': {
                          backgroundColor:
                            'rgba(13, 148, 136, 0.045)',
                        },
                      }
                    : {}),
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    color: item.color,
                    fontSize: '0.62rem',
                    fontWeight: 900,
                    letterSpacing: '0.03em',
                    textTransform: 'uppercase',
                  }}
                >
                  {item.label}
                </Typography>

                <Typography
                  component="div"
                  sx={{
                    mt: 0.18,
                    color: '#0f172a',
                    fontSize: {
                      xs: '1.15rem',
                      md: '1.2rem',
                    },
                    lineHeight: 1.15,
                    fontWeight: 900,
                    letterSpacing: '-0.03em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <RollingCurrency
                    value={item.value}
                    startDelay={
                      rollDelay + index * 60
                    }
                    delayStep={55}
                  />
                </Typography>
              </Box>
            );

            return item.breakdown ? (
              <Tooltip
                key={item.key}
                title={item.breakdown}
                arrow
                placement="top"
                slotProps={
                  richTooltipSlotProps
                }
              >
                {itemBox}
              </Tooltip>
            ) : (
              itemBox
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
}

/*
 * Métrica genérica de duas colunas.
 *
 * Usada na barra inferior para "Entregue" e
 * "Saldo" da remessa futura, reaproveitando o
 * mesmo layout independente do rótulo de cada
 * coluna.
 */
function TwoColumnMetric({
  title,
  leftLabel,
  leftValue,
  leftColor,
  rightLabel,
  rightValue,
  rightColor,
  caption,
  icon,
  iconColor,
  backgroundColor,
}: TwoColumnMetricProps) {
  return (
    <Box
      sx={{
        minWidth: 0,
        height: '100%',

        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.4,

        px: {
          xs: 2,
          md: 2.25,
        },

        py: {
          xs: 1.8,
          md: 2,
        },

        borderRadius: 2.5,

        backgroundColor,

        border:
          '1px solid rgba(148, 163, 184, 0.13)',

        transition:
          'transform 160ms ease, box-shadow 160ms ease',

        '&:hover': {
          transform: 'translateY(-2px)',

          boxShadow:
            '0 8px 22px rgba(15, 23, 42, 0.07)',
        },
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,

          display: 'grid',
          placeItems: 'center',

          flexShrink: 0,

          borderRadius: 2,

          color: iconColor,

          backgroundColor: '#ffffff',

          boxShadow:
            '0 3px 10px rgba(15, 23, 42, 0.06)',

          '& svg': {
            fontSize: 21,
          },
        }}
      >
        {icon}
      </Box>

      <Box
        sx={{
          minWidth: 0,
          flex: 1,

          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            display: 'block',

            minHeight: '2.2em',

            color: '#64748b',

            fontSize: '0.73rem',
            fontWeight: 800,

            lineHeight: 1.1,
          }}
        >
          {title}
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(2, minmax(0, 1fr))',

            gap: 1.25,

            mt: 0.35,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="caption"
              sx={{
                display: 'block',

                color: leftColor,

                fontSize: '0.63rem',
                fontWeight: 900,

                letterSpacing: '0.03em',
                textTransform: 'uppercase',
              }}
            >
              {leftLabel}
            </Typography>

            <Typography
              component="div"
              sx={{
                mt: 0.2,

                color: leftColor,

                fontSize: {
                  xs: '0.98rem',
                  md: '1.06rem',
                },

                lineHeight: 1.2,
                fontWeight: 900,
                letterSpacing: '-0.025em',
                whiteSpace: 'nowrap',
              }}
            >
              <RollingCurrency
                value={leftValue}
                delayStep={60}
              />
            </Typography>
          </Box>

          <Box
            sx={{
              minWidth: 0,

              pl: 1.25,

              borderLeft:
                '1px solid rgba(148, 163, 184, 0.22)',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                display: 'block',

                color: rightColor,

                fontSize: '0.63rem',
                fontWeight: 900,

                letterSpacing: '0.03em',
                textTransform: 'uppercase',
              }}
            >
              {rightLabel}
            </Typography>

            <Typography
              component="div"
              sx={{
                mt: 0.2,

                color: rightColor,

                fontSize: {
                  xs: '0.98rem',
                  md: '1.06rem',
                },

                lineHeight: 1.2,
                fontWeight: 900,
                letterSpacing: '-0.025em',
                whiteSpace: 'nowrap',
              }}
            >
              <RollingCurrency
                value={rightValue}
                delayStep={60}
              />
            </Typography>
          </Box>
        </Box>

        <Typography
          variant="caption"
          sx={{
            display: 'block',

            mt: 'auto',
            pt: 0.65,

            color: '#94a3b8',

            fontSize: '0.66rem',
            fontWeight: 600,

            lineHeight: 1.35,
          }}
        >
          {caption}
        </Typography>
      </Box>
    </Box>
  );
}

export function SummarySection({
  kpis,
}: SummarySectionProps) {
  /*
   * REMESSAS
   *
   * Remessa futura e Remessa transporte são
   * consultas distintas, as duas por cabeçalho:
   *
   * - remessas.sql (TOP 1009):
   *   faturamento e custo próprio da nota-mãe.
   *
   * - remessas_transporte.sql (TOP 1010):
   *   valor, impostos e custo das notas filhas,
   *   ou seja, o que já foi entregue.
   */

  const valorRemessaFutura =
    safeNumber(
      kpis.remessa_futura
        ?.total_faturamento,
    );

  const valorRemessaTransporte =
    safeNumber(
      kpis.remessa_transporte
        ?.valor_nota ??
      kpis.remessa_futura
        ?.total_entregue,
    );

  const saldoRemessa =
    kpis.remessa_futura?.saldo == null
      ? valorRemessaFutura -
        valorRemessaTransporte
      : safeNumber(
          kpis.remessa_futura.saldo,
        );

  /*
   * Custo próprio da nota-mãe, calculado no
   * cabeçalho da própria remessas.sql.
   */

  const custoRemessa =
    safeNumber(
      kpis.remessa_futura
        ?.custo_total,
    );

  /*
   * Custo já baixado pelas notas filhas.
   *
   * O backend entrega isso pronto em
   * remessa_futura.custo_entregue — mesmo
   * campo que a TaxSummaryTable lê direto,
   * sem cair para a Remessa transporte.
   */

  const custoRemessaEntregue =
    safeNumber(
      kpis.remessa_futura
        ?.custo_entregue,
    );

  const saldoCustoRemessa =
    kpis.remessa_futura
      ?.saldo_custo == null
      ? custoRemessa -
        custoRemessaEntregue
      : safeNumber(
          kpis.remessa_futura
            .saldo_custo,
        );

  /*
   * CUSTOS POR ORIGEM
   */

  const custoVendas =
    safeNumber(
      kpis.vendas?.custo_total,
    );

  const custoDevolucoes =
    safeNumber(
      kpis.vendas?.custo_devolucoes,
    );

  const custoDevolucoesInternoObras =
    safeNumber(
      kpis.devolucoes_interno_obras
        ?.custo_total,
    );

  const custoTotalDevolucoes =
    custoDevolucoes +
    custoDevolucoesInternoObras;

  /*
   * O KPI principal de Interno Obras é líquido.
   *
   * Para montar o consolidado sem descontar a
   * devolução duas vezes, usamos o custo bruto e
   * abatemos as duas categorias logo abaixo.
   */

  const custoInternoObrasBruto =
    safeNumber(
      kpis.interno_obras?.custo_bruto ??
      safeNumber(
        kpis.interno_obras?.custo_total,
      ) + custoDevolucoesInternoObras,
    );

  const custoInternoObras =
    safeNumber(
      kpis.interno_obras?.custo_total,
    );

  /*
   * DEVOLUÇÕES
   */

  const totalDevolucoes =
    safeNumber(
      kpis.vendas?.total_devolucoes,
    );

  const totalDevolucoesInternoObras =
    safeNumber(
      kpis.devolucoes_interno_obras
        ?.total,
    );

  const totalGeralDevolucoes =
    totalDevolucoes +
    totalDevolucoesInternoObras;

  const totalVendasLiquido =
    roundMoney(
      safeNumber(
        kpis.vendas?.total_vendas,
      ) - totalGeralDevolucoes,
    );

  /*
   * BONIFICADOS:
   *
   * saem do estoque sem receita, então
   * entram apenas como custo.
   */

  const totalBonificados =
    safeNumber(
      kpis.bonificados?.valor_nota,
    );

  const custoBonificados =
    safeNumber(
      kpis.bonificados
        ?.custo_medio_sem_icms_total,
    );

  /*
   * CUSTO DAS OPERAÇÕES:
   *
   * Custo próprio da remessa futura
   * + custo das vendas normais
   * + custo bruto do Interno Obras
   * - devoluções normais
   * - devoluções de Interno Obras
   *
   * O custo entregue da Remessa transporte não
   * entra aqui: ele apenas baixa o custo que já
   * está dentro da Remessa futura.
   */

  const custoOperacoes =
    custoRemessa +
    custoVendas +
    custoInternoObrasBruto -
    custoTotalDevolucoes;

  /*
   * TOTAL DE CUSTO:
   *
   * Operações + bonificados.
   *
   * Fecha com a coluna "Valor custo" da linha
   * Consolidado líquido da tabela de tributos.
   */

  const totalCusto =
    custoOperacoes +
    custoBonificados;

  /*
   * ENCARGOS CONSOLIDADOS
   *
   * Somamos os grupos de impostos por origem
   * localmente — ICMS, PIS, COFINS e Tributos —
   * exatamente como a TaxSummaryTable faz, em
   * vez de usar o total_tributos pronto do
   * backend. Isso garante que os dois
   * componentes sempre fechem no mesmo número,
   * mesmo que o consolidado do backend não
   * bata 1:1 com a soma das partes.
   *
   * A Remessa transporte fica de fora da soma:
   * os impostos dela já estão contados dentro
   * da Remessa futura, então somar dobraria o
   * efeito.
   */

  const impostosVendasGrupo =
    normalizeTaxGroup(
      kpis.impostos?.vendas,
    );

  const impostosDevolucoesGrupo =
    negativeTaxGroup(
      kpis.impostos?.devolucoes,
    );

  const impostosInternoObrasLiquidoGrupo =
    normalizeTaxGroup(
      kpis.impostos?.interno_obras,
    );

  const impostosDevolucoesInternoObrasPositivoGrupo =
    normalizeTaxGroup(
      kpis.impostos
        ?.devolucoes_interno_obras,
    );

  /*
   * O backend entrega Interno Obras líquido.
   * líquido + devolução = valor bruto.
   */
  const impostosInternoObrasBrutoGrupo =
    sumTaxGroups(
      impostosInternoObrasLiquidoGrupo,
      impostosDevolucoesInternoObrasPositivoGrupo,
    );

  const impostosDevolucoesInternoObrasGrupo =
    negativeTaxGroup(
      kpis.impostos
        ?.devolucoes_interno_obras,
    );

  const impostosRemessaFuturaGrupo =
    normalizeTaxGroup(
      kpis.impostos?.remessa_futura,
    );

  /*
   * O ICMS da bonificação é pago pela
   * empresa, então entra como imposto real.
   */
  const impostosBonificadosGrupo =
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

  const impostosConsolidadoGrupo =
    sumTaxGroups(
      impostosVendasGrupo,
      impostosDevolucoesGrupo,
      impostosBonificadosGrupo,

      impostosInternoObrasBrutoGrupo,
      impostosDevolucoesInternoObrasGrupo,

      impostosRemessaFuturaGrupo,
    );

  /*
   * IRPJ/CSLL = 3,35% sobre o valor de cada
   * origem, igual ao cálculo feito na tabela
   * "Tributos, custos e comissão".
   *
   * A Remessa transporte não soma IRPJ/CSLL
   * aqui pela mesma razão da tabela: ela é
   * a entrega da Remessa futura, cujo valor
   * já foi tributado acima.
   */

  const valorInternoObrasBruto =
    safeNumber(
      kpis.interno_obras?.total_bruto ??
      kpis.interno_obras?.total,
    );

  const irpjCsslVendas =
    roundMoney(
      safeNumber(
        kpis.vendas?.total_vendas,
      ) * IRPJ_CSSL_RATE,
    );

  const irpjCsslDevolucoes =
    -roundMoney(
      totalDevolucoes *
      IRPJ_CSSL_RATE,
    );

  const irpjCsslBonificados =
    roundMoney(
      totalBonificados *
      IRPJ_CSSL_RATE,
    );

  const irpjCsslInternoObras =
    roundMoney(
      valorInternoObrasBruto *
      IRPJ_CSSL_RATE,
    );

  const irpjCsslDevolucoesInternoObras =
    -roundMoney(
      kpis.devolucoes_interno_obras
        ?.irpj_cssl ??
      totalDevolucoesInternoObras *
        IRPJ_CSSL_RATE,
    );

  const irpjCsslRemessaFutura =
    roundMoney(
      valorRemessaFutura *
      IRPJ_CSSL_RATE,
    );

  const totalIrpjCssl =
    roundMoney(
      irpjCsslVendas +
      irpjCsslDevolucoes +
      irpjCsslBonificados +
      irpjCsslInternoObras +
      irpjCsslDevolucoesInternoObras +
      irpjCsslRemessaFutura,
    );

  const totalImpostos =
    roundMoney(
      impostosConsolidadoGrupo
        .total_tributos +
      totalIrpjCssl,
    );

  const totalComissao =
    roundMoney(
      impostosConsolidadoGrupo.comissao,
    );

  /*
   * RESULTADO CONSOLIDADO
   *
   * Valor:
   * + vendas
   * - devoluções normais
   * + remessa futura
   *
   * Bonificações, Interno Obras, devoluções de
   * Interno Obras e Remessa transporte não entram
   * nessa coluna, seguindo a mesma regra da tabela.
   */
  const valorConsolidado =
    roundMoney(
      safeNumber(
        kpis.vendas?.total_vendas,
      ) -
      totalDevolucoes +
      valorRemessaFutura,
    );

  const margemBruta =
    roundMoney(
      valorConsolidado -
      totalCusto -
      totalImpostos -
      totalComissao,
    );

  const custoOperacional =
    roundMoney(
      valorConsolidado *
      OPERATIONAL_COST_RATE,
    );

  const resultadoLiquido =
    roundMoney(
      margemBruta - custoOperacional,
    );

  return (
    <Box component="section">
      {/* TÍTULO */}
      <Box
        sx={{
          mb: 2,
        }}
      >
        <Typography
          component="h2"
          variant="h5"
          sx={{
            color: 'text.primary',
            fontWeight: 900,
            letterSpacing: '-0.025em',
          }}
        >
          Resumo executivo
        </Typography>

        <Typography
          component="p"
          variant="body2"
          sx={{
            mt: 0.5,
            color: 'text.secondary',
          }}
        >
          Visão geral dos principais valores da obra.
        </Typography>
      </Box>

      {/* CARDS PRINCIPAIS */}
      <Box
        sx={{
          display: 'grid',
          gap: 2,

          alignItems: 'stretch',

          gridTemplateColumns: {
            xs: '1fr',
            sm: 'minmax(0, 0.8fr) minmax(0, 1.2fr)',
          },
        }}
      >
        {/*
         * RESULTADO — primeira informação que o
         * usuário deve ver. Só tem 2 indicadores,
         * então ocupa menos largura que Operações,
         * mas estica pra ficar com a mesma altura.
         */}
        <ResultBreakdownCard
          grossMargin={margemBruta}
          netResult={resultadoLiquido}
          operationalCost={custoOperacional}
          consolidatedValue={valorConsolidado}
          totalCost={totalCusto}
          totalTaxes={totalImpostos}
          totalCommission={totalComissao}
          rollDelay={0}
        />

        {/* OPERAÇÕES */}
        <OperationsBreakdownCard
          salesValue={valorConsolidado}
          netSalesValue={totalVendasLiquido}
          returnsValue={totalGeralDevolucoes}
          returnsSalesValue={totalDevolucoes}
          returnsSalesCost={custoDevolucoes}
          returnsInternalValue={
            totalDevolucoesInternoObras
          }
          returnsInternalCost={
            custoDevolucoesInternoObras
          }
          totalCost={totalCusto}
          totalTaxes={totalImpostos}
          totalCommission={totalComissao}
          internalValue={safeNumber(
            kpis.interno_obras?.total,
          )}
          internalGrossValue={
            valorInternoObrasBruto
          }
          internalCost={custoInternoObras}
          internalReturnsValue={
            totalDevolucoesInternoObras
          }
          bonusValue={totalBonificados}
          rollDelay={210}
        />
      </Box>

      {/* CONSOLIDADO RÁPIDO */}
      <Card
        sx={{
          mt: 2.5,

          border: 'none',
          borderRadius: 3,

          backgroundColor: '#ffffff',

          boxShadow:
            '0 3px 10px rgba(15, 23, 42, 0.06), ' +
            '0 12px 30px rgba(15, 23, 42, 0.055)',

          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'grid',

            alignItems: 'stretch',

            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              xl: '1.35fr repeat(2, minmax(0, 1fr))',
            },

            gap: 1.25,

            p: {
              xs: 1.5,
              md: 1.75,
            },
          }}
        >
          {/* FATURADO REMESSA */}
          <Box
            sx={{
              position: 'relative',
              overflow: 'hidden',

              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',

              minHeight: 132,

              px: {
                xs: 2,
                md: 2.4,
              },

              py: 2,

              borderRadius: 2.5,

              color: '#ffffff',

              background:
                'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',

              boxShadow:
                '0 10px 24px rgba(15, 23, 42, 0.15)',

              '&::after': {
                content: '""',

                position: 'absolute',

                width: 180,
                height: 180,

                right: -90,
                bottom: -120,

                borderRadius: '50%',

                backgroundColor:
                  'rgba(193, 141, 52, 0.18)',

                pointerEvents: 'none',
              },
            }}
          >
            <Box
              sx={{
                position: 'relative',
                zIndex: 1,

                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color:
                      'rgba(255, 255, 255, 0.68)',

                    fontSize: '0.72rem',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  Faturado remessa
                </Typography>

                <Typography
                  component="div"
                  sx={{
                    mt: 0.7,

                    color: '#ffffff',

                    fontSize: {
                      xs: '1.55rem',
                      md: '1.8rem',
                    },

                    lineHeight: 1.1,
                    fontWeight: 900,
                    letterSpacing: '-0.04em',
                  }}
                >
                  <RollingCurrency
                    value={valorRemessaFutura}
                    duration={1300}
                    delayStep={85}
                  />
                </Typography>
              </Box>

              <Box
                sx={{
                  width: 45,
                  height: 45,

                  display: 'grid',
                  placeItems: 'center',

                  flexShrink: 0,

                  borderRadius: 2.5,

                  color: '#ffffff',

                  backgroundColor:
                    'rgba(255, 255, 255, 0.10)',

                  border:
                    '1px solid rgba(255, 255, 255, 0.10)',

                  '& svg': {
                    fontSize: 24,
                  },
                }}
              >
                <PaidOutlinedIcon />
              </Box>
            </Box>

            <Box
              sx={{
                position: 'relative',
                zIndex: 1,

                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 1,

                mt: 1.5,
              }}
            >
              <Chip
                label="CUSTO PRÓPRIO"
                size="small"
                sx={{
                  height: 23,

                  color: '#ffffff',

                  backgroundColor:
                    'rgba(255, 255, 255, 0.10)',

                  fontSize: '0.62rem',
                  fontWeight: 900,
                }}
              />

              <Typography
                variant="caption"
                sx={{
                  color:
                    'rgba(255, 255, 255, 0.62)',

                  fontSize: '0.67rem',
                  fontWeight: 600,
                }}
              >
                Custo: {formatCurrency(custoRemessa)}
              </Typography>
            </Box>
          </Box>

          <TwoColumnMetric
            title="Entregue"
            leftLabel="Valor"
            leftValue={valorRemessaTransporte}
            leftColor="#4EAAEF"
            rightLabel="Custo"
            rightValue={custoRemessaEntregue}
            rightColor="#0284c7"
            caption="Faturamento já entregue"
            icon={<Inventory2OutlinedIcon />}
            iconColor="#4EAAEF"
            backgroundColor="rgba(78, 170, 239, 0.07)"
          />

          <TwoColumnMetric
            title="Saldo"
            leftLabel="Valor"
            leftValue={saldoRemessa}
            leftColor="#d97706"
            rightLabel="Custo"
            rightValue={saldoCustoRemessa}
            rightColor="#C18D34"
            caption="Falta faturar/entregar"
            icon={<PriceCheckOutlinedIcon />}
            iconColor="#d97706"
            backgroundColor="rgba(217, 119, 6, 0.07)"
          />
        </Box>
      </Card>
    </Box>
  );
}