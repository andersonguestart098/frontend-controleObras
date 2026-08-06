import {
  useQuery,
} from '@tanstack/react-query';

import {
  getDespesasGerais,
} from '@/api/dashboardApi';

import type {
  DashboardFilters,
  DespesasGeraisResponse,
} from '@/types/dashboard';

export function useDespesasGerais(
  filters: DashboardFilters,
) {
  return useQuery<
    DespesasGeraisResponse,
    Error
  >({
    queryKey: [
      'dashboard',
      'despesas-gerais',
      filters.codproj,
      filters.dtneg_inicial,
      filters.dtneg_final,
    ],

    queryFn: ({
      signal,
    }) =>
      getDespesasGerais(
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
