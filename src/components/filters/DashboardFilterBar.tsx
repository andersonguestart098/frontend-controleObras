import {
  useEffect,
  useState,
} from 'react';

import type {
  FormEvent,
} from 'react';

import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material';

import type {
  DashboardFilters,
} from '@/types/dashboard';

interface DashboardFilterBarProps {
  initialFilters: DashboardFilters;
  loading?: boolean;

  onApply: (
    filters: DashboardFilters,
  ) => void;
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

  '& input[type="number"]': {
    MozAppearance: 'textfield',
  },

  '& input[type="number"]::-webkit-outer-spin-button': {
    WebkitAppearance: 'none',
    margin: 0,
  },

  '& input[type="number"]::-webkit-inner-spin-button': {
    WebkitAppearance: 'none',
    margin: 0,
  },
};

export function DashboardFilterBar({
  initialFilters,
  loading = false,
  onApply,
}: DashboardFilterBarProps) {
  const [draft, setDraft] =
    useState<DashboardFilters>(
      initialFilters,
    );

  useEffect(() => {
    setDraft(initialFilters);
  }, [initialFilters]);

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    onApply({
      codproj: Number(draft.codproj),

      dtneg_inicial:
        draft.dtneg_inicial || null,

      dtneg_final:
        draft.dtneg_final || null,

      nunota: draft.nunota,
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
          <TextField
            type="number"
            label="Código do projeto"
            value={draft.codproj}
            onChange={(event) => {
              setDraft((current) => ({
                ...current,

                codproj: Number(
                  event.target.value,
                ),
              }));
            }}
            required
            sx={{
              ...inputSx,

              width: {
                xs: '100%',
                sm: 230,
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

              display: {
                xs: 'none',
                lg: 'block',
              },

              maxWidth: 260,
              pr: 1,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                display: 'block',

                color: '#64748b',

                fontWeight: 600,
                lineHeight: 1.5,
              }}
            >
              Selecione o projeto e, opcionalmente,
              defina um período para atualizar os
              indicadores.
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}