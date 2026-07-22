import { useMemo } from 'react';

import type { EChartsOption } from 'echarts';

import { EChart } from '@/components/charts/EChart';
import type { RemessaFuturaKpis } from '@/types/dashboard';

interface RemittanceProgressChartProps {
  data: RemessaFuturaKpis;
}

export function RemittanceProgressChart({ data }: RemittanceProgressChartProps) {
  const percent = data.total_faturamento > 0
    ? Math.min(100, (data.total_entregue / data.total_faturamento) * 100)
    : 0;

  const option = useMemo<EChartsOption>(
    () => ({
      series: [
        {
          type: 'gauge',
          startAngle: 210,
          endAngle: -30,
          min: 0,
          max: 100,
          progress: { show: true, width: 18 },
          axisLine: { lineStyle: { width: 18, color: [[1, '#e2e8f0']] } },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          pointer: { show: false },
          anchor: { show: false },
          title: { offsetCenter: [0, '48%'], color: '#64748b', fontSize: 14 },
          detail: {
            valueAnimation: true,
            formatter: '{value}%',
            color: '#0f172a',
            fontSize: 30,
            fontWeight: 800,
            offsetCenter: [0, '4%'],
          },
          data: [{ value: Number(percent.toFixed(1)), name: 'Valor entregue' }],
        },
      ],
    }),
    [percent],
  );

  return <EChart option={option} height={280} />;
}
