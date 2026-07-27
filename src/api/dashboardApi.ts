import type {
  DashboardFilters,
  DashboardResponse,
  RemessaControlResponse,
} from '@/types/dashboard';

import type {
  MovimentosResponse,
} from '@/types/movimentos';

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

export async function getMovimentos(
  filters: DashboardFilters,
): Promise<MovimentosResponse> {
  const response =
    await httpClient.get<MovimentosResponse>(
      '/dashboard/movimentos',
      {
        params: {
          codproj: filters.codproj,

          dtneg_inicial:
            filters.dtneg_inicial ?? undefined,

          dtneg_final:
            filters.dtneg_final ?? undefined,

          nunota:
            filters.nunota ?? undefined,
        },
      },
    );

  return response.data;
}