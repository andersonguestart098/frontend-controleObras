import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import type {
  FormEvent,
} from 'react';

import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';

import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material';

import { QuickActionsMenu } from '@/components/layout/QuickActionsMenu';
import type {
  DashboardFilters,
  ProjetoFiltro,
} from '@/types/dashboard';


interface DashboardFilterBarProps {
  initialFilters: DashboardFilters;

  projetos: ProjetoFiltro[];

  loading?: boolean;
  loadingProjetos?: boolean;

  onApply: (
    filters: DashboardFilters,
  ) => void;

  onLogout: () => void;
}


const inputSx = {
  '& .MuiInputLabel-root': {
    color: '#64748b',
    fontWeight: 600,
  },

  '& .MuiInputLabel-root.Mui-focused': {
    color: '#0f172a',
  },

  '& .MuiOutlinedInput-root': {
    height: 58,

    borderRadius: 2.5,

    backgroundColor: '#ffffff',

    transition:
      'box-shadow 160ms ease, background-color 160ms ease',

    '& fieldset': {
      borderColor:
        'rgba(148, 163, 184, 0.34)',
    },

    '&:hover fieldset': {
      borderColor:
        'rgba(100, 116, 139, 0.55)',
    },

    '&.Mui-focused': {
      boxShadow:
        '0 0 0 4px rgba(14, 165, 233, 0.10)',
    },

    '&.Mui-focused fieldset': {
      borderColor: '#0ea5e9',
      borderWidth: 1,
    },
  },

  '& input': {
    color: '#0f172a',
    fontWeight: 600,
  },
};


function normalizarPesquisa(
  valor: string | number | null | undefined,
): string {
  return String(valor ?? '')
    .trim()
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '');
}


export function DashboardFilterBar({
  initialFilters,
  projetos,
  loading = false,
  loadingProjetos = false,
  onApply,
  onLogout,
}: DashboardFilterBarProps) {
  const [draft, setDraft] =
    useState<DashboardFilters>(
      initialFilters,
    );

  useEffect(() => {
    setDraft(initialFilters);
  }, [initialFilters]);

  const projetoSelecionado = useMemo(
    () => {
      return (
        projetos.find(
          (projeto) =>
            Number(projeto.codproj) ===
            Number(draft.codproj),
        ) ?? null
      );
    },
    [
      projetos,
      draft.codproj,
    ],
  );

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!draft.codproj) {
      return;
    }

    onApply({
      codproj: Number(draft.codproj),

      dtneg_inicial:
        draft.dtneg_inicial || null,

      dtneg_final:
        draft.dtneg_final || null,
    });
  }

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

        overflow: 'visible',
      }}
    >
      <CardContent
        sx={{
          p: {
            xs: 2,
            md: 2.5,
          },

          '&:last-child': {
            pb: {
              xs: 2,
              md: 2.5,
            },
          },
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            alignItems: 'center',

            gap: 2,

            flexWrap: 'wrap',
          }}
        >
          <Autocomplete
            openOnFocus
            autoHighlight
            clearOnEscape

            options={projetos}

            value={projetoSelecionado}

            loading={loadingProjetos}

            loadingText="Carregando projetos..."
            noOptionsText="Nenhum projeto encontrado"

            isOptionEqualToValue={(
              option,
              value,
            ) =>
              Number(option.codproj) ===
              Number(value.codproj)
            }

            getOptionLabel={(option) =>
              option.label_projeto ||
              `${option.codproj} - ${option.nome_projeto}`
            }

            onChange={(
              _event,
              novoProjeto,
            ) => {
              setDraft((current) => ({
                ...current,

                codproj:
                  novoProjeto?.codproj ?? 0,
              }));
            }}

            filterOptions={(
              options,
              state,
            ) => {
              const pesquisa =
                normalizarPesquisa(
                  state.inputValue,
                );

              if (!pesquisa) {
                return options;
              }

              return options.filter(
                (projeto) => {
                  const codigo =
                    normalizarPesquisa(
                      projeto.codproj,
                    );

                  const identificacao =
                    normalizarPesquisa(
                      projeto.identificacao,
                    );

                  const abreviatura =
                    normalizarPesquisa(
                      projeto.abreviatura,
                    );

                  const nome =
                    normalizarPesquisa(
                      projeto.nome_projeto,
                    );

                  const label =
                    normalizarPesquisa(
                      projeto.label_projeto,
                    );

                  return (
                    codigo.includes(pesquisa) ||
                    identificacao.includes(
                      pesquisa,
                    ) ||
                    abreviatura.includes(
                      pesquisa,
                    ) ||
                    nome.includes(pesquisa) ||
                    label.includes(pesquisa)
                  );
                },
              );
            }}

            renderOption={(
              props,
              option,
            ) => (
              <Box
                component="li"
                {...props}
                key={option.codproj}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems:
                    'flex-start !important',

                  py: 1.25,
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    color: '#0f172a',
                    fontSize: '0.92rem',
                    fontWeight: 800,
                  }}
                >
                  {option.nome_projeto}
                </Typography>

                <Typography
                  component="span"
                  variant="caption"
                  sx={{
                    mt: 0.25,
                    color: '#64748b',
                    fontWeight: 600,
                  }}
                >
                  Código: {option.codproj}

                  {option.abreviatura &&
                  option.abreviatura !==
                    option.nome_projeto
                    ? ` • Abreviação: ${option.abreviatura}`
                    : ''}
                </Typography>
              </Box>
            )}

            renderInput={(params) => (
              <TextField
                {...params}
                required
                label="Projeto"
                placeholder={
                  loadingProjetos
                    ? 'Carregando...'
                    : 'Código, nome ou abreviação'
                }
                slotProps={{
                  ...params.slotProps,

                  input: {
                    ...params.slotProps.input,

                    endAdornment: (
                      <>
                        {loadingProjetos ? (
                          <CircularProgress
                            size={18}
                          />
                        ) : null}

                        {
                          params.slotProps.input
                            .endAdornment
                        }
                      </>
                    ),
                  },
                }}
                sx={inputSx}
              />
            )}

            sx={{
              width: {
                xs: '100%',
                sm: 360,
              },
            }}
          />

          <TextField
            type="date"
            label="Data inicial"
            value={
              draft.dtneg_inicial ?? ''
            }
            onChange={(event) => {
              setDraft((current) => ({
                ...current,

                dtneg_inicial:
                  event.target.value || null,
              }));
            }}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            sx={{
              ...inputSx,

              width: {
                xs: '100%',
                sm: 190,
              },
            }}
          />

          <TextField
            type="date"
            label="Data final"
            value={
              draft.dtneg_final ?? ''
            }
            onChange={(event) => {
              setDraft((current) => ({
                ...current,

                dtneg_final:
                  event.target.value || null,
              }));
            }}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            sx={{
              ...inputSx,

              width: {
                xs: '100%',
                sm: 190,
              },
            }}
          />

          <Button
            type="submit"
            disabled={
              loading ||
              loadingProjetos ||
              !draft.codproj
            }
            startIcon={
              loading ? (
                <CircularProgress
                  size={18}
                  thickness={5}
                  sx={{
                    color: 'inherit',
                  }}
                />
              ) : (
                <RefreshRoundedIcon />
              )
            }
            sx={{
              height: 58,

              px: 3.2,

              borderRadius: 2.5,

              textTransform: 'none',

              color: '#ffffff',

              fontSize: '0.95rem',
              fontWeight: 900,

              background:
                'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',

              boxShadow:
                '0 8px 20px rgba(15, 23, 42, 0.18)',

              transition:
                'transform 120ms ease, box-shadow 160ms ease',

              '& .MuiButton-startIcon svg': {
                transition:
                  'transform 350ms ease',
              },

              '&:hover': {
                background:
                  'linear-gradient(135deg, #1e293b 0%, #334155 100%)',

                transform:
                  'translateY(-1px)',

                boxShadow:
                  '0 12px 25px rgba(15, 23, 42, 0.24)',
              },

              '&:hover .MuiButton-startIcon svg': {
                transform: 'rotate(180deg)',
              },

              '&:active': {
                transform: 'translateY(0)',
              },

              '&.Mui-disabled': {
                color:
                  'rgba(255, 255, 255, 0.65)',

                background:
                  'rgba(15, 23, 42, 0.55)',
              },

              width: {
                xs: '100%',
                sm: 'auto',
              },
            }}
          >
            {loading
              ? 'Atualizando...'
              : 'Atualizar dashboard'}
          </Button>

          <Box
            sx={{
              ml: {
                xs: 0,
                lg: 'auto',
              },

              display: 'flex',
              alignItems: 'center',
            }}
          >
            <QuickActionsMenu onLogout={onLogout} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}