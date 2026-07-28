import type { ReactNode } from 'react';

import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import PriceCheckOutlinedIcon from '@mui/icons-material/PriceCheckOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
} from '@mui/material';

import { RollingCurrency } from '@/components/common/RollingCurrency';
import type { DashboardKpis } from '@/types/dashboard';
import { formatCurrency } from '@/utils/formatters';

interface SummarySectionProps {
  kpis: DashboardKpis;
}

interface ChargesMetricProps {
  taxes: number;
  commission: number;
}

interface CostBreakdownMetricProps {
  title: string;
  operations: number;
  bonus: number;
  total: number;
  icon: ReactNode;
  color: string;
  backgroundColor: string;
}

interface OperationsBreakdownCardProps {
  salesValue: number;
  internalValue: number;
  bonusValue: number;
  returnsValue: number;

  salesCost: number;
  internalCost: number;
  bonusCost: number;
  returnsCost: number;

  rollDelay?: number;
}

interface RemittanceBreakdownCardProps {
  invoicedValue: number;
  deliveredValue: number;
  balanceValue: number;

  invoicedCost: number;
  deliveredCost: number;
  balanceCost: number;

  rollDelay?: number;
}

interface ResultBreakdownCardProps {
  grossMargin: number;
  netResult: number;
  operationalCost: number;
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

/*
 * Card unificado das remessas.
 *
 * Reúne faturamento, entrega e saldo em uma
 * única leitura, mantendo os respectivos custos
 * logo abaixo de cada etapa.
 */
function RemittanceBreakdownCard({
  invoicedValue,
  deliveredValue,
  balanceValue,

  invoicedCost,
  deliveredCost,
  balanceCost,

  rollDelay = 0,
}: RemittanceBreakdownCardProps) {
  const items = [
    {
      key: 'faturado',
      label: 'Faturado',
      value: invoicedValue,
      costLabel: 'Custo',
      cost: invoicedCost,
      color: '#2563eb',
    },
    {
      key: 'entregue',
      label: 'Entregue',
      value: deliveredValue,
      costLabel: 'Custo entregue',
      cost: deliveredCost,
      color: '#0284c7',
    },
    {
      key: 'saldo',
      label: 'Saldo',
      value: balanceValue,
      costLabel: 'Saldo custo',
      cost: balanceCost,
      color: '#d97706',
    },
  ];

  return (
    <Card
      sx={{
        height: '100%',
        minHeight: 155,

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
              Remessas futuras
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
              Faturamento, entrega e saldo
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
            <LocalShippingOutlinedIcon />
          </Box>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(3, minmax(0, 1fr))',
            },

            gap: {
              xs: 1.15,
              sm: 0,
            },

            mt: 1.15,
          }}
        >
          {items.map((item, index) => (
            <Box
              key={item.key}
              sx={{
                minWidth: 0,

                px: {
                  xs: 0,
                  sm: index === 0 ? 0 : 1.35,
                },

                borderLeft: {
                  xs: 'none',
                  sm:
                    index === 0
                      ? 'none'
                      : '1px solid rgba(148, 163, 184, 0.20)',
                },

                borderTop: {
                  xs:
                    index === 0
                      ? 'none'
                      : '1px solid rgba(148, 163, 184, 0.14)',
                  sm: 'none',
                },

                pt: {
                  xs: index === 0 ? 0 : 1,
                  sm: 0,
                },
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
                    rollDelay + index * 70
                  }
                  delayStep={55}
                />
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mt: 0.45,
                  color: item.color,
                  fontSize: '0.65rem',
                  fontWeight: 750,
                  lineHeight: 1.2,
                }}
              >
                {item.costLabel}:{' '}
                {formatCurrency(item.cost)}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
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
  rollDelay = 300,
}: ResultBreakdownCardProps) {
  const grossMarginPositive = grossMargin >= 0;
  const netResultPositive = netResult >= 0;

  const grossMarginColor = grossMarginPositive
    ? '#16a34a'
    : '#dc2626';

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
    <Card
      sx={{
        height: '100%',
        minHeight: 155,

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

          p: 2.25,

          backgroundColor,

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
              width: 38,
              height: 38,

              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,

              borderRadius: 2,
              color: accentColor,
              backgroundColor: netResultPositive
                ? 'rgba(22, 163, 74, 0.11)'
                : 'rgba(220, 38, 38, 0.10)',

              '& svg': {
                fontSize: 21,
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
            mt: 1.05,
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
              Margem bruta
            </Typography>

            <Typography
              component="div"
              sx={{
                mt: 0.2,
                color: grossMarginColor,
                fontSize: {
                  xs: '1.18rem',
                  md: '1.45rem',
                },
                lineHeight: 1.15,
                fontWeight: 900,
                letterSpacing: '-0.025em',
                whiteSpace: 'nowrap',
              }}
            >
              <RollingCurrency
                value={grossMargin}
                startDelay={rollDelay}
                delayStep={55}
              />
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
                  xs: '1.18rem',
                  md: '1.45rem',
                },
                lineHeight: 1.15,
                fontWeight: 900,
                letterSpacing: '-0.025em',
                whiteSpace: 'nowrap',
              }}
            >
              <RollingCurrency
                value={netResult}
                startDelay={rollDelay + 80}
                delayStep={55}
              />
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 0.8,

            mt: 'auto',
            pt: 0.75,

            borderTop:
              '1px solid rgba(148, 163, 184, 0.14)',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: '#94a3b8',
              fontSize: '0.60rem',
              fontWeight: 750,
              lineHeight: 1.2,
            }}
          >
            Operacional {OPERATIONAL_COST_PERCENTUAL}%
          </Typography>

          <Typography
            variant="caption"
            sx={{
              color: '#64748b',
              fontSize: '0.65rem',
              fontWeight: 850,
              whiteSpace: 'nowrap',
            }}
          >
            {formatCurrency(operationalCost)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
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
  internalValue,
  bonusValue,
  returnsValue,

  salesCost,
  internalCost,
  bonusCost,
  returnsCost,

  rollDelay = 210,
}: OperationsBreakdownCardProps) {
  const items = [
    {
      key: 'vendas',
      label: 'Vendas',
      value: salesValue,
      costLabel: 'Custo',
      cost: salesCost,
      color: '#0284c7',
    },
    {
      key: 'interno_obras',
      label: 'Interno Obras',
      value: internalValue,
      costLabel: 'Custo',
      cost: internalCost,
      color: '#0d9488',
    },
    {
      key: 'bonificacoes',
      label: 'Bonificações',
      value: bonusValue,
      costLabel: 'Custo',
      cost: bonusCost,
      color: BUBBLE_COLOR,
    },
    {
      key: 'devolucoes',
      label: 'Devoluções',
      value: returnsValue,
      costLabel: 'Custo estornado',
      cost: returnsCost,
      color: '#dc2626',
    },
  ];

  return (
    <Card
      sx={{
        height: '100%',
        minHeight: 155,

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
          {items.map((item, index) => (
            <Box
              key={item.key}
              sx={{
                minWidth: 0,

                px: {
                  xs: 0,
                  sm: index === 0 ? 0 : 1.35,
                },

                borderLeft: {
                  xs: 'none',
                  sm:
                    index === 0
                      ? 'none'
                      : '1px solid rgba(148, 163, 184, 0.20)',
                },

                borderTop: {
                  xs:
                    index === 0
                      ? 'none'
                      : '1px solid rgba(148, 163, 184, 0.14)',
                  sm: 'none',
                },

                pt: {
                  xs: index === 0 ? 0 : 1,
                  sm: 0,
                },
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
                    rollDelay + index * 70
                  }
                  delayStep={55}
                />
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mt: 0.45,
                  color: item.color,
                  fontSize: '0.65rem',
                  fontWeight: 750,
                  lineHeight: 1.2,
                }}
              >
                {item.costLabel}:{' '}
                {formatCurrency(item.cost)}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

function CostBreakdownMetric({
  title,
  operations,
  bonus,
  total,
  icon,
  color,
  backgroundColor,
}: CostBreakdownMetricProps) {
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

          color,

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

                color,

                fontSize: '0.63rem',
                fontWeight: 900,

                letterSpacing: '0.03em',
                textTransform: 'uppercase',
              }}
            >
              Operações
            </Typography>

            <Typography
              component="div"
              sx={{
                mt: 0.2,

                color,

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
                value={operations}
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

                color: '#C96A16',

                fontSize: '0.63rem',
                fontWeight: 900,

                letterSpacing: '0.03em',
                textTransform: 'uppercase',
              }}
            >
              + Bonificado
            </Typography>

            <Typography
              component="div"
              sx={{
                mt: 0.2,

                color: '#C96A16',

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
                value={bonus}
                delayStep={60}
              />
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 0.7,

            mt: 'auto',
            pt: 0.65,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: '#94a3b8',

              fontSize: '0.66rem',
              fontWeight: 700,

              letterSpacing: '0.03em',
              textTransform: 'uppercase',
            }}
          >
            Total
          </Typography>

          <Typography
            component="div"
            sx={{
              color: '#0f172a',

              fontSize: '1rem',
              lineHeight: 1.2,
              fontWeight: 900,
              letterSpacing: '-0.025em',
              whiteSpace: 'nowrap',
            }}
          >
            <RollingCurrency
              value={total}
              delayStep={70}
            />
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

function ChargesMetric({
  taxes,
  commission,
}: ChargesMetricProps) {
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

        backgroundColor:
          'rgba(193, 141, 52, 0.07)',

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

          color: '#C18D34',

          backgroundColor: '#ffffff',

          boxShadow:
            '0 3px 10px rgba(15, 23, 42, 0.06)',

          '& svg': {
            fontSize: 21,
          },
        }}
      >
        <ReceiptLongOutlinedIcon />
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
          Encargos consolidados
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

                color: '#C18D34',

                fontSize: '0.63rem',
                fontWeight: 900,

                letterSpacing: '0.03em',
                textTransform: 'uppercase',
              }}
            >
              Tributos
            </Typography>

            <Typography
              component="div"
              sx={{
                mt: 0.2,

                color: '#C18D34',

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
                value={taxes}
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

                color: '#F97316',

                fontSize: '0.63rem',
                fontWeight: 900,

                letterSpacing: '0.03em',
                textTransform: 'uppercase',
              }}
            >
              Comissão
            </Typography>

            <Typography
              component="div"
              sx={{
                mt: 0.2,

                color: '#F97316',

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
                value={commission}
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
          Tributos e comissão
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
   * remessa_futura.custo_entregue; a Remessa
   * transporte fica de reserva.
   */

  const custoRemessaEntregue =
    kpis.remessa_futura
      ?.custo_entregue == null
      ? safeNumber(
          kpis.remessa_transporte
            ?.custo_medio_sem_icms_total ??
          kpis.remessa_transporte
            ?.custo_total,
        )
      : safeNumber(
          kpis.remessa_futura
            .custo_entregue,
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
   * CUSTO ENTREGUE DAS OPERAÇÕES:
   *
   * Mesma conta, trocando o custo próprio da
   * remessa pelo custo efetivamente entregue
   * pelas notas TOP 1010.
   */

  const custoEntregueOperacoes =
    custoRemessaEntregue +
    custoVendas +
    custoInternoObrasBruto -
    custoTotalDevolucoes;

  const totalCustoEntregue =
    custoEntregueOperacoes +
    custoBonificados;

  /*
   * SALDO DE CUSTOS:
   *
   * Total de custo menos o custo já entregue.
   *
   * Como só a remessa tem saldo, este número
   * acaba sendo o próprio saldo de custo da
   * Remessa futura.
   */

  const saldoCustos =
    totalCusto -
    totalCustoEntregue;

  /*
   * ENCARGOS CONSOLIDADOS
   *
   * O consolidado do backend já contém os
   * tributos da Remessa futura.
   *
   * A Remessa transporte NÃO abate nada:
   * os impostos das notas filhas são os mesmos
   * da operação já contada na Remessa futura,
   * então subtrair dobrava o efeito.
   *
   * A bonificação soma seu imposto real.
   */

  const impostosBonificados =
    safeNumber(
      kpis.bonificados
        ?.valor_impostos,
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
      safeNumber(
        kpis.impostos?.consolidado_liquido
          ?.total_tributos,
      ) +
      impostosBonificados +
      totalIrpjCssl,
    );

  const totalComissao =
    roundMoney(
      safeNumber(
        kpis.impostos?.consolidado_liquido
          ?.comissao,
      ),
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
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(2, minmax(0, 1fr))',
            xl: 'repeat(6, minmax(0, 1fr))',
          },

          '& > *': {
            height: '100%',
          },
        }}
      >
        {/* REMESSAS — primeiro terço da linha */}
        <Box
          sx={{
            gridColumn: {
              xs: 'auto',
              sm: 'span 2',
              md: 'span 2',
              xl: 'span 2',
            },
          }}
        >
          <RemittanceBreakdownCard
            invoicedValue={valorRemessaFutura}
            deliveredValue={valorRemessaTransporte}
            balanceValue={saldoRemessa}
            invoicedCost={custoRemessa}
            deliveredCost={custoRemessaEntregue}
            balanceCost={saldoCustoRemessa}
            rollDelay={0}
          />
        </Box>

        {/* OPERAÇÕES — mesmo tamanho do card de remessas */}
        <Box
          sx={{
            gridColumn: {
              xs: 'auto',
              sm: 'span 2',
              md: 'span 2',
              xl: 'span 2',
            },
          }}
        >
          <OperationsBreakdownCard
            salesValue={safeNumber(
              kpis.vendas?.total_vendas,
            )}
            internalValue={safeNumber(
              kpis.interno_obras?.total,
            )}
            bonusValue={totalBonificados}
            returnsValue={totalGeralDevolucoes}
            salesCost={custoVendas}
            internalCost={custoInternoObras}
            bonusCost={custoBonificados}
            returnsCost={custoTotalDevolucoes}
            rollDelay={210}
          />
        </Box>

        {/*
         * RESULTADO — ocupa o espaço onde ficava o
         * card de devoluções e usa todo o terço final.
         */}
        <Box
          sx={{
            gridColumn: {
              xs: 'auto',
              sm: 'span 2',
              md: 'span 2',
              xl: 'span 2',
            },
          }}
        >
          <ResultBreakdownCard
            grossMargin={margemBruta}
            netResult={resultadoLiquido}
            operationalCost={custoOperacional}
            rollDelay={420}
          />
        </Box>
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
              xl: '1.35fr repeat(3, minmax(0, 1fr))',
            },

            gap: 1.25,

            p: {
              xs: 1.5,
              md: 1.75,
            },
          }}
        >
          {/* SALDO DE CUSTOS */}
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
                  Saldo de custos
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
                    value={saldoCustos}
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
                label="CUSTO A ENTREGAR"
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
                Custo total menos o custo já entregue
              </Typography>
            </Box>
          </Box>

          <CostBreakdownMetric
            title="Total custo"
            operations={custoOperacoes}
            bonus={custoBonificados}
            total={totalCusto}
            icon={<PriceCheckOutlinedIcon />}
            color="#FF746D"
            backgroundColor="rgba(255, 116, 109, 0.07)"
          />

          <CostBreakdownMetric
            title="Total custo entregue"
            operations={custoEntregueOperacoes}
            bonus={custoBonificados}
            total={totalCustoEntregue}
            icon={<Inventory2OutlinedIcon />}
            color="#4EAAEF"
            backgroundColor="rgba(78, 170, 239, 0.07)"
          />

          <ChargesMetric
            taxes={totalImpostos}
            commission={totalComissao}
          />
        </Box>
      </Card>
    </Box>
  );
}