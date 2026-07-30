import {
  useQuery,
} from '@tanstack/react-query';

import {
  getPagamentos,
} from '@/api/dashboardApi';

import type {
  DashboardFilters,
  PagamentosResponse,
} from '@/types/dashboard';

export function usePagamentos(
  filters: DashboardFilters,
) {
  return useQuery<
    PagamentosResponse,
    Error
  >({
    queryKey: [
      'dashboard',
      'pagamentos',
      filters.codproj,
      filters.dtneg_inicial,
      filters.dtneg_final,
    ],

    queryFn: ({
      signal,
    }) =>
      getPagamentos(
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