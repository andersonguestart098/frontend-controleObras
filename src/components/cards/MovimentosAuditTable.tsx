import { useMemo } from 'react';

import ReceiptLongRoundedIcon from
  '@mui/icons-material/ReceiptLongRounded';

import {
  Box,
  Card,
  Chip,
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


interface MovimentosAuditTableProps {
  movimentos: Movimento[];
  loading?: boolean;
}


interface MovimentoGridRow extends Movimento {
  id: number;
  dtneg_date: Date | null;
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


const movementColors = {
  venda: '#0f766e',
  devolucao: '#dc2626',
  outro: '#4f6edb',

  normal: '#0f172a',
  muted: '#64748b',
};


function safeNumber(
  value: number | null | undefined,
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
  value: number | null | undefined,
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


function getMovementChip(
  tipo: Movimento['tipo_movimento'],
) {
  const normalizedType =
    String(tipo).toUpperCase();

  if (normalizedType === 'VENDA') {
    return {
      label: 'Venda',
      color: movementColors.venda,
      backgroundColor:
        'rgba(15, 118, 110, 0.10)',
    };
  }

  if (normalizedType === 'DEVOLUCAO') {
    return {
      label: 'Devolução',
      color: movementColors.devolucao,
      backgroundColor:
        'rgba(220, 38, 38, 0.09)',
    };
  }

  return {
    label: 'Outro',
    color: movementColors.outro,
    backgroundColor:
      'rgba(79, 110, 219, 0.10)',
  };
}


function moneyColumn(
  field: MovimentoMoneyField,
  headerName: string,
  width = 145,
): GridColDef<MovimentoGridRow> {
  return {
    field,
    headerName,
    width,

    type: 'number',

    align: 'right',
    headerAlign: 'right',

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
              number | null | undefined,
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
  const rows = useMemo<
    MovimentoGridRow[]
  >(
    () =>
      movimentos.map((movimento) => ({
        ...movimento,

        id: movimento.nunota,

        dtneg_date: parseDate(
          movimento.dtneg,
        ),
      })),
    [movimentos],
  );


  const columns = useMemo<
    GridColDef<MovimentoGridRow>[]
  >(
    () => [
      {
        field: 'nunota',
        headerName: 'NUNOTA',

        type: 'number',
        width: 110,

        align: 'center',
        headerAlign: 'center',

        renderCell: (params) => (
          <Typography
            component="span"
            sx={{
              color: '#4f6edb',

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
        width: 135,

        align: 'center',
        headerAlign: 'center',

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
        headerName: 'Data negociação',

        type: 'date',
        width: 155,

        align: 'center',
        headerAlign: 'center',

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
              params.value as Date | null,
            )}
          </Typography>
        ),
      },

      {
        field: 'tipo_movimento',
        headerName: 'Movimento',

        type: 'singleSelect',
        width: 135,

        valueOptions: [
          {
            value: 'VENDA',
            label: 'Venda',
          },
          {
            value: 'DEVOLUCAO',
            label: 'Devolução',
          },
          {
            value: 'OUTRO',
            label: 'Outro',
          },
        ],

        renderCell: (params) => {
          const movement =
            getMovementChip(
              params.value as
                Movimento['tipo_movimento'],
            );

          return (
            <Chip
              size="small"
              label={movement.label}
              sx={{
                height: 24,

                color: movement.color,

                backgroundColor:
                  movement.backgroundColor,

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
        width: 95,

        align: 'center',
        headerAlign: 'center',

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

        minWidth: 280,
        flex: 1,

        renderCell: (params) => (
          <Typography
            component="span"
            title={String(params.value ?? '')}
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',

              color: movementColors.normal,

              fontSize: '0.875rem',
              fontWeight: 700,
            }}
          >
            {String(params.value ?? '—')}
          </Typography>
        ),
      },

      {
        field: 'parceiro',
        headerName: 'Parceiro',

        minWidth: 260,
        flex: 1,

        renderCell: (params) => (
          <Typography
            component="span"
            title={String(params.value ?? '')}
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',

              color: movementColors.normal,

              fontSize: '0.875rem',
              fontWeight: 650,
            }}
          >
            {String(params.value ?? '—')}
          </Typography>
        ),
      },

      {
        field: 'cgc_cpf',
        headerName: 'CPF/CNPJ',
        width: 155,

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
            {String(params.value ?? '—')}
          </Typography>
        ),
      },

      {
        field: 'codparc',
        headerName: 'Cód. parceiro',

        type: 'number',
        width: 135,

        align: 'center',
        headerAlign: 'center',
      },

      {
        field: 'codtipvenda',
        headerName: 'Cód. negociação',

        type: 'number',
        width: 150,

        align: 'center',
        headerAlign: 'center',
      },

      {
        field: 'tipo_negociacao',
        headerName: 'Tipo negociação',

        width: 220,

        renderCell: (params) => (
          <Typography
            component="span"
            title={String(params.value ?? '')}
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
            {String(params.value ?? '—')}
          </Typography>
        ),
      },

      moneyColumn(
        'vlrnota',
        'Valor da nota',
        150,
      ),

      moneyColumn(
        'vlricms',
        'ICMS',
        125,
      ),

      moneyColumn(
        'vlrpis',
        'PIS',
        120,
      ),

      moneyColumn(
        'vlrcofins',
        'COFINS',
        125,
      ),

      moneyColumn(
        'vlr_gasto_fixo',
        'Gasto fixo',
        145,
      ),

      moneyColumn(
        'vlr_irpj_cssl',
        'IRPJ/CSLL',
        145,
      ),

      moneyColumn(
        'vlr_comissao',
        'Comissão',
        140,
      ),

      moneyColumn(
        'vlr_gasto_total',
        'Gasto total',
        150,
      ),

      {
        ...moneyColumn(
          'vlr_liquido',
          'Valor líquido',
          155,
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
                  number | null | undefined,
              ),
            )}
          </Typography>
        ),
      },

      {
        field: 'codproj',
        headerName: 'Cód. projeto',

        type: 'number',
        width: 135,

        align: 'center',
        headerAlign: 'center',
      },

      {
        field: 'projeto',
        headerName: 'Projeto',
        width: 230,
      },
    ],
    [],
  );


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

              color: '#4f6edb',

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
                color: '#0f172a',

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

        <Chip
          label={`${rows.length} documentos`}
          sx={{
            color: '#4f6edb',

            backgroundColor:
              'rgba(79, 110, 219, 0.10)',

            fontWeight: 900,
          }}
        />
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
          rows={rows}
          columns={columns}

          loading={loading}

          showToolbar
          ignoreDiacritics

          disableRowSelectionOnClick

          rowHeight={52}
          columnHeaderHeight={54}

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
              params.row.tipo_movimento,
            ).toLowerCase();

            return `movimento-${tipo}`;
          }}

          sx={{
            border: 'none',

            color: '#0f172a',

            '& .MuiDataGrid-columnHeaders': {
              backgroundColor:
                '#f8fafc',

              borderBottom:
                '1px solid rgba(148, 163, 184, 0.20)',
            },

            '& .MuiDataGrid-columnHeaderTitle': {
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

            '& .movimento-devolucao:hover': {
              backgroundColor:
                '#fdf0f0',
            },

            '& .MuiDataGrid-footerContainer': {
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
          }}
        />
      </Box>
    </Card>
  );
}