import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { EChartsOption } from 'echarts';

import {
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import { EChart } from '@/components/charts/EChart';
import { useInViewOnce } from '@/components/common/RollingCurrency';
import type { DashboardKpis } from '@/types/dashboard';
import { formatCurrency } from '@/utils/formatters';

interface SalesCompositionChartProps {
  kpis: DashboardKpis;
}

const BAR_DURATION = 2200;
const BAR_DELAY_STEP = 430;

const compactCurrencyFormatter =
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 1,
  });

const fadeUpSx = {
  width: '100%',
  maxWidth: 'none',
  minWidth: 0,

  opacity: 0,
  transform: 'translateY(16px)',

  animation:
    'salesChartFadeUp 620ms cubic-bezier(0.22, 1, 0.36, 1) forwards',

  willChange: 'opacity, transform',

  '@keyframes salesChartFadeUp': {
    '0%': {
      opacity: 0,
      transform: 'translateY(16px)',
    },

    '100%': {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },

  '@media (prefers-reduced-motion: reduce)': {
    opacity: 1,
    transform: 'none',
    animation: 'none',
  },
};

function formatCompactCurrency(
  value: number,
): string {
  return compactCurrencyFormatter.format(
    value ?? 0,
  );
}

export function SalesCompositionChart({
  kpis,
}: SalesCompositionChartProps) {
  const theme = useTheme();

  const isMobile = useMediaQuery(
    theme.breakpoints.down('sm'),
  );

  const isTablet = useMediaQuery(
    theme.breakpoints.between('sm', 'lg'),
  );

  const chartHeight = isMobile
    ? 340
    : isTablet
      ? 390
      : 420;

  const [containerRef, inView] =
    useInViewOnce(
      0.35,
      '0px 0px -100px 0px',
    );

  const [grown, setGrown] = useState(false);

  useEffect(() => {
    if (!inView) {
      setGrown(false);

      return undefined;
    }

    const timer = window.setTimeout(() => {
      setGrown(true);
    }, 420);

    return () => {
      window.clearTimeout(timer);
    };
  }, [inView]);

  const option = useMemo<EChartsOption>(
    () => {
      const valorVendas =
        kpis.vendas.total_vendas;

      const valorRemessas =
        kpis.remessa_futura
          .total_faturamento;

      const chartData = [
        {
          name: 'Vendas e remessas',
          shortName: 'Vendas + remessas',

          value:
            valorVendas + valorRemessas,

          detalhe: [
            {
              label: 'Vendas',
              value: valorVendas,
            },
            {
              label: 'Remessas',
              value: valorRemessas,
            },
          ],

          color: '#4f6edb',
        },

        {
          name: 'Interno Obras',
          shortName: 'Interno Obras',

          value: kpis.interno_obras.total,

          detalhe: [],

          color: '#0d9488',
        },

        {
          name: 'Devoluções',
          shortName: 'Devoluções',

          value:
            kpis.vendas.total_devolucoes,

          detalhe: [],

          color: '#dc2626',
        },
      ];

      const maiorValor = Math.max(
        ...chartData.map(
          (item) => item.value,
        ),
        1,
      );

      const tooltip = {
        trigger: 'axis' as const,

        axisPointer: {
          type: 'shadow' as const,

          shadowStyle: {
            color:
              'rgba(79, 110, 219, 0.06)',
          },
        },

        formatter: (params: unknown) => {
          const list = Array.isArray(params)
            ? params
            : [params];

          const first = list[0] as {
            dataIndex: number;
          };

          const item =
            chartData[first.dataIndex];

          if (!item) {
            return '';
          }

          const linhas = item.detalhe
            .map(
              (parte) =>
                `<div style="color:#64748b">${parte.label}: ` +
                `<strong style="color:#0f172a">${formatCurrency(
                  parte.value,
                )}</strong></div>`,
            )
            .join('');

          return (
            `<div style="font-weight:700;margin-bottom:4px">${item.name}</div>` +
            `<div style="font-weight:800;color:#0f172a">${formatCurrency(
              item.value,
            )}</div>` +
            linhas
          );
        },
      };

      if (isMobile) {
        return {
          animationDurationUpdate:
            BAR_DURATION,

          animationEasingUpdate:
            'elasticOut',

          animationDelayUpdate: (
            index: number,
          ) => index * BAR_DELAY_STEP,

          tooltip,

          grid: {
            top: 20,
            right: 24,
            bottom: 24,
            left: 12,
            containLabel: true,
          },

          xAxis: {
            type: 'value',

            min: 0,

            max: Math.ceil(
              maiorValor * 1.22,
            ),

            axisTick: {
              show: false,
            },

            axisLine: {
              show: false,
            },

            axisLabel: {
              color: '#64748b',
              fontSize: 11,

              formatter: (
                value: number,
              ) =>
                formatCompactCurrency(
                  value,
                ),
            },

            splitLine: {
              lineStyle: {
                color:
                  'rgba(148, 163, 184, 0.22)',
              },
            },
          },

          yAxis: {
            type: 'category',

            inverse: true,

            data: chartData.map(
              (item) => item.shortName,
            ),

            axisTick: {
              show: false,
            },

            axisLine: {
              show: false,
            },

            axisLabel: {
              color: '#475569',
              fontSize: 11,
              fontWeight: 700,
              lineHeight: 15,
              width: 104,
              overflow: 'break',
            },
          },

          series: [
            {
              name: 'Valor',
              type: 'bar',

              data: chartData.map(
                (item) => ({
                  value: grown
                    ? item.value
                    : 0,

                  itemStyle: {
                    color:
                      item.color,
                  },
                }),
              ),

              barMaxWidth: 46,

              itemStyle: {
                borderRadius: [
                  0,
                  8,
                  8,
                  0,
                ],

                shadowColor:
                  'rgba(15, 23, 42, 0.14)',

                shadowBlur: 7,
                shadowOffsetX: 3,
              },

              label: {
                show: grown,
                position: 'right',
                distance: 8,

                color: '#0f172a',
                fontSize: 10,
                fontWeight: 800,

                formatter: (params) =>
                  formatCompactCurrency(
                    Number(
                      params.value ?? 0,
                    ),
                  ),
              },
            },
          ],
        };
      }

      return {
        animationDurationUpdate:
          BAR_DURATION,

        animationEasingUpdate:
          'elasticOut',

        animationDelayUpdate: (
          index: number,
        ) => index * BAR_DELAY_STEP,

        tooltip,

        grid: {
          top: 62,
          right: 38,
          bottom: 34,
          left: 38,
          containLabel: true,
        },

        xAxis: {
          type: 'category',

          data: chartData.map(
            (item) => item.name,
          ),

          axisTick: {
            show: false,
          },

          axisLine: {
            lineStyle: {
              color:
                'rgba(148, 163, 184, 0.45)',
            },
          },

          axisLabel: {
            color: '#475569',
            fontSize: isTablet
              ? 12
              : 13,
            fontWeight: 650,
            interval: 0,
            lineHeight: 18,
          },
        },

        yAxis: {
          type: 'value',

          min: 0,

          max: Math.ceil(
            maiorValor * 1.18,
          ),

          axisTick: {
            show: false,
          },

          axisLine: {
            show: false,
          },

          axisLabel: {
            color: '#64748b',
            fontSize: 12,

            formatter: (
              value: number,
            ) =>
              formatCompactCurrency(
                value,
              ),
          },

          splitLine: {
            lineStyle: {
              color:
                'rgba(148, 163, 184, 0.24)',
            },
          },
        },

        series: [
          {
            name: 'Valor',
            type: 'bar',

            data: chartData.map(
              (item) => ({
                value: grown
                  ? item.value
                  : 0,

                itemStyle: {
                  color: item.color,
                },
              }),
            ),

            barMaxWidth: isTablet
              ? 76
              : 96,

            itemStyle: {
              borderRadius: [
                10,
                10,
                0,
                0,
              ],

              shadowColor:
                'rgba(15, 23, 42, 0.16)',

              shadowBlur: 10,
              shadowOffsetY: 4,
            },

            emphasis: {
              itemStyle: {
                shadowColor:
                  'rgba(15, 23, 42, 0.26)',

                shadowBlur: 14,
                shadowOffsetY: 5,
              },
            },

            label: {
              show: grown,
              position: 'top',
              distance: 12,

              color: '#0f172a',

              fontSize: isTablet
                ? 12
                : 13,

              fontWeight: 850,

              formatter: (params) =>
                formatCurrency(
                  Number(
                    params.value ?? 0,
                  ),
                ),
            },

            labelLayout: {
              hideOverlap: false,
            },
          },
        ],
      };
    },
    [
      grown,
      isMobile,
      isTablet,
      kpis,
    ],
  );

  return (
    <Box
      ref={containerRef}
      sx={fadeUpSx}
    >
      {inView ? (
        <EChart
          option={option}
          height={chartHeight}
        />
      ) : (
        <Box
          sx={{
            width: '100%',
            height: chartHeight,
          }}
        />
      )}
    </Box>
  );
}