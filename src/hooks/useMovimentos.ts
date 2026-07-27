import { useQuery } from '@tanstack/react-query';

import {
  getMovimentos,
} from '@/api/dashboardApi';

import type {
  DashboardFilters,
} from '@/types/dashboard';

export function useMovimentos(
  filters: DashboardFilters,
) {
  return useQuery({
    queryKey: [
      'movimentos',
      filters.codproj,
      filters.dtneg_inicial,
      filters.dtneg_final
    ],

    queryFn: () =>
      getMovimentos(filters),

    enabled:
      Number.isFinite(filters.codproj) &&
      filters.codproj > 0,

    staleTime: 30_000,
  });
}