import FormatListNumberedRtlOutlinedIcon from '@mui/icons-material/FormatListNumberedRtlOutlined';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import {
  Box,
  Card,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';

import { SectionHeader } from '@/components/layout/SectionHeader';
import type {
  RemessaControlResponse,
  RemessaItem,
} from '@/types/dashboard';
import { formatCurrency } from '@/utils/formatters';

interface RemittanceControlTableProps {
  data: RemessaControlResponse;
}

interface SummaryMetricProps {
  title: string;
  value: string;
  color?: string;
  helper?: string;
  progress?: number;
  progressColor?: string;
}

const quantityFormatter =
  new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

const dateFormatter =
  new Intl.DateTimeFormat('pt-BR');

const surfaceCardSx = {
  border: 'none',
  borderRadius: 2.5,
  backgroundColor: '#ffffff',

  boxShadow:
    '0 3px 10px rgba(15, 23, 42, 0.07), ' +
    '0 12px 30px rgba(15, 23, 42, 0.06)',

  overflow: 'hidden',
};

const summaryCardSx = {
  border: 'none',
  borderRadius: 2.5,
  backgroundColor: '#ffffff',

  boxShadow:
    '0 2px 8px rgba(15, 23, 42, 0.05), ' +
    '0 8px 22px rgba(15, 23, 42, 0.05)',

  transition:
    'transform 160ms ease, box-shadow 160ms ease',

  '&:hover': {
    transform: 'translateY(-2px)',

    boxShadow:
      '0 6px 16px rgba(15, 23, 42, 0.09), ' +
      '0 14px 28px rgba(15, 23, 42, 0.07)',
  },
};

const tableHeaderCellSx = {
  py: 1.6,

  color: '#475569',
  backgroundColor: '#f8fafc',

  borderBottom:
    '1px solid rgba(148, 163, 184, 0.20)',

  fontSize: '0.73rem',
  fontWeight: 900,
  letterSpacing: '0.025em',
  whiteSpace: 'nowrap',
};

const numericCellSx = {
  color: '#334155',
  fontWeight: 600,
  whiteSpace: 'nowrap',
};

const tableViewportSx = {
  maxHeight: 340,

  overflowX: 'auto',
  overflowY: 'auto',

  borderTop:
    '1px solid rgba(148, 163, 184, 0.14)',

  scrollbarWidth: 'thin',
  scrollbarColor:
    'rgba(100, 116, 139, 0.45) transparent',

  '&::-webkit-scrollbar': {
    width: 8,
    height: 8,
  },

  '&::-webkit-scrollbar-track': {
    backgroundColor: 'transparent',
  },

  '&::-webkit-scrollbar-thumb': {
    borderRadius: 99,

    backgroundColor:
      'rgba(100, 116, 139, 0.36)',

    border: '2px solid transparent',
    backgroundClip: 'content-box',
  },

  '&::-webkit-scrollbar-thumb:hover': {
    backgroundColor:
      'rgba(71, 85, 105, 0.55)',

    backgroundClip: 'content-box',
  },
};

function formatQuantity(
  value: number | null | undefined,
): string {
  return quantityFormatter.format(
    value ?? 0,
  );
}

function formatDate(
  value: string | null | undefined,
): string {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return dateFormatter.format(date);
}

function normalizeStatus(
  status: string,
): string {
  return status
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function getStatusLabel(
  status: string,
): string {
  const normalized =
    normalizeStatus(status);

  if (normalized === 'NAO ENTREGUE') {
    return 'NÃO ENTREGUE';
  }

  return status;
}

function getStatusStyles(
  status: string,
): {
  color: string;
  backgroundColor: string;
} {
  const normalized =
    normalizeStatus(status);

  if (normalized === 'ENTREGUE') {
    return {
      color: '#15803d',
      backgroundColor:
        'rgba(22, 163, 74, 0.11)',
    };
  }

  if (normalized === 'PARCIAL') {
    return {
      color: '#0369a1',
      backgroundColor:
        'rgba(14, 165, 233, 0.12)',
    };
  }

  return {
    color: '#b45309',
    backgroundColor:
      'rgba(245, 158, 11, 0.13)',
  };
}

function getProgressColor(
  percentage: number,
): string {
  if (percentage >= 100) {
    return '#16a34a';
  }

  if (percentage > 0) {
    return '#4EAAEF';
  }

  return '#C18D34';
}

function SummaryMetric({
  title,
  value,
  color = '#0f172a',
  helper,
  progress,
  progressColor = '#4EAAEF',
}: SummaryMetricProps) {
  return (
    <Card sx={summaryCardSx}>
      <Box
        sx={{
          height: '100%',
          p: 2,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            color: '#64748b',
            fontWeight: 750,
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            mt: 0.7,

            color,

            fontSize: {
              xs: '1.05rem',
              md: '1.15rem',
            },

            lineHeight: 1.2,
            fontWeight: 900,
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
          }}
        >
          {value}
        </Typography>

        {helper ? (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 0.8,
              color: '#94a3b8',
              fontWeight: 600,
            }}
          >
            {helper}
          </Typography>
        ) : null}

        {progress !== undefined ? (
          <LinearProgress
            variant="determinate"
            value={Math.min(
              100,
              Math.max(0, progress),
            )}
            sx={{
              mt: 1.4,
              height: 7,
              borderRadius: 99,

              backgroundColor:
                'rgba(148, 163, 184, 0.18)',

              '& .MuiLinearProgress-bar': {
                borderRadius: 99,
                backgroundColor: progressColor,
              },
            }}
          />
        ) : null}
      </Box>
    </Card>
  );
}

function ItemProgress({
  item,
}: {
  item: RemessaItem;
}) {
  const percentage = Math.min(
    100,
    Math.max(
      0,
      item.perc_entrega ?? 0,
    ),
  );

  return (
    <Box
      sx={{
        width: '100%',
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          mb: 0.7,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: '#64748b',
            fontWeight: 700,
          }}
        >
          Entrega
        </Typography>

        <Typography
          variant="caption"
          sx={{
            color: '#0f172a',
            fontWeight: 850,
          }}
        >
          {formatQuantity(percentage)}%
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 7,
          borderRadius: 99,

          backgroundColor:
            'rgba(148, 163, 184, 0.18)',

          '& .MuiLinearProgress-bar': {
            borderRadius: 99,

            backgroundColor:
              getProgressColor(percentage),
          },
        }}
      />
    </Box>
  );
}

export function RemittanceControlTable({
  data,
}: RemittanceControlTableProps) {
  const {
    resumo,
    remessas,
    itens,
  } = data;

  return (
    <Box>
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

          gap: 2,
          mb: 2.5,
        }}
      >
        <SectionHeader
          title="Controle das remessas"
          description="Saldo físico, financeiro e custo dos materiais vinculados às remessas futuras."
        />

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Chip
            label={`${data.count_remessas} remessa(s)`}
            sx={{
              color: '#0369a1',

              backgroundColor:
                'rgba(14, 165, 233, 0.10)',

              fontWeight: 800,
            }}
          />

          <Chip
            label={`${data.count_itens} item(ns)`}
            sx={{
              color: '#475569',
              backgroundColor: '#e2e8f0',
              fontWeight: 750,
            }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 1.5,

          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(3, minmax(0, 1fr))',
            xl: 'repeat(5, minmax(0, 1fr))',
          },
        }}
      >
        <SummaryMetric
          title="Qtd. Total produtos"
          value={formatQuantity(
            resumo.qtd_total,
          )}
        />

        <SummaryMetric
          title="Qtd. Entregue produtos"
          value={formatQuantity(
            resumo.qtd_entregue,
          )}
          color="#4EAAEF"
        />

        <SummaryMetric
          title="Qtd. Pendente produtos"
          value={formatQuantity(
            resumo.qtd_pendente,
          )}
          color="#C18D34"
        />

        <SummaryMetric
          title="Valor faturado"
          value={formatCurrency(
            resumo.vlr_total_item,
          )}
          color="#15803D"
        />

        <SummaryMetric
          title="Valor entregue"
          value={formatCurrency(
            resumo.vlr_entregue_item,
          )}
          color="#4EAAEF"
        />

        <SummaryMetric
          title="Saldo financeiro"
          value={formatCurrency(
            resumo.vlr_saldo_item,
          )}
          color="#C18D34"
        />

        <SummaryMetric
          title="Custo total sem ICMS"
          value={formatCurrency(
            resumo.custo_total,
          )}
          color="#FF746D"
        />

        <SummaryMetric
          title="Custo entregue sem ICMS"
          value={formatCurrency(
            resumo.custo_entregue,
          )}
          color="#4EAAEF"
        />

        <SummaryMetric
          title="Saldo de custo sem ICMS"
          value={formatCurrency(
            resumo.custo_pendente,
          )}
          color="#C18D34"
        />

        <SummaryMetric
          title="Progresso geral"
          value={`${formatQuantity(
            resumo.perc_entrega,
          )}%`}
          color="#4EAAEF"
          helper={`${formatQuantity(
            resumo.qtd_entregue,
          )} de ${formatQuantity(
            resumo.qtd_total,
          )} unidades`}
          progress={resumo.perc_entrega}
          progressColor="#4EAAEF"
        />
      </Box>

      {/* TABELA DAS NOTAS DE REMESSA */}
      <Card
        sx={{
          ...surfaceCardSx,
          mt: 3,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.2,

            px: {
              xs: 2,
              md: 2.5,
            },

            py: 2,
          }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,

              display: 'grid',
              placeItems: 'center',

              borderRadius: 2,

              color: '#4EAAEF',

              backgroundColor:
                'rgba(78, 170, 239, 0.11)',
            }}
          >
            <ReceiptLongRoundedIcon />
          </Box>

          <Box>
            <Typography
              sx={{
                color: '#0f172a',
                fontWeight: 850,
              }}
            >
              Notas de remessa
            </Typography>

            <Typography
              variant="caption"
              sx={{
                color: '#64748b',
                fontWeight: 600,
              }}
            >
              Documentos de remessa futura vinculados à obra.
            </Typography>
          </Box>
        </Box>

        <TableContainer sx={tableViewportSx}>
          <Table
            stickyHeader
            size="small"
            sx={{
              minWidth: 1180,
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={tableHeaderCellSx}>
                  Nota
                </TableCell>

                <TableCell sx={tableHeaderCellSx}>
                  Parceiro
                </TableCell>

                <TableCell sx={tableHeaderCellSx}>
                  Projeto
                </TableCell>

                <TableCell sx={tableHeaderCellSx}>
                  Data
                </TableCell>

                <TableCell sx={tableHeaderCellSx}>
                  Negociação
                </TableCell>

                <TableCell
                  align="right"
                  sx={tableHeaderCellSx}
                >
                  Valor
                </TableCell>

                <TableCell
                  align="right"
                  sx={tableHeaderCellSx}
                >
                  ICMS
                </TableCell>

                <TableCell
                  align="right"
                  sx={tableHeaderCellSx}
                >
                  Gastos
                </TableCell>

                <TableCell
                  align="right"
                  sx={tableHeaderCellSx}
                >
                  Líquido
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {remessas.map((remessa) => (
                <TableRow
                  key={remessa.nunota}
                  hover
                  sx={{
                    '& td': {
                      borderBottom:
                        '1px solid rgba(148, 163, 184, 0.13)',
                    },

                    '&:last-child td': {
                      borderBottom: 'none',
                    },

                    '&:hover': {
                      backgroundColor:
                        'rgba(78, 170, 239, 0.035)',
                    },
                  }}
                >
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#0f172a',
                        fontWeight: 850,
                      }}
                    >
                      {remessa.numnota}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        color: '#94a3b8',
                      }}
                    >
                      NU {remessa.nunota}
                    </Typography>
                  </TableCell>

                  <TableCell
                    sx={{
                      minWidth: 260,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#334155',
                        fontWeight: 700,
                      }}
                    >
                      {remessa.parceiro}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        color: '#94a3b8',
                      }}
                    >
                      {remessa.cgc_cpf}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    {remessa.projeto}
                  </TableCell>

                  <TableCell>
                    {formatDate(
                      remessa.dtneg,
                    )}
                  </TableCell>

                  <TableCell>
                    {remessa.tipo_negociacao}
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={numericCellSx}
                  >
                    {formatCurrency(
                      remessa.vlrnota,
                    )}
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={numericCellSx}
                  >
                    {formatCurrency(
                      remessa.vlricms ?? 0,
                    )}
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={{
                      ...numericCellSx,
                      color: '#FF746D',
                    }}
                  >
                    {formatCurrency(
                      remessa.vlr_gasto_total,
                    )}
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={{
                      ...numericCellSx,
                      color: '#15803d',
                      fontWeight: 850,
                    }}
                  >
                    {formatCurrency(
                      remessa.vlr_liquido,
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {remessas.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    sx={{
                      py: 5,
                      textAlign: 'center',
                      color: '#64748b',
                    }}
                  >
                    Nenhuma remessa encontrada para o projeto.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* TABELA DE SALDO DOS MATERIAIS */}
      <Card
        sx={{
          ...surfaceCardSx,
          mt: 3,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.2,

            px: {
              xs: 2,
              md: 2.5,
            },

            py: 2,
          }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,

              display: 'grid',
              placeItems: 'center',

              borderRadius: 2,

              color: '#C18D34',

              backgroundColor:
                'rgba(193, 141, 52, 0.11)',
            }}
          >
            <FormatListNumberedRtlOutlinedIcon />
          </Box>

          <Box>
            <Typography
              sx={{
                color: '#0f172a',
                fontWeight: 850,
              }}
            >
              Saldo por material
            </Typography>

            <Typography
              variant="caption"
              sx={{
                color: '#64748b',
                fontWeight: 600,
              }}
            >
              Quantidades, valores, custos e andamento da entrega.
            </Typography>
          </Box>
        </Box>

        <TableContainer
          sx={{
            maxHeight: 390,
            overflowX: 'auto',
            overflowY: 'auto',

            borderTop:
              '1px solid rgba(148, 163, 184, 0.14)',

            scrollbarWidth: 'thin',
            scrollbarColor:
              'rgba(100, 116, 139, 0.45) transparent',

            '&::-webkit-scrollbar': {
              width: 8,
              height: 8,
            },

            '&::-webkit-scrollbar-track': {
              backgroundColor: 'transparent',
            },

            '&::-webkit-scrollbar-thumb': {
              borderRadius: 99,
              backgroundColor:
                'rgba(100, 116, 139, 0.36)',
              border: '2px solid transparent',
              backgroundClip: 'content-box',
            },
          }}
        >
          <Table
            stickyHeader
            size="small"
            sx={{
              minWidth: 990,
              tableLayout: 'fixed',
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    ...tableHeaderCellSx,
                    width: 260,
                  }}
                >
                  Material
                </TableCell>

                <TableCell
                  sx={{
                    ...tableHeaderCellSx,
                    width: 140,
                  }}
                >
                  Quantidades
                </TableCell>

                <TableCell
                  sx={{
                    ...tableHeaderCellSx,
                    width: 170,
                  }}
                >
                  Valores
                </TableCell>

                <TableCell
                  sx={{
                    ...tableHeaderCellSx,
                    width: 170,
                  }}
                >
                  Custos sem ICMS
                </TableCell>

                <TableCell
                  sx={{
                    ...tableHeaderCellSx,
                    width: 140,
                  }}
                >
                  Progresso
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    ...tableHeaderCellSx,
                    width: 110,
                  }}
                >
                  Status
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {itens.map((item) => {
                const statusStyles =
                  getStatusStyles(
                    item.status_item,
                  );

                const detailLabelSx = {
                  color: '#94a3b8',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  lineHeight: 1.25,
                };

                const detailValueSx = {
                  color: '#334155',
                  fontSize: '0.76rem',
                  fontWeight: 750,
                  lineHeight: 1.25,
                  whiteSpace: 'nowrap',
                };

                return (
                  <TableRow
                    key={[
                      item.nunota,
                      item.sequencia,
                      item.codprod,
                    ].join('-')}
                    hover
                    sx={{
                      '& td': {
                        py: 1.5,
                        verticalAlign: 'middle',
                        borderBottom:
                          '1px solid rgba(148, 163, 184, 0.13)',
                      },

                      '&:last-child td': {
                        borderBottom: 'none',
                      },

                      '&:hover': {
                        backgroundColor:
                          'rgba(78, 170, 239, 0.035)',
                      },
                    }}
                  >
                    {/* MATERIAL */}
                    <TableCell sx={{ minWidth: 0 }}>
                      <Tooltip
                        title={item.descrprod}
                        arrow
                        placement="top-start"
                        enterDelay={250}
                      >
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{
                            display: 'block',
                            width: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            color: '#0f172a',
                            fontWeight: 850,
                            cursor: 'help',
                          }}
                        >
                          {item.descrprod}
                        </Typography>
                      </Tooltip>

                      <Typography
                        variant="caption"
                        noWrap
                        sx={{
                          display: 'block',
                          mt: 0.45,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          color: '#64748b',
                          fontWeight: 650,
                        }}
                      >
                        Nota {item.numnota} • NU {item.nunota} • Cód. {item.codprod} • {item.codvol}
                      </Typography>
                    </TableCell>

                    {/* QUANTIDADES */}
                    <TableCell>
                      <Box sx={{ display: 'grid', gap: 0.55 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 0.8 }}>
                          <Typography sx={detailLabelSx}>Total</Typography>
                          <Typography sx={detailValueSx}>{formatQuantity(item.qtd_total)}</Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 0.8 }}>
                          <Typography sx={detailLabelSx}>Entregue</Typography>
                          <Typography sx={{ ...detailValueSx, color: '#15803d' }}>
                            {formatQuantity(item.qtd_entregue)}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 0.8 }}>
                          <Typography sx={detailLabelSx}>Pendente</Typography>
                          <Typography sx={{ ...detailValueSx, color: '#C18D34' }}>
                            {formatQuantity(item.qtd_pendente)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* VALORES */}
                    <TableCell>
                      <Box sx={{ display: 'grid', gap: 0.45 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 0.8 }}>
                          <Typography sx={detailLabelSx}>Unit.</Typography>
                          <Typography sx={detailValueSx}>{formatCurrency(item.preco_liq_unitario)}</Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 0.8 }}>
                          <Typography sx={detailLabelSx}>Total</Typography>
                          <Typography sx={detailValueSx}>{formatCurrency(item.vlr_total_item)}</Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 0.8 }}>
                          <Typography sx={detailLabelSx}>Entregue</Typography>
                          <Typography sx={{ ...detailValueSx, color: '#4EAAEF' }}>
                            {formatCurrency(item.vlr_entregue_item)}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 0.8 }}>
                          <Typography sx={detailLabelSx}>Saldo</Typography>
                          <Typography sx={{ ...detailValueSx, color: '#C18D34', fontWeight: 850 }}>
                            {formatCurrency(item.vlr_saldo_item)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* CUSTOS */}
                    <TableCell>
                      <Box sx={{ display: 'grid', gap: 0.45 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 0.8 }}>
                          <Typography sx={detailLabelSx}>Unit.</Typography>
                          <Typography sx={detailValueSx}>{formatCurrency(item.custo_medio_sem_icms)}</Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 0.8 }}>
                          <Typography sx={detailLabelSx}>Total</Typography>
                          <Typography sx={{ ...detailValueSx, color: '#FF746D' }}>
                            {formatCurrency(item.custo_total)}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 0.8 }}>
                          <Typography sx={detailLabelSx}>Entregue</Typography>
                          <Typography sx={{ ...detailValueSx, color: '#4EAAEF' }}>
                            {formatCurrency(item.custo_entregue)}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 0.8 }}>
                          <Typography sx={detailLabelSx}>Saldo</Typography>
                          <Typography sx={{ ...detailValueSx, color: '#C18D34', fontWeight: 850 }}>
                            {formatCurrency(item.custo_pendente)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* PROGRESSO */}
                    <TableCell>
                      <ItemProgress item={item} />
                    </TableCell>

                    {/* STATUS */}
                    <TableCell align="center">
                      <Chip
                        label={getStatusLabel(
                          item.status_item,
                        )}
                        size="small"
                        sx={{
                          width: '100%',
                          maxWidth: 118,

                          color:
                            statusStyles.color,

                          backgroundColor:
                            statusStyles
                              .backgroundColor,

                          fontSize: '0.67rem',
                          fontWeight: 900,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}

              {itens.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    sx={{
                      py: 6,
                      textAlign: 'center',
                      color: '#64748b',
                    }}
                  >
                    Nenhum item de remessa encontrado para o projeto.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}