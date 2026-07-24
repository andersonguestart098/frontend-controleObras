import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { EChartsOption } from 'echarts';

import { Box, Typography } from '@mui/material';

import { EChart } from '@/components/charts/EChart';
import { useInViewOnce } from '@/components/common/RollingCurrency';
import type {
  RemessaControlResumo,
  RemessaFuturaKpis,
} from '@/types/dashboard';
import { formatCurrency } from '@/utils/formatters';

interface RemittanceQuantities {
  qtd_total: number;
  qtd_entregue: number;
}

interface RemittanceProgressChartProps {
  data: RemessaFuturaKpis;

  /*
   * Resumo do controle de remessas, o mesmo
   * que alimenta a tabela de materiais.
   *
   * É daqui que sai o percentual de produto
   * entregue.
   */
  resumo?: RemessaControlResumo;

  /*
   * Alternativa quando só as quantidades
   * estão disponíveis.
   */
  quantidades?: RemittanceQuantities;
}

interface GaugeConfig {
  key: string;
  title: string;
  percent: number;
  color: string;
  helper: string;
  delay: number;
}

/*
 * Só usamos esses dois easings, tipados como
 * literal para o TypeScript aceitar em
 * animationEasingUpdate.
 */
type GaugeEasing = 'cubicIn' | 'cubicOut';

interface GaugeFrame {
  value: number;
  duration: number;
  easing: GaugeEasing;
}

interface RevStep {
  ratio: number;
  duration: number;
  easing: GaugeEasing;
}

const GAUGE_HEIGHT = 230;

/*
 * Aceleradas do ponteiro antes de assentar.
 *
 * ratio é a fração do valor final, então o
 * ponteiro sobe, alivia, sobe mais, alivia de
 * novo, passa um pouco do alvo e volta.
 */
const REV_STEPS: RevStep[] = [
  { ratio: 0.42, duration: 380, easing: 'cubicOut' },
  { ratio: 0.24, duration: 260, easing: 'cubicIn' },
  { ratio: 0.78, duration: 400, easing: 'cubicOut' },
  { ratio: 0.55, duration: 260, easing: 'cubicIn' },
  { ratio: 1.09, duration: 520, easing: 'cubicOut' },
  { ratio: 1, duration: 460, easing: 'cubicOut' },
];

function calculatePercent(
  parte: number,
  total: number,
): number {
  if (!total || total <= 0) {
    return 0;
  }

  const percent = (parte / total) * 100;

  return Number(
    Math.min(Math.max(percent, 0), 100).toFixed(1),
  );
}

function clampPercent(value: number): number {
  return Number(
    Math.min(Math.max(value, 0), 100).toFixed(1),
  );
}

function GaugeCard({
  config,
  active,
}: {
  config: GaugeConfig;
  active: boolean;
}) {
  const [frame, setFrame] =
    useState<GaugeFrame>({
      value: 0,
      duration: 0,
      easing: 'cubicOut',
    });

  /*
   * Sequência de aceleradas até o valor real.
   */
  useEffect(() => {
    if (!active) {
      setFrame({
        value: 0,
        duration: 0,
        easing: 'cubicOut',
      });

      return undefined;
    }

    const prefersReducedMotion =
      window.matchMedia?.(
        '(prefers-reduced-motion: reduce)',
      ).matches;

    if (prefersReducedMotion) {
      setFrame({
        value: config.percent,
        duration: 0,
        easing: 'cubicOut',
      });

      return undefined;
    }

    const timers: number[] = [];

    let elapsed = config.delay;

    REV_STEPS.forEach((step) => {
      timers.push(
        window.setTimeout(() => {
          setFrame({
            value: clampPercent(
              config.percent * step.ratio,
            ),

            duration: step.duration,
            easing: step.easing,
          });
        }, elapsed),
      );

      elapsed += step.duration;
    });

    return () => {
      timers.forEach((timer) =>
        window.clearTimeout(timer),
      );
    };
  }, [active, config]);

  const option = useMemo<EChartsOption>(
    () => ({
      /*
       * Entra parado no zero e todo o movimento
       * acontece nas atualizações.
       */
      animationDuration: 0,

      animationDurationUpdate: frame.duration,
      animationEasingUpdate: frame.easing,

      series: [
        {
          type: 'gauge',

          startAngle: 210,
          endAngle: -30,

          min: 0,
          max: 100,

          animationDuration: 0,
          animationDurationUpdate:
            frame.duration,
          animationEasingUpdate: frame.easing,

          progress: {
            show: true,
            width: 16,

            itemStyle: {
              color: config.color,
            },
          },

          axisLine: {
            lineStyle: {
              width: 16,
              color: [[1, '#e2e8f0']],
            },
          },

          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          pointer: { show: false },
          anchor: { show: false },

          title: {
            offsetCenter: [0, '52%'],

            color: '#64748b',
            fontSize: 13,
            fontWeight: 600,
          },

          detail: {
            valueAnimation: true,

            formatter: '{value}%',

            color: '#0f172a',
            fontSize: 26,
            fontWeight: 800,

            offsetCenter: [0, '4%'],
          },

          data: [
            {
              value: frame.value,
              name: config.title,
            },
          ],
        },
      ],
    }),
    [config, frame],
  );

  return (
    <Box
      sx={{
        minWidth: 0,
        width: '100%',

        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {active ? (
        <EChart
          option={option}
          height={GAUGE_HEIGHT}
        />
      ) : (
        <Box
          sx={{
            width: '100%',
            height: GAUGE_HEIGHT,
          }}
        />
      )}

      <Typography
        variant="caption"
        sx={{
          mt: -1,

          color: '#94a3b8',

          fontSize: '0.7rem',
          fontWeight: 600,

          textAlign: 'center',
        }}
      >
        {config.helper}
      </Typography>
    </Box>
  );
}

export function RemittanceProgressChart({
  data,
  resumo,
  quantidades,
}: RemittanceProgressChartProps) {
  const [containerRef, inView] =
    useInViewOnce(
      0.45,
      '0px 0px -160px 0px',
    );

  /*
   * A quantidade pode chegar de três lugares:
   * pelo resumo do controle de remessas, por
   * prop direta ou dentro dos próprios KPIs.
   */
  const quantidadesFinais = useMemo<
    RemittanceQuantities | null
  >(() => {
    if (quantidades) {
      return quantidades;
    }

    if (resumo && resumo.qtd_total) {
      return {
        qtd_total: resumo.qtd_total,
        qtd_entregue: resumo.qtd_entregue,
      };
    }

    const total = Number(
      data.qtd_total ?? 0,
    );

    const entregue = Number(
      data.qtd_entregue ?? 0,
    );

    if (!total) {
      return null;
    }

    return {
      qtd_total: total,
      qtd_entregue: entregue,
    };
  }, [data, quantidades, resumo]);

  const gauges = useMemo<GaugeConfig[]>(
    () => {
      const lista: GaugeConfig[] = [
        {
          key: 'valor',
          title: 'Valor entregue',

          percent: calculatePercent(
            data.total_entregue,
            data.total_faturamento,
          ),

          color: '#4f6edb',

          helper: `${formatCurrency(
            data.total_entregue,
          )} de ${formatCurrency(
            data.total_faturamento,
          )}`,

          delay: 0,
        },

        {
          key: 'custo',
          title: 'Custo entregue',

          percent: calculatePercent(
            data.custo_entregue,
            data.custo_total,
          ),

          color: '#C18D34',

          helper: `${formatCurrency(
            data.custo_entregue,
          )} de ${formatCurrency(
            data.custo_total,
          )}`,

          delay: 650,
        },
      ];

      /*
       * O terceiro velocímetro entra embaixo,
       * centralizado entre os dois de cima.
       */
      if (quantidadesFinais) {
        lista.push({
          key: 'produto',
          title: 'Produto entregue',

          percent: calculatePercent(
            quantidadesFinais.qtd_entregue,
            quantidadesFinais.qtd_total,
          ),

          color: '#0d9488',

          helper: `${quantidadesFinais.qtd_entregue} de ${quantidadesFinais.qtd_total} unidades`,

          delay: 1300,
        });
      }

      return lista;
    },
    [data, quantidadesFinais],
  );

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',

        display: 'grid',

        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, minmax(0, 1fr))',
        },

        gap: 1,
      }}
    >
      {gauges.map((config, index) => {
        /*
         * O terceiro ocupa a linha inteira e
         * fica centralizado.
         */
        const centralizado =
          gauges.length === 3 && index === 2;

        return (
          <Box
            key={config.key}
            sx={{
              minWidth: 0,

              gridColumn: centralizado
                ? {
                    xs: 'auto',
                    sm: '1 / -1',
                  }
                : 'auto',

              justifySelf: 'center',

              width: '100%',

              maxWidth: centralizado
                ? {
                    xs: '100%',
                    sm: '52%',
                  }
                : '100%',
            }}
          >
            <GaugeCard
              config={config}
              active={inView}
            />
          </Box>
        );
      })}
    </Box>
  );
}