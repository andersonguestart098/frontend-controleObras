import {
  useQuery,
} from '@tanstack/react-query';

import {
  getComprasDetalhes,
} from '@/api/dashboardApi';

import type {
  ComprasDetalhesResponse,
  DashboardFilters,
} from '@/types/dashboard';

export function useComprasDetalhes(
  filters: DashboardFilters,
) {
  return useQuery<
    ComprasDetalhesResponse,
    Error
  >({
    queryKey: [
      'dashboard',
      'compras-detalhes',
      filters.codproj,
      filters.dtneg_inicial,
      filters.dtneg_final,
    ],

    queryFn: ({
      signal,
    }) =>
      getComprasDetalhes(
        filters,
        signal,
      ),

    enabled:
      Number.isFinite(filters.codproj) &&
      filters.codproj > 0,

    staleTime: 30_000,

    refetchOnWindowFocus: false,
  });
}
