import { useState } from 'react';

import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Skeleton,
  Typography,
} from '@mui/material';

import logoCemear from '@/assets/logo cem.png';
import { TaxSummaryTable } from '@/components/cards/TaxSummaryTable';
import { RemittanceProgressChart } from '@/components/charts/RemittanceProgressChart';
import { SalesCompositionChart } from '@/components/charts/SalesCompositionChart';
import { TaxBreakdownChart } from '@/components/charts/TaxBreakdownChart';
import { DashboardFilterBar } from '@/components/filters/DashboardFilterBar';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { RemittanceControlTable } from '@/components/remessas/RemittanceControlTable';
import { SummarySection } from '@/components/summary/SummarySection';
import { MovimentosAuditTable } from '@/components/cards/MovimentosAuditTable';
import { useDashboardKpis } from '@/hooks/useDashboardKpis';
import { useRemessasControl } from '@/hooks/useRemessasControl';
import { useMovimentos } from '../hooks/useMovimentos';
import { usePagamentos } from '@/hooks/usePagamentos';
import type { DashboardFilters } from '@/types/dashboard';


const initialFilters: DashboardFilters = {
  codproj: 10030000,
  dtneg_inicial: null,
  dtneg_final: null
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

const youtubeSkeletonSx = {
  bgcolor: 'rgba(148, 163, 184, 0.22)',

  '&::after': {
    background:
      'linear-gradient(' +
      '90deg, ' +
      'transparent, ' +
      'rgba(255, 255, 255, 0.62), ' +
      'transparent' +
      ')',
  },
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

function SummarySectionSkeleton() {
  return (
    <Box component="section">
      {/* TÍTULO DO RESUMO */}

      <Box sx={{ mb: 2 }}>
        <Skeleton
          variant="text"
          animation="wave"
          width={205}
          height={36}
          sx={{
            ...youtubeSkeletonSx,
            transform: 'none',
          }}
        />

        <Skeleton
          variant="text"
          animation="wave"
          width={310}
          height={22}
          sx={{
            ...youtubeSkeletonSx,
            mt: 0.4,
            transform: 'none',
            borderRadius: 1,
          }}
        />
      </Box>

      {/* SEIS CARDS PRINCIPAIS */}

      <Box
        sx={{
          display: 'grid',
          gap: 2,

          alignItems: 'stretch',

          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(3, minmax(0, 1fr))',
            xl: 'repeat(6, minmax(0, 1fr))',
          },
        }}
      >
        {Array.from({
          length: 6,
        }).map((_, index) => (
          <Card
            key={index}
            sx={{
              ...contentCardSx,

              minHeight: 176,

              p: 2,

              overflow: 'hidden',
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
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <Skeleton
                  variant="text"
                  animation="wave"
                  width="78%"
                  height={19}
                  sx={youtubeSkeletonSx}
                />

                <Skeleton
                  variant="text"
                  animation="wave"
                  width="55%"
                  height={19}
                  sx={youtubeSkeletonSx}
                />
              </Box>

              <Skeleton
                variant="circular"
                animation="wave"
                width={42}
                height={42}
                sx={{
                  ...youtubeSkeletonSx,
                  flexShrink: 0,
                  borderRadius: '50%',
                }}
              />
            </Box>

            <Skeleton
              variant="text"
              animation="wave"
              width="82%"
              height={44}
              sx={{
                ...youtubeSkeletonSx,
                mt: 1.2,
              }}
            />

            <Skeleton
              variant="text"
              animation="wave"
              width="68%"
              height={20}
              sx={youtubeSkeletonSx}
            />

            <Skeleton
              variant="text"
              animation="wave"
              width="48%"
              height={20}
              sx={youtubeSkeletonSx}
            />
          </Card>
        ))}
      </Box>

      {/* CONSOLIDADO INFERIOR */}

      <Card
        sx={{
          ...contentCardSx,

          mt: 2.5,
          p: 1.5,

          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gap: 1.25,

            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              xl:
                '1.35fr repeat(3, minmax(0, 1fr))',
            },
          }}
        >
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <Box
              key={index}
              sx={{
                minHeight: 108,

                p: 2,

                borderRadius: 2.5,

                border:
                  '1px solid rgba(148, 163, 184, 0.13)',

                backgroundColor:
                  index === 0
                    ? 'rgba(15, 23, 42, 0.06)'
                    : '#f8fafc',
              }}
            >
              <Skeleton
                variant="text"
                animation="wave"
                width="48%"
                height={18}
                sx={youtubeSkeletonSx}
              />

              <Skeleton
                variant="text"
                animation="wave"
                width="72%"
                height={37}
                sx={{
                  ...youtubeSkeletonSx,
                  mt: 0.6,
                }}
              />

              <Skeleton
                variant="text"
                animation="wave"
                width="60%"
                height={18}
                sx={youtubeSkeletonSx}
              />
            </Box>
          ))}
        </Box>
      </Card>
    </Box>
  );
}




export function DashboardPage() {
  const [filters, setFilters] =
    useState<DashboardFilters>(
      initialFilters,
    );

  const dashboard =
    useDashboardKpis(filters);

  const remessasControl =
    useRemessasControl(filters);

  const movimentos =
    useMovimentos(filters);

  const pagamentos = usePagamentos(filters);

  const isUpdating =
    dashboard.isFetching ||
    remessasControl.isFetching ||
    movimentos.isFetching ||
    pagamentos.isFetching;

  const isDashboardLoading =
    dashboard.isPending ||
    dashboard.isFetching;

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
        nextFilters.dtneg_final;

    if (!sameFilters) {
      setFilters(nextFilters);
      return;
    }

    void Promise.all([
      dashboard.refetch(),
      remessasControl.refetch(),
      movimentos.refetch(),
      pagamentos.refetch(),
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
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 1.2,
                  }}
                >
                  <Box component="span">
                    Dashboard -
                  </Box>

                  {isDashboardLoading ? (
                    <Skeleton
                      component="span"
                      variant="rounded"
                      animation="wave"
                      sx={{
                        display: 'inline-block',

                        width: {
                          xs: 220,
                          sm: 340,
                          md: 430,
                        },

                        height: '0.92em',

                        borderRadius: 1.2,

                        backgroundColor:
                          'rgba(255, 255, 255, 0.18)',

                        WebkitTextFillColor: 'initial',

                        '&::after': {
                          background:
                            'linear-gradient(' +
                            '90deg, ' +
                            'transparent, ' +
                            'rgba(255, 255, 255, 0.18), ' +
                            'transparent' +
                            ')',
                        },
                      }}
                    />
                  ) : (
                    <Box component="span">
                      {projectName}
                    </Box>
                  )}
                </Box>
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
        maxWidth={false}
        sx={{
          maxWidth: 1800,
          mx: 'auto',

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
            <Box
              component="section"
              sx={{
                ...summarySectionSx,
                ...fadeUpSx(150),
              }}
            >
              <SummarySectionSkeleton />
            </Box>
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
                {dashboard.isFetching ? (
                  <SummarySectionSkeleton />
                ) : (
                  <SummarySection
                  kpis={dashboard.data.kpis}
                  pagamentos={
                    pagamentos.data?.pagamentos ?? []
                  }
                />
                )}
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

                    alignItems: 'stretch',

                    gap: {
                      xs: 2,
                      sm: 2.5,
                      lg: 3.5,
                    },

                    /*
                     * Os três cards ficam com a mesma
                     * largura no desktop.
                     *
                     * No mobile e tablet entram em uma
                     * coluna para não comprimir gráficos,
                     * títulos, legendas e valores.
                     */
                    gridTemplateColumns: {
                      xs: 'minmax(0, 1fr)',
                      lg:
                        'repeat(3, minmax(0, 1fr))',
                    },

                    '& > *': {
                      width: '100%',
                      minWidth: 0,
                      height: '100%',
                    },
                  }}
                >
                  <Card
                    sx={{
                      ...contentCardSx,

                      height: '100%',
                      minWidth: 0,
                    }}
                  >
                    <CardContent
                      sx={{
                        height: '100%',

                        display: 'flex',
                        flexDirection: 'column',

                        p: {
                          xs: 2,
                          md: 2.4,
                          lg: 2.75,
                        },

                        '&:last-child': {
                          pb: {
                            xs: 2,
                            md: 2.4,
                            lg: 2.75,
                          },
                        },
                      }}
                    >
                      <SectionHeader
                        title="Composição das operações"
                        description="Comparativo por origem."
                      />

                      <Box
                        sx={{
                          minWidth: 0,
                          width: '100%',
                          flex: 1,
                        }}
                      >
                        <SalesCompositionChart
                          kpis={
                            dashboard.data.kpis
                          }
                        />
                      </Box>
                    </CardContent>
                  </Card>

                  <Card
                    sx={{
                      ...contentCardSx,

                      height: '100%',
                      minWidth: 0,
                    }}
                  >
                    <CardContent
                      sx={{
                        height: '100%',

                        display: 'flex',
                        flexDirection: 'column',

                        p: {
                          xs: 2,
                          md: 2.4,
                          lg: 2.75,
                        },

                        '&:last-child': {
                          pb: {
                            xs: 2,
                            md: 2.4,
                            lg: 2.75,
                          },
                        },
                      }}
                    >
                      <SectionHeader
                        title="Progresso da remessa"
                        description="Percentual entregue em valor."
                      />

                      <Box
                        sx={{
                          minWidth: 0,
                          width: '100%',
                          flex: 1,
                        }}
                      >
                        <RemittanceProgressChart
                          data={
                            dashboard.data.kpis
                              .remessa_futura
                          }
                          remessaTransporte={
                            dashboard.data.kpis
                              .remessa_transporte
                          }
                        />
                      </Box>
                    </CardContent>
                  </Card>

                  <Card
                    sx={{
                      ...contentCardSx,

                      height: '100%',
                      minWidth: 0,
                    }}
                  >
                    <CardContent
                      sx={{
                        height: '100%',

                        display: 'flex',
                        flexDirection: 'column',

                        p: {
                          xs: 2,
                          md: 2.4,
                          lg: 2.75,
                        },

                        '&:last-child': {
                          pb: {
                            xs: 2,
                            md: 2.4,
                            lg: 2.75,
                          },
                        },
                      }}
                    >
                      <SectionHeader
                        title="Encargos consolidados"
                        description="Tributos e comissão."
                      />

                      <Box
                        sx={{
                          minWidth: 0,
                          width: '100%',
                          flex: 1,
                        }}
                      >
                        <TaxBreakdownChart
                          data={
                            dashboard.data.kpis
                              .impostos
                              .consolidado_liquido
                          }
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </Box>

               {/* AUDITORIA DE DOCUMENTOS */}
              <Box
                component="section"
                sx={{
                  ...separatedSectionSx,
                  ...fadeUpSx(400),
                }}
              >
                {movimentos.isError ? (
                  <Alert
                    severity="error"
                    sx={{
                      mb: 2,
                    }}
                  >
                    Não foi possível carregar os documentos
                    vinculados ao projeto.
                  </Alert>
                ) : null}

                <MovimentosAuditTable
                  movimentos={
                    movimentos.data?.movimentos ?? []
                  }
                  loading={
                    movimentos.isPending ||
                    movimentos.isFetching
                  }
                />
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