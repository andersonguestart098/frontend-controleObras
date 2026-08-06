import { httpClient } from '@/api/httpClient';

import type {
  VExpensesDashboardResponse,
  VExpensesExpensesLoadResult,
  VExpensesExpensesResponse,
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

export async function getVExpensesExpenses(
  filters: VExpensesFilters,
): Promise<VExpensesExpensesLoadResult> {
  const {
    codproj,
    data_inicial,
    data_final,
  } = filters;

  const projeto = await getVExpensesProjectByCodproj(codproj);

  // Projeto ainda não vinculado na VExpenses.
  // Isso é um estado vazio válido, não uma falha da consulta.
  if (!projeto) {
    return {
      linked: false,
      expenses: [],
      totalRegistros: 0,
    };
  }

  const response = await httpClient.get<VExpensesExpensesResponse>(
    '/dashboard/vexpenses/expenses',
    {
      params: {
        pagina: 1,
        itens_por_pagina: 100,
        project_id: projeto.id,
        somente_com_projeto: true,
        data_inicial: data_inicial || undefined,
        data_final: data_final || undefined,
      },
    },
  );

  return {
    linked: true,
    expenses: response.data.data,
    totalRegistros: response.data.total_registros,
  };
}