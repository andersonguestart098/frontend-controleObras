import { useMemo } from 'react';

import type { EChartsOption } from 'echarts';

import { Box } from '@mui/material';

import { EChart } from '@/components/charts/EChart';
import type { DashboardKpis } from '@/types/dashboard';
import { formatCurrency } from '@/utils/formatters';

interface SalesCompositionChartProps {
  kpis: DashboardKpis;
}

const compactCurrencyFormatter =
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 1,
  });

const fadeUpSx = {
  width: '100%',

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
  const option = useMemo<EChartsOption>(
    () => {
      const chartData = [
        {
          name: 'Vendas',
          value:
            kpis.vendas.total_vendas,
        },
        {
          name: 'Interno Obras',
          value:
            kpis.interno_obras.total,
        },
        {
          name: 'Remessas',
          value:
            kpis.remessa_futura
              .total_faturamento,
        },
        {
          name: 'Devoluções',
          value:
            kpis.vendas
              .total_devolucoes,
        },
      ];

      return {
        color: ['#4f6edb'],

        animationDuration: 700,
        animationEasing: 'cubicOut',

        tooltip: {
          trigger: 'axis',

          axisPointer: {
            type: 'shadow',

            shadowStyle: {
              color:
                'rgba(79, 110, 219, 0.06)',
            },
          },

          valueFormatter: (value) =>
            formatCurrency(
              Number(value ?? 0),
            ),
        },

        grid: {
          top: 58,
          right: 22,
          bottom: 18,
          left: 20,
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
            fontSize: 12,
            fontWeight: 600,
            interval: 0,
          },
        },

        yAxis: {
          type: 'value',
          min: 0,

          axisTick: {
            show: false,
          },

          axisLine: {
            show: false,
          },

          axisLabel: {
            color: '#64748b',
            fontSize: 12,

            formatter: (value: number) =>
              formatCompactCurrency(value),
          },

          splitLine: {
            lineStyle: {
              color:
                'rgba(148, 163, 184, 0.24)',

              type: 'solid',
            },
          },
        },

        series: [
          {
            name: 'Valor',
            type: 'bar',

            data: chartData.map(
              (item) => item.value,
            ),

            barMaxWidth: 60,

            itemStyle: {
              color: '#4f6edb',

              borderRadius: [
                8,
                8,
                0,
                0,
              ],

              shadowColor:
                'rgba(79, 110, 219, 0.18)',

              shadowBlur: 8,
              shadowOffsetY: 3,
            },

            emphasis: {
              itemStyle: {
                color: '#3f5fc9',

                shadowColor:
                  'rgba(79, 110, 219, 0.28)',

                shadowBlur: 12,
                shadowOffsetY: 4,
              },
            },

            label: {
              show: true,
              position: 'top',
              distance: 10,

              color: '#0f172a',

              fontSize: 12,
              fontWeight: 800,

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
    [kpis],
  );

  const animationKey = [
    kpis.vendas.total_vendas,
    kpis.interno_obras.total,
    kpis.remessa_futura
      .total_faturamento,
    kpis.vendas.total_devolucoes,
  ].join('-');

  return (
    <Box
      key={animationKey}
      sx={fadeUpSx}
    >
      <EChart
        option={option}
        height={330}
      />
    </Box>
  );
}