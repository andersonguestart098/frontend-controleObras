import { useQuery } from '@tanstack/react-query';

import { getVExpensesExpenses } from '@/api/vexpensesApi';
import type {
  VExpensesExpensesLoadResult,
  VExpensesFilters,
} from '@/types/vexpenses';

export function useVExpensesExpenses(
  filters: VExpensesFilters,
) {
  const codproj = Number(filters.codproj);

  const projetoValido =
    Number.isInteger(codproj) && codproj > 0;

  return useQuery<VExpensesExpensesLoadResult, Error>({
    queryKey: [
      'vexpenses',
      'expenses',
      codproj || null,
      filters.data_inicial ?? null,
      filters.data_final ?? null,
    ],

    queryFn: () =>
      getVExpensesExpenses({
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
