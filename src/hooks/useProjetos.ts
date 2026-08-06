import {
  useQuery,
} from '@tanstack/react-query';

import {
  getProjetos,
} from '@/api/dashboardApi';

import type {
  ProjetoFiltro,
} from '@/types/dashboard';

export function useProjetos() {
  return useQuery<
    ProjetoFiltro[],
    Error
  >({
    queryKey: [
      'dashboard',
      'projetos',
    ],

    queryFn: ({
      signal,
    }) =>
      getProjetos(signal),

    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
