import { useQuery } from '@tanstack/react-query';

import { getDashboardKpis } from '@/api/dashboardApi';
import type { DashboardFilters } from '@/types/dashboard';

export function useDashboardKpis(
  filters: DashboardFilters,
) {
  return useQuery({
    queryKey: [
      'dashboard-kpis',
      filters,
    ],

    queryFn: ({ signal }) =>
      getDashboardKpis(
        filters,
        signal,
      ),

    enabled: filters.codproj > 0,

    staleTime: 60_000,

    retry: 1,

    refetchOnWindowFocus: false,
  });
}