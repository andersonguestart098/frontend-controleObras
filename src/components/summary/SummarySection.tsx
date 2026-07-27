import type { ReactNode } from 'react';

import FormatListNumberedRtlOutlinedIcon from '@mui/icons-material/FormatListNumberedRtlOutlined';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import MoneyOffCsredOutlinedIcon from '@mui/icons-material/MoneyOffCsredOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import PriceCheckOutlinedIcon from '@mui/icons-material/PriceCheckOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined';
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

interface BonusBubbleProps {
  value: number;
  cost: number;
  rollDelay?: number;
}

const BUBBLE_COLOR = '#C96A16';

/*
 * Rastro de bolhas subindo pela direita do
 * card até o balão.
 *
 * Todos os right são negativos, então as
 * bolhas ficam fora do card.
 *
 * A curva abre rápido para a direita e depois
 * sobe quase reta, formando o C deitado até o
 * balão.
 *
 * A última bolha encosta no centro da borda de
 * baixo do balão.
 *
 * O centro do balão fica a 105px da borda do
 * card: 16px de margem mais metade dos 178px
 * de largura mínima.
 */
const BUBBLE_TRAIL = [
  { size: 6, bottom: 6, right: -10 },
  { size: 8, bottom: 32, right: -46 },
  { size: 10, bottom: 62, right: -74 },
  { size: 11, bottom: 92, right: -94 },
  { size: 12, bottom: 117, right: -106 },
  { size: 14, bottom: 137, right: -112 },
];

/*
 * Balão flutuante com o dado de bonificações.
 *
 * No desktop ele sai do fluxo e fica pairando
 * acima do card de devoluções. No mobile entra
 * na coluna, logo acima do card.
 */
function BonusBubble({
  value,
  cost,
  rollDelay = 380,
}: BonusBubbleProps) {
  return (
    <>
      {/* RASTRO EM CURVA */}
      {BUBBLE_TRAIL.map((bubble, index) => (
        <Box
          key={bubble.size}
          aria-hidden="true"
          sx={{
            position: 'absolute',

            display: {
              xs: 'none',
              xl: 'block',
            },

            bottom: bubble.bottom,
            right: bubble.right,

            width: bubble.size,
            height: bubble.size,

            borderRadius: '50%',

            background:
              'linear-gradient(135deg, #fffaf5 0%, #ffedd5 100%)',

            border:
              '1px solid rgba(221, 127, 19, 0.28)',

            boxShadow:
              '0 3px 8px rgba(180, 102, 13, 0.18)',

            zIndex: 2,

            animation: `bonusFloat 4.2s ease-in-out ${
              700 + index * 130
            }ms infinite`,

            '@keyframes bonusFloat': {
              '0%, 100%': {
                transform: 'translateY(0)',
              },

              '50%': {
                transform: 'translateY(-6px)',
              },
            },

            '@media (prefers-reduced-motion: reduce)':
              {
                animation: 'none',
              },
          }}
        />
      ))}

      {/* BALÃO */}
      <Box
        sx={{
          position: {
            xs: 'relative',
            md: 'absolute',
          },

          /*
           * Em telas largas o balão sai pela
           * direita do card, desacoplado.
           *
           * Abaixo disso não há espaço lateral,
           * então ele volta para cima do card.
           */
          top: {
            md: -92,
            xl: 'auto',
          },

          right: {
            md: 2,
            xl: 'auto',
          },

          bottom: {
            xl: 150,
          },

          left: {
            xl: '100%',
          },

          ml: {
            xl: 2,
          },

          mr: {
            md: 1,
            xl: 0,
          },

          zIndex: 3,

          mb: {
            xs: 1.2,
            md: 0,
          },

          px: 2.9,
          py: 2.1,

          minWidth: {
            xl: 178,
          },

          display: 'inline-flex',
          flexDirection: 'column',

          whiteSpace: 'nowrap',

          borderRadius: '24px 24px 10px 24px',

          background:
            'linear-gradient(135deg, #fffaf5 0%, #ffedd5 100%)',

          border:
            '1px solid rgba(221, 127, 19, 0.22)',

          boxShadow:
            '0 12px 30px rgba(180, 102, 13, 0.2), ' +
            '0 2px 6px rgba(15, 23, 42, 0.05)',

          transformOrigin: 'bottom right',

          animation:
            'bonusPop 560ms cubic-bezier(0.22, 1, 0.36, 1) both, ' +
            'bonusFloat 4.2s ease-in-out 560ms infinite',

          transition:
            'transform 200ms ease, box-shadow 200ms ease',

          '&:hover': {
            boxShadow:
              '0 16px 38px rgba(221, 127, 19, 0.28), ' +
              '0 3px 8px rgba(15, 23, 42, 0.06)',
          },

          '@keyframes bonusPop': {
            '0%': {
              opacity: 0,
              transform:
                'translateY(10px) scale(0.92)',
            },

            '100%': {
              opacity: 1,
              transform:
                'translateY(0) scale(1)',
            },
          },

          '@keyframes bonusFloat': {
            '0%, 100%': {
              transform: 'translateY(0)',
            },

            '50%': {
              transform: 'translateY(-6px)',
            },
          },

          '@media (prefers-reduced-motion: reduce)':
            {
              animation: 'none',
              opacity: 1,
            },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.7,
          }}
        >
          <MoneyOffCsredOutlinedIcon
            sx={{
              fontSize: 17,
              color: BUBBLE_COLOR,
            }}
          />

          <Typography
            variant="caption"
            sx={{
              color: BUBBLE_COLOR,

              fontSize: '0.68rem',
              fontWeight: 900,

              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            Bonificações
          </Typography>
        </Box>

        <Typography
          component="div"
          sx={{
            mt: 0.5,

            color: '#0f172a',

            fontSize: '1.5rem',
            lineHeight: 1.15,
            fontWeight: 900,
            letterSpacing: '-0.025em',
          }}
        >
          <RollingCurrency
            value={value}
            startDelay={rollDelay}
          />
        </Typography>

        <Typography
          variant="caption"
          sx={{
            mt: 0.5,

            color: BUBBLE_COLOR,

            fontSize: '0.78rem',
            fontWeight: 700,
          }}
        >
          Custo: {formatCurrency(cost)}
        </Typography>
      </Box>
    </>
  );
}

/*
 * Total de custo com a parcela de bonificação
 * separada.
 *
 * A bonificação é custo puro: sai do estoque
 * e não tem receita nem abatimento, por isso
 * aparece somando à parte.
 */
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
   * BONIFICADOS:
   *
   * saem do estoque sem receita, então
   * entram apenas como custo.
   */

  const totalBonificados =
    kpis.bonificados?.valor_nota ?? 0;

  const custoBonificados =
    kpis.bonificados
      ?.custo_medio_sem_icms_total ?? 0;

  /*
   * CUSTO DAS OPERAÇÕES:
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
  const custoOperacoes =
    custoRemessa +
    custoVendas +
    custoInternoObras -
    custoDevolucoes;

  /*
   * TOTAL DE CUSTO:
   *
   * Operações + bonificados.
   *
   * A bonificação entra somando porque é
   * custo puro, sem receita e sem abatimento.
   */
  const totalCusto =
    custoOperacoes + custoBonificados;

  /*
   * CUSTO ENTREGUE DAS OPERAÇÕES:
   *
   * Vendas e Interno Obras saem no ato, a
   * devolução volta para o estoque e abate,
   * e a remessa entra apenas com o que já
   * foi entregue.
   *
   * Bate com o consolidado da coluna
   * "Custo entregue" da tabela de tributos.
   */
  const custoEntregueOperacoes =
    custoRemessaEntregue +
    custoVendas +
    custoInternoObras -
    custoDevolucoes;

  /*
   * TOTAL DE CUSTO ENTREGUE:
   *
   * Operações + bonificados, já que a
   * bonificação também sai no ato.
   */
  const totalCustoEntregue =
    custoEntregueOperacoes +
    custoBonificados;

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
          icon={<PaymentsOutlinedIcon />}
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
            <PaidOutlinedIcon />
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
            <HandymanOutlinedIcon />
          }
          tone="secondary"
          rollDelay={280}
        />

        <Box sx={{ position: 'relative' }}>
          <BonusBubble
            value={totalBonificados}
            cost={custoBonificados}
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
              <MoneyOffCsredOutlinedIcon />
            }
            tone="error"
            rollDelay={350}
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