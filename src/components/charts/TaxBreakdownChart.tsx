import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type {
  ECharts,
  EChartsOption,
} from 'echarts';

import { Box } from '@mui/material';

import { EChart } from '@/components/charts/EChart';
import { useInViewOnce } from '@/components/common/RollingCurrency';
import { useContainerWidth } from '@/hooks/useContainerWidth';
import type { ImpostoGrupoKpis } from '@/types/dashboard';
import { formatCurrency } from '@/utils/formatters';

interface TaxBreakdownChartProps {
  data: ImpostoGrupoKpis;
}

const HIGHLIGHT_STEP_MS = 1150;
const HIGHLIGHT_START_MS = 1900;

export function TaxBreakdownChart({
  data,
}: TaxBreakdownChartProps) {
  const [inViewRef, inView] =
    useInViewOnce(
      0.35,
      '0px 0px -100px 0px',
    );

  const [widthRef, containerWidth] =
    useContainerWidth();

  const setRefs = useCallback(
    (node: HTMLElement | null) => {
      inViewRef(node);
      widthRef(node);
    },
    [inViewRef, widthRef],
  );

  /*
   * Baseado na largura real do card, não na
   * viewport — o card pode estar espremido num
   * grid de 3 colunas mesmo em janelas largas.
   */
  const isMobile =
    containerWidth > 0 && containerWidth < 420;

  const isTablet =
    containerWidth >= 420 && containerWidth < 640;

  const chartHeight = isMobile
    ? 360
    : isTablet
      ? 400
      : 420;

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
        value: Number(
          data.icms ?? 0,
        ),
      },
      {
        name: 'PIS',
        value: Number(
          data.pis ?? 0,
        ),
      },
      {
        name: 'COFINS',
        value: Number(
          data.cofins ?? 0,
        ),
      },
      {
        name: 'Comissão',
        value: Number(
          data.comissao ?? 0,
        ),
      },
    ],
    [data],
  );

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
          chartData.length *
            HIGHLIGHT_STEP_MS,
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
        Number(
          data.total_tributos ?? 0,
        ) +
        Number(
          data.comissao ?? 0,
        );

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
          type: 'scroll',

          bottom: isMobile
            ? 4
            : 8,

          left: 'center',

          orient: 'horizontal',

          itemWidth: isMobile
            ? 16
            : 22,

          itemHeight: isMobile
            ? 9
            : 12,

          itemGap: isMobile
            ? 8
            : 16,

          pageIconSize: 10,

          textStyle: {
            color: '#475569',

            fontSize: isMobile
              ? 10
              : 13,

            fontWeight: 650,
          },
        },

        graphic: [
          {
            type: 'text',

            left: 'center',

            top: isMobile
              ? '33%'
              : '35%',

            silent: true,

            style: {
              text: 'Total',

              fill: '#64748b',

              fontSize: isMobile
                ? 11
                : 14,

              fontWeight: 650,

              textAlign: 'center',
            },
          },

          {
            type: 'text',

            left: 'center',

            top: isMobile
              ? '40%'
              : '42%',

            silent: true,

            style: {
              text: formatCurrency(
                total,
              ),

              fill: '#0f172a',

              fontSize: isMobile
                ? 15
                : 21,

              fontWeight: 900,

              textAlign: 'center',
            },
          },
        ],

        series: [
          {
            name: 'Encargos',
            type: 'pie',

            radius: isMobile
              ? ['31%', '52%']
              : isTablet
                ? ['35%', '59%']
                : ['37%', '62%'],

            center: isMobile
              ? ['50%', '42%']
              : ['50%', '44%'],

            avoidLabelOverlap: true,
            minShowLabelAngle: 0,

            itemStyle: {
              borderRadius: isMobile
                ? 5
                : 8,

              borderColor: '#ffffff',

              borderWidth: isMobile
                ? 2
                : 4,

              shadowColor:
                'rgba(15, 23, 42, 0.08)',

              shadowBlur: isMobile
                ? 3
                : 6,
            },

            emphasis: {
              scale: true,

              scaleSize: isMobile
                ? 7
                : 12,

              itemStyle: {
                shadowColor:
                  'rgba(15, 23, 42, 0.22)',

                shadowBlur: isMobile
                  ? 10
                  : 18,
              },
            },

            label: {
              /*
               * No mobile os rótulos externos
               * somem para não cortar ou sobrepor.
               * A legenda e o tooltip permanecem.
               */
              show: !isMobile,

              position: 'outside',

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
                  `{value|${formatCurrency(
                    value,
                  )}} ` +
                  `{percentage|${percentage.toFixed(
                    1,
                  )}%}`
                );
              },

              rich: {
                name: {
                  color: '#475569',

                  fontSize: isTablet
                    ? 11
                    : 13,

                  fontWeight: 750,

                  lineHeight: isTablet
                    ? 17
                    : 20,
                },

                value: {
                  color: '#0f172a',

                  fontSize: isTablet
                    ? 11
                    : 13,

                  fontWeight: 850,

                  lineHeight: isTablet
                    ? 17
                    : 20,
                },

                percentage: {
                  color: '#64748b',

                  fontSize: isTablet
                    ? 10
                    : 12,

                  fontWeight: 700,

                  lineHeight: isTablet
                    ? 17
                    : 20,
                },
              },
            },

            labelLine: {
              show: !isMobile,

              length: isTablet
                ? 12
                : 18,

              length2: isTablet
                ? 9
                : 13,

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
    [
      chartData,
      data,
      isMobile,
      isTablet,
    ],
  );

  return (
    <Box
      ref={setRefs}
      sx={{
        width: '100%',
        maxWidth: 'none',
        minWidth: 0,
      }}
    >
      {inView ? (
        <EChart
          option={option}
          height={chartHeight}
          onReady={handleReady}
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