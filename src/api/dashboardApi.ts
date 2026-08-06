import type {
  ComprasDetalhesResponse,
  DashboardFilters,
  DashboardResponse,
  DespesasGeraisResponse,
  PagamentosResponse,
  ProjetoFiltro,
  RemessaControlResponse,
} from '@/types/dashboard';

import type {
  MovimentosResponse,
} from '@/types/movimentos';

import {
  httpClient,
} from './httpClient';

export async function getProjetos(
  signal?: AbortSignal,
): Promise<ProjetoFiltro[]> {
  const response =
    await httpClient.get<ProjetoFiltro[]>(
      '/dashboard/projects',
      {
        signal,
      },
    );

  return response.data;
}

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
  signal?: AbortSignal,
): Promise<MovimentosResponse> {
  const response =
    await httpClient.get<MovimentosResponse>(
      '/dashboard/movimentos',
      {
        params: {
          codproj: filters.codproj,

          dtneg_inicial:
            filters.dtneg_inicial ??
            undefined,

          dtneg_final:
            filters.dtneg_final ??
            undefined,
        },

        signal,
      },
    );

  return response.data;
}

export async function getPagamentos(
  filters: DashboardFilters,
  signal?: AbortSignal,
): Promise<PagamentosResponse> {
  const response =
    await httpClient.post<PagamentosResponse>(
      '/dashboard/pagamentos',
      filters,
      {
        signal,
      },
    );

  return response.data;
}

export async function getDespesasGerais(
  filters: DashboardFilters,
  signal?: AbortSignal,
): Promise<DespesasGeraisResponse> {
  const response =
    await httpClient.post<DespesasGeraisResponse>(
      '/dashboard/despesas-gerais',
      filters,
      {
        signal,
      },
    );

  return response.data;
}

export async function getComprasDetalhes(
  filters: DashboardFilters,
  signal?: AbortSignal,
): Promise<ComprasDetalhesResponse> {
  const response =
    await httpClient.get<ComprasDetalhesResponse>(
      '/dashboard/compras',
      {
        params: {
          codproj: filters.codproj,

          dtneg_inicial:
            filters.dtneg_inicial ??
            undefined,

          dtneg_final:
            filters.dtneg_final ??
            undefined,
        },

        signal,
      },
    );

  return response.data;
}