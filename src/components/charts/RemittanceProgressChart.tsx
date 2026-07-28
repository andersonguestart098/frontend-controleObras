import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { EChartsOption } from 'echarts';

import {
  Box,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

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
  resumo?: RemessaControlResumo;
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

  return Number(
    Math.min(
      Math.max((parte / total) * 100, 0),
      100,
    ).toFixed(1),
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
  height,
  isMobile,
}: {
  config: GaugeConfig;
  active: boolean;
  height: number;
  isMobile: boolean;
}) {
  const [frame, setFrame] =
    useState<GaugeFrame>({
      value: 0,
      duration: 0,
      easing: 'cubicOut',
    });

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

          center: ['50%', isMobile ? '48%' : '50%'],
          radius: isMobile ? '84%' : '88%',

          animationDuration: 0,
          animationDurationUpdate:
            frame.duration,
          animationEasingUpdate: frame.easing,

          progress: {
            show: true,
            width: isMobile ? 14 : 20,
            itemStyle: {
              color: config.color,
            },
          },

          axisLine: {
            lineStyle: {
              width: isMobile ? 14 : 20,
              color: [[1, '#e2e8f0']],
            },
          },

          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          pointer: { show: false },
          anchor: { show: false },

          title: {
            offsetCenter: [
              0,
              isMobile ? '54%' : '56%',
            ],
            color: '#64748b',
            fontSize: isMobile ? 12 : 15,
            fontWeight: 650,
          },

          detail: {
            valueAnimation: true,
            formatter: '{value}%',
            color: '#0f172a',
            fontSize: isMobile ? 25 : 34,
            fontWeight: 900,
            offsetCenter: [
              0,
              isMobile ? '1%' : '2%',
            ],
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
    [config, frame, isMobile],
  );

  return (
    <Box
      sx={{
        minWidth: 0,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',

        px: {
          xs: 0,
          sm: 0.5,
          lg: 1,
        },
      }}
    >
      {active ? (
        <EChart
          option={option}
          height={height}
        />
      ) : (
        <Box
          sx={{
            width: '100%',
            height,
          }}
        />
      )}

      <Typography
        variant="caption"
        sx={{
          mt: {
            xs: -0.5,
            md: -1,
          },
          px: 1,
          color: '#94a3b8',
          fontSize: {
            xs: '0.72rem',
            md: '0.82rem',
          },
          fontWeight: 650,
          lineHeight: 1.35,
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
  const theme = useTheme();

  const isMobile = useMediaQuery(
    theme.breakpoints.down('sm'),
  );

  const isTablet = useMediaQuery(
    theme.breakpoints.between('sm', 'lg'),
  );

  const gaugeHeight = isMobile
    ? 215
    : isTablet
      ? 275
      : 320;

  const [containerRef, inView] =
    useInViewOnce(
      0.35,
      '0px 0px -100px 0px',
    );

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
        maxWidth: 'none',
        minWidth: 0,

        display: 'grid',

        gridTemplateColumns: {
          xs: '1fr',
          sm:
            gauges.length === 3
              ? 'repeat(3, minmax(0, 1fr))'
              : 'repeat(2, minmax(0, 1fr))',
        },

        alignItems: 'start',

        gap: {
          xs: 1.5,
          sm: 2,
          lg: 2.5,
        },

        px: {
          xs: 0,
          sm: 1,
          lg: 1.5,
        },

        py: {
          xs: 0.5,
          md: 1,
        },
      }}
    >
      {gauges.map((config) => (
        <Box
          key={config.key}
          sx={{
            minWidth: 0,
            width: '100%',
          }}
        >
          <GaugeCard
            config={config}
            active={inView}
            height={gaugeHeight}
            isMobile={isMobile}
          />
        </Box>
      ))}
    </Box>
  );
}