import type { ReactNode } from 'react';

import {
  Box,
  Card,
  Chip,
  Skeleton,
  Tooltip,
  Typography,
} from '@mui/material';

import logoSankhya from '@/assets/logoSankhya.png';
import logoVexpenses from '@/assets/logoVexpenses.png';
import { RollingCurrency } from '@/components/common/RollingCurrency';
import type {
  DespesaGeralItem,
  DespesasGeraisKpis,
} from '@/types/dashboard';
import type {
  VExpensesExpenseItem,
  VExpensesLoadResult,
} from '@/types/vexpenses';
import { formatCurrency } from '@/utils/formatters';

interface VExpensesSectionProps {
  result?: VExpensesLoadResult;
  expenses?: VExpensesExpenseItem[];
  despesasGeraisKpis?: DespesasGeraisKpis;
  despesasGerais?: DespesaGeralItem[];
  loading?: boolean;
  error?: Error | null;
}

const richTooltipSlotProps = {
  tooltip: {
    sx: {
      backgroundColor: '#ffffff',
      color: '#0f172a',
      borderRadius: 2.5,
      border: '1px solid rgba(148, 163, 184, 0.16)',
      boxShadow:
        '0 16px 36px rgba(15, 23, 42, 0.18), 0 4px 12px rgba(15, 23, 42, 0.08)',
      px: 1.6,
      py: 1.4,
      maxWidth: 'none',
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

function formatDataCurta(
  date: string | null,
): string {
  if (!date) {
    return '—';
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return '—';
  }

  return parsed.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function VExpensesBreakdownTooltip({
  expenses,
}: {
  expenses: VExpensesExpenseItem[];
}) {
  const totalSomado = expenses.reduce(
    (acumulado, despesa) =>
      acumulado + safeNumber(despesa.value),
    0,
  );

  const despesasOrdenadas = [...expenses].sort(
    (a, b) =>
      (b.date ?? '').localeCompare(a.date ?? ''),
  );

  return (
    <Box
      sx={{
        width: 420,
        maxWidth: 'calc(100vw - 24px)',
        maxHeight: 'calc(100vh - 32px)',
        display: 'flex',
        flexDirection: 'column',
        p: 0.4,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              color: '#94a3b8',
              fontSize: '0.63rem',
              fontWeight: 900,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            Detalhamento das despesas
          </Typography>

          <Typography
            sx={{
              mt: 0.15,
              color: '#475569',
              fontSize: '0.66rem',
              fontWeight: 700,
              lineHeight: 1.3,
            }}
          >
            Despesas lançadas na VExpenses para este projeto.
          </Typography>
        </Box>

        <Chip
          label={`${expenses.length} despesas`}
          size="small"
          sx={{
            height: 21,
            flexShrink: 0,
            color: '#475569',
            backgroundColor:
              'rgba(148, 163, 184, 0.10)',
            fontSize: '0.6rem',
            fontWeight: 800,
          }}
        />
      </Box>

      <Typography
        sx={{
          mt: 0.65,
          color: '#94a3b8',
          fontSize: '0.59rem',
          fontWeight: 700,
          textAlign: 'right',
        }}
      >
        Total: {formatCurrency(totalSomado)}
      </Typography>

      <Box
        sx={{
          mt: 0.75,
          pt: 0.7,
          minHeight: 0,
          maxHeight: 320,
          overflowY: 'auto',
          pr: 0.4,
          borderTop:
            '1px solid rgba(148, 163, 184, 0.20)',
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
        {despesasOrdenadas.length === 0 ? (
          <Typography
            sx={{
              py: 1,
              color: '#94a3b8',
              fontSize: '0.68rem',
              fontWeight: 700,
              textAlign: 'center',
            }}
          >
            Nenhuma despesa encontrada para os filtros.
          </Typography>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0.45,
            }}
          >
            {despesasOrdenadas.map((despesa) => (
              <Box
                key={despesa.id}
                sx={{
                  display: 'grid',
                  gridTemplateColumns:
                    'minmax(0, 1fr) auto',
                  alignItems: 'center',
                  gap: 1,
                  px: 0.85,
                  py: 0.65,
                  borderRadius: 1.35,
                  backgroundColor:
                    'rgba(63, 161, 255, 0.06)',
                  border:
                    '1px solid rgba(63, 161, 255, 0.18)',
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    noWrap
                    title={
                      despesa.title ?? undefined
                    }
                    sx={{
                      color: '#334155',
                      fontSize: '0.67rem',
                      fontWeight: 850,
                    }}
                  >
                    {despesa.title ||
                      'Despesa sem título'}
                  </Typography>

                  <Typography
                    noWrap
                    sx={{
                      mt: 0.1,
                      color: '#94a3b8',
                      fontSize: '0.59rem',
                      fontWeight: 700,
                    }}
                  >
                    {formatDataCurta(
                      despesa.date,
                    )}
                    {' · '}Despesa{' '}
                    {despesa.expense_id}
                    {despesa.rejected ? (
                      <Box
                        component="span"
                        sx={{
                          color: '#dc2626',
                          fontWeight: 900,
                        }}
                      >
                        {' · Rejeitada'}
                      </Box>
                    ) : null}
                  </Typography>
                </Box>

                <Typography
                  sx={{
                    color: '#3FA1FF',
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formatCurrency(despesa.value)}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

function despesaStatusColor(status: string): string {
  if (status === 'PAGA') {
    return '#059669';
  }

  if (status === 'VENCIDA') {
    return '#dc2626';
  }

  return '#d97706';
}

function DespesasGeraisTooltip({
  despesas,
}: {
  despesas: DespesaGeralItem[];
}) {
  const totalSomado = despesas.reduce(
    (acumulado, despesa) =>
      acumulado + safeNumber(despesa.valor_despesa),
    0,
  );

  const despesasOrdenadas = [...despesas].sort(
    (a, b) =>
      (b.dtneg ?? '').localeCompare(a.dtneg ?? ''),
  );

  return (
    <Box
      sx={{
        width: 420,
        maxWidth: 'calc(100vw - 24px)',
        maxHeight: 'calc(100vh - 32px)',
        display: 'flex',
        flexDirection: 'column',
        p: 0.4,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              color: '#94a3b8',
              fontSize: '0.63rem',
              fontWeight: 900,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            Detalhamento das despesas
          </Typography>

          <Typography
            sx={{
              mt: 0.15,
              color: '#475569',
              fontSize: '0.66rem',
              fontWeight: 700,
              lineHeight: 1.3,
            }}
          >
            Despesas gerais lançadas para este projeto.
          </Typography>
        </Box>

        <Chip
          label={`${despesas.length} despesas`}
          size="small"
          sx={{
            height: 21,
            flexShrink: 0,
            color: '#475569',
            backgroundColor:
              'rgba(148, 163, 184, 0.10)',
            fontSize: '0.6rem',
            fontWeight: 800,
          }}
        />
      </Box>

      <Typography
        sx={{
          mt: 0.65,
          color: '#94a3b8',
          fontSize: '0.59rem',
          fontWeight: 700,
          textAlign: 'right',
        }}
      >
        Total: {formatCurrency(totalSomado)}
      </Typography>

      <Box
        sx={{
          mt: 0.75,
          pt: 0.7,
          minHeight: 0,
          maxHeight: 320,
          overflowY: 'auto',
          pr: 0.4,
          borderTop:
            '1px solid rgba(148, 163, 184, 0.20)',
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
        {despesasOrdenadas.length === 0 ? (
          <Typography
            sx={{
              py: 1,
              color: '#94a3b8',
              fontSize: '0.68rem',
              fontWeight: 700,
              textAlign: 'center',
            }}
          >
            Nenhuma despesa encontrada para os filtros.
          </Typography>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0.45,
            }}
          >
            {despesasOrdenadas.map((despesa) => (
              <Box
                key={despesa.nufin}
                sx={{
                  display: 'grid',
                  gridTemplateColumns:
                    'minmax(0, 1fr) auto',
                  alignItems: 'center',
                  gap: 1,
                  px: 0.85,
                  py: 0.65,
                  borderRadius: 1.35,
                  backgroundColor:
                    'rgba(15, 23, 42, 0.03)',
                  border:
                    '1px solid rgba(148, 163, 184, 0.18)',
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    noWrap
                    title={
                      despesa.parceiro ?? undefined
                    }
                    sx={{
                      color: '#334155',
                      fontSize: '0.67rem',
                      fontWeight: 850,
                    }}
                  >
                    {despesa.parceiro ||
                      despesa.natureza ||
                      'Despesa sem descrição'}
                  </Typography>

                  <Typography
                    noWrap
                    sx={{
                      mt: 0.1,
                      color: '#94a3b8',
                      fontSize: '0.59rem',
                      fontWeight: 700,
                    }}
                  >
                    {formatDataCurta(
                      despesa.dtvenc,
                    )}
                    {' · '}
                    {despesa.natureza || 'Sem natureza'}
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'right' }}>
                  <Typography
                    sx={{
                      color: '#0f172a',
                      fontSize: '0.7rem',
                      fontWeight: 900,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatCurrency(despesa.valor_despesa)}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.1,
                      color: despesaStatusColor(
                        despesa.status_despesa,
                      ),
                      fontSize: '0.56rem',
                      fontWeight: 850,
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {despesa.status_despesa}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

type MetricFormat = 'currency' | 'number';

interface MetricItem {
  label: string;
  value: number;
  color: string;
  format: MetricFormat;
}

interface SecondaryCardProps {
  title: string;
  subtitle: string;
  items: [MetricItem, MetricItem, MetricItem];
  accentColor: string;
  icon?: ReactNode;
}

function safeNumber(value: number | null | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function SecondaryCard({
  title,
  subtitle,
  items,
  accentColor,
  icon,
}: SecondaryCardProps) {
  return (
    <Box
      sx={{
        minWidth: 0,
        minHeight: 156,
        height: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        p: 2.4,
        borderRadius: 3,
        border: '1px solid rgba(148, 163, 184, 0.13)',
        backgroundColor: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 180ms ease, box-shadow 180ms ease',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 88% 8%, ${accentColor}12, transparent 34%)`,
          pointerEvents: 'none',
        },
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow:
            '0 14px 30px rgba(15, 23, 42, 0.08)',
        },
      }}
    >
      {icon ? (
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            width: 42,
            height: 42,
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            borderRadius: 2.5,
            color: accentColor,
            backgroundColor: '#ffffff',
            border: `1px solid ${accentColor}22`,
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
            '& svg': {
              fontSize: 22,
            },
          }}
        >
          {icon}
        </Box>
      ) : null}

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          minWidth: 0,
          flex: 1,
        }}
      >
        <Typography
          sx={{
            color: '#64748b',
            fontSize: '0.76rem',
            fontWeight: 850,
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            mt: 0.15,
            color: '#94a3b8',
            fontSize: '0.62rem',
            fontWeight: 650,
          }}
        >
          {subtitle}
        </Typography>

        <Box
          sx={{
            mt: 1.35,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 0,
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
                    : '1px solid rgba(148, 163, 184, 0.20)',
              }}
            >
              <Typography
                sx={{
                  color: item.color,
                  fontSize: '0.61rem',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.label}
              </Typography>

              <Typography
                component="div"
                sx={{
                  mt: 0.35,
                  color: item.color,
                  fontSize: { xs: '0.93rem', md: '1.03rem' },
                  lineHeight: 1.15,
                  fontWeight: 900,
                  letterSpacing: '-0.025em',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.format === 'currency' ? (
                  <RollingCurrency
                    value={item.value}
                    delayStep={55}
                  />
                ) : (
                  item.value.toLocaleString('pt-BR')
                )}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

function DespesasCard({
  kpis,
  despesas,
}: {
  kpis?: DespesasGeraisKpis;
  despesas: DespesaGeralItem[];
}) {
  const totalPago = safeNumber(kpis?.total_pago);
  const totalVencido = safeNumber(kpis?.total_vencido);
  const totalEmAberto = safeNumber(kpis?.total_em_aberto);

  const items: [MetricItem, MetricItem, MetricItem] = [
    {
      label: 'Pago',
      value: totalPago,
      color: '#059669',
      format: 'currency',
    },
    {
      label: 'Vencido',
      value: totalVencido,
      color: '#dc2626',
      format: 'currency',
    },
    {
      label: 'Em aberto',
      value: totalEmAberto,
      color: '#d97706',
      format: 'currency',
    },
  ];

  return (
    <Tooltip
      title={
        <DespesasGeraisTooltip
          despesas={despesas}
        />
      }
      arrow
      placement="bottom-start"
      enterDelay={180}
      leaveDelay={180}
      disableInteractive={false}
      slotProps={{
        ...richTooltipSlotProps,
        popper: {
          modifiers: [
            {
              name: 'offset',
              options: { offset: [0, 10] },
            },
            {
              name: 'preventOverflow',
              options: { padding: 12 },
            },
            {
              name: 'flip',
              options: {
                fallbackPlacements: [
                  'bottom-start',
                  'bottom',
                  'top-start',
                ],
              },
            },
          ],
        },
      }}
    >
      <Box
        sx={{
          minWidth: 0,
          minHeight: 156,
          height: '100%',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          p: 2.4,
          borderRadius: 3,
          border: '1px solid rgba(148, 163, 184, 0.13)',
          backgroundColor: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'help',
          transition: 'transform 180ms ease, box-shadow 180ms ease',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 88% 8%, #0ea5e912, transparent 34%)',
            pointerEvents: 'none',
          },
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow:
              '0 14px 30px rgba(15, 23, 42, 0.08)',
          },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            width: 68,
            height: 68,
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            border: '1px solid rgba(148, 163, 184, 0.20)',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
            overflow: 'hidden',
          }}
        >
          <Box
            component="img"
            src={logoSankhya}
            alt="Sankhya"
            sx={{
              display: 'block',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </Box>

        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            minWidth: 0,
            flex: 1,
          }}
        >
          <Typography
            sx={{
              color: '#64748b',
              fontSize: '0.76rem',
              fontWeight: 850,
            }}
          >
            Despesas
          </Typography>

          <Typography
            sx={{
              mt: 0.15,
              color: '#94a3b8',
              fontSize: '0.62rem',
              fontWeight: 650,
            }}
          >
            Situação das despesas gerais da obra
          </Typography>

          <Box
            sx={{
              mt: 1.35,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 0,
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
                      : '1px solid rgba(148, 163, 184, 0.20)',
                }}
              >
                <Typography
                  sx={{
                    color: item.color,
                    fontSize: '0.61rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.025em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.label}
                </Typography>

                <Typography
                  component="div"
                  sx={{
                    mt: 0.35,
                    color: item.color,
                    fontSize: { xs: '0.93rem', md: '1.03rem' },
                    lineHeight: 1.15,
                    fontWeight: 900,
                    letterSpacing: '-0.025em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <RollingCurrency
                    value={item.value}
                    delayStep={55}
                  />
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Tooltip>
  );
}

function VExpensesCardsSkeleton() {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 1.5,
        gridTemplateColumns: {
          xs: '1fr',
          lg: '0.8fr 1fr 1fr',
        },
      }}
    >
      {[0, 1, 2].map((item) => (
        <Skeleton
          key={item}
          variant="rounded"
          height={156}
          animation="wave"
          sx={{ borderRadius: 3 }}
        />
      ))}
    </Box>
  );
}

export function VExpensesSection({
  result,
  expenses = [],
  despesasGeraisKpis,
  despesasGerais = [],
  loading = false,
  error = null,
}: VExpensesSectionProps) {
  const linked = result?.linked === true;
  const response = result?.data;
  const summary = response?.summary;

  /*
   * Total, quantidade, média e reembolsável/não
   * reembolsável são somados a partir da lista real
   * de despesas (fonte da verdade), não do
   * agregado "summary" do backend — que já veio
   * inconsistente com os lançamentos reais.
   *
   * "Relatórios" continua vindo do summary porque
   * a lista de despesas não carrega o vínculo com
   * o relatório de origem.
   */
  const totalSomado = expenses.reduce(
    (acumulado, despesa) =>
      acumulado + safeNumber(despesa.value),
    0,
  );

  const quantidadeDespesas = expenses.length;

  const quantidadeRelatorios = safeNumber(summary?.quantidade_relatorios);

  const mediaPorDespesa =
    quantidadeDespesas > 0
      ? totalSomado / quantidadeDespesas
      : 0;

  const projectName =
    response?.project?.name?.trim() || 'Projeto não vinculado';

  const statusLabel = error
    ? 'Falha ao carregar'
    : linked
      ? 'Projeto vinculado'
      : 'Sem vínculo na VExpenses';

  return (
    <Box component="section">
      <Box sx={{ mb: 1.4 }}>
        <Typography
          component="h2"
          sx={{
            color: '#0f172a',
            fontSize: { xs: '1.15rem', md: '1.35rem' },
            fontWeight: 900,
            letterSpacing: '-0.025em',
          }}
        >
          Despesas da Obra
        </Typography>

        <Typography
          sx={{
            mt: 0.25,
            color: '#64748b',
            fontSize: '0.78rem',
            fontWeight: 500,
          }}
        >
          Despesas aprovadas e vinculadas ao projeto selecionado.
        </Typography>
      </Box>

      <Card
        sx={{
          p: 1.5,
          border: 'none',
          borderRadius: 3,
          backgroundColor: '#ffffff',
          boxShadow:
            '0 3px 10px rgba(15, 23, 42, 0.07), 0 12px 30px rgba(15, 23, 42, 0.06)',
        }}
      >
        {loading ? (
          <VExpensesCardsSkeleton />
        ) : (
          <Box
            sx={{
              display: 'grid',
              gap: 1.5,
              alignItems: 'stretch',
              gridTemplateColumns: {
                xs: '1fr',
                lg: '0.8fr 1fr 1fr',
              },
            }}
          >
            {/* CARD PRINCIPAL */}
            <Tooltip
              title={
                <VExpensesBreakdownTooltip
                  expenses={expenses}
                />
              }
              arrow
              placement="bottom-start"
              enterDelay={180}
              leaveDelay={180}
              disableInteractive={false}
              slotProps={{
                ...richTooltipSlotProps,
                popper: {
                  modifiers: [
                    {
                      name: 'offset',
                      options: { offset: [0, 10] },
                    },
                    {
                      name: 'preventOverflow',
                      options: { padding: 12 },
                    },
                    {
                      name: 'flip',
                      options: {
                        fallbackPlacements: [
                          'bottom-start',
                          'bottom',
                          'top-start',
                        ],
                      },
                    },
                  ],
                },
              }}
            >
            <Box
              sx={{
                minWidth: 0,
                minHeight: 156,
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'help',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                px: { xs: 2.4, md: 2.8 },
                py: 2.5,
                borderRadius: 3,
                color: '#ffffff',
                background:
                  'linear-gradient(135deg, #172033 0%, #20304a 52%, #0d4f7a 135%)',
                boxShadow: '0 10px 28px rgba(15, 23, 42, 0.18)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  width: 180,
                  height: 180,
                  right: -85,
                  bottom: -120,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(63, 161, 255, 0.18)',
                },
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 2,
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      color: 'rgba(255, 255, 255, 0.72)',
                      fontSize: '0.7rem',
                      fontWeight: 850,
                      letterSpacing: '0.075em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Total
                  </Typography>

                  <Typography
                    component="div"
                    sx={{
                      mt: 0.65,
                      color: '#ffffff',
                      fontSize: { xs: '1.55rem', md: '1.8rem' },
                      lineHeight: 1.1,
                      fontWeight: 900,
                      letterSpacing: '-0.04em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <RollingCurrency
                      value={totalSomado}
                      duration={1300}
                      delayStep={75}
                    />
                  </Typography>
                </Box>

                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Box
                    component="img"
                    src={logoVexpenses}
                    alt="VExpenses"
                    sx={{
                      display: 'block',
                      width: '100%',
                      objectFit: 'contain',
                      filter:
                        'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.35)) drop-shadow(0 0 14px rgba(59, 160, 239, 0.45))',
                    }}
                  />
                </Box>
              </Box>

              <Box
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 0.8,
                  mt: 1.4,
                }}
              >
                <Chip
                  label={statusLabel}
                  size="small"
                  sx={{
                    height: 23,
                    color: '#ffffff',
                    backgroundColor: error
                      ? 'rgba(239, 68, 68, 0.22)'
                      : linked
                        ? 'rgba(63, 161, 255, 0.22)'
                        : 'rgba(148, 163, 184, 0.20)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    fontSize: '0.6rem',
                    fontWeight: 850,
                  }}
                />

                <Typography
                  noWrap
                  title={projectName}
                  sx={{
                    minWidth: 0,
                    color: 'rgba(255, 255, 255, 0.72)',
                    fontSize: '0.64rem',
                    fontWeight: 700,
                  }}
                >
                  {projectName}
                </Typography>
              </Box>
            </Box>
            </Tooltip>

            {/* CARD 2 — EDITE OS ITENS AQUI QUANDO DEFINIR OS KPIs */}
            <SecondaryCard
              title="Movimentação VExpenses"
              subtitle="Volume de relatórios e despesas aprovadas"
              accentColor="#0ea5e9"
              items={[
                {
                  label: 'Despesas',
                  value: quantidadeDespesas,
                  color: '#0284c7',
                  format: 'number',
                },
                {
                  label: 'Relatórios',
                  value: quantidadeRelatorios,
                  color: '#2563eb',
                  format: 'number',
                },
                {
                  label: 'Média',
                  value: mediaPorDespesa,
                  color: '#7c3aed',
                  format: 'currency',
                },
              ]}
            />

            {/* CARD 3 — DESPESAS DA OBRA (SANKHYA) */}
            <DespesasCard
              kpis={despesasGeraisKpis}
              despesas={despesasGerais}
            />
          </Box>
        )}

        {!loading && error ? (
          <Typography
            sx={{
              mt: 1,
              color: '#dc2626',
              fontSize: '0.68rem',
              fontWeight: 700,
            }}
          >
            Não foi possível atualizar a VExpenses. Os cards foram mantidos zerados.
          </Typography>
        ) : null}
      </Card>
    </Box>
  );
}