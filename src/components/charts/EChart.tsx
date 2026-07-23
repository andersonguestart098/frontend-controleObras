import {
  useEffect,
  useRef,
} from 'react';

import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

interface EChartProps {
  option: EChartsOption;
  height?: number;

  /*
   * Recebe a instância assim que o gráfico
   * é criado, para quem precisa disparar
   * ações como highlight.
   */
  onReady?: (chart: echarts.ECharts) => void;
}

export function EChart({
  option,
  height = 320,
  onReady,
}: EChartProps) {
  const containerRef =
    useRef<HTMLDivElement | null>(null);

  const chartRef =
    useRef<echarts.ECharts | null>(null);

  /*
   * Guardamos o callback em ref para que
   * trocar a função não recrie o gráfico.
   */
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  /*
   * Cria o gráfico uma única vez.
   */
  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return undefined;
    }

    const chart = echarts.init(container);

    chartRef.current = chart;

    const resizeObserver = new ResizeObserver(
      () => chart.resize(),
    );

    resizeObserver.observe(container);

    onReadyRef.current?.(chart);

    return () => {
      resizeObserver.disconnect();
      chart.dispose();

      chartRef.current = null;
    };
  }, []);

  /*
   * Atualiza as opções em modo merge, que é o
   * que permite o ECharts animar a transição
   * dos valores antigos para os novos.
   */
  useEffect(() => {
    chartRef.current?.setOption(option);
  }, [option]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height }}
    />
  );
}