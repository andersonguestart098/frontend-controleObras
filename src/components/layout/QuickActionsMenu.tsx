import {
  useState,
  type MouseEvent,
} from 'react';

import Lottie from 'lottie-react';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';

import {
  Box,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';

import gearAnimation from '@/assets/Fun Gear.json';
import { ImportacaoMaoObraSection } from '@/components/importacao/ImportacaoMaoObraSection';

const BLUE = '#0ea5e9';
const RED = '#dc2626';

interface QuickActionsMenuProps {
  onLogout: () => void;
}

export function QuickActionsMenu({
  onLogout,
}: QuickActionsMenuProps) {
  const [anchorEl, setAnchorEl] =
    useState<HTMLElement | null>(null);

  const [uploadOpen, setUploadOpen] =
    useState(false);

  const menuOpen = Boolean(anchorEl);

  function handleOpenMenu(
    event: MouseEvent<HTMLElement>,
  ) {
    setAnchorEl(event.currentTarget);
  }

  function handleCloseMenu() {
    setAnchorEl(null);
  }

  function handleSelectUpload() {
    handleCloseMenu();
    setUploadOpen(true);
  }

  function handleSelectLogout() {
    handleCloseMenu();
    onLogout();
  }

  function handleCloseUpload() {
    setUploadOpen(false);
  }

  return (
    <>
      <Box
        sx={{
          position: 'relative',
          width: 58,
          height: 58,
          mr: 2.7,
          flexShrink: 0,
        }}
      >
        <Tooltip title="Ações rápidas" arrow>
          <IconButton
            disableRipple
            onClick={handleOpenMenu}
            aria-haspopup="true"
            aria-expanded={menuOpen}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              zIndex: 2,

              width: 136,
              height: 136,

              p: 0,

              backgroundColor: 'transparent',

              transform: 'translate(-50%, -50%)',
              transition: 'transform 180ms ease',

              '&:hover': {
                backgroundColor: 'transparent',
                transform: 'translate(-50%, -50%) scale(1.08)',
              },
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: '100%',
              }}
            >
              <Lottie
                animationData={gearAnimation}
                autoplay
                loop
                style={{
                  width: '100%',
                  height: '100%',
                }}
              />
            </Box>
          </IconButton>
        </Tooltip>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              minWidth: 260,

              borderRadius: 2.5,

              border:
                '1px solid rgba(148, 163, 184, 0.16)',

              boxShadow:
                '0 16px 36px rgba(15, 23, 42, 0.18), ' +
                '0 4px 12px rgba(15, 23, 42, 0.08)',
            },
          },
        }}
      >
        <MenuItem
          onClick={handleSelectUpload}
          sx={{
            py: 1.2,
            px: 1.8,
          }}
        >
          <ListItemIcon>
            <CloudUploadRoundedIcon
              sx={{ color: BLUE }}
            />
          </ListItemIcon>

          <ListItemText
            primary={
              <Typography
                sx={{
                  color: '#0f172a',
                  fontSize: '0.86rem',
                  fontWeight: 800,
                }}
              >
                Importar mão de obra
              </Typography>
            }
            secondary={
              <Typography
                sx={{
                  color: '#64748b',
                  fontSize: '0.72rem',
                  fontWeight: 550,
                }}
              >
                Upload de planilha XLSX
              </Typography>
            }
          />
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />

        <MenuItem
          onClick={handleSelectLogout}
          sx={{
            py: 1.2,
            px: 1.8,
          }}
        >
          <ListItemIcon>
            <LogoutRoundedIcon
              sx={{ color: RED }}
            />
          </ListItemIcon>

          <ListItemText
            primary={
              <Typography
                sx={{
                  color: '#0f172a',
                  fontSize: '0.86rem',
                  fontWeight: 800,
                }}
              >
                Sair
              </Typography>
            }
            secondary={
              <Typography
                sx={{
                  color: '#64748b',
                  fontSize: '0.72rem',
                  fontWeight: 550,
                }}
              >
                Encerrar sessão
              </Typography>
            }
          />
        </MenuItem>
      </Menu>

      <Dialog
        open={uploadOpen}
        onClose={handleCloseUpload}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: {
                xs: 4,
                md: 5,
              },

              overflow: 'hidden',

              backgroundColor: 'transparent',
              backgroundImage: 'none',
              boxShadow: 'none',
            },
          },
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            position: 'relative',
          }}
        >
          <IconButton
            onClick={handleCloseUpload}
            aria-label="Fechar"
            sx={{
              position: 'absolute',
              top: 14,
              right: 14,
              zIndex: 2,

              color: '#ffffff',

              backgroundColor:
                'rgba(255, 255, 255, 0.10)',

              border:
                '1px solid rgba(255, 255, 255, 0.16)',

              '&:hover': {
                backgroundColor:
                  'rgba(255, 255, 255, 0.18)',
              },
            }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>

          <ImportacaoMaoObraSection />
        </DialogContent>
      </Dialog>
    </>
  );
}
