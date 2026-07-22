import { useQuery } from '@tanstack/react-query';

import { getRemessasControl } from '@/api/dashboardApi';
import type { DashboardFilters } from '@/types/dashboard';

export function useRemessasControl(
  filters: DashboardFilters,
) {
  return useQuery({
    queryKey: [
      'dashboard-remessas',
      filters,
    ],

    queryFn: ({ signal }) =>
      getRemessasControl(
        filters,
        signal,
      ),

    enabled: filters.codproj > 0,

    staleTime: 60_000,

    retry: 1,

    refetchOnWindowFocus: false,
  });
}