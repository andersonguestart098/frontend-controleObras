import { useEffect, useState } from 'react';

/*
 * Mede a largura real do container via
 * ResizeObserver, em vez de depender da
 * largura da viewport.
 *
 * Necessário porque um card pode estar
 * espremido dentro de um grid de 3 colunas
 * mesmo em janelas largas — useMediaQuery
 * de viewport erra nesse caso e o gráfico
 * assume que tem o espaço todo pra ele.
 *
 * Retorna uma ref de callback, então funciona
 * mesmo quando o elemento monta depois.
 */
export function useContainerWidth() {
  const [node, setNode] =
    useState<HTMLElement | null>(null);

  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!node || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    /*
     * ResizeObserver já dispara com o tamanho
     * inicial assim que observe() é chamado,
     * então não precisamos medir de novo aqui.
     */
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (entry) {
        setWidth(entry.contentRect.width);
      }
    });

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [node]);

  return [setNode, width] as const;
}
