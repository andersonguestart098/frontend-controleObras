import { useMemo } from 'react';

import type { EChartsOption } from 'echarts';

import { EChart } from '@/components/charts/EChart';
import type { ImpostoGrupoKpis } from '@/types/dashboard';
import { formatCurrency } from '@/utils/formatters';

interface TaxBreakdownChartProps {
  data: ImpostoGrupoKpis;
}

export function TaxBreakdownChart({
  data,
}: TaxBreakdownChartProps) {
  const option = useMemo<EChartsOption>(
    () => {
      const chartData = [
        {
          name: 'ICMS',
          value: data.icms,
        },
        {
          name: 'PIS',
          value: data.pis,
        },
        {
          name: 'COFINS',
          value: data.cofins,
        },
        {
          name: 'Comissão',
          value: data.comissao,
        },
      ];

      const total =
        data.total_tributos +
        data.comissao;

      return {
        color: [
          '#4f6edb',
          '#a8cf24',
          '#575b7c',
          '#ff994c',
        ],

        animationDuration: 750,
        animationEasing: 'cubicOut',

        tooltip: {
          trigger: 'item',

          valueFormatter: (value) =>
            formatCurrency(
              Number(value ?? 0),
            ),
        },

        legend: {
          bottom: 0,
          left: 'center',

          itemWidth: 20,
          itemHeight: 11,
          itemGap: 12,

          textStyle: {
            color: '#475569',
            fontSize: 12,
            fontWeight: 600,
          },
        },

        graphic: [
          {
            type: 'text',

            left: 'center',
            top: '34%',

            silent: true,

            style: {
              text: 'Total',

              fill: '#64748b',

              fontSize: 12,
              fontWeight: 600,

              textAlign: 'center',
            },
          },

          {
            type: 'text',

            left: 'center',
            top: '40%',

            silent: true,

            style: {
              text: formatCurrency(total),

              fill: '#0f172a',

              fontSize: 16,
              fontWeight: 800,

              textAlign: 'center',
            },
          },
        ],

        series: [
          {
            name: 'Encargos',
            type: 'pie',

            radius: [
              '35%',
              '57%',
            ],

            center: [
              '50%',
              '42%',
            ],

            avoidLabelOverlap: true,
            minShowLabelAngle: 0,

            itemStyle: {
              borderRadius: 6,

              borderColor: '#ffffff',
              borderWidth: 3,

              shadowColor:
                'rgba(15, 23, 42, 0.08)',

              shadowBlur: 4,
            },

            emphasis: {
              scale: true,
              scaleSize: 6,

              itemStyle: {
                shadowColor:
                  'rgba(15, 23, 42, 0.18)',

                shadowBlur: 12,
              },
            },

            label: {
              show: true,
              position: 'outside',

              alignTo: 'none',

              formatter: (params) => {
                const value = Number(
                  params.value ?? 0,
                );

                const percentage =
                  Number(
                    params.percent ?? 0,
                  );

                return (
                  `{name|${params.name}}\n` +
                  `{value|${formatCurrency(value)}} ` +
                  `{percentage|${percentage.toFixed(1)}%}`
                );
              },

              rich: {
                name: {
                  color: '#475569',

                  fontSize: 11,
                  fontWeight: 700,

                  lineHeight: 17,
                },

                value: {
                  color: '#0f172a',

                  fontSize: 11,
                  fontWeight: 800,

                  lineHeight: 17,
                },

                percentage: {
                  color: '#64748b',

                  fontSize: 10,
                  fontWeight: 700,

                  lineHeight: 17,
                },
              },
            },

            labelLine: {
              show: true,

              length: 11,
              length2: 8,

              smooth: 0.2,

              lineStyle: {
                color:
                  'rgba(100, 116, 139, 0.55)',

                width: 1,
              },
            },

            labelLayout: {
              hideOverlap: false,
              moveOverlap: 'shiftY',
            },

            data: chartData,
          },
        ],
      };
    },
    [data],
  );

  return (
    <EChart
      option={option}
      height={360}
    />
  );
}