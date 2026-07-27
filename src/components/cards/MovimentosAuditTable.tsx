import {
  useCallback,
  useMemo,
  useState,
  type MouseEvent,
} from 'react';

import FilterAltRoundedIcon from
  '@mui/icons-material/FilterAltRounded';

import ReceiptLongRoundedIcon from
  '@mui/icons-material/ReceiptLongRounded';

import SearchRoundedIcon from
  '@mui/icons-material/SearchRounded';

import {
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  MenuList,
  Popover,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import {
  DataGrid,
  type GridColDef,
} from '@mui/x-data-grid';

import { ptBR } from
  '@mui/x-data-grid/locales';

import type {
  Movimento,
} from '../../types/movimentos';

import {
  formatCurrency,
} from '@/utils/formatters';


/*
 * Quando quiser disponibilizar a exportação,
 * basta trocar para true.
 */
const SHOW_EXPORT_BUTTON = false;

const EMPTY_FILTER_VALUE = '__EMPTY__';


interface MovimentosAuditTableProps {
  movimentos: Movimento[];
  loading?: boolean;
}


type TipoMovimentoExibicao =
  | 'VENDA'
  | 'DEVOLUCAO'
  | 'INTERNO_OBRAS'
  | 'DEVOLUCAO_INTERNO_OBRAS'
  | 'PEDIDO_MAE'
  | 'OUTRO';


interface MovimentoGridRow extends Movimento {
  id: number;

  dtneg_date: Date | null;

  /*
   * Campo criado somente no frontend.
   *
   * O backend continua retornando OUTRO
   * para a TOP 1009.
   */
  tipo_movimento_exibicao:
    TipoMovimentoExibicao;
}


type MovimentoMoneyField =
  | 'vlrnota'
  | 'vlricms'
  | 'vlrpis'
  | 'vlrcofins'
  | 'vlr_gasto_fixo'
  | 'vlr_irpj_cssl'
  | 'vlr_comissao'
  | 'vlr_gasto_total'
  | 'vlr_liquido';


type CheckboxFilterField =
  | 'nunota'
  | 'numnota'
  | 'dtneg_date'
  | 'tipo_movimento_exibicao'
  | 'codtipoper'
  | 'descroper'
  | 'parceiro'
  | 'cgc_cpf'
  | 'codparc'
  | 'codtipvenda'
  | 'tipo_negociacao'
  | 'vlrnota'
  | 'vlricms'
  | 'vlrpis'
  | 'vlrcofins'
  | 'vlr_gasto_fixo'
  | 'vlr_irpj_cssl'
  | 'vlr_comissao'
  | 'vlr_gasto_total'
  | 'vlr_liquido'
  | 'codproj'
  | 'projeto';


type ColumnFilters = Partial<
  Record<
    CheckboxFilterField,
    string[]
  >
>;


interface FilterOption {
  key: string;
  label: string;
}


interface CheckboxFilterHeaderProps {
  field: CheckboxFilterField;
  label: string;

  rows: MovimentoGridRow[];

  selectedValues:
    | string[]
    | undefined;

  onChange: (
    values: string[] | undefined,
  ) => void;

  align?: 'left' | 'center' | 'right';
}


const movementColors = {
  venda: '#0f766e',
  devolucao: '#dc2626',

  internoObras: '#7c3aed',
  devolucaoInternoObras: '#c2410c',

  pedidoMae: '#2563eb',
  outro: '#4f6edb',

  normal: '#0f172a',
  muted: '#64748b',

  filter: '#0095FF',
};


const moneyFields =
  new Set<CheckboxFilterField>([
    'vlrnota',
    'vlricms',
    'vlrpis',
    'vlrcofins',
    'vlr_gasto_fixo',
    'vlr_irpj_cssl',
    'vlr_comissao',
    'vlr_gasto_total',
    'vlr_liquido',
  ]);


function safeNumber(
  value:
    | number
    | null
    | undefined,
): number {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : 0;
}


function parseDate(
  value: string | null,
): Date | null {
  if (!value) {
    return null;
  }

  const isoDate = value.slice(0, 10);

  /*
   * Meio-dia evita mudança de data
   * causada por timezone.
   */
  const parsedDate = new Date(
    `${isoDate}T12:00:00`,
  );

  return Number.isNaN(
    parsedDate.getTime(),
  )
    ? null
    : parsedDate;
}


function formatDate(
  value: Date | null,
): string {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat(
    'pt-BR',
  ).format(value);
}


function formatDocument(
  value:
    | number
    | null
    | undefined,
): string {
  const parsedValue = Number(value);

  if (
    !Number.isFinite(parsedValue) ||
    parsedValue === 0
  ) {
    return '—';
  }

  return String(parsedValue);
}


function normalizeSearchText(
  value: string,
): string {
  return value
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      '',
    )
    .toLowerCase()
    .trim();
}


function getTipoMovimentoExibicao(
  movimento: Movimento,
): TipoMovimentoExibicao {
  /*
   * Regra visual isolada:
   *
   * TOP 1009 será exibida como Pedido mãe,
   * sem alterar o retorno do backend.
   */
  if (movimento.codtipoper === 1009) {
    return 'PEDIDO_MAE';
  }

  const tipo = String(
    movimento.tipo_movimento ?? '',
  ).toUpperCase();

  if (tipo === 'VENDA') {
    return 'VENDA';
  }

  if (tipo === 'DEVOLUCAO') {
    return 'DEVOLUCAO';
  }

  if (tipo === 'INTERNO_OBRAS') {
    return 'INTERNO_OBRAS';
  }

  if (
    tipo ===
    'DEVOLUCAO_INTERNO_OBRAS'
  ) {
    return 'DEVOLUCAO_INTERNO_OBRAS';
  }

  return 'OUTRO';
}


function getMovementLabel(
  tipo: TipoMovimentoExibicao,
): string {
  if (tipo === 'VENDA') {
    return 'Venda';
  }

  if (tipo === 'DEVOLUCAO') {
    return 'Devolução';
  }

  if (tipo === 'INTERNO_OBRAS') {
    return 'Interno Obras';
  }

  if (
    tipo ===
    'DEVOLUCAO_INTERNO_OBRAS'
  ) {
    return 'Devolução Interno Obras';
  }

  if (tipo === 'PEDIDO_MAE') {
    return 'Pedido mãe';
  }

  return 'Outro';
}


function getMovementChip(
  tipo: TipoMovimentoExibicao,
) {
  if (tipo === 'VENDA') {
    return {
      label: 'Venda',
      color: movementColors.venda,

      backgroundColor:
        'rgba(15, 118, 110, 0.10)',
    };
  }

  if (tipo === 'DEVOLUCAO') {
    return {
      label: 'Devolução',
      color: movementColors.devolucao,

      backgroundColor:
        'rgba(220, 38, 38, 0.09)',
    };
  }

  if (tipo === 'INTERNO_OBRAS') {
    return {
      label: 'Interno Obras',
      color: movementColors.internoObras,

      backgroundColor:
        'rgba(124, 58, 237, 0.10)',
    };
  }

  if (
    tipo ===
    'DEVOLUCAO_INTERNO_OBRAS'
  ) {
    return {
      label: 'Devolução Interno Obras',
      color:
        movementColors
          .devolucaoInternoObras,

      backgroundColor:
        'rgba(194, 65, 12, 0.10)',
    };
  }

  if (tipo === 'PEDIDO_MAE') {
    return {
      label: 'Pedido mãe - remessa',
      color: movementColors.pedidoMae,

      backgroundColor:
        'rgba(37, 99, 235, 0.10)',
    };
  }

  return {
    label: 'Outro',
    color: movementColors.outro,

    backgroundColor:
      'rgba(79, 110, 219, 0.10)',
  };
}


function getFilterKey(
  field: CheckboxFilterField,
  value: unknown,
): string {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return EMPTY_FILTER_VALUE;
  }

  if (
    field === 'dtneg_date' &&
    value instanceof Date
  ) {
    return value
      .toISOString()
      .slice(0, 10);
  }

  return String(value);
}


function getFilterLabel(
  field: CheckboxFilterField,
  value: unknown,
): string {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return '(Em branco)';
  }

  if (
    field === 'dtneg_date' &&
    value instanceof Date
  ) {
    return formatDate(value);
  }

  if (
    field ===
    'tipo_movimento_exibicao'
  ) {
    return getMovementLabel(
      value as TipoMovimentoExibicao,
    );
  }

  if (moneyFields.has(field)) {
    return formatCurrency(
      safeNumber(
        value as number | null,
      ),
    );
  }

  if (
    field === 'numnota' &&
    Number(value) === 0
  ) {
    return '(Sem número)';
  }

  return String(value);
}


function buildFilterOptions(
  rows: MovimentoGridRow[],
  field: CheckboxFilterField,
): FilterOption[] {
  const optionsMap =
    new Map<string, FilterOption>();

  for (const row of rows) {
    const value = row[field];

    const key = getFilterKey(
      field,
      value,
    );

    const label = getFilterLabel(
      field,
      value,
    );

    if (!optionsMap.has(key)) {
      optionsMap.set(
        key,
        {
          key,
          label,
        },
      );
    }
  }

  return Array.from(
    optionsMap.values(),
  ).sort(
    (firstOption, secondOption) =>
      firstOption.label.localeCompare(
        secondOption.label,
        'pt-BR',
        {
          numeric: true,
          sensitivity: 'base',
        },
      ),
  );
}


function CheckboxFilterHeader({
  field,
  label,
  rows,
  selectedValues,
  onChange,
  align = 'left',
}: CheckboxFilterHeaderProps) {
  const [
    anchorElement,
    setAnchorElement,
  ] = useState<HTMLElement | null>(
    null,
  );

  const [
    searchValue,
    setSearchValue,
  ] = useState('');


  const options = useMemo(
    () =>
      buildFilterOptions(
        rows,
        field,
      ),
    [
      rows,
      field,
    ],
  );


  const optionKeys = useMemo(
    () =>
      options.map(
        (option) => option.key,
      ),
    [options],
  );


  /*
   * selectedValues undefined significa:
   * todos os valores selecionados e nenhum
   * filtro ativo nesta coluna.
   */
  const effectiveSelectedValues =
    selectedValues ?? optionKeys;


  const selectedValueSet = useMemo(
    () =>
      new Set(
        effectiveSelectedValues,
      ),
    [effectiveSelectedValues],
  );


  const visibleOptions = useMemo(
    () => {
      const normalizedSearch =
        normalizeSearchText(
          searchValue,
        );

      if (!normalizedSearch) {
        return options;
      }

      return options.filter(
        (option) =>
          normalizeSearchText(
            option.label,
          ).includes(
            normalizedSearch,
          ),
      );
    },
    [
      options,
      searchValue,
    ],
  );


  const allSelected =
    optionKeys.length > 0 &&
    optionKeys.every(
      (key) =>
        selectedValueSet.has(key),
    );


  const someSelected =
    !allSelected &&
    optionKeys.some(
      (key) =>
        selectedValueSet.has(key),
    );


  const hasActiveFilter =
    selectedValues !== undefined;


  function handleOpen(
    event: MouseEvent<HTMLElement>,
  ) {
    /*
     * Impede que o clique no filtro
     * altere a ordenação da coluna.
     */
    event.stopPropagation();

    setAnchorElement(
      event.currentTarget,
    );
  }


  function handleClose() {
    setAnchorElement(null);
    setSearchValue('');
  }


  function handleToggleOption(
    optionKey: string,
  ) {
    const currentValues =
      selectedValues ?? optionKeys;

    const alreadySelected =
      currentValues.includes(
        optionKey,
      );

    const nextValues =
      alreadySelected
        ? currentValues.filter(
            (value) =>
              value !== optionKey,
          )
        : [
            ...currentValues,
            optionKey,
          ];


    /*
     * Se todos foram selecionados novamente,
     * removemos o filtro da coluna.
     */
    if (
      nextValues.length ===
      optionKeys.length
    ) {
      onChange(undefined);
      return;
    }

    onChange(nextValues);
  }


  function handleToggleAll() {
    if (allSelected) {
      /*
       * Desmarca todos.
       * A tabela ficará sem resultados até
       * algum valor ser marcado novamente.
       */
      onChange([]);
      return;
    }

    /*
     * undefined representa todos marcados
     * e filtro inativo.
     */
    onChange(undefined);
  }


  function handleClearFilter() {
    onChange(undefined);
  }


  return (
    <>
      <Box
        sx={{
          width: '100%',

          display: 'flex',
          alignItems: 'center',

          justifyContent:
            align === 'right'
              ? 'flex-end'
              : align === 'center'
                ? 'center'
                : 'space-between',

          gap: 0.5,

          overflow: 'hidden',
        }}
      >
        <Typography
          component="span"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',

            color: '#64748b',

            fontSize: '0.76rem',
            fontWeight: 900,

            letterSpacing: '0.02em',
          }}
        >
          {label}
        </Typography>

        <Tooltip
          title={
            hasActiveFilter
              ? 'Filtro ativo'
              : 'Filtrar valores'
          }
        >
          <IconButton
            size="small"
            onClick={handleOpen}
            onMouseDown={(event) => {
              event.stopPropagation();
            }}
            sx={{
              width: 27,
              height: 27,

              flexShrink: 0,

              color: hasActiveFilter
                ? movementColors.filter
                : '#94a3b8',

              backgroundColor:
                hasActiveFilter
                  ? 'rgba(0, 149, 255, 0.10)'
                  : 'transparent',

              '&:hover': {
                color:
                  movementColors.filter,

                backgroundColor:
                  '#0095FF',
              },
            }}
          >
            <FilterAltRoundedIcon
              sx={{
                fontSize: 17,
              }}
            />
          </IconButton>
        </Tooltip>
      </Box>

      <Popover
        open={Boolean(anchorElement)}
        anchorEl={anchorElement}
        onClose={handleClose}

        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}

        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}

        slotProps={{
          paper: {
            sx: {
              width: 320,
              maxWidth:
                'calc(100vw - 32px)',

              mt: 0.7,

              borderRadius: 2.5,

              border:
                '1px solid rgba(148, 163, 184, 0.18)',

              boxShadow:
                '0 18px 45px rgba(15, 23, 42, 0.16)',

              overflow: 'hidden',
            },
          },
        }}
      >
        <Box
          sx={{
            px: 1.5,
            pt: 1.5,
            pb: 1.2,
          }}
        >
          <Typography
            sx={{
              mb: 1.2,

              color: '#0095FF',

              fontSize: '0.84rem',
              fontWeight: 900,
            }}
          >
            Filtrar: {label}
          </Typography>

          <TextField
            fullWidth
            size="small"

            value={searchValue}

            onChange={(event) => {
              setSearchValue(
                event.target.value,
              );
            }}

            placeholder="Pesquisar valor..."

            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon
                      sx={{
                        color: '#94a3b8',
                        fontSize: 19,
                      }}
                    />
                  </InputAdornment>
                ),
              },
            }}

            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,

                fontSize: '0.82rem',
              },
            }}
          />
        </Box>

        <Divider />

        <MenuList
          dense
          disablePadding
          variant="menu"
        >
          <MenuItem
            onClick={handleToggleAll}
            sx={{
              minHeight: 42,
              px: 1.2,
            }}
          >
            <Checkbox
              size="small"
              checked={allSelected}
              indeterminate={someSelected}
              sx={{
                color: '#94a3b8',

                '&.Mui-checked': {
                  color: movementColors.filter,
                },

                '&.MuiCheckbox-indeterminate': {
                  color: movementColors.filter,
                },
              }}
            />

            <Typography
              sx={{
                fontSize: '0.82rem',
                fontWeight: 800,
              }}
            >
              Selecionar todos
            </Typography>
          </MenuItem>
        </MenuList>

        <Divider />

        {visibleOptions.length === 0 ? (
        <Box
          sx={{
            px: 2,
            py: 3,
            textAlign: 'center',
          }}
        >
          <Typography
            sx={{
              color: '#94a3b8',
              fontSize: '0.82rem',
              fontWeight: 700,
            }}
          >
            Nenhum valor encontrado.
          </Typography>
        </Box>
      ) : (
        <MenuList
          dense
          disablePadding
          variant="menu"
          sx={{
            maxHeight: 310,
            overflowY: 'auto',
          }}
        >
          {visibleOptions.map(
            (option) => (
              <MenuItem
                key={option.key}
                onClick={() => {
                  handleToggleOption(
                    option.key,
                  );
                }}
                sx={{
                  minHeight: 40,
                  px: 1.2,
                }}
              >
                <Checkbox
                  size="small"
                  checked={
                    selectedValueSet.has(
                      option.key,
                    )
                  }
                  sx={{
                    color: '#94a3b8',

                    '&.Mui-checked': {
                      color:
                        movementColors.filter,
                    },
                  }}
                />

                <Typography
                  title={option.label}
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',

                    color: '#334155',

                    fontSize: '0.81rem',
                    fontWeight: 650,
                  }}
                >
                  {option.label}
                </Typography>
              </MenuItem>
            ),
          )}
        </MenuList>
      )}

        <Divider />

        <Box
          sx={{
            display: 'flex',

            justifyContent:
              'space-between',

            gap: 1,

            px: 1.5,
            py: 1.2,
          }}
        >
          <Button
            size="small"
            onClick={handleClearFilter}
            disabled={!hasActiveFilter}

            sx={{
              color: '#64748b',

              fontSize: '0.72rem',
              fontWeight: 800,

              textTransform: 'none',
            }}
          >
            Limpar filtro
          </Button>

          <Button
            size="small"
            variant="contained"
            onClick={handleClose}

            sx={{
              backgroundColor:
                movementColors.filter,

              borderRadius: 1.8,

              fontSize: '0.72rem',
              fontWeight: 900,

              textTransform: 'none',

              boxShadow: 'none',

              '&:hover': {
                backgroundColor:
                  '#007FDC',

                boxShadow: 'none',
              },
            }}
          >
            Concluir
          </Button>
        </Box>
      </Popover>
    </>
  );
}


function moneyColumn(
  field: MovimentoMoneyField,
  headerName: string,
  width: number,

  renderHeader: () =>
    React.ReactNode,
): GridColDef<MovimentoGridRow> {
  return {
    field,
    headerName,
    width,

    type: 'number',

    align: 'right',
    headerAlign: 'right',

    renderHeader,

    renderCell: (params) => (
      <Typography
        component="span"
        sx={{
          width: '100%',

          color: movementColors.normal,

          fontSize: '0.875rem',
          fontWeight: 700,

          textAlign: 'right',
        }}
      >
        {formatCurrency(
          safeNumber(
            params.value as
              | number
              | null
              | undefined,
          ),
        )}
      </Typography>
    ),
  };
}


export function MovimentosAuditTable({
  movimentos,
  loading = false,
}: MovimentosAuditTableProps) {
  const [
    columnFilters,
    setColumnFilters,
  ] = useState<ColumnFilters>({});


  const rows = useMemo<
    MovimentoGridRow[]
  >(
    () =>
      movimentos.map(
        (movimento) => ({
          ...movimento,

          id: movimento.nunota,

          dtneg_date: parseDate(
            movimento.dtneg,
          ),

          tipo_movimento_exibicao:
            getTipoMovimentoExibicao(
              movimento,
            ),
        }),
      ),
    [movimentos],
  );


  const updateColumnFilter =
    useCallback(
      (
        field: CheckboxFilterField,
        values:
          | string[]
          | undefined,
      ) => {
        setColumnFilters(
          (currentFilters) => {
            const nextFilters = {
              ...currentFilters,
            };

            if (
              values === undefined
            ) {
              delete nextFilters[field];

              return nextFilters;
            }

            nextFilters[field] =
              values;

            return nextFilters;
          },
        );
      },
      [],
    );


  const filteredRows = useMemo(
    () => {
      const activeFilters =
        Object.entries(
          columnFilters,
        ) as Array<
          [
            CheckboxFilterField,
            string[],
          ]
        >;

      if (
        activeFilters.length === 0
      ) {
        return rows;
      }

      return rows.filter(
        (row) =>
          activeFilters.every(
            ([
              field,
              selectedValues,
            ]) => {
              /*
               * Nenhum checkbox selecionado:
               * nenhuma linha passa.
               */
              if (
                selectedValues.length === 0
              ) {
                return false;
              }

              const rowValue =
                getFilterKey(
                  field,
                  row[field],
                );

              return selectedValues.includes(
                rowValue,
              );
            },
          ),
      );
    },
    [
      rows,
      columnFilters,
    ],
  );


  const activeFilterCount =
    Object.keys(
      columnFilters,
    ).length;


  const renderCheckboxHeader =
    useCallback(
      (
        field:
          CheckboxFilterField,

        label: string,

        align:
          | 'left'
          | 'center'
          | 'right' = 'left',
      ) =>
        () => (
          <CheckboxFilterHeader
            field={field}
            label={label}

            rows={rows}

            selectedValues={
              columnFilters[field]
            }

            onChange={(values) => {
              updateColumnFilter(
                field,
                values,
              );
            }}

            align={align}
          />
        ),
      [
        rows,
        columnFilters,
        updateColumnFilter,
      ],
    );


  const columns = useMemo<
    GridColDef<MovimentoGridRow>[]
  >(
    () => [
      {
        field: 'nunota',
        headerName: 'Nº Único',

        type: 'number',
        width: 125,

        align: 'center',
        headerAlign: 'center',

        renderHeader:
          renderCheckboxHeader(
            'nunota',
            'Nº Único',
            'center',
          ),

        renderCell: (params) => (
          <Typography
            component="span"
            sx={{
              color: '#0095FF',

              fontSize: '0.875rem',
              fontWeight: 900,
            }}
          >
            {String(params.value)}
          </Typography>
        ),
      },

      {
        field: 'numnota',
        headerName: 'Nº documento',

        type: 'number',
        width: 155,

        align: 'center',
        headerAlign: 'center',

        renderHeader:
          renderCheckboxHeader(
            'numnota',
            'Nº documento',
            'center',
          ),

        renderCell: (params) => (
          <Typography
            component="span"
            sx={{
              width: '100%',

              color: params.value
                ? movementColors.normal
                : movementColors.muted,

              fontSize: '0.875rem',
              fontWeight: 700,

              textAlign: 'center',
            }}
          >
            {formatDocument(
              params.value as number,
            )}
          </Typography>
        ),
      },

      {
        field: 'dtneg_date',
        headerName:
          'Data negociação',

        type: 'date',
        width: 180,

        align: 'center',
        headerAlign: 'center',

        renderHeader:
          renderCheckboxHeader(
            'dtneg_date',
            'Data negociação',
            'center',
          ),

        renderCell: (params) => (
          <Typography
            component="span"
            sx={{
              width: '100%',

              color: params.value
                ? movementColors.normal
                : movementColors.muted,

              fontSize: '0.875rem',
              fontWeight: 650,

              textAlign: 'center',
            }}
          >
            {formatDate(
              params.value as
                Date | null,
            )}
          </Typography>
        ),
      },

      {
        field:
          'tipo_movimento_exibicao',

        headerName: 'Movimento',

        width: 165,

        renderHeader:
          renderCheckboxHeader(
            'tipo_movimento_exibicao',
            'Movimento',
          ),

        renderCell: (params) => {
          const movement =
            getMovementChip(
              params.value as
                TipoMovimentoExibicao,
            );

          return (
            <Chip
              size="small"
              label={movement.label}

              sx={{
                height: 24,

                color: movement.color,

                backgroundColor:
                  movement
                    .backgroundColor,

                fontSize: '0.68rem',
                fontWeight: 900,
              }}
            />
          );
        },
      },

      {
        field: 'codtipoper',
        headerName: 'TOP',

        type: 'number',
        width: 110,

        align: 'center',
        headerAlign: 'center',

        renderHeader:
          renderCheckboxHeader(
            'codtipoper',
            'TOP',
            'center',
          ),

        renderCell: (params) => (
          <Chip
            size="small"
            label={String(params.value)}

            sx={{
              height: 25,

              color: '#475569',

              backgroundColor:
                'rgba(100, 116, 139, 0.09)',

              fontSize: '0.70rem',
              fontWeight: 900,
            }}
          />
        ),
      },

      {
        field: 'descroper',
        headerName: 'Operação',

        minWidth: 300,
        flex: 1,

        renderHeader:
          renderCheckboxHeader(
            'descroper',
            'Operação',
          ),

        renderCell: (params) => (
          <Typography
            component="span"
            title={String(
              params.value ?? '',
            )}

            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',

              color:
                movementColors.normal,

              fontSize: '0.875rem',
              fontWeight: 700,
            }}
          >
            {String(
              params.value ?? '—',
            )}
          </Typography>
        ),
      },

      {
        field: 'parceiro',
        headerName: 'Parceiro',

        minWidth: 280,
        flex: 1,

        renderHeader:
          renderCheckboxHeader(
            'parceiro',
            'Parceiro',
          ),

        renderCell: (params) => (
          <Typography
            component="span"
            title={String(
              params.value ?? '',
            )}

            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',

              color:
                movementColors.normal,

              fontSize: '0.875rem',
              fontWeight: 650,
            }}
          >
            {String(
              params.value ?? '—',
            )}
          </Typography>
        ),
      },

      {
        field: 'cgc_cpf',
        headerName: 'CPF/CNPJ',

        width: 175,

        renderHeader:
          renderCheckboxHeader(
            'cgc_cpf',
            'CPF/CNPJ',
          ),

        renderCell: (params) => (
          <Typography
            component="span"
            sx={{
              color: params.value
                ? movementColors.normal
                : movementColors.muted,

              fontSize: '0.84rem',
              fontWeight: 650,
            }}
          >
            {String(
              params.value ?? '—',
            )}
          </Typography>
        ),
      },

      {
        field: 'codparc',
        headerName:
          'Cód. parceiro',

        type: 'number',
        width: 155,

        align: 'center',
        headerAlign: 'center',

        renderHeader:
          renderCheckboxHeader(
            'codparc',
            'Cód. parceiro',
            'center',
          ),
      },

      {
        field: 'codtipvenda',
        headerName:
          'Cód. negociação',

        type: 'number',
        width: 175,

        align: 'center',
        headerAlign: 'center',

        renderHeader:
          renderCheckboxHeader(
            'codtipvenda',
            'Cód. negociação',
            'center',
          ),
      },

      {
        field: 'tipo_negociacao',
        headerName:
          'Tipo negociação',

        width: 245,

        renderHeader:
          renderCheckboxHeader(
            'tipo_negociacao',
            'Tipo negociação',
          ),

        renderCell: (params) => (
          <Typography
            component="span"
            title={String(
              params.value ?? '',
            )}

            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',

              color: params.value
                ? movementColors.normal
                : movementColors.muted,

              fontSize: '0.875rem',
              fontWeight: 650,
            }}
          >
            {String(
              params.value ?? '—',
            )}
          </Typography>
        ),
      },

      moneyColumn(
        'vlrnota',
        'Valor da nota',
        175,

        renderCheckboxHeader(
          'vlrnota',
          'Valor da nota',
          'right',
        ),
      ),

      moneyColumn(
        'vlricms',
        'ICMS',
        145,

        renderCheckboxHeader(
          'vlricms',
          'ICMS',
          'right',
        ),
      ),

      moneyColumn(
        'vlrpis',
        'PIS',
        135,

        renderCheckboxHeader(
          'vlrpis',
          'PIS',
          'right',
        ),
      ),

      moneyColumn(
        'vlrcofins',
        'COFINS',
        145,

        renderCheckboxHeader(
          'vlrcofins',
          'COFINS',
          'right',
        ),
      ),

      moneyColumn(
        'vlr_gasto_fixo',
        'Gasto fixo',
        165,

        renderCheckboxHeader(
          'vlr_gasto_fixo',
          'Gasto fixo',
          'right',
        ),
      ),

      moneyColumn(
        'vlr_irpj_cssl',
        'IRPJ/CSLL',
        165,

        renderCheckboxHeader(
          'vlr_irpj_cssl',
          'IRPJ/CSLL',
          'right',
        ),
      ),

      moneyColumn(
        'vlr_comissao',
        'Comissão',
        160,

        renderCheckboxHeader(
          'vlr_comissao',
          'Comissão',
          'right',
        ),
      ),

      moneyColumn(
        'vlr_gasto_total',
        'Gasto total',
        170,

        renderCheckboxHeader(
          'vlr_gasto_total',
          'Gasto total',
          'right',
        ),
      ),

      {
        ...moneyColumn(
          'vlr_liquido',
          'Valor líquido',
          175,

          renderCheckboxHeader(
            'vlr_liquido',
            'Valor líquido',
            'right',
          ),
        ),

        renderCell: (params) => (
          <Typography
            component="span"
            sx={{
              width: '100%',

              color: '#0f766e',

              fontSize: '0.875rem',
              fontWeight: 900,

              textAlign: 'right',
            }}
          >
            {formatCurrency(
              safeNumber(
                params.value as
                  | number
                  | null
                  | undefined,
              ),
            )}
          </Typography>
        ),
      },

      {
        field: 'codproj',
        headerName:
          'Cód. projeto',

        type: 'number',
        width: 155,

        align: 'center',
        headerAlign: 'center',

        renderHeader:
          renderCheckboxHeader(
            'codproj',
            'Cód. projeto',
            'center',
          ),
      },

      {
        field: 'projeto',
        headerName: 'Projeto',

        width: 250,

        renderHeader:
          renderCheckboxHeader(
            'projeto',
            'Projeto',
          ),
      },
    ],
    [renderCheckboxHeader],
  );


  const documentCountLabel =
    activeFilterCount > 0
      ? `${filteredRows.length} de ${rows.length} documentos`
      : `${rows.length} documentos`;


  return (
    <Card
      component="section"

      sx={{
        width: '100%',

        border: 'none',
        borderRadius: 3,

        backgroundColor: '#ffffff',

        boxShadow:
          '0 3px 10px rgba(15, 23, 42, 0.07), ' +
          '0 12px 30px rgba(15, 23, 42, 0.06)',

        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',

          alignItems: {
            xs: 'flex-start',
            md: 'center',
          },

          justifyContent:
            'space-between',

          flexDirection: {
            xs: 'column',
            md: 'row',
          },

          gap: 2,

          px: {
            xs: 2,
            md: 2.5,
          },

          py: {
            xs: 2,
            md: 2.5,
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.3,
          }}
        >
          <Box
            sx={{
              width: 42,
              height: 42,

              display: 'grid',
              placeItems: 'center',

              flexShrink: 0,

              borderRadius: 2.5,

              color: '#0095FF',

              backgroundColor:
                'rgba(79, 110, 219, 0.11)',
            }}
          >
            <ReceiptLongRoundedIcon />
          </Box>

          <Box>
            <Typography
              component="h2"

              sx={{
                color: '#0095FF',

                fontSize: {
                  xs: '1.05rem',
                  md: '1.2rem',
                },

                fontWeight: 900,

                letterSpacing:
                  '-0.025em',
              }}
            >
              Auditoria de documentos
            </Typography>

            <Typography
              sx={{
                mt: 0.3,

                color: '#64748b',

                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              Todas as movimentações vinculadas
              ao projeto.
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {activeFilterCount > 0 ? (
            <Button
              size="small"

              onClick={() => {
                setColumnFilters({});
              }}

              sx={{
                color: '#64748b',

                fontSize: '0.73rem',
                fontWeight: 800,

                textTransform: 'none',
              }}
            >
              Limpar {activeFilterCount}{' '}
              {activeFilterCount === 1
                ? 'filtro'
                : 'filtros'}
            </Button>
          ) : null}

          <Chip
            label={documentCountLabel}

            sx={{
              color: '#0095FF',

              backgroundColor:
                'rgba(79, 110, 219, 0.10)',

              fontWeight: 900,
            }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          mx: {
            xs: 1.5,
            md: 2,
          },

          mb: {
            xs: 1.5,
            md: 2,
          },

          height: 650,

          borderRadius: 2.5,

          border:
            '1px solid rgba(148, 163, 184, 0.16)',

          overflow: 'hidden',
        }}
      >
        <DataGrid
          rows={filteredRows}
          columns={columns}

          loading={loading}

          showToolbar
          ignoreDiacritics

          /*
           * Desativa o filtro nativo por
           * operadores/condições.
           *
           * Os filtros por checkbox continuam
           * funcionando porque são controlados
           * pelo componente.
           */
          disableColumnFilter

          disableRowSelectionOnClick

          rowHeight={52}
          columnHeaderHeight={58}

          pageSizeOptions={[
            10,
            25,
            50,
            100,
          ]}

          initialState={{
            pagination: {
              paginationModel: {
                page: 0,
                pageSize: 25,
              },
            },

            sorting: {
              sortModel: [
                {
                  field: 'dtneg_date',
                  sort: 'desc',
                },
              ],
            },

            columns: {
              columnVisibilityModel: {
                codproj: false,
                projeto: false,

                codparc: false,
                codtipvenda: false,

                cgc_cpf: false,

                vlrpis: false,
                vlrcofins: false,

                vlr_gasto_fixo: false,
                vlr_irpj_cssl: false,
                vlr_comissao: false,
              },
            },
          }}

          slotProps={{
            toolbar: {
              quickFilterProps: {
                debounceMs: 350,
              },

              /*
               * Com false, o botão de exportação
               * fica fora da interface.
               *
               * Ao trocar SHOW_EXPORT_BUTTON
               * para true, ele volta a aparecer.
               */
              csvOptions: {
                disableToolbarButton:
                  !SHOW_EXPORT_BUTTON,

                delimiter: ';',

                utf8WithBom: true,

                fileName:
                  'auditoria-documentos',
              },

              printOptions: {
                disableToolbarButton:
                  !SHOW_EXPORT_BUTTON,
              },
            },

            loadingOverlay: {
              variant:
                'linear-progress',

              noRowsVariant:
                'linear-progress',
            },
          }}

          localeText={
            ptBR.components
              .MuiDataGrid
              .defaultProps
              .localeText
          }

          getRowClassName={(params) => {
            const tipo = String(
              params.row
                .tipo_movimento_exibicao,
            ).toLowerCase();

            return `movimento-${tipo}`;
          }}

          sx={{
            border: 'none',

            color: '#0f172a',

            /*
             * Barra superior de carregamento.
             */
            '& .MuiLinearProgress-root': {
              backgroundColor:
                'rgba(0, 149, 255, 0.18)',
            },

            '& .MuiLinearProgress-bar': {
              backgroundColor:
                '#0095FF',
            },

            '& .MuiDataGrid-columnHeaders': {
              backgroundColor:
                '#f8fafc',

              borderBottom:
                '1px solid rgba(148, 163, 184, 0.20)',
            },

            '& .MuiDataGrid-columnHeader': {
              px: 1.1,
            },

            '& .MuiDataGrid-columnHeaderTitleContainer':
              {
                width: '100%',
              },

            '& .MuiDataGrid-columnHeaderTitleContainerContent':
              {
                width: '100%',
              },

            '& .MuiDataGrid-columnHeaderTitle':
              {
                color: '#64748b',

                fontSize: '0.76rem',
                fontWeight: 900,

                letterSpacing:
                  '0.02em',
              },

            '& .MuiDataGrid-cell': {
              borderBottom:
                '1px solid rgba(148, 163, 184, 0.13)',

              fontSize: '0.875rem',
              fontWeight: 600,
            },

            '& .MuiDataGrid-row:hover': {
              backgroundColor:
                '#f2f9fe',
            },

            '& .movimento-devolucao': {
              backgroundColor:
                '#fffafa',
            },

            '& .movimento-devolucao:hover':
              {
                backgroundColor:
                  '#fdf0f0',
              },

            '& .movimento-pedido_mae': {
              backgroundColor:
                'rgba(37, 99, 235, 0.025)',
            },

            '& .movimento-pedido_mae:hover':
              {
                backgroundColor:
                  'rgba(37, 99, 235, 0.07)',
              },

            '& .MuiDataGrid-footerContainer':
              {
                borderTop:
                  '1px solid rgba(148, 163, 184, 0.16)',
              },

            '& .MuiDataGrid-toolbarContainer': {
              px: 1.5,
              py: 1.2,
              gap: 1,

              borderBottom:
                '1px solid rgba(148, 163, 184, 0.14)',
            },

            '& .MuiDataGrid-toolbarQuickFilter .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#0095FF',
              },

              '&:hover fieldset': {
                borderColor: '#0095FF',
              },

              '&.Mui-focused fieldset': {
                borderColor: '#0095FF',
              },
            },
          }}
        />
      </Box>
    </Card>
  );
}