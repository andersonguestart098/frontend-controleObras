import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { ECharts, EChartsOption } from 'echarts';

import { Box } from '@mui/material';

import { EChart } from '@/components/charts/EChart';
import { useInViewOnce } from '@/components/common/RollingCurrency';
import type { ImpostoGrupoKpis } from '@/types/dashboard';
import { formatCurrency } from '@/utils/formatters';

interface TaxBreakdownChartProps {
  data: ImpostoGrupoKpis;
}

const CHART_HEIGHT = 360;

/*
 * Tempo que cada fatia fica destacada na
 * apresentação inicial.
 */
const HIGHLIGHT_STEP_MS = 1150;

/*
 * Espera a rosca terminar de desenhar antes
 * de começar a destacar.
 */
const HIGHLIGHT_START_MS = 1900;

export function TaxBreakdownChart({
  data,
}: TaxBreakdownChartProps) {
  const [containerRef, inView] =
    useInViewOnce(
      0.45,
      '0px 0px -160px 0px',
    );

  const [chart, setChart] =
    useState<ECharts | null>(null);

  const handleReady = useCallback(
    (instance: ECharts) => {
      setChart(instance);
    },
    [],
  );

  const chartData = useMemo(
    () => [
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
    ],
    [data],
  );

  /*
   * Depois que a rosca aparece, cada fatia é
   * destacada uma a uma e no fim tudo volta
   * ao formato original.
   */
  useEffect(() => {
    if (!chart || !inView) {
      return undefined;
    }

    const prefersReducedMotion =
      window.matchMedia?.(
        '(prefers-reduced-motion: reduce)',
      ).matches;

    if (prefersReducedMotion) {
      return undefined;
    }

    const timers: number[] = [];

    chartData.forEach((_, index) => {
      timers.push(
        window.setTimeout(() => {
          chart.dispatchAction({
            type: 'downplay',
            seriesIndex: 0,
          });

          chart.dispatchAction({
            type: 'highlight',
            seriesIndex: 0,
            dataIndex: index,
          });
        }, HIGHLIGHT_START_MS + index * HIGHLIGHT_STEP_MS),
      );
    });

    timers.push(
      window.setTimeout(
        () => {
          chart.dispatchAction({
            type: 'downplay',
            seriesIndex: 0,
          });
        },
        HIGHLIGHT_START_MS +
          chartData.length * HIGHLIGHT_STEP_MS,
      ),
    );

    return () => {
      timers.forEach((timer) =>
        window.clearTimeout(timer),
      );
    };
  }, [chart, chartData, inView]);

  const option = useMemo<EChartsOption>(
    () => {
      const total =
        data.total_tributos + data.comissao;

      return {
        color: [
          '#4f6edb',
          '#a8cf24',
          '#575b7c',
          '#ff994c',
        ],

        animationDuration: 1700,
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

            radius: ['35%', '57%'],

            center: ['50%', '42%'],

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
              scaleSize: 10,

              itemStyle: {
                shadowColor:
                  'rgba(15, 23, 42, 0.22)',

                shadowBlur: 16,
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

                const percentage = Number(
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
    [chartData, data],
  );

  return (
    <Box ref={containerRef} sx={{ width: '100%' }}>
      {inView ? (
        <EChart
          option={option}
          height={CHART_HEIGHT}
          onReady={handleReady}
        />
      ) : (
        <Box sx={{ height: CHART_HEIGHT }} />
      )}
    </Box>
  );
}