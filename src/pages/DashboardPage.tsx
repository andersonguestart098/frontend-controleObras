import { useState } from 'react';

import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import ArchitectureRoundedIcon from '@mui/icons-material/ArchitectureRounded';
import AssignmentReturnRoundedIcon from '@mui/icons-material/AssignmentReturnRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import PaidRoundedIcon from '@mui/icons-material/PaidRounded';
import SavingsRoundedIcon from '@mui/icons-material/SavingsRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import WarehouseRoundedIcon from '@mui/icons-material/WarehouseRounded';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Typography,
} from '@mui/material';

import logoCemear from '@/assets/logo cem.png';
import { KpiCard } from '@/components/cards/KpiCard';
import { TaxSummaryTable } from '@/components/cards/TaxSummaryTable';
import { RemittanceProgressChart } from '@/components/charts/RemittanceProgressChart';
import { SalesCompositionChart } from '@/components/charts/SalesCompositionChart';
import { TaxBreakdownChart } from '@/components/charts/TaxBreakdownChart';
import { DashboardFilterBar } from '@/components/filters/DashboardFilterBar';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { RemittanceControlTable } from '@/components/remessas/RemittanceControlTable';
import { SummarySection } from '@/components/summary/SummarySection';
import { useDashboardKpis } from '@/hooks/useDashboardKpis';
import { useRemessasControl } from '@/hooks/useRemessasControl';
import type { DashboardFilters } from '@/types/dashboard';

const initialFilters: DashboardFilters = {
  codproj: 10030000,
  dtneg_inicial: null,
  dtneg_final: null,
  nunota: null,
};

const gridSx = {
  display: 'grid',
  gap: 2,

  gridTemplateColumns: {
    xs: '1fr',
    sm: 'repeat(2, minmax(0, 1fr))',
    xl: 'repeat(3, minmax(0, 1fr))',
  },
};

const sectionGridSx = {
  ...gridSx,

  mt: {
    xs: 2,
    md: 2.5,
  },
};

const summarySectionSx = {
  mt: {
    xs: 3,
    md: 5,
  },

  pb: {
    xs: 1,
    md: 1.5,
  },
};

const separatedSectionSx = {
  position: 'relative',

  mt: {
    xs: 4,
    md: 5,
  },

  pt: {
    xs: 4,
    md: 5,
  },

  '&::before': {
    content: '""',

    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,

    height: '1px',

    background:
      'linear-gradient(' +
      '90deg, ' +
      'transparent 0%, ' +
      'rgba(148, 163, 184, 0.10) 5%, ' +
      'rgba(14, 165, 233, 0.20) 50%, ' +
      'rgba(148, 163, 184, 0.10) 95%, ' +
      'transparent 100%' +
      ')',
  },
};

const contentCardSx = {
  border: 'none',
  borderRadius: 3,
  backgroundColor: '#ffffff',

  boxShadow:
    '0 3px 10px rgba(15, 23, 42, 0.07), ' +
    '0 12px 30px rgba(15, 23, 42, 0.06)',
};

const fadeUpSx = (
  delay = 0,
) => ({
  opacity: 0,
  transform: 'translateY(18px)',
  willChange: 'opacity, transform',

  animation:
    'fadeUp 650ms cubic-bezier(0.22, 1, 0.36, 1) forwards',

  animationDelay: `${delay}ms`,

  '@media (prefers-reduced-motion: reduce)': {
    opacity: 1,
    transform: 'none',
    animation: 'none',
  },
});

export function DashboardPage() {
  const [filters, setFilters] =
    useState<DashboardFilters>(
      initialFilters,
    );

  const dashboard =
    useDashboardKpis(filters);

  const remessasControl =
    useRemessasControl(filters);

  const isUpdating =
    dashboard.isFetching ||
    remessasControl.isFetching;

  const projectName =
  dashboard.data?.projeto.nome_projeto?.trim() ||
  `Projeto ${filters.codproj}`;

  function handleApplyFilters(
    nextFilters: DashboardFilters,
  ) {
    const sameFilters =
      filters.codproj ===
        nextFilters.codproj &&
      filters.dtneg_inicial ===
        nextFilters.dtneg_inicial &&
      filters.dtneg_final ===
        nextFilters.dtneg_final &&
      filters.nunota ===
        nextFilters.nunota;

    if (!sameFilters) {
      setFilters(nextFilters);
      return;
    }

    void Promise.all([
      dashboard.refetch(),
      remessasControl.refetch(),
    ]);
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f4f7fb',

        pb: {
          xs: 5,
          md: 8,
        },

        '@keyframes fadeUp': {
          '0%': {
            opacity: 0,
            transform: 'translateY(18px)',
          },

          '100%': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
      }}
    >
      <Box
        component="header"
        sx={{
          position: 'relative',
          overflow: 'hidden',

          background:
            'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',

          color: 'common.white',

          pt: {
            xs: 4,
            md: 5,
          },

          pb: {
            xs: 10,
            md: 11,
          },

          borderBottom:
            '1px solid rgba(255, 255, 255, 0.08)',

          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,

            background:
              'radial-gradient(circle at 84% 10%, rgba(14, 165, 233, 0.17), transparent 32%)',

            pointerEvents: 'none',
          },

          '&::after': {
            content: '""',
            position: 'absolute',

            width: 460,
            height: 460,

            right: -180,
            bottom: -330,

            borderRadius: '50%',

            background:
              'rgba(37, 99, 235, 0.12)',

            filter: 'blur(24px)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 4,

              ...fadeUpSx(0),
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="overline"
                sx={{
                  display: 'block',

                  color:
                    'rgba(255, 255, 255, 0.72)',

                  fontSize: '0.75rem',
                  fontWeight: 800,
                  letterSpacing: '0.16em',
                }}
              >
                Controle de obras • Sankhya
              </Typography>

              <Typography
                component="h1"
                sx={{
                  mt: 0.8,

                  fontSize: {
                    xs: '1.9rem',
                    sm: '2.3rem',
                    md: '2.65rem',
                  },

                  lineHeight: 1.08,
                  fontWeight: 900,
                  letterSpacing: '-0.04em',

                  background:
                    'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',

                  WebkitBackgroundClip: 'text',

                  WebkitTextFillColor:
                    'transparent',

                  backgroundClip: 'text',
                }}
              >
                Dashboard - {projectName}
              </Typography>

              <Typography
                component="p"
                sx={{
                  mt: 1.4,
                  maxWidth: 760,

                  color:
                    'rgba(255, 255, 255, 0.72)',

                  fontSize: {
                    xs: '0.92rem',
                    md: '1rem',
                  },

                  fontWeight: 500,
                }}
              >
                Vendas, remessas futuras, custos,
                tributos e comissão consolidados por
                projeto.
              </Typography>
            </Box>

            <Box
              sx={{
                display: {
                  xs: 'none',
                  md: 'flex',
                },

                alignItems: 'center',
                justifyContent: 'center',

                minWidth: 160,
                minHeight: 60,

                transition:
                  'transform 180ms ease, filter 180ms ease',

                '&:hover': {
                  transform: 'scale(1.04)',

                  filter:
                    'drop-shadow(0 10px 22px rgba(14, 165, 233, 0.22))',
                },
              }}
            >
              <Box
                component="img"
                src={logoCemear}
                alt="Cemear"
                sx={{
                  display: 'block',

                  width: 'auto',

                  height: {
                    md: 48,
                    lg: 54,
                  },

                  maxWidth: 190,
                  objectFit: 'contain',

                  filter:
                    'drop-shadow(0 8px 18px rgba(0, 0, 0, 0.18))',
                }}
              />
            </Box>
          </Box>
        </Container>
      </Box>

      <Container
        maxWidth="xl"
        sx={{
          mt: {
            xs: -6,
            md: -6.5,
          },

          position: 'relative',
          zIndex: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={fadeUpSx(90)}>
            <DashboardFilterBar
              initialFilters={filters}
              loading={isUpdating}
              onApply={handleApplyFilters}
            />
          </Box>

          {dashboard.isError ? (
            <Alert
              severity="error"
              sx={{
                mt: 3,
                ...fadeUpSx(130),
              }}
            >
              Não foi possível carregar os indicadores.
              Confira a API, o CORS e as variáveis do
              arquivo .env.
            </Alert>
          ) : null}

          {dashboard.isPending ? (
            <Card
              sx={{
                ...contentCardSx,
                ...fadeUpSx(150),
                mt: 4,
              }}
            >
              <CardContent
                sx={{
                  minHeight: 260,
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <CircularProgress />

                  <Typography
                    sx={{
                      color: 'text.secondary',
                    }}
                  >
                    Carregando indicadores do projeto...
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ) : null}

          {dashboard.data ? (
            <Box
              key={dashboard.dataUpdatedAt}
              sx={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* RESUMO EXECUTIVO */}
              <Box
                component="section"
                sx={{
                  ...summarySectionSx,
                  ...fadeUpSx(180),
                }}
              >
                <SummarySection
                  kpis={dashboard.data.kpis}
                />
              </Box>

              {/* IMPOSTOS E COMISSÃO */}
              <Box
                component="section"
                sx={{
                  ...separatedSectionSx,
                  ...fadeUpSx(260),
                }}
              >
                <TaxSummaryTable
                  kpis={dashboard.data.kpis}
                />
              </Box>

              {/* GRÁFICOS */}
              <Box
                component="section"
                sx={{
                  ...separatedSectionSx,
                  ...fadeUpSx(340),
                }}
              >
                <Box
                  sx={{
                    display: 'grid',
                    gap: 2,

                    gridTemplateColumns: {
                      xs: '1fr',
                      lg: '1.5fr 1fr 1fr',
                    },
                  }}
                >
                  <Card sx={contentCardSx}>
                    <CardContent>
                      <SectionHeader
                        title="Composição das operações"
                        description="Comparativo por origem."
                      />

                      <SalesCompositionChart
                        kpis={dashboard.data.kpis}
                      />
                    </CardContent>
                  </Card>

                  <Card sx={contentCardSx}>
                    <CardContent>
                      <SectionHeader
                        title="Progresso da remessa"
                        description="Percentual entregue em valor."
                      />

                      <RemittanceProgressChart
                        data={
                          dashboard.data.kpis
                            .remessa_futura
                        }
                      />
                    </CardContent>
                  </Card>

                  <Card sx={contentCardSx}>
                    <CardContent>
                      <SectionHeader
                        title="Encargos consolidados"
                        description="Tributos e comissão."
                      />

                      <TaxBreakdownChart
                        data={
                          dashboard.data.kpis.impostos
                            .consolidado_liquido
                        }
                      />
                    </CardContent>
                  </Card>
                </Box>
              </Box>

              {/* RESULTADO COMERCIAL */}
              <Box
                component="section"
                sx={{
                  ...separatedSectionSx,
                  ...fadeUpSx(420),
                }}
              >
                <SectionHeader
                  title="Resultado comercial"
                  description="Vendas normais, devoluções e operações Interno Obras."
                />

                <Box sx={sectionGridSx}>
                  <KpiCard
                    title="Total de vendas"
                    value={
                      dashboard.data.kpis.vendas
                        .total_vendas
                    }
                    subtitle='Exceto  interno obras e remessas'
                    icon={<PaidRoundedIcon />}
                    tone="primary"
                  />

                  <KpiCard
                    title="Total de devoluções"
                    value={
                      dashboard.data.kpis.vendas
                        .total_devolucoes
                    }
                    icon={
                      <AssignmentReturnRoundedIcon />
                    }
                    tone="error"
                  />

                  <KpiCard
                    title="Vendas líquidas"
                    value={
                      dashboard.data.kpis.vendas
                        .vendas_liquidas
                    }
                    icon={<TrendingUpRoundedIcon />}
                    tone="success"
                  />

                  <Box
                    sx={{
                      display: 'flex',

                      gridColumn: {
                        xs: 'auto',
                        sm: 'auto',
                        xl: '2 / 3',
                      },

                      '& > *': {
                        width: '100%',
                      },
                    }}
                  >
                    <KpiCard
                      title="Interno Obras"
                      value={
                        dashboard.data.kpis
                          .interno_obras.total
                      }
                      subtitle=""
                      icon={
                        <ArchitectureRoundedIcon />
                      }
                      tone="secondary"
                    />
                  </Box>
                </Box>
              </Box>

              {/* REMESSA FUTURA */}
              <Box
                component="section"
                sx={{
                  ...separatedSectionSx,
                  ...fadeUpSx(500),
                }}
              >
                <SectionHeader
                  title="Remessa futura"
                  description="Faturamento, entrega, saldo e custos dos itens de remessa."
                />

                <Box sx={sectionGridSx}>
                  <KpiCard
                    title="Total faturado"
                    value={
                      dashboard.data.kpis
                        .remessa_futura
                        .total_faturamento
                    }
                    icon={
                      <LocalShippingRoundedIcon />
                    }
                    tone="primary"
                  />

                  <KpiCard
                    title="Total entregue"
                    value={
                      dashboard.data.kpis
                        .remessa_futura
                        .total_entregue
                    }
                    icon={<WarehouseRoundedIcon />}
                    tone="success"
                  />

                  <KpiCard
                    title="Saldo da remessa"
                    value={
                      dashboard.data.kpis
                        .remessa_futura.saldo
                    }
                    icon={<SavingsRoundedIcon />}
                    tone="warning"
                  />

                  <KpiCard
                    title="Custo total"
                    value={
                      dashboard.data.kpis
                        .remessa_futura.custo_total
                    }
                    icon={
                      <AccountBalanceRoundedIcon />
                    }
                    tone="primary"
                  />

                  <KpiCard
                    title="Custo entregue"
                    value={
                      dashboard.data.kpis
                        .remessa_futura
                        .custo_entregue
                    }
                    icon={<WarehouseRoundedIcon />}
                    tone="success"
                  />

                  <KpiCard
                    title="Saldo de custo"
                    value={
                      dashboard.data.kpis
                        .remessa_futura.saldo_custo
                    }
                    icon={<SavingsRoundedIcon />}
                    tone="warning"
                  />
                </Box>
              </Box>

              {/* DETALHAMENTO DAS REMESSAS */}
              <Box
                component="section"
                sx={{
                  ...separatedSectionSx,
                  ...fadeUpSx(580),

                  pb: {
                    xs: 2,
                    md: 4,
                  },
                }}
              >
                {remessasControl.isPending ? (
                  <Card
                    sx={{
                      ...contentCardSx,
                      ...fadeUpSx(0),
                    }}
                  >
                    <CardContent
                      sx={{
                        minHeight: 240,
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 2,
                        }}
                      >
                        <CircularProgress />

                        <Typography
                          sx={{
                            color: 'text.secondary',
                          }}
                        >
                          Carregando controle das remessas...
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ) : null}

                {remessasControl.isError ? (
                  <Alert
                    severity="error"
                    sx={fadeUpSx(0)}
                  >
                    Não foi possível carregar o controle
                    das remessas.
                  </Alert>
                ) : null}

                {remessasControl.data ? (
                  <Box sx={fadeUpSx(0)}>
                    <RemittanceControlTable
                      data={remessasControl.data}
                    />
                  </Box>
                ) : null}
              </Box>
            </Box>
          ) : null}
        </Box>
      </Container>
    </Box>
  );
}