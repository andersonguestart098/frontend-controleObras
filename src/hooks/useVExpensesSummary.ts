import { useQuery } from '@tanstack/react-query';

import { getVExpensesSummary } from '@/api/vexpensesApi';
import type {
  VExpensesFilters,
  VExpensesLoadResult,
} from '@/types/vexpenses';

export function useVExpensesSummary(
  filters: VExpensesFilters,
) {
  const codproj = Number(filters.codproj);

  const projetoValido =
    Number.isInteger(codproj) && codproj > 0;

  return useQuery<VExpensesLoadResult, Error>({
    queryKey: [
      'vexpenses',
      'summary',
      codproj || null,
      filters.data_inicial ?? null,
      filters.data_final ?? null,
      filters.incluir_movimentos ?? false,
    ],

    queryFn: () =>
      getVExpensesSummary({
        ...filters,
        codproj,
      }),

    enabled: projetoValido,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}