import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import {
  Box,
  Card,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import type { ImpostosKpis } from '@/types/dashboard';
import { formatCurrency } from '@/utils/formatters';

interface TaxSummaryTableProps {
  data: ImpostosKpis;
}

const rows = [
  ['Vendas', 'vendas'],
  ['Devoluções', 'devolucoes'],
  ['Interno Obras', 'interno_obras'],
  ['Remessa futura', 'remessa_futura'],
  ['Consolidado líquido', 'consolidado_liquido'],
] as const;

const taxColors = {
  icms: '#4f6edb',
  pis: '#84a914',
  cofins: '#575b7c',
  tributos: '#d97706',
  comissao: '#f97316',
};

const headerCellSx = {
  px: 2,
  py: 1.7,

  color: '#64748b',
  backgroundColor: '#f8fafc',

  borderBottom:
    '1px solid rgba(148, 163, 184, 0.20)',

  fontSize: '0.73rem',
  fontWeight: 900,
  letterSpacing: '0.035em',
  whiteSpace: 'nowrap',
};

const bodyCellSx = {
  px: 2,
  py: 1.6,

  color: '#334155',

  borderBottom:
    '1px solid rgba(148, 163, 184, 0.13)',

  fontSize: '0.875rem',
  fontWeight: 600,
  whiteSpace: 'nowrap',
};

interface SummaryItemProps {
  title: string;
  value: number;
  color: string;
  backgroundColor: string;
}

function SummaryItem({
  title,
  value,
  color,
  backgroundColor,
}: SummaryItemProps) {
  return (
    <Box
      sx={{
        minWidth: {
          xs: '100%',
          sm: 190,
        },

        px: 2,
        py: 1.3,

        borderRadius: 2.5,

        backgroundColor,

        border:
          '1px solid rgba(148, 163, 184, 0.12)',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          color: '#64748b',
          fontWeight: 700,
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          mt: 0.35,

          color,

          fontSize: '1.05rem',
          lineHeight: 1.2,
          fontWeight: 900,
          letterSpacing: '-0.02em',
        }}
      >
        {formatCurrency(value)}
      </Typography>
    </Box>
  );
}

export function TaxSummaryTable({
  data,
}: TaxSummaryTableProps) {
  return (
    <Card
      component="section"
      sx={{
        border: 'none',
        borderRadius: 3,

        backgroundColor: '#ffffff',

        boxShadow:
          '0 3px 10px rgba(15, 23, 42, 0.07), ' +
          '0 12px 30px rgba(15, 23, 42, 0.06)',

        overflow: 'hidden',
      }}
    >
      {/* CABEÇALHO */}
      <Box
        sx={{
          display: 'flex',

          alignItems: {
            xs: 'flex-start',
            md: 'center',
          },

          justifyContent: 'space-between',

          flexDirection: {
            xs: 'column',
            md: 'row',
          },

          gap: 2.5,

          px: {
            xs: 2,
            md: 2.5,
          },

          pt: {
            xs: 2,
            md: 2.5,
          },

          pb: 2,
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
            <AccountBalanceRoundedIcon />
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
                letterSpacing: '-0.025em',
              }}
            >
              Tributos e comissão
            </Typography>

            <Typography
              sx={{
                mt: 0.3,

                color: '#64748b',

                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              Valores separados por origem e consolidado
              líquido.
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'stretch',
            flexWrap: 'wrap',
            gap: 1.2,

            width: {
              xs: '100%',
              md: 'auto',
            },
          }}
        >
          <SummaryItem
            title="Tributos consolidados"
            value={
              data.consolidado_liquido
                .total_tributos
            }
            color="#d97706"
            backgroundColor="rgba(245, 158, 11, 0.08)"
          />

          <SummaryItem
            title="Comissão consolidada"
            value={
              data.consolidado_liquido.comissao
            }
            color="#f97316"
            backgroundColor="rgba(249, 115, 22, 0.08)"
          />
        </Box>
      </Box>

      {/* LEGENDA */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,

          px: {
            xs: 2,
            md: 2.5,
          },

          pb: 2,
        }}
      >
        <Chip
          size="small"
          label="ICMS"
          sx={{
            color: taxColors.icms,

            backgroundColor:
              'rgba(79, 110, 219, 0.10)',

            fontWeight: 800,
          }}
        />

        <Chip
          size="small"
          label="PIS"
          sx={{
            color: taxColors.pis,

            backgroundColor:
              'rgba(132, 169, 20, 0.10)',

            fontWeight: 800,
          }}
        />

        <Chip
          size="small"
          label="COFINS"
          sx={{
            color: taxColors.cofins,

            backgroundColor:
              'rgba(87, 91, 124, 0.10)',

            fontWeight: 800,
          }}
        />

        <Chip
          size="small"
          label="Tributos"
          sx={{
            color: taxColors.tributos,

            backgroundColor:
              'rgba(245, 158, 11, 0.10)',

            fontWeight: 800,
          }}
        />

        <Chip
          size="small"
          label="Comissão"
          sx={{
            color: taxColors.comissao,

            backgroundColor:
              'rgba(249, 115, 22, 0.10)',

            fontWeight: 800,
          }}
        />
      </Box>

      {/* TABELA */}
      <TableContainer
        sx={{
          mx: {
            xs: 2,
            md: 2.5,
          },

          mb: {
            xs: 2,
            md: 2.5,
          },

          width: 'auto',
          overflowX: 'auto',

          borderRadius: 2.5,

          border:
            '1px solid rgba(148, 163, 184, 0.16)',
        }}
      >
        <Table
          size="small"
          sx={{
            minWidth: 900,
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={headerCellSx}>
                Origem
              </TableCell>

              <TableCell
                align="right"
                sx={{
                  ...headerCellSx,
                  color: taxColors.icms,
                }}
              >
                ICMS
              </TableCell>

              <TableCell
                align="right"
                sx={{
                  ...headerCellSx,
                  color: taxColors.pis,
                }}
              >
                PIS
              </TableCell>

              <TableCell
                align="right"
                sx={{
                  ...headerCellSx,
                  color: taxColors.cofins,
                }}
              >
                COFINS
              </TableCell>

              <TableCell
                align="right"
                sx={{
                  ...headerCellSx,
                  color: taxColors.tributos,
                }}
              >
                Tributos
              </TableCell>

              <TableCell
                align="right"
                sx={{
                  ...headerCellSx,
                  color: taxColors.comissao,
                }}
              >
                Comissão
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map(([label, key]) => {
              const item = data[key];

              const consolidated =
                key === 'consolidado_liquido';

              return (
                <TableRow
                  key={key}
                  hover={!consolidated}
                  sx={{
                    backgroundColor: consolidated
                      ? 'rgba(79, 110, 219, 0.065)'
                      : '#ffffff',

                    '&:hover': {
                      backgroundColor: consolidated
                        ? 'rgba(79, 110, 219, 0.085)'
                        : 'rgba(78, 170, 239, 0.035)',
                    },

                    '&:last-child td': {
                      borderBottom: 'none',
                    },
                  }}
                >
                  <TableCell
                    sx={{
                      ...bodyCellSx,

                      color: consolidated
                        ? '#0f172a'
                        : '#334155',

                      fontWeight: consolidated
                        ? 900
                        : 700,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.1,
                      }}
                    >
                      <Box
                        sx={{
                          width: consolidated
                            ? 9
                            : 7,

                          height: consolidated
                            ? 9
                            : 7,

                          flexShrink: 0,

                          borderRadius: '50%',

                          backgroundColor: consolidated
                            ? '#4f6edb'
                            : '#cbd5e1',
                        }}
                      />

                      <Typography
                        component="span"
                        sx={{
                          color: 'inherit',
                          fontSize: 'inherit',
                          fontWeight: 'inherit',
                        }}
                      >
                        {label}
                      </Typography>

                      {consolidated ? (
                        <Chip
                          label="TOTAL"
                          size="small"
                          sx={{
                            height: 21,
                            ml: 0.4,

                            color: '#4f6edb',

                            backgroundColor:
                              'rgba(79, 110, 219, 0.11)',

                            fontSize: '0.62rem',
                            fontWeight: 900,
                          }}
                        />
                      ) : null}
                    </Box>
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={{
                      ...bodyCellSx,

                      color: consolidated
                        ? taxColors.icms
                        : '#334155',

                      fontWeight: consolidated
                        ? 850
                        : 600,
                    }}
                  >
                    {formatCurrency(item.icms)}
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={{
                      ...bodyCellSx,

                      color: consolidated
                        ? taxColors.pis
                        : '#334155',

                      fontWeight: consolidated
                        ? 850
                        : 600,
                    }}
                  >
                    {formatCurrency(item.pis)}
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={{
                      ...bodyCellSx,

                      color: consolidated
                        ? taxColors.cofins
                        : '#334155',

                      fontWeight: consolidated
                        ? 850
                        : 600,
                    }}
                  >
                    {formatCurrency(item.cofins)}
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={{
                      ...bodyCellSx,

                      color: consolidated
                        ? taxColors.tributos
                        : '#334155',

                      fontWeight: consolidated
                        ? 900
                        : 700,
                    }}
                  >
                    {formatCurrency(
                      item.total_tributos,
                    )}
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={{
                      ...bodyCellSx,

                      color: consolidated
                        ? taxColors.comissao
                        : '#334155',

                      fontWeight: consolidated
                        ? 900
                        : 700,
                    }}
                  >
                    {formatCurrency(
                      item.comissao,
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}