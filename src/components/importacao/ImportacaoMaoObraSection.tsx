import {
  type ChangeEvent,
  type DragEvent,
  useRef,
  useState,
} from 'react';

import {
  alpha,
  keyframes,
} from '@mui/material/styles';

import ArrowForwardRoundedIcon from
  '@mui/icons-material/ArrowForwardRounded';
import CheckCircleRoundedIcon from
  '@mui/icons-material/CheckCircleRounded';
import CloudUploadRoundedIcon from
  '@mui/icons-material/CloudUploadRounded';
import DescriptionRoundedIcon from
  '@mui/icons-material/DescriptionRounded';
import ReplayRoundedIcon from
  '@mui/icons-material/ReplayRounded';
import WarningAmberRoundedIcon from
  '@mui/icons-material/WarningAmberRounded';

import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import {
  getImportacaoMaoObraErrorMessage,
  previewImportacaoMaoObra,
  processarImportacaoMaoObra,
} from '@/api/importacaoMaoObraApi';

import type {
  MaoObraImportacaoResponse,
  MaoObraPreviewResponse,
} from '@/types/importacaoMaoObra';

import {
  formatCurrency,
} from '@/utils/formatters';

import logoExcel from '@/assets/logoExcel.png';


const NAVY = '#0f172a';
const NAVY_SOFT = '#1e293b';

const BLUE = '#0ea5e9';
const BLUE_LIGHT = '#38bdf8';
const BLUE_DEEP = '#2563eb';

const ORANGE = '#f97316';

const SUCCESS = '#16a34a';
const MUTED = '#64748b';

const BORDER =
  'rgba(148, 163, 184, 0.18)';


const fadeUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.985);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;


const floatIcon = keyframes`
  0%, 100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-7px);
  }
`;


const pulseRing = keyframes`
  0% {
    transform: scale(0.88);
    opacity: 0.58;
  }

  70% {
    transform: scale(1.35);
    opacity: 0;
  }

  100% {
    transform: scale(1.35);
    opacity: 0;
  }
`;


const shimmer = keyframes`
  from {
    transform: translateX(-130%) rotate(12deg);
  }

  to {
    transform: translateX(260%) rotate(12deg);
  }
`;


const blobFloat = keyframes`
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
  }

  50% {
    transform: translate3d(8px, -9px, 0) scale(1.035);
  }
`;


const successPop = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.72);
  }

  65% {
    opacity: 1;
    transform: scale(1.08);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
`;


type ViewState =
  | 'empty'
  | 'previewing'
  | 'preview'
  | 'processing'
  | 'success';


function isXlsxFile(
  arquivo: File,
): boolean {
  return (
    arquivo.name
      .toLowerCase()
      .endsWith('.xlsx')
  );
}


function formatFileSize(
  bytes: number,
): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return (
      `${(bytes / 1024).toFixed(1)} KB`
    );
  }

  return (
    `${(
      bytes /
      (1024 * 1024)
    ).toFixed(2)} MB`
  );
}


function SummaryMetric({
  label,
  value,
  helper,
  accent,
}: {
  label: string;
  value: string;
  helper: string;
  accent: string;
}) {
  return (
    <Box
      sx={{
        position: 'relative',

        minWidth: 0,
        p: 2,

        overflow: 'hidden',

        borderRadius: 3,
        border: `1px solid ${BORDER}`,

        background:
          `linear-gradient(
            145deg,
            ${alpha(accent, 0.075)} 0%,
            rgba(255, 255, 255, 0.96) 68%
          )`,
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',

          width: 92,
          height: 92,

          right: -34,
          top: -42,

          borderRadius: '50%',

          backgroundColor:
            alpha(accent, 0.08),
        }}
      />

      <Typography
        variant="caption"
        sx={{
          display: 'block',

          color: MUTED,

          fontSize: '0.68rem',
          fontWeight: 900,
          letterSpacing: '0.055em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          mt: 0.45,

          color: accent,

          fontSize: {
            xs: '1.25rem',
            md: '1.5rem',
          },

          lineHeight: 1.05,
          fontWeight: 950,
          letterSpacing: '-0.035em',
        }}
      >
        {value}
      </Typography>

      <Typography
        variant="caption"
        sx={{
          display: 'block',

          mt: 0.65,

          color: '#94a3b8',

          fontSize: '0.7rem',
          fontWeight: 650,
        }}
      >
        {helper}
      </Typography>
    </Box>
  );
}


export function ImportacaoMaoObraSection() {
  const inputRef =
    useRef<HTMLInputElement | null>(null);

  const [
    arquivo,
    setArquivo,
  ] = useState<File | null>(null);

  const [
    preview,
    setPreview,
  ] = useState<MaoObraPreviewResponse | null>(
    null,
  );

  const [
    resultado,
    setResultado,
  ] = useState<MaoObraImportacaoResponse | null>(
    null,
  );

  const [
    viewState,
    setViewState,
  ] = useState<ViewState>('empty');

  const [
    dragging,
    setDragging,
  ] = useState(false);

  const [
    confirmOpen,
    setConfirmOpen,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(null);


  const isBusy =
    viewState === 'previewing' ||
    viewState === 'processing';


  async function carregarPreview(
    nextFile: File,
  ) {
    setErrorMessage(null);
    setResultado(null);
    setPreview(null);
    setArquivo(nextFile);

    if (!isXlsxFile(nextFile)) {
      setArquivo(null);

      setErrorMessage(
        'Selecione uma planilha XLSX. ' +
        'A importação lê exclusivamente a aba OBRAS.',
      );

      setViewState('empty');
      return;
    }

    try {
      setViewState('previewing');

      const response =
        await previewImportacaoMaoObra(
          nextFile,
        );

      setPreview(response);
      setViewState('preview');

    } catch (error) {
      setPreview(null);

      setErrorMessage(
        getImportacaoMaoObraErrorMessage(
          error,
        ),
      );

      setViewState('empty');
    }
  }


  function handleInputChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const nextFile =
      event.target.files?.[0];

    event.target.value = '';

    if (!nextFile) {
      return;
    }

    void carregarPreview(nextFile);
  }


  function handleDragOver(
    event: DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault();

    if (!isBusy) {
      setDragging(true);
    }
  }


  function handleDragLeave(
    event: DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault();
    setDragging(false);
  }


  function handleDrop(
    event: DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault();
    setDragging(false);

    if (isBusy) {
      return;
    }

    const nextFile =
      event.dataTransfer.files?.[0];

    if (!nextFile) {
      return;
    }

    void carregarPreview(nextFile);
  }


  function resetarImportacao() {
    setArquivo(null);
    setPreview(null);
    setResultado(null);
    setErrorMessage(null);
    setConfirmOpen(false);
    setDragging(false);
    setViewState('empty');
  }


  async function processarImportacao() {
    if (
      !arquivo ||
      !preview ||
      preview.total_validas <= 0
    ) {
      return;
    }

    setConfirmOpen(false);
    setErrorMessage(null);

    try {
      setViewState('processing');

      const response =
        await processarImportacaoMaoObra(
          arquivo,
        );

      setResultado(response);
      setViewState('success');

    } catch (error) {
      setErrorMessage(
        getImportacaoMaoObraErrorMessage(
          error,
        ),
      );

      /*
       * Volta ao preview para permitir ao usuário
       * revisar e tentar novamente.
       */
      setViewState('preview');
    }
  }


  const previewRows =
    preview?.linhas ?? [];

  const successRows =
    resultado?.resultados ?? [];


  return (
    <>
      <Card
        component="section"
        sx={{
          position: 'relative',

          overflow: 'hidden',

          border: `1px solid ${BORDER}`,
          borderRadius: {
            xs: 4,
            md: 5,
          },

          backgroundColor: '#ffffff',

          boxShadow:
            '0 5px 16px rgba(15, 23, 42, 0.055), ' +
            '0 24px 54px rgba(15, 23, 42, 0.075)',

          animation:
            `${fadeUp} 720ms cubic-bezier(0.22, 1, 0.36, 1) both`,

          isolation: 'isolate',
        }}
      >
        {/* BLOB AZUL */}
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',

            width: 330,
            height: 330,

            right: -150,
            top: -175,

            zIndex: -1,

            borderRadius: '50%',

            background:
              'radial-gradient(' +
              'circle, ' +
              'rgba(14, 165, 233, 0.16) 0%, ' +
              'rgba(37, 99, 235, 0.06) 48%, ' +
              'transparent 72%' +
              ')',

            filter: 'blur(2px)',

            animation:
              `${blobFloat} 8s ease-in-out infinite`,
          }}
        />

        {/* BLOB LARANJA */}
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',

            width: 210,
            height: 210,

            left: -105,
            bottom: -120,

            zIndex: -1,

            borderRadius: '50%',

            background:
              'radial-gradient(' +
              'circle, ' +
              'rgba(249, 115, 22, 0.105) 0%, ' +
              'transparent 70%' +
              ')',

            animation:
              `${blobFloat} 9.5s ease-in-out infinite reverse`,
          }}
        />

        {/* CABEÇALHO */}
        <Box
          sx={{
            position: 'relative',

            px: {
              xs: 2.4,
              md: 3.5,
            },

            pt: {
              xs: 2.6,
              md: 3.2,
            },

            pb: {
              xs: 2.2,
              md: 2.6,
            },

            background:
              'linear-gradient(' +
              '135deg, ' +
              'rgba(15, 23, 42, 0.985) 0%, ' +
              'rgba(30, 41, 59, 0.97) 58%, ' +
              'rgba(15, 23, 42, 0.98) 100%' +
              ')',

            color: '#ffffff',
          }}
        >
          <Box
            aria-hidden="true"
            sx={{
              position: 'absolute',
              inset: 0,

              background:
                'radial-gradient(' +
                'circle at 88% 12%, ' +
                'rgba(14, 165, 233, 0.20), ' +
                'transparent 28%' +
                ')',

              pointerEvents: 'none',
            }}
          />

          <Box
            sx={{
              position: 'relative',
              zIndex: 1,

              display: 'flex',
              alignItems: {
                xs: 'flex-start',
                sm: 'center',
              },
              justifyContent: 'space-between',

              flexDirection: {
                xs: 'column',
                sm: 'row',
              },

              gap: 2.2,
            }}
          >
            <Box>
              <Typography
                component="h2"
                sx={{
                  mt: 0,

                  fontSize: {
                    xs: '1.42rem',
                    md: '1.78rem',
                  },

                  lineHeight: 1.06,
                  fontWeight: 950,
                  letterSpacing: '-0.045em',
                }}
              >
                Importação de mão de obra
              </Typography>

              <Typography
                sx={{
                  mt: 0.8,

                  maxWidth: 720,

                  color:
                    'rgba(226, 232, 240, 0.78)',

                  fontSize: {
                    xs: '0.82rem',
                    md: '0.9rem',
                  },

                  lineHeight: 1.55,
                  fontWeight: 550,
                }}
              >
                Transforme o fechamento da planilha
                em lançamentos no Sankhya com
                validação antes de qualquer inclusão.
              </Typography>
            </Box>

            <Chip
              icon={
                <Box
                  component="img"
                  src={logoExcel}
                  alt=""
                />
              }
              label="XLSX • aba OBRAS"
              sx={{
                flexShrink: 0,

                /*
                 * Reserva espaço para o botão X do modal,
                 * que fica posicionado no canto superior direito
                 * pelo componente pai.
                 */
                mr: {
                  xs: 0,
                  sm: 5.5,
                },

                height: 36,

                color: '#dbeafe',

                border:
                  '1px solid rgba(125, 211, 252, 0.22)',

                backgroundColor:
                  'rgba(14, 165, 233, 0.10)',

                fontSize: '0.72rem',
                fontWeight: 850,

                '& .MuiChip-icon': {
                  width: 60,
                  height: 60,

                  ml: '10px',
                  mr: '-2px',

                  objectFit: 'contain',
                },

                '& .MuiChip-label': {
                  px: 1.25,
                },
              }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            p: {
              xs: 2.2,
              md: 3.2,
            },
          }}
        >
          {errorMessage ? (
            <Alert
              severity="error"
              onClose={() => {
                setErrorMessage(null);
              }}
              sx={{
                mb: 2.2,

                borderRadius: 3,

                border:
                  '1px solid rgba(220, 38, 38, 0.12)',

                '& .MuiAlert-message': {
                  fontWeight: 650,
                },
              }}
            >
              {errorMessage}
            </Alert>
          ) : null}


          {/* ESTADO INICIAL */}
          {viewState === 'empty' ? (
            <Box
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => {
                inputRef.current?.click();
              }}
              role="button"
              tabIndex={0}
              sx={{
                position: 'relative',

                minHeight: {
                  xs: 290,
                  md: 330,
                },

                display: 'grid',
                placeItems: 'center',

                overflow: 'hidden',

                px: 2.5,
                py: 4,

                cursor: 'pointer',

                borderRadius: 4,

                border:
                  dragging
                    ? `2px solid ${BLUE}`
                    : (
                      '1.5px dashed ' +
                      alpha(BLUE, 0.34)
                    ),

                background:
                  dragging
                    ? (
                      'linear-gradient(' +
                      '145deg, ' +
                      'rgba(14, 165, 233, 0.105), ' +
                      'rgba(37, 99, 235, 0.045)' +
                      ')'
                    )
                    : (
                      'linear-gradient(' +
                      '145deg, ' +
                      'rgba(248, 250, 252, 0.98), ' +
                      'rgba(239, 246, 255, 0.74)' +
                      ')'
                    ),

                boxShadow:
                  dragging
                    ? (
                      '0 20px 55px ' +
                      'rgba(14, 165, 233, 0.12)'
                    )
                    : 'none',

                transform:
                  dragging
                    ? 'scale(1.008)'
                    : 'scale(1)',

                transition:
                  'border-color 220ms ease, ' +
                  'background 220ms ease, ' +
                  'box-shadow 220ms ease, ' +
                  'transform 220ms ease',

                '&:hover': {
                  borderColor:
                    alpha(BLUE, 0.72),

                  background:
                    'linear-gradient(' +
                    '145deg, ' +
                    'rgba(248, 250, 252, 1), ' +
                    'rgba(224, 242, 254, 0.68)' +
                    ')',

                  boxShadow:
                    '0 20px 50px ' +
                    'rgba(15, 23, 42, 0.07)',
                },

                '&::after': {
                  content: '""',

                  position: 'absolute',

                  width: '30%',
                  height: '170%',

                  top: '-35%',
                  left: '-45%',

                  opacity: 0.5,

                  background:
                    'linear-gradient(' +
                    '90deg, ' +
                    'transparent, ' +
                    'rgba(255,255,255,0.75), ' +
                    'transparent' +
                    ')',

                  pointerEvents: 'none',

                  animation:
                    `${shimmer} 6.8s ease-in-out infinite`,
                },
              }}
            >
              <Stack
                spacing={1.7}
                sx={{
                  position: 'relative',
                  zIndex: 1,

                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <Box
                  sx={{
                    position: 'relative',

                    width: 82,
                    height: 82,

                    display: 'grid',
                    placeItems: 'center',

                    borderRadius: '50%',

                    color: '#ffffff',

                    background:
                      'linear-gradient(' +
                      '135deg, ' +
                      `${BLUE_DEEP} 0%, ` +
                      `${BLUE} 58%, ` +
                      `${BLUE_LIGHT} 100%` +
                      ')',

                    boxShadow:
                      '0 18px 40px ' +
                      'rgba(14, 165, 233, 0.28)',

                    animation:
                      `${floatIcon} 3.6s ease-in-out infinite`,

                    '&::before': {
                      content: '""',

                      position: 'absolute',
                      inset: -10,

                      borderRadius: '50%',

                      border:
                        '2px solid ' +
                        alpha(BLUE, 0.22),

                      animation:
                        `${pulseRing} 2.4s ease-out infinite`,
                    },
                  }}
                >
                  <CloudUploadRoundedIcon
                    sx={{
                      fontSize: 39,
                    }}
                  />
                </Box>

                <Box>
                  <Typography
                    sx={{
                      color: NAVY,

                      fontSize: {
                        xs: '1.04rem',
                        md: '1.16rem',
                      },

                      fontWeight: 900,
                      letterSpacing: '-0.025em',
                    }}
                  >
                    Arraste sua planilha aqui
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.45,

                      color: MUTED,

                      fontSize: '0.82rem',
                      fontWeight: 550,
                    }}
                  >
                    ou clique para selecionar o arquivo
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  startIcon={
                    <DescriptionRoundedIcon />
                  }
                  onClick={(event) => {
                    event.stopPropagation();
                    inputRef.current?.click();
                  }}
                  sx={{
                    mt: '4px !important',

                    px: 2.5,
                    py: 1.05,

                    borderRadius: 999,

                    color: '#ffffff',

                    background:
                      'linear-gradient(' +
                      '90deg, ' +
                      `${BLUE_DEEP}, ` +
                      `${BLUE}, ` +
                      `${BLUE_LIGHT}` +
                      ')',

                    boxShadow:
                      '0 12px 26px ' +
                      'rgba(14, 165, 233, 0.22)',

                    fontSize: '0.79rem',
                    fontWeight: 900,
                    textTransform: 'none',

                    transition:
                      'transform 180ms ease, ' +
                      'box-shadow 180ms ease',

                    '&:hover': {
                      transform:
                        'translateY(-2px)',

                      boxShadow:
                        '0 16px 32px ' +
                        'rgba(14, 165, 233, 0.30)',
                    },
                  }}
                >
                  Selecionar arquivo
                </Button>

                <Typography
                  variant="caption"
                  sx={{
                    color: '#94a3b8',

                    fontSize: '0.68rem',
                    fontWeight: 650,
                  }}
                >
                  Somente XLSX • leitura da aba OBRAS
                </Typography>
              </Stack>
            </Box>
          ) : null}


          {/* LENDO PREVIEW */}
          {viewState === 'previewing' ? (
            <Box
              sx={{
                minHeight: 310,

                display: 'grid',
                placeItems: 'center',

                borderRadius: 4,

                border:
                  `1px solid ${BORDER}`,

                background:
                  'linear-gradient(' +
                  '145deg, ' +
                  '#ffffff, ' +
                  'rgba(239, 246, 255, 0.82)' +
                  ')',
              }}
            >
              <Stack
                spacing={2}
                sx={{
                  px: 3,
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    width: 76,
                    height: 76,

                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <CircularProgress
                    size={76}
                    thickness={2.6}
                    sx={{
                      color: BLUE,
                    }}
                  />

                  <DescriptionRoundedIcon
                    sx={{
                      position: 'absolute',
                      color: NAVY,
                      fontSize: 29,
                    }}
                  />
                </Box>

                <Box>
                  <Typography
                    sx={{
                      color: NAVY,
                      fontSize: '1.05rem',
                      fontWeight: 900,
                    }}
                  >
                    Lendo a aba OBRAS...
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.45,
                      color: MUTED,
                      fontSize: '0.78rem',
                    }}
                  >
                    Validando projetos e valores antes
                    de liberar a importação.
                  </Typography>
                </Box>

                <LinearProgress
                  sx={{
                    width: {
                      xs: 220,
                      sm: 320,
                    },

                    height: 5,
                    borderRadius: 999,

                    backgroundColor:
                      alpha(BLUE, 0.09),

                    '& .MuiLinearProgress-bar': {
                      borderRadius: 999,

                      background:
                        'linear-gradient(' +
                        '90deg, ' +
                        `${BLUE_DEEP}, ` +
                        `${BLUE_LIGHT}` +
                        ')',
                    },
                  }}
                />
              </Stack>
            </Box>
          ) : null}


          {/* PREVIEW */}
          {(
            viewState === 'preview' ||
            viewState === 'processing'
          ) &&
          preview &&
          arquivo ? (
            <Box
              sx={{
                animation:
                  `${fadeUp} 520ms cubic-bezier(0.22, 1, 0.36, 1) both`,
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

                  p: 2.2,

                  borderRadius: 3.5,

                  border:
                    `1px solid ${BORDER}`,

                  background:
                    'linear-gradient(' +
                    '135deg, ' +
                    'rgba(248, 250, 252, 0.98), ' +
                    'rgba(239, 246, 255, 0.82)' +
                    ')',
                }}
              >
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{
                    minWidth: 0,
                    alignItems: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,

                      flexShrink: 0,

                      display: 'grid',
                      placeItems: 'center',

                      borderRadius: 2.5,

                      color: BLUE_DEEP,

                      backgroundColor:
                        alpha(BLUE, 0.09),

                      border:
                        '1px solid ' +
                        alpha(BLUE, 0.12),
                    }}
                  >
                    <DescriptionRoundedIcon />
                  </Box>

                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        color: NAVY,

                        fontSize: '0.84rem',
                        fontWeight: 900,

                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {arquivo.name}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={0.8}
                      sx={{
                        mt: 0.7,
                        flexWrap: 'wrap',
                        rowGap: 0.6,
                      }}
                    >
                      <Chip
                        size="small"
                        label={
                          `Aba ${preview.aba ?? '—'}`
                        }
                        sx={{
                          height: 24,

                          color: '#0369a1',
                          backgroundColor:
                            'rgba(14, 165, 233, 0.09)',

                          fontSize: '0.65rem',
                          fontWeight: 850,
                        }}
                      />

                      <Chip
                        size="small"
                        label={
                          formatFileSize(
                            arquivo.size,
                          )
                        }
                        sx={{
                          height: 24,

                          color: MUTED,
                          backgroundColor:
                            'rgba(148, 163, 184, 0.10)',

                          fontSize: '0.65rem',
                          fontWeight: 750,
                        }}
                      />
                    </Stack>
                  </Box>
                </Stack>

                <Button
                  variant="outlined"
                  startIcon={
                    <ReplayRoundedIcon />
                  }
                  disabled={
                    viewState === 'processing'
                  }
                  onClick={() => {
                    inputRef.current?.click();
                  }}
                  sx={{
                    flexShrink: 0,

                    borderRadius: 999,

                    borderColor:
                      alpha(NAVY, 0.15),

                    color: NAVY,

                    fontSize: '0.74rem',
                    fontWeight: 850,
                    textTransform: 'none',
                  }}
                >
                  Trocar arquivo
                </Button>
              </Box>


              <Box
                sx={{
                  mt: 2,

                  display: 'grid',
                  gap: 1.3,

                  gridTemplateColumns: {
                    xs: '1fr',
                    sm:
                      'repeat(3, minmax(0, 1fr))',
                  },
                }}
              >
                <SummaryMetric
                  label="Projetos encontrados"
                  value={String(
                    preview.total_validas,
                  )}
                  helper={
                    `${preview.total_linhas} linha(s) ` +
                    'importável(is)'
                  }
                  accent={BLUE_DEEP}
                />

                <SummaryMetric
                  label="Valor total"
                  value={formatCurrency(
                    preview.valor_total_valido,
                  )}
                  helper="Valor acumulado pago"
                  accent={SUCCESS}
                />

                <SummaryMetric
                  label="Validação"
                  value={
                    preview.total_invalidas === 0
                      ? 'Pronto'
                      : (
                        `${preview.total_invalidas} ` +
                        'pendência(s)'
                      )
                  }
                  helper={
                    preview.total_invalidas === 0
                      ? 'Nenhum bloqueio encontrado'
                      : (
                        'Revise antes de processar'
                      )
                  }
                  accent={
                    preview.total_invalidas === 0
                      ? SUCCESS
                      : ORANGE
                  }
                />
              </Box>


              <TableContainer
                sx={{
                  mt: 2,

                  overflow: 'hidden',

                  borderRadius: 3.5,

                  border:
                    `1px solid ${BORDER}`,

                  backgroundColor: '#ffffff',
                }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow
                      sx={{
                        backgroundColor:
                          '#f8fafc',
                      }}
                    >
                      <TableCell
                        sx={{
                          color: MUTED,
                          fontSize: '0.68rem',
                          fontWeight: 900,
                          letterSpacing:
                            '0.04em',
                          textTransform:
                            'uppercase',
                        }}
                      >
                        Linha
                      </TableCell>

                      <TableCell
                        sx={{
                          color: MUTED,
                          fontSize: '0.68rem',
                          fontWeight: 900,
                          letterSpacing:
                            '0.04em',
                          textTransform:
                            'uppercase',
                        }}
                      >
                        Projeto
                      </TableCell>

                      <TableCell
                        align="right"
                        sx={{
                          color: MUTED,
                          fontSize: '0.68rem',
                          fontWeight: 900,
                          letterSpacing:
                            '0.04em',
                          textTransform:
                            'uppercase',
                        }}
                      >
                        Valor
                      </TableCell>

                      <TableCell
                        align="center"
                        sx={{
                          color: MUTED,
                          fontSize: '0.68rem',
                          fontWeight: 900,
                          letterSpacing:
                            '0.04em',
                          textTransform:
                            'uppercase',
                        }}
                      >
                        Status
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {previewRows.map(
                      (row) => (
                        <TableRow
                          key={row.linha}
                          sx={{
                            '&:last-child td': {
                              borderBottom:
                                'none',
                            },

                            '&:hover': {
                              backgroundColor:
                                'rgba(14, 165, 233, 0.025)',
                            },
                          }}
                        >
                          <TableCell
                            sx={{
                              color: MUTED,
                              fontSize: '0.78rem',
                              fontWeight: 700,
                            }}
                          >
                            {row.linha}
                          </TableCell>

                          <TableCell>
                            <Typography
                              component="span"
                              sx={{
                                color: NAVY,
                                fontSize:
                                  '0.82rem',
                                fontWeight: 900,
                              }}
                            >
                              {row.codproj ?? '—'}
                            </Typography>
                          </TableCell>

                          <TableCell
                            align="right"
                          >
                            <Typography
                              component="span"
                              sx={{
                                color: NAVY,
                                fontSize:
                                  '0.82rem',
                                fontWeight: 900,
                              }}
                            >
                              {formatCurrency(
                                row.valor_acumulado ??
                                  0,
                              )}
                            </Typography>
                          </TableCell>

                          <TableCell
                            align="center"
                          >
                            <Chip
                              size="small"
                              icon={
                                row.valida
                                  ? (
                                    <CheckCircleRoundedIcon />
                                  )
                                  : (
                                    <WarningAmberRoundedIcon />
                                  )
                              }
                              label={
                                row.valida
                                  ? 'Validado'
                                  : 'Revisar'
                              }
                              sx={{
                                height: 26,

                                color:
                                  row.valida
                                    ? '#15803d'
                                    : '#c2410c',

                                backgroundColor:
                                  row.valida
                                    ? (
                                      'rgba(22, 163, 74, 0.08)'
                                    )
                                    : (
                                      'rgba(249, 115, 22, 0.09)'
                                    ),

                                fontSize:
                                  '0.64rem',
                                fontWeight: 850,

                                '& .MuiChip-icon': {
                                  color: 'inherit',
                                },
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              </TableContainer>


              {viewState === 'processing' ? (
                <Box
                  sx={{
                    mt: 2.2,

                    p: 2.2,

                    borderRadius: 3.5,

                    border:
                      '1px solid ' +
                      alpha(BLUE, 0.15),

                    background:
                      'linear-gradient(' +
                      '135deg, ' +
                      'rgba(14, 165, 233, 0.07), ' +
                      'rgba(37, 99, 235, 0.035)' +
                      ')',
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{ alignItems: 'center' }}
                  >
                    <CircularProgress
                      size={30}
                      thickness={4}
                      sx={{
                        color: BLUE,
                      }}
                    />

                    <Box>
                      <Typography
                        sx={{
                          color: NAVY,
                          fontSize: '0.86rem',
                          fontWeight: 900,
                        }}
                      >
                        Criando os pedidos no
                        Sankhya...
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.25,
                          color: MUTED,
                          fontSize: '0.72rem',
                        }}
                      >
                        Aguarde a resposta do
                        processamento. Não feche esta
                        página.
                      </Typography>
                    </Box>
                  </Stack>

                  <LinearProgress
                    sx={{
                      mt: 1.7,

                      height: 5,
                      borderRadius: 999,

                      backgroundColor:
                        alpha(BLUE, 0.08),

                      '& .MuiLinearProgress-bar': {
                        borderRadius: 999,

                        background:
                          'linear-gradient(' +
                          '90deg, ' +
                          `${BLUE_DEEP}, ` +
                          `${BLUE_LIGHT}` +
                          ')',
                      },
                    }}
                  />
                </Box>
              ) : (
                <Box
                  sx={{
                    mt: 2.3,

                    display: 'flex',

                    alignItems: {
                      xs: 'stretch',
                      sm: 'center',
                    },

                    justifyContent:
                      'space-between',

                    flexDirection: {
                      xs: 'column',
                      sm: 'row',
                    },

                    gap: 1.4,
                  }}
                >
                  <Button
                    variant="text"
                    startIcon={
                      <ReplayRoundedIcon />
                    }
                    onClick={resetarImportacao}
                    sx={{
                      alignSelf: {
                        xs: 'flex-start',
                        sm: 'auto',
                      },

                      color: MUTED,

                      fontSize: '0.76rem',
                      fontWeight: 800,
                      textTransform: 'none',
                    }}
                  >
                    Limpar seleção
                  </Button>

                  <Button
                    variant="contained"
                    endIcon={
                      <ArrowForwardRoundedIcon />
                    }
                    disabled={
                      preview.total_validas <= 0
                    }
                    onClick={() => {
                      setConfirmOpen(true);
                    }}
                    sx={{
                      minWidth: {
                        sm: 220,
                      },

                      px: 2.6,
                      py: 1.15,

                      borderRadius: 999,

                      color: '#ffffff',

                      background:
                        'linear-gradient(' +
                        '90deg, ' +
                        `${NAVY} 0%, ` +
                        `${NAVY_SOFT} 48%, ` +
                        '#123b62 100%' +
                        ')',

                      boxShadow:
                        '0 14px 30px ' +
                        'rgba(15, 23, 42, 0.18)',

                      fontSize: '0.79rem',
                      fontWeight: 900,
                      textTransform: 'none',

                      transition:
                        'transform 180ms ease, ' +
                        'box-shadow 180ms ease',

                      '&:hover': {
                        transform:
                          'translateY(-2px)',

                        boxShadow:
                          '0 18px 36px ' +
                          'rgba(15, 23, 42, 0.24)',
                      },
                    }}
                  >
                    Importar para Sankhya
                  </Button>
                </Box>
              )}
            </Box>
          ) : null}


          {/* SUCESSO */}
          {viewState === 'success' &&
          resultado ? (
            <Box
              sx={{
                textAlign: 'center',

                animation:
                  `${fadeUp} 560ms cubic-bezier(0.22, 1, 0.36, 1) both`,
              }}
            >
              <Box
                sx={{
                  position: 'relative',

                  width: 94,
                  height: 94,

                  mx: 'auto',

                  display: 'grid',
                  placeItems: 'center',

                  borderRadius: '50%',

                  color: '#ffffff',

                  background:
                    'linear-gradient(' +
                    '135deg, ' +
                    '#16a34a, ' +
                    '#22c55e, ' +
                    '#4ade80' +
                    ')',

                  boxShadow:
                    '0 22px 46px ' +
                    'rgba(34, 197, 94, 0.26)',

                  animation:
                    `${successPop} 680ms cubic-bezier(0.22, 1, 0.36, 1) both`,

                  '&::before': {
                    content: '""',

                    position: 'absolute',
                    inset: -11,

                    borderRadius: '50%',

                    border:
                      '2px solid ' +
                      'rgba(34, 197, 94, 0.20)',

                    animation:
                      `${pulseRing} 2.5s ease-out infinite`,
                  },
                }}
              >
                <CheckCircleRoundedIcon
                  sx={{
                    fontSize: 52,
                  }}
                />
              </Box>

              <Typography
                sx={{
                  mt: 2,

                  color: NAVY,

                  fontSize: {
                    xs: '1.28rem',
                    md: '1.55rem',
                  },

                  fontWeight: 950,
                  letterSpacing: '-0.04em',
                }}
              >
                Importação concluída
              </Typography>

              <Typography
                sx={{
                  mt: 0.6,

                  color: MUTED,

                  fontSize: '0.82rem',
                  fontWeight: 550,
                }}
              >
                Os lançamentos válidos foram enviados
                ao Sankhya.
              </Typography>


              <Box
                sx={{
                  mt: 2.4,

                  display: 'grid',
                  gap: 1.3,

                  gridTemplateColumns: {
                    xs: '1fr',
                    sm:
                      'repeat(3, minmax(0, 1fr))',
                  },

                  textAlign: 'left',
                }}
              >
                <SummaryMetric
                  label="Pedidos criados"
                  value={String(
                    resultado.total_sucesso,
                  )}
                  helper={
                    `${resultado.total_processadas} ` +
                    'processado(s)'
                  }
                  accent={SUCCESS}
                />

                <SummaryMetric
                  label="Valor processado"
                  value={formatCurrency(
                    resultado.valor_total_processado,
                  )}
                  helper="Total enviado ao Sankhya"
                  accent={BLUE_DEEP}
                />

                <SummaryMetric
                  label="Erros"
                  value={String(
                    resultado.total_erros,
                  )}
                  helper={
                    resultado.total_erros === 0
                      ? 'Processamento limpo'
                      : 'Confira a tabela abaixo'
                  }
                  accent={
                    resultado.total_erros === 0
                      ? SUCCESS
                      : ORANGE
                  }
                />
              </Box>


              <TableContainer
                sx={{
                  mt: 2,

                  overflow: 'hidden',

                  borderRadius: 3.5,

                  border:
                    `1px solid ${BORDER}`,

                  backgroundColor: '#ffffff',

                  textAlign: 'left',
                }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow
                      sx={{
                        backgroundColor:
                          '#f8fafc',
                      }}
                    >
                      <TableCell>
                        Linha
                      </TableCell>

                      <TableCell>
                        Projeto
                      </TableCell>

                      <TableCell
                        align="right"
                      >
                        Valor
                      </TableCell>

                      <TableCell>
                        Pedido
                      </TableCell>

                      <TableCell
                        align="center"
                      >
                        Status
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {successRows.map(
                      (row) => (
                        <TableRow
                          key={[
                            row.linha,
                            row.codproj,
                            row.codigo_pedido,
                          ].join('-')}
                          sx={{
                            '&:last-child td': {
                              borderBottom:
                                'none',
                            },
                          }}
                        >
                          <TableCell
                            sx={{
                              color: MUTED,
                              fontSize: '0.78rem',
                              fontWeight: 700,
                            }}
                          >
                            {row.linha}
                          </TableCell>

                          <TableCell
                            sx={{
                              color: NAVY,
                              fontSize: '0.8rem',
                              fontWeight: 900,
                            }}
                          >
                            {row.codproj ?? '—'}
                          </TableCell>

                          <TableCell
                            align="right"
                            sx={{
                              color: NAVY,
                              fontSize: '0.8rem',
                              fontWeight: 900,
                            }}
                          >
                            {formatCurrency(
                              row.valor_acumulado ??
                                0,
                            )}
                          </TableCell>

                          <TableCell
                            sx={{
                              color:
                                row.sucesso
                                  ? BLUE_DEEP
                                  : MUTED,

                              fontSize: '0.8rem',
                              fontWeight: 900,
                            }}
                          >
                            {row.codigo_pedido ??
                              '—'}
                          </TableCell>

                          <TableCell
                            align="center"
                          >
                            <Chip
                              size="small"
                              icon={
                                row.sucesso
                                  ? (
                                    <CheckCircleRoundedIcon />
                                  )
                                  : (
                                    <WarningAmberRoundedIcon />
                                  )
                              }
                              label={
                                row.sucesso
                                  ? 'Criado'
                                  : 'Erro'
                              }
                              sx={{
                                height: 26,

                                color:
                                  row.sucesso
                                    ? '#15803d'
                                    : '#c2410c',

                                backgroundColor:
                                  row.sucesso
                                    ? (
                                      'rgba(22, 163, 74, 0.08)'
                                    )
                                    : (
                                      'rgba(249, 115, 22, 0.09)'
                                    ),

                                fontSize:
                                  '0.64rem',
                                fontWeight: 850,

                                '& .MuiChip-icon': {
                                  color: 'inherit',
                                },
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              </TableContainer>


              <Button
                variant="contained"
                startIcon={
                  <ReplayRoundedIcon />
                }
                onClick={resetarImportacao}
                sx={{
                  mt: 2.5,

                  px: 2.7,
                  py: 1.1,

                  borderRadius: 999,

                  color: '#ffffff',

                  background:
                    'linear-gradient(' +
                    '90deg, ' +
                    `${BLUE_DEEP}, ` +
                    `${BLUE}, ` +
                    `${BLUE_LIGHT}` +
                    ')',

                  boxShadow:
                    '0 12px 28px ' +
                    'rgba(14, 165, 233, 0.22)',

                  fontSize: '0.78rem',
                  fontWeight: 900,
                  textTransform: 'none',
                }}
              >
                Importar outra planilha
              </Button>
            </Box>
          ) : null}


          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            hidden
            onChange={handleInputChange}
          />
        </Box>
      </Card>


      {/* CONFIRMAÇÃO */}
      <Dialog
        open={confirmOpen}
        onClose={() => {
          if (!isBusy) {
            setConfirmOpen(false);
          }
        }}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              overflow: 'hidden',

              borderRadius: 4,

              border:
                `1px solid ${BORDER}`,

              boxShadow:
                '0 30px 90px rgba(15, 23, 42, 0.22)',
            },
          },
        }}
      >
        <Box
          sx={{
            height: 5,

            background:
              'linear-gradient(' +
              '90deg, ' +
              `${BLUE_DEEP}, ` +
              `${BLUE_LIGHT}, ` +
              `${ORANGE}` +
              ')',
          }}
        />

        <DialogTitle
          sx={{
            pb: 1,

            color: NAVY,

            fontSize: '1.08rem',
            fontWeight: 950,
            letterSpacing: '-0.025em',
          }}
        >
          Confirmar importação
        </DialogTitle>

        <DialogContent>
          <Typography
            sx={{
              color: MUTED,

              fontSize: '0.82rem',
              lineHeight: 1.6,
            }}
          >
            Esta ação criará documentos reais no
            Sankhya.
          </Typography>

          <Box
            sx={{
              mt: 1.8,

              p: 2,

              borderRadius: 3,

              border:
                `1px solid ${BORDER}`,

              backgroundColor: '#f8fafc',
            }}
          >
            <Stack spacing={1.2}>
              <Stack
                direction="row"
                sx={{
                  justifyContent: 'space-between',
                  gap: 2,
                }}
              >
                <Typography
                  sx={{
                    color: MUTED,
                    fontSize: '0.76rem',
                    fontWeight: 700,
                  }}
                >
                  Pedidos
                </Typography>

                <Typography
                  sx={{
                    color: NAVY,
                    fontSize: '0.8rem',
                    fontWeight: 950,
                  }}
                >
                  {preview?.total_validas ?? 0}
                </Typography>
              </Stack>

              <Divider />

              <Stack
                direction="row"
                sx={{
                  justifyContent: 'space-between',
                  gap: 2,
                }}
              >
                <Typography
                  sx={{
                    color: MUTED,
                    fontSize: '0.76rem',
                    fontWeight: 700,
                  }}
                >
                  Valor total
                </Typography>

                <Typography
                  sx={{
                    color: SUCCESS,
                    fontSize: '0.85rem',
                    fontWeight: 950,
                  }}
                >
                  {formatCurrency(
                    preview
                      ?.valor_total_valido ?? 0,
                  )}
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2.5,
            gap: 1,
          }}
        >
          <Button
            onClick={() => {
              setConfirmOpen(false);
            }}
            sx={{
              color: MUTED,
              fontSize: '0.76rem',
              fontWeight: 800,
              textTransform: 'none',
            }}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            endIcon={
              <ArrowForwardRoundedIcon />
            }
            onClick={() => {
              void processarImportacao();
            }}
            sx={{
              px: 2.1,

              borderRadius: 999,

              color: '#ffffff',

              background:
                'linear-gradient(' +
                '90deg, ' +
                `${NAVY}, ` +
                `${NAVY_SOFT}` +
                ')',

              fontSize: '0.76rem',
              fontWeight: 900,
              textTransform: 'none',
            }}
          >
            Confirmar e importar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}