export interface MaoObraLinhaPreview {
  linha: number;
  codproj: number | null;
  valor_acumulado: number | null;
  valida: boolean;
  erro: string | null;
}

export interface MaoObraPreviewResponse {
  arquivo: string;
  aba: string | null;

  total_linhas: number;
  total_validas: number;
  total_invalidas: number;

  valor_total_valido: number;

  linhas: MaoObraLinhaPreview[];
}

export interface MaoObraResultadoLinha {
  linha: number;
  codproj: number | null;
  valor_acumulado: number | null;

  sucesso: boolean;

  codigo_pedido: string | null;
  erro: string | null;
}

export interface MaoObraImportacaoResponse {
  arquivo: string;

  total_linhas: number;
  total_validas: number;
  total_invalidas: number;

  total_processadas: number;
  total_sucesso: number;
  total_erros: number;

  valor_total_processado: number;

  resultados: MaoObraResultadoLinha[];
}