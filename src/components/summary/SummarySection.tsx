import type { ReactNode } from 'react';
import { keyframes } from '@mui/material/styles';

import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
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
  PagamentoTitulo,
} from '@/types/dashboard';
import {
  formatCurrency,
  formatPercentRatio,
} from '@/utils/formatters';

interface SummarySectionProps {
  kpis: DashboardKpis;
  pagamentos?: PagamentoTitulo[];
}

interface SingleMetricProps {
  title: string;
  label: string;
  value: number;
  color: string;
  caption: string;
  icon: ReactNode;
  iconColor: string;
  backgroundColor: string;
}

interface ThreeColumnMetricItem {
  label: string;
  value: number;
  color: string;
}

interface ThreeColumnMetricProps {
  title: string;
  items: [
    ThreeColumnMetricItem,
    ThreeColumnMetricItem,
    ThreeColumnMetricItem,
  ];
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
const IRPJ_CSSL_RATE = 0.0335;
const OPERATIONAL_COST_RATE = 0.17;
const OPERATIONAL_COST_PERCENTUAL = 17;

// Animações

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
`;

const gradientShift = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

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

function normalizeTaxGroup(
  group: ImpostoGrupoKpis | null | undefined,
): ImpostoGrupoKpis {
  return {
    icms: safeNumber(group?.icms),
    pis: safeNumber(group?.pis),
    cofins: safeNumber(group?.cofins),
    federais: safeNumber(group?.federais),
    total_tributos: safeNumber(group?.total_tributos),
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
    total_tributos: negate(normalized.total_tributos),
    comissao: negate(normalized.comissao),
  };
}

function sumTaxGroups(
  ...groups: Array<ImpostoGrupoKpis | null | undefined>
): ImpostoGrupoKpis {
  return groups.reduce<ImpostoGrupoKpis>(
    (total, group) => {
      const normalized = normalizeTaxGroup(group);

      return {
        icms: total.icms + normalized.icms,
        pis: total.pis + normalized.pis,
        cofins: total.cofins + normalized.cofins,
        federais: total.federais + normalized.federais,
        total_tributos: total.total_tributos + normalized.total_tributos,
        comissao: total.comissao + normalized.comissao,
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
  const netResultPercent = safeRatio(netResult, consolidatedValue);
  const netResultColor = netResultPositive ? '#10b981' : '#ef4444';
  const accentColor = netResultPositive ? '#10b981' : '#ef4444';
  const backgroundColor = netResultPositive
    ? 'rgba(16, 185, 129, 0.04)'
    : 'rgba(239, 68, 68, 0.04)';

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
        borderRadius: 3,
        border: '1px solid rgba(148, 163, 184, 0.12)',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        animation: `${fadeInUp} 0.6s ease-out`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, transparent 0%, ${accentColor}60 20%, ${accentColor}80 50%, ${accentColor}60 80%, transparent 100%)`,
          backgroundSize: '200% 100%',
          animation: `${shimmer} 6s infinite linear`,
          opacity: 0.9,
        },
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.03)',
        },
      }}
    >
        <CardContent
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            p: 2,
            backgroundColor,
            position: 'relative',
            zIndex: 1,
            '&:last-child': {
              pb: 2,
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 1.5,
            }}
          >
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 800,
                  lineHeight: 1.25,
                  letterSpacing: '-0.01em',
                }}
              >
                Resultado da obra
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mt: 0.2,
                  color: '#94a3b8',
                  fontSize: '0.6rem',
                  fontWeight: 600,
                }}
              >
                Margem & resultado líquido
              </Typography>
            </Box>

            <Box
              sx={{
                width: 38,
                height: 38,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                borderRadius: 2.5,
                background: `linear-gradient(135deg, ${accentColor}15, ${accentColor}25)`,
                border: `1px solid ${accentColor}20`,
                transition: 'all 0.3s ease',
                '& svg': {
                  fontSize: 20,
                  color: accentColor,
                },
                '&:hover': {
                  transform: 'scale(1.1)',
                },
              }}
            >
              {netResultPositive ? <TrendingUpIcon /> : <TrendingDownIcon />}
            </Box>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 1.5,
              mt: 1.2,
            }}
          >
            <Box
              sx={{
                minWidth: 0,
                p: 1.25,
                borderRadius: 2,
                backgroundColor: 'rgba(148, 163, 184, 0.04)',
                border: '1px solid rgba(148, 163, 184, 0.08)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(148, 163, 184, 0.07)',
                  transform: 'scale(1.02)',
                },
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
                  letterSpacing: '0.03em',
                }}
              >
                Vlr. custo op.
              </Typography>

              <Typography
                component="div"
                sx={{
                  mt: 0.3,
                  color: '#475569',
                  fontSize: { xs: '1.02rem', md: '1.2rem' },
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

              <Chip
                label={`${OPERATIONAL_COST_PERCENTUAL}% do consolidado`}
                size="small"
                sx={{
                  mt: 0.4,
                  height: 20,
                  fontSize: '0.58rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(148, 163, 184, 0.08)',
                  color: '#64748b',
                }}
              />
            </Box>

            <Box
              sx={{
                minWidth: 0,
                p: 1.25,
                borderRadius: 2,
                backgroundColor: netResultPositive
                  ? 'rgba(16, 185, 129, 0.06)'
                  : 'rgba(239, 68, 68, 0.06)',
                border: `1px solid ${netResultColor}15`,
                transition: 'all 0.2s ease',
                animation: `${fadeInUp} 0.5s ease-out 0.15s both`,
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: `0 4px 12px ${netResultColor}15`,
                },
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
                  letterSpacing: '0.03em',
                }}
              >
                Resultado líquido
              </Typography>

              <Typography
                component="div"
                sx={{
                  mt: 0.3,
                  color: netResultColor,
                  fontSize: { xs: '1.02rem', md: '1.2rem' },
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
                  mt: 0.3,
                  color: netResultColor,
                  opacity: 0.75,
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                }}
              >
                ({formatPercentRatio(netResultPercent)})
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Tooltip>
  );
}

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
      color: '#ef4444',
    },
    {
      key: 'interno_obras',
      label: 'Devolução Interno Obras',
      value: internalValue,
      cost: internalCost,
      color: '#dc2626',
    },
  ];

  const totalValue = salesValue + internalValue;
  const totalCost = salesCost + internalCost;

  return (
    <Box sx={{ minWidth: 250, p: 0.5 }}>
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

      <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.9 }}>
        {rows.map((row) => (
          <Box
            key={row.key}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
              pb: 0.9,
              borderBottom: '1px solid rgba(148, 163, 184, 0.18)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  flexShrink: 0,
                  borderRadius: '50%',
                  backgroundColor: row.color,
                  boxShadow: `0 0 6px ${row.color}66`,
                }}
              />
              <Typography sx={{ color: '#334155', fontSize: '0.76rem', fontWeight: 750 }}>
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
                -{formatCurrency(Math.abs(row.value))}
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
              color: '#ef4444',
              fontSize: '0.85rem',
              fontWeight: 900,
              whiteSpace: 'nowrap',
            }}
          >
            -{formatCurrency(Math.abs(totalValue))}
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
      color: '#06b6d4',
    },
    {
      key: 'custo',
      label: 'Custo',
      value: cost,
      color: '#0e7490',
    },
    {
      key: 'devolucao',
      label: 'Devolução',
      value: -Math.abs(returnsValue),
      color: '#ef4444',
    },
  ];

  return (
    <Box sx={{ minWidth: 230, p: 0.5 }}>
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

      <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.7 }}>
        {rows.map((row) => (
          <Box
            key={row.key}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
              pb: 0.7,
              borderBottom: '1px solid rgba(148, 163, 184, 0.18)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  flexShrink: 0,
                  borderRadius: '50%',
                  backgroundColor: row.color,
                  boxShadow: `0 0 6px ${row.color}66`,
                }}
              />
              <Typography sx={{ color: '#334155', fontSize: '0.76rem', fontWeight: 750 }}>
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
            color: netValue >= 0 ? '#10b981' : '#ef4444',
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
      border: '1px solid rgba(148, 163, 184, 0.16)',
      boxShadow: '0 16px 36px rgba(15, 23, 42, 0.18), 0 4px 12px rgba(15, 23, 42, 0.08)',
      px: 1.6,
      py: 1.4,
    },
  },
  arrow: {
    sx: {
      color: '#ffffff',
      '&::before': {
        border: '1px solid rgba(148, 163, 184, 0.16)',
      },
    },
  },
} as const;

const paymentsTooltipSlotProps = {
  tooltip: {
    sx: {
      ...richTooltipSlotProps.tooltip.sx,
      maxWidth: 'none',
    },
  },
  arrow: richTooltipSlotProps.arrow,
} as const;

type PagamentoStatus =
  | 'PAGO'
  | 'VENCIDO'
  | 'EM ABERTO';

interface PaymentGroupConfig {
  status: PagamentoStatus;
  label: string;
  color: string;
  backgroundColor: string;
}

const paymentGroups: PaymentGroupConfig[] = [
  {
    status: 'VENCIDO',
    label: 'Vencidos',
    color: '#dc2626',
    backgroundColor: 'rgba(220, 38, 38, 0.055)',
  },
  {
    status: 'EM ABERTO',
    label: 'Em aberto',
    color: '#d97706',
    backgroundColor: 'rgba(217, 119, 6, 0.055)',
  },
  {
    status: 'PAGO',
    label: 'Pagos',
    color: '#16a34a',
    backgroundColor: 'rgba(22, 163, 74, 0.055)',
  },
];

function normalizePaymentStatus(
  value: string | null | undefined,
): PagamentoStatus | '' {
  const status = String(value ?? '')
    .trim()
    .toUpperCase()
    .replace('_', ' ');

  if (
    status === 'PAGO' ||
    status === 'VENCIDO' ||
    status === 'EM ABERTO'
  ) {
    return status;
  }

  return '';
}

function getPaymentValue(
  titulo: PagamentoTitulo,
): number {
  const status = normalizePaymentStatus(
    titulo.status_titulo,
  );

  if (status === 'PAGO') {
    const valorBaixa = safeNumber(
      titulo.valor_baixa,
    );

    return valorBaixa || safeNumber(
      titulo.valor_titulo,
    );
  }

  return safeNumber(titulo.saldo_aberto);
}

function PaymentsBreakdownTooltip({
  pagamentos,
}: {
  pagamentos: PagamentoTitulo[];
}) {
  const grupos = paymentGroups.map((grupo) => {
    const titulos = pagamentos.filter(
      (titulo) =>
        normalizePaymentStatus(
          titulo.status_titulo,
        ) === grupo.status,
    );

    const total = titulos.reduce(
      (acumulado, titulo) =>
        acumulado + getPaymentValue(titulo),
      0,
    );

    return {
      ...grupo,
      titulos,
      total,
    };
  });

  const totalGeral = grupos.reduce(
    (acumulado, grupo) =>
      acumulado + grupo.total,
    0,
  );

  return (
    <Box
      sx={{
        width: 500,
        maxWidth: 'calc(100vw - 48px)',
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
        Detalhamento dos pagamentos
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
          Títulos vinculados à obra
        </Typography>

        <Chip
          label={`${pagamentos.length} títulos`}
          size="small"
          sx={{
            height: 21,
            color: '#475569',
            backgroundColor:
              'rgba(148, 163, 184, 0.10)',
            fontSize: '0.6rem',
            fontWeight: 800,
          }}
        />
      </Box>

      <Box
        sx={{
          mt: 0.75,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.6,
          pl: 1,
          borderLeft:
            '2px solid rgba(148, 163, 184, 0.20)',
        }}
      >
        {grupos.map((grupo) => (
          <Box
            key={grupo.status}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.65,
                minWidth: 0,
              }}
            >
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  flexShrink: 0,
                  borderRadius: '50%',
                  backgroundColor: grupo.color,
                  boxShadow:
                    `0 0 6px ${grupo.color}66`,
                }}
              />

              <Typography
                sx={{
                  color: '#64748b',
                  fontSize: '0.73rem',
                  fontWeight: 700,
                }}
              >
                {grupo.label} ({grupo.titulos.length})
              </Typography>
            </Box>

            <Typography
              sx={{
                color: grupo.color,
                fontSize: '0.78rem',
                fontWeight: 850,
                whiteSpace: 'nowrap',
              }}
            >
              {formatCurrency(grupo.total)}
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
          Total dos títulos
        </Typography>

        <Typography
          sx={{
            color: '#0f172a',
            fontSize: '0.84rem',
            fontWeight: 900,
            whiteSpace: 'nowrap',
          }}
        >
          {formatCurrency(totalGeral)}
        </Typography>
      </Box>

      <Box
        sx={{
          mt: 1,
          pt: 0.8,
          maxHeight: 330,
          overflowY: 'auto',
          pr: 0.5,
          borderTop:
            '1px solid rgba(148, 163, 184, 0.22)',
          scrollbarWidth: 'thin',
          scrollbarColor:
            'rgba(100, 116, 139, 0.42) transparent',
          '&::-webkit-scrollbar': {
            width: 6,
          },
          '&::-webkit-scrollbar-thumb': {
            borderRadius: 99,
            backgroundColor:
              'rgba(100, 116, 139, 0.42)',
          },
        }}
      >
        {pagamentos.length === 0 ? (
          <Typography
            sx={{
              py: 1.2,
              color: '#94a3b8',
              fontSize: '0.7rem',
              fontWeight: 700,
              textAlign: 'center',
            }}
          >
            Nenhum título encontrado para os filtros.
          </Typography>
        ) : (
          grupos.map((grupo) => (
            <Box
              key={`detalhe-${grupo.status}`}
              sx={{
                '& + &': {
                  mt: 1.1,
                  pt: 1,
                  borderTop:
                    '1px solid rgba(148, 163, 184, 0.16)',
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1.5,
                  mb: 0.65,
                }}
              >
                <Typography
                  sx={{
                    color: grupo.color,
                    fontSize: '0.68rem',
                    fontWeight: 900,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  {grupo.label}
                </Typography>

                <Typography
                  sx={{
                    color: grupo.color,
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formatCurrency(grupo.total)}
                </Typography>
              </Box>

              {grupo.titulos.length === 0 ? (
                <Typography
                  sx={{
                    py: 0.65,
                    color: '#94a3b8',
                    fontSize: '0.67rem',
                    fontStyle: 'italic',
                  }}
                >
                  Nenhum título nesta situação.
                </Typography>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.55,
                  }}
                >
                  {grupo.titulos.map(
                    (titulo, index) => (
                      <Box
                        key={
                          titulo.nufin ??
                          `${titulo.nunota}-${titulo.parcela}-${index}`
                        }
                        sx={{
                          display: 'grid',
                          gridTemplateColumns:
                            'minmax(0, 1fr) auto',
                          alignItems: 'center',
                          gap: 1.5,
                          px: 1,
                          py: 0.8,
                          borderRadius: 1.5,
                          backgroundColor:
                            grupo.backgroundColor,
                          border:
                            `1px solid ${grupo.color}18`,
                        }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            noWrap
                            title={
                              titulo.parceiro ??
                              undefined
                            }
                            sx={{
                              color: '#334155',
                              fontSize: '0.7rem',
                              fontWeight: 850,
                            }}
                          >
                            {titulo.parceiro ||
                              'Parceiro não informado'}
                          </Typography>

                          <Typography
                            noWrap
                            sx={{
                              mt: 0.15,
                              color: '#94a3b8',
                              fontSize: '0.62rem',
                              fontWeight: 700,
                            }}
                          >
                            NF {titulo.nunota ?? '—'}
                            {' · '}Parcela{' '}
                            {titulo.parcela ?? '—'}
                            {' · '}NUFIN{' '}
                            {titulo.nufin ?? '—'}
                          </Typography>
                        </Box>

                        <Typography
                          sx={{
                            color: grupo.color,
                            fontSize: '0.73rem',
                            fontWeight: 900,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {formatCurrency(
                            getPaymentValue(titulo),
                          )}
                        </Typography>
                      </Box>
                    ),
                  )}
                </Box>
              )}
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
}

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
  const netResultPercent = safeRatio(netResult, consolidatedValue);

  const deductions = [
    { key: 'custo', label: 'Custo total', value: totalCost },
    { key: 'tributos', label: 'Tributos', value: totalTaxes },
    { key: 'comissao', label: 'Comissão', value: totalCommission },
  ];

  const rowLabelSx = {
    color: '#64748b',
    fontSize: '0.73rem',
    fontWeight: 700,
  };

  const rowValueSx = {
    color: '#ef4444',
    fontSize: '0.78rem',
    fontWeight: 850,
    whiteSpace: 'nowrap',
  };

  return (
    <Box sx={{ minWidth: 270, p: 0.5 }}>
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
        <Typography sx={{ color: '#334155', fontSize: '0.76rem', fontWeight: 800 }}>
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
          borderLeft: '2px solid rgba(239, 68, 68, 0.18)',
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
            <Typography sx={rowLabelSx}>(−) {row.label}</Typography>
            <Typography sx={rowValueSx}>
              -{formatCurrency(Math.abs(row.value))}
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
          borderTop: '1px solid rgba(148, 163, 184, 0.22)',
        }}
      >
        <Typography sx={{ color: '#0f172a', fontSize: '0.74rem', fontWeight: 900 }}>
          Margem bruta
        </Typography>
        <Typography
          sx={{
            color: grossMargin >= 0 ? '#10b981' : '#ef4444',
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
          borderLeft: '2px solid rgba(239, 68, 68, 0.18)',
        }}
      >
        <Typography sx={rowLabelSx}>
          (−) Custo operacional ({OPERATIONAL_COST_PERCENTUAL}%)
        </Typography>
        <Typography sx={rowValueSx}>
          -{formatCurrency(Math.abs(operationalCost))}
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
          borderTop: '1px solid rgba(148, 163, 184, 0.22)',
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
              color: netResult >= 0 ? '#10b981' : '#ef4444',
              fontSize: '0.9rem',
              fontWeight: 900,
              whiteSpace: 'nowrap',
            }}
          >
            {formatCurrency(netResult)}
          </Typography>
          <Typography
            sx={{
              color: netResult >= 0 ? '#10b981' : '#ef4444',
              opacity: 0.72,
              fontSize: '0.68rem',
              fontWeight: 800,
              whiteSpace: 'nowrap',
            }}
          >
            {formatPercentRatio(netResultPercent)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

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
    backgroundColor: string;
    breakdown?: ReactNode;
  }> = [
    {
      key: 'venda',
      label: 'Total venda',
      value: salesValue,
      color: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.04)',
    },
    {
      key: 'devolucoes',
      label: 'Total devoluções',
      value: returnsValue,
      color: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.04)',
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
      color: netSalesValue >= 0 ? '#10b981' : '#ef4444',
      backgroundColor: netSalesValue >= 0
        ? 'rgba(16, 185, 129, 0.04)'
        : 'rgba(239, 68, 68, 0.04)',
    },
    {
      key: 'bonificacoes',
      label: 'Bonificação',
      value: bonusValue,
      color: '#C96A16',
      backgroundColor: 'rgba(139, 92, 246, 0.04)',
    },
    {
      key: 'custo',
      label: 'Total custo',
      value: totalCost,
      color: '#DC2626',
      backgroundColor: 'rgba(245, 158, 11, 0.04)',
    },
    {
      key: 'encargos',
      label: 'Encargos',
      value: totalTaxes,
      color: '#f97316',
      backgroundColor: 'rgba(249, 115, 22, 0.04)',
    },
    {
      key: 'comissao',
      label: 'Comissão',
      value: totalCommission,
      color: '#fb923c',
      backgroundColor: 'rgba(251, 146, 60, 0.04)',
    },
    {
      key: 'interno_obras',
      label: 'Interno Obras líquido',
      value: internalValue,
      color: '#06b6d4',
      backgroundColor: 'rgba(6, 182, 212, 0.04)',
      breakdown: (
        <InternalWorksBreakdownTooltip
          grossValue={internalGrossValue}
          cost={internalCost}
          returnsValue={internalReturnsValue}
          netValue={internalValue}
        />
      ),
    },
  ];

return (
  <Card
    sx={{
      height: '100%',
      borderRadius: 3,
      border: '1px solid rgba(148, 163, 184, 0.12)',
      backgroundColor: '#ffffff',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      animation: `${fadeInUp} 0.6s ease-out 0.1s both`,
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '2px',
      background: 'linear-gradient(90deg, transparent 0%, #3b82f699 15%, #06b6d499 50%, #8b5cf699 85%, transparent 100%)',
      backgroundSize: '200% 100%',
      animation: `${shimmer} 7s infinite linear`,
      zIndex: 2,
    },
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.03)',
      },
    }}
  >
    <CardContent
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        p: 2.5,
        position: 'relative',
        zIndex: 1,
        '&:last-child': {
          pb: 2.5,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Box>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontWeight: 800,
              lineHeight: 1.25,
              letterSpacing: '-0.01em',
            }}
          >
            Operações
          </Typography>

          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 0.2,
              color: '#94a3b8',
              fontSize: '0.62rem',
              fontWeight: 600,
            }}
          >
            Vendas, Interno Obras, Bonificações e devoluções
          </Typography>
        </Box>

        <Box
          sx={{
            width: 38,
            height: 38,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            borderRadius: 2.5,
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.15)',
            transition: 'all 0.3s ease',
            '& svg': {
              fontSize: 21,
              color: '#3b82f6',
            },
            '&:hover': {
              transform: 'scale(1.1)',
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
          gap: { xs: 1.15, sm: 0 },
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
                px: { xs: 0, sm: isFirstInRow ? 0 : 1.35 },
                py: { xs: 0, sm: 0 },
                borderLeft: {
                  xs: 'none',
                  sm: isFirstInRow ? 'none' : '1px solid rgba(148, 163, 184, 0.15)',
                },
                borderTop: {
                  xs: index === 0 ? 'none' : '1px solid rgba(148, 163, 184, 0.1)',
                  sm: isFirstRow ? 'none' : '1px solid rgba(148, 163, 184, 0.1)',
                },
                pt: { xs: index === 0 ? 0 : 1, sm: isFirstRow ? 0 : 1 },
                cursor: item.breakdown ? 'help' : 'default',
                transition: 'all 0.2s ease',
                animation: `${fadeInUp} 0.5s ease-out ${0.1 + index * 0.04}s both`,
                ...(item.breakdown
                  ? {
                      '&:hover': {
                        backgroundColor: item.backgroundColor,
                        transform: 'scale(1.02)',
                      },
                    }
                  : {
                      '&:hover': {
                        backgroundColor: item.backgroundColor,
                      },
                    }),
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: item.color,
                    boxShadow: `0 0 6px ${item.color}66`,
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: item.color,
                    fontSize: '0.62rem',
                    fontWeight: 900,
                    letterSpacing: '0.03em',
                    textTransform: 'uppercase',
                  }}
                >
                  {item.label}
                </Typography>
              </Box>

              <Typography
                component="div"
                sx={{
                  color: '#0f172a',
                  fontSize: { xs: '1.15rem', md: '1.2rem' },
                  lineHeight: 1.15,
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  whiteSpace: 'nowrap',
                }}
              >
                <RollingCurrency
                  value={item.value}
                  startDelay={rollDelay + index * 60}
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
              slotProps={richTooltipSlotProps}
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

function SingleMetric({
  title,
  label,
  value,
  color,
  caption,
  icon,
  iconColor,
  backgroundColor,
}: SingleMetricProps) {
  return (
    <Box
      sx={{
        minWidth: 0,
        height: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        px: { xs: 2, md: 2.25 },
        py: { xs: 1.8, md: 2 },
        borderRadius: 3,
        backgroundColor,
        border: '1px solid rgba(148, 163, 184, 0.1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${iconColor}10, transparent)`,
          pointerEvents: 'none',
        },
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.05)',
          '& .metric-icon': {
            transform: 'scale(1.1)',
          },
        },
      }}
    >
      <Box
        className="metric-icon"
        sx={{
          width: 42,
          height: 42,
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
          borderRadius: 2.5,
          color: iconColor,
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
          border: `1px solid ${iconColor}20`,
          transition: 'all 0.3s ease',
          '& svg': {
            fontSize: 22,
          },
        }}
      >
        {icon}
      </Box>

      <Box sx={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
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

        <Box sx={{ mt: 0.35, minHeight: 40 }}>
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
            {label}
          </Typography>

          <Typography
            component="div"
            sx={{
              mt: 0.2,
              color,
              fontSize: { xs: '1.1rem', md: '1.2rem' },
              lineHeight: 1.2,
              fontWeight: 900,
              letterSpacing: '-0.025em',
              whiteSpace: 'nowrap',
            }}
          >
            <RollingCurrency value={value} delayStep={60} />
          </Typography>
        </Box>

        <Chip
          label={caption}
          size="small"
          sx={{
            mt: 2,
            alignSelf: 'flex-start',
            height: 22,
            fontSize: '0.6rem',
            fontWeight: 600,
            backgroundColor: 'rgba(148, 163, 184, 0.06)',
            color: '#64748b',
            border: '1px solid rgba(148, 163, 184, 0.15)',
          }}
        />
      </Box>
    </Box>
  );
}

function ThreeColumnMetric({
  title,
  items,
  caption,
  icon,
  iconColor,
  backgroundColor,
}: ThreeColumnMetricProps) {
  return (
    <Box
      sx={{
        minWidth: 0,
        height: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        px: { xs: 2, md: 2.25 },
        py: { xs: 1.8, md: 2 },
        borderRadius: 3,
        backgroundColor,
        border: '1px solid rgba(148, 163, 184, 0.1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${iconColor}10, transparent)`,
          pointerEvents: 'none',
        },
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.05)',
          '& .metric-icon': {
            transform: 'scale(1.1)',
          },
        },
      }}
    >
      <Box
        className="metric-icon"
        sx={{
          width: 42,
          height: 42,
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
          borderRadius: 2.5,
          color: iconColor,
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
          border: `1px solid ${iconColor}20`,
          transition: 'all 0.3s ease',
          '& svg': {
            fontSize: 22,
          },
        }}
      >
        {icon}
      </Box>

      <Box sx={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
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
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 1.25,
            mt: 0.35,
            minHeight: 40,
          }}
        >
          {items.map((item, index) => (
            <Box
              key={item.label}
              sx={{
                minWidth: 0,
                pl: index === 0 ? 0 : 1.25,
                borderLeft:
                  index === 0
                    ? 'none'
                    : '1px solid rgba(148, 163, 184, 0.22)',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  color: item.color,
                  fontSize: '0.63rem',
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
                  mt: 0.2,
                  color: item.color,
                  fontSize: { xs: '0.88rem', md: '0.96rem' },
                  lineHeight: 1.2,
                  fontWeight: 900,
                  letterSpacing: '-0.025em',
                  whiteSpace: 'nowrap',
                }}
              >
                <RollingCurrency value={item.value} delayStep={60} />
              </Typography>
            </Box>
          ))}
        </Box>

        <Chip
          label={caption}
          size="small"
          sx={{
            mt: 2,
            alignSelf: 'flex-start',
            height: 22,
            fontSize: '0.6rem',
            fontWeight: 600,
            backgroundColor: 'rgba(148, 163, 184, 0.06)',
            color: '#64748b',
            border: '1px solid rgba(148, 163, 184, 0.15)',
          }}
        />
      </Box>
    </Box>
  );
}

export function SummarySection({
  kpis,
  pagamentos = [],
}: SummarySectionProps) {
  /*
   * REMESSAS
   */
  const valorRemessaFutura =
    safeNumber(kpis.remessa_futura?.total_faturamento);

  const valorRemessaTransporte =
    safeNumber(
      kpis.remessa_transporte?.valor_nota ??
      kpis.remessa_futura?.total_entregue,
    );

  const saldoRemessa =
    kpis.remessa_futura?.saldo == null
      ? valorRemessaFutura - valorRemessaTransporte
      : safeNumber(kpis.remessa_futura.saldo);

  const custoRemessa =
    safeNumber(kpis.remessa_futura?.custo_total);

  /*
   * MÃO DE OBRA, COMPRAS E PAGAMENTOS
   */
  const maoDeObraValor =
    safeNumber(kpis.mao_de_obra?.valor_nota);

  const comprasValor =
    safeNumber(kpis.compras?.valor_nota);

  const pagamentosPago =
    safeNumber(kpis.pagamentos?.valor_pago);

  const pagamentosEmAberto =
    safeNumber(kpis.pagamentos?.valor_em_aberto);

  const pagamentosVencido =
    safeNumber(kpis.pagamentos?.valor_vencido);

  const pagamentosTitulos =
    safeNumber(kpis.pagamentos?.quantidade_titulos);

  /*
   * CUSTOS POR ORIGEM
   */
  const custoVendas =
    safeNumber(kpis.vendas?.custo_total);

  const custoDevolucoes =
    safeNumber(kpis.vendas?.custo_devolucoes);

  const custoDevolucoesInternoObras =
    safeNumber(kpis.devolucoes_interno_obras?.custo_total);

  const custoTotalDevolucoes =
    custoDevolucoes + custoDevolucoesInternoObras;

  const custoInternoObrasBruto =
    safeNumber(
      kpis.interno_obras?.custo_bruto ??
      safeNumber(kpis.interno_obras?.custo_total) + custoDevolucoesInternoObras,
    );

  const custoInternoObras =
    safeNumber(kpis.interno_obras?.custo_total);

  /*
   * DEVOLUÇÕES
   */
  const totalDevolucoes =
    safeNumber(kpis.vendas?.total_devolucoes);

  const totalDevolucoesInternoObras =
    safeNumber(kpis.devolucoes_interno_obras?.total);

  const totalGeralDevolucoes =
    totalDevolucoes + totalDevolucoesInternoObras;

  const totalVendasBruto =
    safeNumber(kpis.vendas?.total_vendas);

  const totalVendaComRemessa =
    totalVendasBruto + valorRemessaFutura;

  const totalVendasLiquido =
    roundMoney(totalVendaComRemessa - totalDevolucoes);

  /*
   * BONIFICADOS
   */
  const totalBonificados =
    safeNumber(kpis.bonificados?.valor_nota);

  const custoBonificados =
    safeNumber(kpis.bonificados?.custo_medio_sem_icms_total);

  /*
   * CUSTO DAS OPERAÇÕES
   */
  const custoOperacoes =
    custoRemessa +
    custoVendas +
    custoInternoObrasBruto -
    custoTotalDevolucoes;

  const totalCusto =
    custoOperacoes + custoBonificados;

  /*
   * ENCARGOS CONSOLIDADOS
   */
  const impostosVendasGrupo =
    normalizeTaxGroup(kpis.impostos?.vendas);

  const impostosDevolucoesGrupo =
    negativeTaxGroup(kpis.impostos?.devolucoes);

  const impostosInternoObrasLiquidoGrupo =
    normalizeTaxGroup(kpis.impostos?.interno_obras);

  const impostosDevolucoesInternoObrasPositivoGrupo =
    normalizeTaxGroup(kpis.impostos?.devolucoes_interno_obras);

  const impostosInternoObrasBrutoGrupo =
    sumTaxGroups(
      impostosInternoObrasLiquidoGrupo,
      impostosDevolucoesInternoObrasPositivoGrupo,
    );

  const impostosDevolucoesInternoObrasGrupo =
    negativeTaxGroup(kpis.impostos?.devolucoes_interno_obras);

  const impostosRemessaFuturaGrupo =
    normalizeTaxGroup(kpis.impostos?.remessa_futura);

  const impostosBonificadosGrupo =
    normalizeTaxGroup({
      icms: safeNumber(kpis.bonificados?.valor_icms),
      pis: safeNumber(kpis.bonificados?.valor_pis),
      cofins: safeNumber(kpis.bonificados?.valor_cofins),
      federais: 0,
      total_tributos: safeNumber(kpis.bonificados?.valor_impostos),
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
   * IRPJ/CSLL
   */
  const valorInternoObrasBruto =
    safeNumber(
      kpis.interno_obras?.total_bruto ??
      kpis.interno_obras?.total,
    );

  const irpjCsslVendas =
    roundMoney(safeNumber(kpis.vendas?.total_vendas) * IRPJ_CSSL_RATE);

  const irpjCsslDevolucoes =
    -roundMoney(totalDevolucoes * IRPJ_CSSL_RATE);

  const irpjCsslBonificados =
    roundMoney(totalBonificados * IRPJ_CSSL_RATE);

  const irpjCsslInternoObras =
    roundMoney(valorInternoObrasBruto * IRPJ_CSSL_RATE);

  const irpjCsslDevolucoesInternoObras =
    -roundMoney(
      kpis.devolucoes_interno_obras?.irpj_cssl ??
      totalDevolucoesInternoObras * IRPJ_CSSL_RATE,
    );

  const irpjCsslRemessaFutura =
    roundMoney(valorRemessaFutura * IRPJ_CSSL_RATE);

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
    roundMoney(impostosConsolidadoGrupo.total_tributos + totalIrpjCssl);

  const totalComissao =
    roundMoney(impostosConsolidadoGrupo.comissao);

  /*
   * RESULTADO CONSOLIDADO
   */
  const valorConsolidado =
    roundMoney(
      safeNumber(kpis.vendas?.total_vendas) -
      totalDevolucoes +
      valorRemessaFutura,
    );

  const margemBruta =
    roundMoney(
      valorConsolidado - totalCusto - totalImpostos - totalComissao,
    );

  const custoOperacional =
    roundMoney(valorConsolidado * OPERATIONAL_COST_RATE);

  const resultadoLiquido =
    roundMoney(margemBruta - custoOperacional);

  return (
    <Box component="section">
      {/* TÍTULO */}
      <Box sx={{ mb: 3 }}>
        <Typography
          component="h2"
          variant="h5"
          sx={{
            background: 'linear-gradient(135deg, #0f172a 0%, #334155 50%, #475569 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 900,
            letterSpacing: '-0.025em',
            animation: `${fadeInUp} 0.6s ease-out`,
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
            animation: `${fadeInUp} 0.6s ease-out 0.1s both`,
          }}
        >
          Visão geral dos principais valores da obra.
        </Typography>
      </Box>

      {/* CARDS PRINCIPAIS */}
      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          alignItems: 'stretch',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'minmax(0, 0.8fr) minmax(0, 1.2fr)',
          },
        }}
      >
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

        <OperationsBreakdownCard
          salesValue={totalVendaComRemessa}
          netSalesValue={totalVendasLiquido}
          returnsValue={totalGeralDevolucoes}
          returnsSalesValue={totalDevolucoes}
          returnsSalesCost={custoDevolucoes}
          returnsInternalValue={totalDevolucoesInternoObras}
          returnsInternalCost={custoDevolucoesInternoObras}
          totalCost={totalCusto}
          totalTaxes={totalImpostos}
          totalCommission={totalComissao}
          internalValue={safeNumber(kpis.interno_obras?.total)}
          internalGrossValue={valorInternoObrasBruto}
          internalCost={custoInternoObras}
          internalReturnsValue={totalDevolucoesInternoObras}
          bonusValue={totalBonificados}
          rollDelay={210}
        />
      </Box>

      {/* CONSOLIDADO RÁPIDO */}
      <Card
        sx={{
          mt: 3,
          border: '1px solid rgba(148, 163, 184, 0.1)',
          borderRadius: 3,
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
          animation: `${fadeInUp} 0.6s ease-out 0.2s both`,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            alignItems: 'stretch',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              xl: '1.2fr 1.1fr 0.75fr 1.3fr',
            },
            gap: 1.5,
            p: { xs: 1.5, md: 1.75 },
          }}
        >
          {/* MÃO DE OBRA */}
          <Box
            sx={{
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 156,
              px: { xs: 2.4, md: 2.8 },
              py: 2.5,
              borderRadius: 3,
              color: '#ffffff',
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
              backgroundSize: '200% 200%',
              animation: `${gradientShift} 8s ease infinite`,
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.2)',
              '&::before': {
                content: '""',
                position: 'absolute',
                width: 180,
                height: 180,
                right: -90,
                bottom: -120,
                borderRadius: '50%',
                backgroundColor: 'rgba(193, 141, 52, 0.12)',
                pointerEvents: 'none',
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                width: 120,
                height: 120,
                left: -40,
                top: -60,
                borderRadius: '50%',
                backgroundColor: 'rgba(99, 102, 241, 0.08)',
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
                    color: 'rgba(255, 255, 255, 0.68)',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  Mão de obra
                </Typography>

                <Typography
                  component="div"
                  sx={{
                    mt: 0.7,
                    color: '#ffffff',
                    fontSize: { xs: '1.55rem', md: '1.8rem' },
                    lineHeight: 1.1,
                    fontWeight: 900,
                    letterSpacing: '-0.04em',
                  }}
                >
                  <RollingCurrency
                    value={maoDeObraValor}
                    duration={1300}
                    delayStep={85}
                  />
                </Typography>
              </Box>

              <Box
                sx={{
                  width: 48,
                  height: 48,
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                  borderRadius: 3,
                  color: '#ffffff',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(8px)',
                  '& svg': {
                    fontSize: 26,
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  },
                }}
              >
                <BuildOutlinedIcon />
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
                label="MÃO DE OBRA PAGA"
                size="small"
                sx={{
                  height: 24,
                  color: '#ffffff',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  fontSize: '0.62rem',
                  fontWeight: 900,
                  letterSpacing: '0.04em',
                }}
              />
            </Box>
          </Box>

          {/* PAGAMENTOS */}
          <Tooltip
            title={
              <PaymentsBreakdownTooltip
                pagamentos={pagamentos}
              />
            }
            arrow
            placement="top"
            enterDelay={250}
            leaveDelay={250}
            disableInteractive={false}
            slotProps={paymentsTooltipSlotProps}
          >
            <Box
              sx={{
                minWidth: 0,
                height: '100%',
                cursor: 'help',
              }}
            >
              <ThreeColumnMetric
                title="Recebimentos"
                items={[
                  {
                    label: 'Recebido',
                    value: pagamentosPago,
                    color: '#16a34a',
                  },
                  {
                    label: 'A receber',
                    value: pagamentosEmAberto,
                    color: '#d97706',
                  },
                  {
                    label: 'Vencido',
                    value: pagamentosVencido,
                    color:
                      pagamentosVencido > 0
                        ? '#dc2626'
                        : '#94a3b8',
                  },
                ]}
                caption={`${pagamentosTitulos} títulos`}
                icon={
                  <AccountBalanceWalletOutlinedIcon />
                }
                iconColor="#16a34a"
                backgroundColor="rgba(22, 163, 74, 0.04)"
              />
            </Box>
          </Tooltip>

          {/* COMPRAS */}
          <SingleMetric
            title="Compras"
            label="Valor nota"
            value={comprasValor}
            color="#0d9488"
            caption="Notas de compra do projeto"
            icon={<ShoppingCartOutlinedIcon />}
            iconColor="#0d9488"
            backgroundColor="rgba(13, 148, 136, 0.04)"
          />

          {/* REMESSA: FATURADO, ENTREGUE E SALDO */}
          <ThreeColumnMetric
            title="Remessa"
            items={[
              {
                label: 'Faturado',
                value: valorRemessaFutura,
                color: '#0f172a',
              },
              {
                label: 'Entregue',
                value: valorRemessaTransporte,
                color: '#3b82f6',
              },
              {
                label: 'Saldo',
                value: saldoRemessa,
                color: '#d97706',
              },
            ]}
            caption="Faturamento, entrega e saldo da remessa"
            icon={<Inventory2OutlinedIcon />}
            iconColor="#3b82f6"
            backgroundColor="rgba(59, 130, 246, 0.04)"
          />
        </Box>
      </Card>
    </Box>
  );
}