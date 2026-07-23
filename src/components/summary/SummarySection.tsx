import type { ReactNode } from 'react';

import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import PriceCheckOutlinedIcon from '@mui/icons-material/PriceCheckOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined';
import {
  Box,
  Card,
  Chip,
  Typography,
} from '@mui/material';

import { KpiCard } from '@/components/cards/KpiCard';
import { RollingCurrency } from '@/components/common/RollingCurrency';
import type { DashboardKpis } from '@/types/dashboard';
import { formatCurrency } from '@/utils/formatters';

interface SummarySectionProps {
  kpis: DashboardKpis;
}

interface ConsolidatedMetricProps {
  title: string;
  value: number;
  helper: string;
  icon: ReactNode;
  color: string;
  backgroundColor: string;
  delayStep?: number;
}

interface ChargesMetricProps {
  taxes: number;
  commission: number;
}

function ConsolidatedMetric({
  title,
  value,
  helper,
  icon,
  color,
  backgroundColor,
  delayStep = 70,
}: ConsolidatedMetricProps) {
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

        <Typography
          component="div"
          sx={{
            mt: 0.35,

            color,

            fontSize: {
              xs: '1.05rem',
              md: '1.12rem',
            },

            lineHeight: 1.2,
            fontWeight: 900,
            letterSpacing: '-0.025em',
            whiteSpace: 'nowrap',
          }}
        >
          <RollingCurrency
            value={value}
            delayStep={delayStep}
          />
        </Typography>

        <Typography
          variant="caption"
          sx={{
            display: 'block',

            mt: 'auto',
            pt: 0.55,

            color: '#94a3b8',

            fontSize: '0.68rem',
            fontWeight: 600,

            lineHeight: 1.35,
          }}
        >
          {helper}
        </Typography>
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
   * CUSTOS POR ORIGEM
   */

  const custoRemessa =
    kpis.remessa_futura.custo_total;

  const custoRemessaEntregue =
    kpis.remessa_futura.custo_entregue;

  const custoVendas =
    kpis.vendas.custo_total;

  const custoDevolucoes =
    kpis.vendas.custo_devolucoes;

  const custoInternoObras =
    kpis.interno_obras.custo_total;

  /*
   * TOTAL DE CUSTO:
   *
   * Custo da remessa
   * + custo das vendas normais
   * + custo do Interno Obras
   * - custo das devoluções
   *
   * O custo entregue da remessa não entra
   * aqui porque já faz parte do custo total
   * dela, senão a remessa contaria duas vezes.
   */
  const totalCusto =
    custoRemessa +
    custoVendas +
    custoInternoObras -
    custoDevolucoes;

  /*
   * TOTAL DE CUSTO ENTREGUE:
   *
   * Vendas e Interno Obras entregam no ato,
   * a devolução estorna e a remessa entra
   * apenas com o que já foi entregue.
   */
  const totalCustoEntregue =
    custoRemessaEntregue +
    custoVendas +
    custoInternoObras -
    custoDevolucoes;

  /*
   * SALDO DE CUSTOS:
   *
   * O que ainda não foi baixado por entrega.
   * Confere com kpis.remessa_futura.saldo_custo.
   */
  const saldoCustos =
    totalCusto - totalCustoEntregue;

  const totalImpostos =
    kpis.impostos.consolidado_liquido
      .total_tributos;

  const totalComissao =
    kpis.impostos.consolidado_liquido
      .comissao;

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
            md: 'repeat(3, minmax(0, 1fr))',
            xl: 'repeat(6, minmax(0, 1fr))',
          },

          '& > *': {
            height: '100%',
          },
        }}
      >
        <KpiCard
          title="Faturamento remessas"
          value={
            kpis.remessa_futura
              .total_faturamento
          }
          subtitle={`Custo: ${formatCurrency(
            custoRemessa,
          )}`}
          subtitleColor="#FF746D"
          icon={<Inventory2OutlinedIcon />}
          tone="primary"
          rollDelay={0}
        />

        <KpiCard
          title="Entregas remessa futura"
          value={
            kpis.remessa_futura
              .total_entregue
          }
          subtitle={`Custo entregue: ${formatCurrency(
            custoRemessaEntregue,
          )}`}
          subtitleColor="#4EAAEF"
          icon={
            <LocalShippingOutlinedIcon />
          }
          tone="info"
          rollDelay={70}
        />

        <KpiCard
          title="Saldo remessa"
          value={kpis.remessa_futura.saldo}
          subtitle={`Saldo custo: ${formatCurrency(
            kpis.remessa_futura.saldo_custo,
          )}`}
          subtitleColor="#C18D34"
          icon={
            <AccountBalanceWalletOutlinedIcon />
          }
          tone="warning"
          rollDelay={140}
        />

        <KpiCard
          title="Vendas normais"
          value={kpis.vendas.total_vendas}
          subtitle={`Exceto Interno Obras e remessas • Custo: ${formatCurrency(
            custoVendas,
          )}`}
          subtitleColor="#4EAAEF"
          icon={<PaymentsOutlinedIcon />}
          tone="info"
          rollDelay={210}
        />

        <KpiCard
          title="Interno Obras"
          value={kpis.interno_obras.total}
          subtitle={`Custo: ${formatCurrency(
            custoInternoObras,
          )}`}
          subtitleColor="#4EAAEF"
          icon={
            <BusinessCenterOutlinedIcon />
          }
          tone="secondary"
          rollDelay={280}
        />

        <KpiCard
          title="Devoluções"
          value={
            kpis.vendas.total_devolucoes
          }
          subtitle={`Custo estornado: ${formatCurrency(
            custoDevolucoes,
          )}`}
          subtitleColor="#FF746D"
          icon={
            <AssignmentReturnOutlinedIcon />
          }
          tone="error"
          rollDelay={350}
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
                <SavingsOutlinedIcon />
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

          <ConsolidatedMetric
            title="Total custo"
            value={totalCusto}
            helper="Remessa, vendas e Interno Obras, sem as devoluções"
            icon={<PriceCheckOutlinedIcon />}
            color="#FF746D"
            backgroundColor="rgba(255, 116, 109, 0.07)"
          />

          <ConsolidatedMetric
            title="Total custo entregue"
            value={totalCustoEntregue}
            helper="Custo referente aos materiais entregues"
            icon={<Inventory2OutlinedIcon />}
            color="#4EAAEF"
            backgroundColor="rgba(78, 170, 239, 0.07)"
            delayStep={80}
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