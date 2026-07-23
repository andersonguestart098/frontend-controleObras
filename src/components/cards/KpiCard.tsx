import type { ReactNode } from 'react';

import {
  Box,
  Card,
  CardContent,
  Typography,
} from '@mui/material';

import { RollingCurrency } from '@/components/common/RollingCurrency';

export type KpiCardTone =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

interface KpiCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  subtitle?: string;
  subtitleColor?: string;
  tone?: KpiCardTone;

  /*
   * Atraso do giro em ms.
   * Usado para escalonar um card após o outro.
   */
  rollDelay?: number;
}

const toneStyles: Record<
  KpiCardTone,
  {
    backgroundColor: string;
    iconColor: string;
  }
> = {
  primary: {
    backgroundColor: 'rgba(37, 99, 235, 0.10)',
    iconColor: '#2563eb',
  },
  secondary: {
    backgroundColor: 'rgba(13, 148, 136, 0.10)',
    iconColor: '#0d9488',
  },
  success: {
    backgroundColor: 'rgba(22, 163, 74, 0.10)',
    iconColor: '#16a34a',
  },
  warning: {
    backgroundColor: 'rgba(217, 119, 6, 0.10)',
    iconColor: '#d97706',
  },
  error: {
    backgroundColor: 'rgba(220, 38, 38, 0.10)',
    iconColor: '#dc2626',
  },
  info: {
    backgroundColor: 'rgba(2, 132, 199, 0.10)',
    iconColor: '#0284c7',
  },
};

export function KpiCard({
  title,
  value,
  icon,
  subtitle,
  subtitleColor,
  tone = 'primary',
  rollDelay = 0,
}: KpiCardProps) {
  const styles = toneStyles[tone];

  return (
    <Card
      sx={{
        height: '100%',
        minHeight: 155,
        borderRadius: 2.5,
        border: 'none',
        backgroundColor: '#ffffff',
        boxShadow:
          '0 3px 10px rgba(15, 23, 42, 0.07), ' +
          '0 12px 30px rgba(15, 23, 42, 0.06)',
        transition:
          'transform 180ms ease, box-shadow 180ms ease',

        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow:
            '0 7px 20px rgba(15, 23, 42, 0.11), ' +
            '0 18px 38px rgba(15, 23, 42, 0.08)',
        },
      }}
    >
      <CardContent
        sx={{
          height: '100%',
          p: 2.5,

          '&:last-child': {
            pb: 2.5,
          },
        }}
      >
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box
            sx={{
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontWeight: 650,

                /*
                 * Reserva o espaço de duas linhas
                 * para que o valor de todos os cards
                 * fique na mesma altura.
                 */
                minHeight: '2.6em',
                lineHeight: 1.3,
              }}
            >
              {title}
            </Typography>

            <Typography
              component="div"
              sx={{
                display: 'block',
                mt: 0.8,

                // Valor principal sempre preto.
                color: 'text.primary',

                fontSize: {
                  xs: '1.55rem',
                  md: '1.7rem',
                },

                lineHeight: 1.15,
                fontWeight: 900,
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
              }}
            >
              <RollingCurrency
                value={value}
                startDelay={rollDelay}
              />
            </Typography>

            {subtitle ? (
              <Typography
                variant="body2"
                sx={{
                  display: 'block',
                  mt: 1.5,

                  // Apenas o custo recebe a cor personalizada.
                  color: subtitleColor ?? 'text.secondary',

                  fontWeight: subtitleColor ? 700 : 500,
                  lineHeight: 1.35,
                }}
              >
                {subtitle}
              </Typography>
            ) : null}
          </Box>

          <Box
            sx={{
              width: 42,
              height: 42,
              flexShrink: 0,
              borderRadius: 2.25,
              display: 'grid',
              placeItems: 'center',
              backgroundColor: styles.backgroundColor,
              color: styles.iconColor,

              '& svg': {
                fontSize: 22,
              },
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}