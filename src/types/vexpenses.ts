export interface VExpensesFilters {
  codproj: number;
  data_inicial?: string;
  data_final?: string;
  incluir_movimentos?: boolean;
}

export interface VExpensesProject {
  id: number;
  name: string;
  company_name: string | null;
  integration_id: string;
  on: boolean;
}

export interface VExpensesResponseFilters {
  project_id: number;
  data_inicial: string | null;
  data_final: string | null;
}

export interface VExpensesSummary {
  total_aprovado: number;
  quantidade_despesas: number;
  quantidade_relatorios: number;
  media_por_despesa: number;
  total_reembolsavel: number;
  total_nao_reembolsavel: number;
}

export interface VExpensesGroupItem {
  description: string;
  total: number;
  quantidade: number;
}

export interface VExpensesMovement {
  report_id: number;
  report_description: string | null;
  report_status: string | null;
  approval_date: string | null;
  pdf_link: string | null;
  excel_link: string | null;

  expense_id: number;
  expense_date: string | null;
  expense_title: string | null;
  expense_observation: string | null;
  receipt_url: string | null;

  user_id: number | null;
  user_name: string | null;
  user_email: string | null;

  expense_type_id: number | null;
  expense_type: string | null;

  cost_center_id: number | null;
  cost_center: string | null;

  payment_method_id: number | null;
  payment_method: string | null;

  reimbursable: boolean;
  project_id: number;

  apportionment_id: number | null;
  apportionment: string | null;
  apportionment_integration_id: string | null;

  percentage: number;
  original_value: number;
  value: number;
}

export interface VExpensesDashboardResponse {
  project: VExpensesProject;
  filters: VExpensesResponseFilters;
  summary: VExpensesSummary;
  por_tipo_despesa: VExpensesGroupItem[];
  por_centro_custo: VExpensesGroupItem[];
  por_forma_pagamento: VExpensesGroupItem[];
  por_usuario: VExpensesGroupItem[];
  movimentos?: VExpensesMovement[];
}

/**
 * Resultado tratado para a tela.
 *
 * linked=false não é erro: significa apenas que o CODPROJ ainda
 * não foi cadastrado como integration_id na VExpenses.
 */
export interface VExpensesLoadResult {
  linked: boolean;
  data: VExpensesDashboardResponse | null;
}

export interface VExpensesExpenseApportionmentItem {
  id: number;
  integration_id: string | null;
  expense_id: number;
  reimbursable_company_id: number;
  description: string | null;
  percentage: string;
  on: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface VExpensesExpenseProjectAllocation {
  project_id: number;
  integration_id: string | null;
  percentage: number;
  source: string;
}

export interface VExpensesExpenseItem {
  id: number;
  user_id: number | null;
  expense_id: number;
  date: string | null;
  expense_type_id: number | null;
  payment_method_id: number | null;
  paying_company_id: number | null;
  reicept_url: string | null;
  value: number;
  title: string | null;
  validate: string | null;
  reimbursable: boolean;
  observation: string | null;
  rejected: number;
  on: boolean;
  original_currency_iso: string | null;
  converted_value: number | null;
  converted_currency_iso: string | null;
  created_at: string | null;
  updated_at: string | null;

  apportionment?: {
    data: VExpensesExpenseApportionmentItem[];
  };

  project_allocation?: VExpensesExpenseProjectAllocation | null;
}

export interface VExpensesExpensesResponse {
  pagina: number;
  itens_por_pagina: number;
  total_registros: number;
  total_paginas: number;
  tem_proxima_pagina: boolean;
  tem_pagina_anterior: boolean;
  projeto: VExpensesProject;
  filtros: Record<string, unknown>;
  data: VExpensesExpenseItem[];
}

export interface VExpensesExpensesLoadResult {
  linked: boolean;
  expenses: VExpensesExpenseItem[];
  totalRegistros: number;
}