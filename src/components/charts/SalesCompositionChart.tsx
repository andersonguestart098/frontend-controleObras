import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { EChartsOption } from 'echarts';

import { Box } from '@mui/material';

import { EChart } from '@/components/charts/EChart';
import { useInViewOnce } from '@/components/common/RollingCurrency';
import type { DashboardKpis } from '@/types/dashboard';
import { formatCurrency } from '@/utils/formatters';

interface SalesCompositionChartProps {
  kpis: DashboardKpis;
}

const CHART_HEIGHT = 330;

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
  /*
   * O gráfico só é montado quando entra na
   * tela, para a animação acontecer na frente
   * do usuário.
   */
  const [containerRef, inView] =
    useInViewOnce(
      0.45,
      '0px 0px -160px 0px',
    );

  /*
   * As barras nascem no zero e só depois sobem
   * para o valor real.
   *
   * A animação de entrada do ECharts ignora
   * easing com repique, então fazemos o
   * crescimento como uma atualização de dados.
   */
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

      /*
       * Vendas e remessas viram uma barra só,
       * já somada. A quebra continua visível
       * no tooltip.
       */
      const chartData = [
        {
          name: 'Vendas e remessas',
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
          value: kpis.interno_obras.total,

          detalhe: [],

          color: '#4f6edb',
        },
        {
          name: 'Devoluções',
          value:
            kpis.vendas.total_devolucoes,

          detalhe: [],

          color: '#dc2626',
        },
      ];

      /*
       * Escala travada no maior valor para o
       * eixo não pular quando as barras sobem.
       */
      const maiorValor = Math.max(
        ...chartData.map(
          (item) => item.value,
        ),
        1,
      );

      return {
        animationDurationUpdate: BAR_DURATION,
        animationEasingUpdate: 'elasticOut',

        animationDelayUpdate: (
          index: number,
        ) => index * BAR_DELAY_STEP,

        tooltip: {
          trigger: 'axis',

          axisPointer: {
            type: 'shadow',

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
          max: Math.ceil(maiorValor * 1.15),

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

            data: chartData.map((item) => ({
              value: grown ? item.value : 0,

              itemStyle: {
                color: item.color,
              },
            })),

            barMaxWidth: 70,

            itemStyle: {
              borderRadius: [8, 8, 0, 0],

              shadowColor:
                'rgba(15, 23, 42, 0.16)',

              shadowBlur: 8,
              shadowOffsetY: 3,
            },

            emphasis: {
              itemStyle: {
                shadowColor:
                  'rgba(15, 23, 42, 0.26)',

                shadowBlur: 12,
                shadowOffsetY: 4,
              },
            },

            label: {
              show: grown,
              position: 'top',
              distance: 10,

              color: '#0f172a',

              fontSize: 12,
              fontWeight: 800,

              formatter: (params) =>
                formatCurrency(
                  Number(params.value ?? 0),
                ),
            },

            labelLayout: {
              hideOverlap: false,
            },
          },
        ],
      };
    },
    [grown, kpis],
  );

  return (
    <Box ref={containerRef} sx={fadeUpSx}>
      {inView ? (
        <EChart
          option={option}
          height={CHART_HEIGHT}
        />
      ) : (
        <Box
          sx={{ height: CHART_HEIGHT }}
        />
      )}
    </Box>
  );
}