import { httpClient } from '@/api/httpClient';

import type {
  VExpensesDashboardResponse,
  VExpensesFilters,
  VExpensesLoadResult,
  VExpensesProject,
} from '@/types/vexpenses';

/**
 * A rota deve responder:
 * - projeto encontrado: objeto do projeto;
 * - projeto sem vínculo: null com HTTP 200.
 */
export async function getVExpensesProjectByCodproj(
  codproj: number,
): Promise<VExpensesProject | null> {
  if (!Number.isInteger(codproj) || codproj <= 0) {
    return null;
  }

  const response = await httpClient.get<VExpensesProject | null>(
    `/dashboard/vexpenses/projects/by-integration/${codproj}`,
  );

  return response.data;
}

export async function getVExpensesSummary(
  filters: VExpensesFilters,
): Promise<VExpensesLoadResult> {
  const {
    codproj,
    data_inicial,
    data_final,
    incluir_movimentos = false,
  } = filters;

  const projeto = await getVExpensesProjectByCodproj(codproj);

  // Projeto ainda não vinculado na VExpenses.
  // Isso é um estado vazio válido, não uma falha da consulta.
  if (!projeto) {
    return {
      linked: false,
      data: null,
    };
  }

  const response = await httpClient.get<VExpensesDashboardResponse>(
    '/dashboard/vexpenses/summary',
    {
      params: {
        project_id: projeto.id,
        data_inicial: data_inicial || undefined,
        data_final: data_final || undefined,
        incluir_movimentos,
      },
    },
  );

  return {
    linked: true,
    data: {
      ...response.data,
      project: {
        ...response.data.project,
        ...projeto,
      },
    },
  };
}