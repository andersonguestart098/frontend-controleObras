import type {
  DashboardFilters,
  DashboardResponse,
  RemessaControlResponse,
} from '@/types/dashboard';

import { httpClient } from './httpClient';

export async function getDashboardKpis(
  filters: DashboardFilters,
  signal?: AbortSignal,
): Promise<DashboardResponse> {
  const response =
    await httpClient.post<DashboardResponse>(
      '/dashboard/kpis',
      filters,
      {
        signal,
      },
    );

  return response.data;
}

export async function getRemessasControl(
  filters: DashboardFilters,
  signal?: AbortSignal,
): Promise<RemessaControlResponse> {
  const response =
    await httpClient.post<RemessaControlResponse>(
      '/dashboard/remessas',
      filters,
      {
        signal,
      },
    );

  return response.data;
}