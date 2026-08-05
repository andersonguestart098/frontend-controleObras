import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  ArrowForwardRounded,
  EmailOutlined,
  LockOutlined,
  SecurityRounded,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

import { isAxiosError } from "axios";
import Lottie from "lottie-react";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router";

import {
  forgotPassword,
  login,
} from "@/api/authApi";

import {
  isAuthenticated,
  saveAuthSession,
} from "@/auth/authStorage";

import logoCemear from "@/assets/logo cem.png";
import loginAnimation from "@/assets/login-dashboard.json";


const REMEMBERED_EMAIL_KEY =
  "dashboard_obras_remembered_email";


interface ApiErrorResponse {
  detail?: string;
}


interface LoginLocationState {
  from?: {
    pathname?: string;
  };

  successMessage?: string;
}


function getApiErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  if (isAxiosError<ApiErrorResponse>(error)) {
    const detail = error.response?.data?.detail;

    if (
      typeof detail === "string" &&
      detail.trim()
    ) {
      return detail;
    }

    if (!error.response) {
      return (
        "Não foi possível conectar à API. " +
        "Verifique se o backend está em execução."
      );
    }
  }

  if (
    error instanceof Error &&
    error.message
  ) {
    return error.message;
  }

  return fallbackMessage;
}


export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const locationState =
    location.state as LoginLocationState | null;

  const [email, setEmail] = useState(
    () =>
      localStorage.getItem(
        REMEMBERED_EMAIL_KEY,
      ) ?? "",
  );

  const [rememberEmail, setRememberEmail] =
    useState(() =>
      Boolean(
        localStorage.getItem(
          REMEMBERED_EMAIL_KEY,
        ),
      ),
    );

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(
      locationState?.successMessage ?? null,
    );

  const [
    forgotPasswordOpen,
    setForgotPasswordOpen,
  ] = useState(false);

  const [
    recoveryEmail,
    setRecoveryEmail,
  ] = useState("");

  const [
    recoveryLoading,
    setRecoveryLoading,
  ] = useState(false);

  const [
    recoveryMessage,
    setRecoveryMessage,
  ] = useState<string | null>(null);

  const [
    recoveryError,
    setRecoveryError,
  ] = useState<string | null>(null);


  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/", {
        replace: true,
      });
    }
  }, [navigate]);


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage(
        "Informe seu e-mail.",
      );
      return;
    }

    if (!password) {
      setErrorMessage(
        "Informe sua senha.",
      );
      return;
    }

    try {
      setLoading(true);

      const normalizedEmail =
        email.trim().toLowerCase();

      const response = await login({
        email: normalizedEmail,
        password,
      });

      if (rememberEmail) {
        localStorage.setItem(
          REMEMBERED_EMAIL_KEY,
          normalizedEmail,
        );
      } else {
        localStorage.removeItem(
          REMEMBERED_EMAIL_KEY,
        );
      }

      saveAuthSession({
        accessToken:
          response.access_token,

        refreshToken:
          response.refresh_token,

        user:
          response.user,
      });

      const destination =
        locationState?.from?.pathname ?? "/";

      navigate(destination, {
        replace: true,
      });
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "Não foi possível realizar o login.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }


  function openForgotPasswordDialog() {
    setRecoveryEmail(
      email.trim().toLowerCase(),
    );

    setRecoveryMessage(null);
    setRecoveryError(null);
    setForgotPasswordOpen(true);
  }


  function closeForgotPasswordDialog() {
    if (recoveryLoading) {
      return;
    }

    setForgotPasswordOpen(false);
  }


  async function handleForgotPassword(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setRecoveryMessage(null);
    setRecoveryError(null);

    if (!recoveryEmail.trim()) {
      setRecoveryError(
        "Informe seu e-mail.",
      );
      return;
    }

    try {
      setRecoveryLoading(true);

      const response = await forgotPassword(
        recoveryEmail
          .trim()
          .toLowerCase(),
      );

      setRecoveryMessage(
        response.message,
      );
    } catch (error) {
      setRecoveryError(
        getApiErrorMessage(
          error,
          "Não foi possível solicitar a recuperação.",
        ),
      );
    } finally {
      setRecoveryLoading(false);
    }
  }


  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        display: "grid",

        gridTemplateColumns: {
          xs: "1fr",
          md: "minmax(0, 1.5fr) minmax(360px, 0.6fr)",
        },

        background:
          "linear-gradient(135deg, #ffffff 0%, #eef2f7 55%, #ffffff 100%)",
        backgroundSize: "220% 220%",
        animation: "loginBgShift 18s ease-in-out infinite",

        // ==== keyframes globais (blobs + fundo) ====
        "@keyframes floatBlobA": {
          "0%, 100%": {
            transform: "translate(0, 0) scale(1)",
          },
          "50%": {
            transform: "translate(60px, 45px) scale(1.22)",
          },
        },
        "@keyframes floatBlobB": {
          "0%, 100%": {
            transform: "translate(0, 0) scale(1.12)",
          },
          "50%": {
            transform: "translate(-50px, -40px) scale(1)",
          },
        },
        "@keyframes floatBlobC": {
          "0%, 100%": {
            transform: "translate(0, 0) scale(1)",
          },
          "50%": {
            transform: "translate(-45px, 40px) scale(1.2)",
          },
        },
        "@keyframes floatBlobD": {
          "0%, 100%": {
            transform: "translate(0, 0) scale(1.06)",
          },
          "50%": {
            transform: "translate(45px, -35px) scale(1)",
          },
        },
        "@keyframes loginBgShift": {
          "0%": {
            backgroundPosition: "0% 0%",
          },
          "50%": {
            backgroundPosition: "100% 100%",
          },
          "100%": {
            backgroundPosition: "0% 0%",
          },
        },
      }}
    >
      {/* ===================================================
          DIVISÓRIA EM ONDA (forma escura do banner)
          — fica atrás de tudo, só no desktop
      ==================================================== */}

      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          display: {
            xs: "none",
            md: "block",
          },
        }}
      >
        <svg
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
          style={{
            width: "100%",
            height: "100%",
            display: "block",
          }}
        >
          <defs>
            <linearGradient
              id="bannerWaveGradient"
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>

          <path
            d="M0,0 L620,0 C700,160 690,360 620,540 C555,700 545,860 610,1000 L0,1000 Z"
            fill="url(#bannerWaveGradient)"
          />
        </svg>
      </Box>

      {/* ===================================================
          BANNER ESQUERDO
      ==================================================== */}

      <Box
        component="section"
        sx={{
          position: "relative",
          zIndex: 1,
          display: {
            xs: "none",
            md: "flex",
          },
          minHeight: "100vh",
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
          px: {
            md: 4,
            lg: 7,
          },
          py: {
            md: 4,
            lg: 6,
          },
        }}
      >
        {/* blobs animados do banner (mesma paleta gradiente) */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            zIndex: 0,
            top: "6%",
            left: "2%",
            width: 440,
            height: 440,
            borderRadius: "50%",
            pointerEvents: "none",
            filter: "blur(28px)",
            background:
              "radial-gradient(circle, rgba(56, 189, 248, 0.30) 0%, transparent 70%)",
            animation: "floatBlobA 17s ease-in-out infinite",
          }}
        />

        <Box
          aria-hidden
          sx={{
            position: "absolute",
            zIndex: 0,
            bottom: "-8%",
            left: "18%",
            width: 520,
            height: 520,
            borderRadius: "50%",
            pointerEvents: "none",
            filter: "blur(32px)",
            background:
              "radial-gradient(circle, rgba(37, 99, 235, 0.28) 0%, transparent 70%)",
            animation: "floatBlobB 21s ease-in-out infinite",
          }}
        />

        <Box
          aria-hidden
          sx={{
            position: "absolute",
            zIndex: 0,
            top: "38%",
            left: "30%",
            width: 300,
            height: 300,
            borderRadius: "50%",
            pointerEvents: "none",
            filter: "blur(26px)",
            background:
              "radial-gradient(circle, rgba(14, 165, 233, 0.18) 0%, transparent 70%)",
            animation: "floatBlobC 24s ease-in-out infinite",
          }}
        />

        <Stack
          spacing={{ md: 2.5, lg: 3.5 }}
          sx={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            maxWidth: 760,
          }}
        >
          <Box>
            <Typography
              component="h1"
              sx={{
                maxWidth: 720,
                fontSize:
                  "clamp(2.1rem, 1.5vw + 1.5rem, 4rem)",
                lineHeight: 1.08,
                letterSpacing: "-0.035em",
                fontWeight: 850,

                background:
                  "linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)",

                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Dados da obra transformados em decisões.
            </Typography>

            <Typography
              sx={{
                maxWidth: 620,
                mt: { md: 2, lg: 2.5 },
                color:
                  "rgba(255, 255, 255, 0.74)",
                fontSize:
                  "clamp(1rem, 0.45vw + 0.9rem, 1.4rem)",
                lineHeight: 1.6,
              }}
            >
              Acompanhe vendas, custos, pagamentos,
              remessas e despesas em uma única visão
              gerencial.
            </Typography>
          </Box>

          <Box
            sx={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: "clamp(340px, 62vh, 800px)",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: "4% 12%",
                borderRadius: "50%",
                background:
                  "rgba(255, 255, 255, 0.055)",
                filter: "blur(1px)",
              }}
            />

            <Box
              role="img"
              aria-label="Animação do Dashboard Gerencial de Obras"
              sx={{
                position: "relative",
                width: "100%",
                height: "100%",
                maxWidth: "clamp(410px, 44vw, 880px)",

                "& svg": {
                  display: "block",
                  width: "100%",
                  height: "100%",
                },
              }}
            >
              <Lottie
                animationData={loginAnimation}
                autoplay
                loop
                style={{
                  width: "100%",
                  height: "100%",
                }}
              />
            </Box>
          </Box>
        </Stack>
      </Box>

      {/* ===================================================
          FORMULÁRIO DIREITO
      ==================================================== */}

      <Box
        component="main"
        sx={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",

          px: {
            xs: 3,
            sm: 6,
            md: 4,
            lg: 6,
          },

          py: {
            xs: 5,
            md: 6,
          },
        }}
      >
        {/* blobs animados do formulário (cinza sutil, um tom + escuro) */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            zIndex: 0,
            top: "12%",
            right: "-6%",
            width: 380,
            height: 380,
            borderRadius: "50%",
            pointerEvents: "none",
            filter: "blur(30px)",
            background:
              "radial-gradient(circle, rgba(148, 163, 184, 0.22) 0%, transparent 70%)",
            animation: "floatBlobC 20s ease-in-out infinite",
          }}
        />

        <Box
          aria-hidden
          sx={{
            position: "absolute",
            zIndex: 0,
            bottom: "-10%",
            left: "-8%",
            width: 460,
            height: 460,
            borderRadius: "50%",
            pointerEvents: "none",
            filter: "blur(34px)",
            background:
              "radial-gradient(circle, rgba(148, 163, 184, 0.16) 0%, transparent 70%)",
            animation: "floatBlobD 24s ease-in-out infinite",
          }}
        />

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            maxWidth: { xs: 360, md: 320, xl: 360 },
            transform: {
              xs: "none",
              md: "translateX(-24px)",
            },
          }}
        >
          <Box
            component="img"
            src={logoCemear}
            alt="Cemear"
            sx={{
              display: "block",
              width: {
                xs: 128,
                sm: 140,
              },
              maxHeight: 56,
              objectFit: "contain",
              objectPosition: "left center",
              mb: {
                xs: 2.5,
                md: 3,
              },
            }}
          />

          <Typography
            component="h2"
            sx={{
              color: "#122033",
              fontSize:
                "clamp(1.55rem, 0.6vw + 1.2rem, 2rem)",
              lineHeight: 1.14,
              letterSpacing: "-0.035em",
              fontWeight: 850,
            }}
          >
            Bem-vindo de volta
          </Typography>

          <Typography
            sx={{
              mt: 0.75,
              mb: { xs: 3, md: 3.25 },
              color: "#718096",
              lineHeight: 1.55,
              fontSize: "0.88rem",
            }}
          >
            Entre com suas credenciais para acessar o
            sistema gerencial de obras.
          </Typography>

          {successMessage && (
            <Alert
              severity="success"
              sx={{
                mb: 3,
                borderRadius: 2.5,
              }}
            >
              {successMessage}
            </Alert>
          )}

          {errorMessage && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2.5,
              }}
            >
              {errorMessage}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
          >
            <Stack spacing={2}>
              <TextField
                label="E-mail"
                type="email"
                name="email"
                value={email}
                onChange={(event) => {
                  setEmail(
                    event.target.value,
                  );

                  if (errorMessage) {
                    setErrorMessage(null);
                  }
                }}
                fullWidth
                required
                autoFocus
                autoComplete="email"
                disabled={loading}
                placeholder="seu.email@empresa.com.br"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlined
                          sx={{
                            color: "#94a3b8",
                            fontSize: 20,
                          }}
                        />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    minHeight: 50,
                    borderRadius: 2.5,
                    backgroundColor: "transparent",

                    "& fieldset": {
                      borderColor: "#d9e0e8",
                    },

                    "&:hover fieldset": {
                      borderColor: "#8ba2b8",
                    },

                    "&.Mui-focused fieldset": {
                      borderWidth: 2,
                      borderColor: "#0095FF",
                    },
                  },

                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#0095FF",
                  },
                }}
              />

              <TextField
                label="Senha"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                value={password}
                onChange={(event) => {
                  setPassword(
                    event.target.value,
                  );

                  if (errorMessage) {
                    setErrorMessage(null);
                  }
                }}
                fullWidth
                required
                autoComplete="current-password"
                disabled={loading}
                placeholder="Digite sua senha"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined
                          sx={{
                            color: "#94a3b8",
                            fontSize: 20,
                          }}
                        />
                      </InputAdornment>
                    ),

                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          disabled={loading}
                          aria-label={
                            showPassword
                              ? "Ocultar senha"
                              : "Mostrar senha"
                          }
                          onClick={() =>
                            setShowPassword(
                              (current) =>
                                !current,
                            )
                          }
                        >
                          {showPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    minHeight: 50,
                    borderRadius: 2.5,
                    backgroundColor: "transparent",

                    "& fieldset": {
                      borderColor: "#d9e0e8",
                    },

                    "&:hover fieldset": {
                      borderColor: "#8ba2b8",
                    },

                    "&.Mui-focused fieldset": {
                      borderWidth: 2,
                      borderColor: "#0095FF",
                    },
                  },

                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#0095FF",
                  },
                }}
              />

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 0.5,
                  mt: "-8px !important",
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberEmail}
                      disabled={loading}
                      size="small"
                      onChange={(event) => {
                        setRememberEmail(
                          event.target.checked,
                        );
                      }}
                      sx={{
                        color: "#94a3b8",

                        "&.Mui-checked": {
                          color: "#0095FF",
                        },
                      }}
                    />
                  }
                  label="Lembrar meu e-mail"
                  sx={{
                    m: 0,

                    "& .MuiFormControlLabel-label": {
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: "#64748b",
                    },
                  }}
                />

                <Button
                  type="button"
                  disabled={loading}
                  onClick={
                    openForgotPasswordDialog
                  }
                  sx={{
                    minWidth: "auto",
                    p: 0,
                    color: "#0095FF",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    textTransform: "none",

                    "&:hover": {
                      backgroundColor: "transparent",
                      color: "#0077cc",
                      textDecoration: "underline",
                    },
                  }}
                >
                  Esqueci minha senha
                </Button>
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                endIcon={
                  !loading
                    ? <ArrowForwardRounded />
                    : undefined
                }
                sx={{
                  minHeight: 48,
                  mt: "6px !important",
                  borderRadius: 2.5,
                  color: "#ffffff",
                  fontSize: "0.95rem",
                  fontWeight: 750,
                  textTransform: "none",

                  background:
                    "linear-gradient(90deg, #0095FF 0%, #33b5ff 100%)",

                  boxShadow:
                    "0 12px 28px rgba(0, 149, 255, 0.25)",

                  "&:hover": {
                    background:
                      "linear-gradient(90deg, #0077cc 0%, #0095FF 100%)",

                    boxShadow:
                      "0 15px 34px rgba(0, 149, 255, 0.34)",
                  },
                }}
              >
                {loading ? (
                  <CircularProgress
                    size={24}
                    color="inherit"
                  />
                ) : (
                  "Entrar"
                )}
              </Button>
            </Stack>
          </Box>

          <Stack
            direction="row"
            spacing={1}
            sx={{
              mt: { xs: 4, md: 3.5 },
              color: "#94a3b8",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SecurityRounded
              sx={{
                fontSize: 18,
              }}
            />

            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                fontSize: "0.82rem",
              }}
            >
              Ambiente seguro e acesso monitorado
            </Typography>
          </Stack>
        </Box>
      </Box>

      {/* ===================================================
          MODAL DE RECUPERAÇÃO
      ==================================================== */}

      <Dialog
        open={forgotPasswordOpen}
        onClose={closeForgotPasswordDialog}
        fullWidth
        maxWidth="xs"
        slotProps={{
          paper: {
            sx: {
              overflow: "hidden",
              borderRadius: 3.5,
              boxShadow:
                "0 28px 80px rgba(15, 23, 42, 0.22)",
            },
          },
        }}
      >
        <Box
          sx={{
            height: 7,
            background:
              "linear-gradient(90deg, #0095FF 0%, #33b5ff 100%)",
          }}
        />

        <Box
          component="form"
          onSubmit={handleForgotPassword}
        >
          <DialogTitle
            sx={{
              pt: 3.5,
              px: 3.5,
              pb: 1,
              color: "#122033",
              fontSize: "1.45rem",
              fontWeight: 800,
            }}
          >
            Recuperar senha
          </DialogTitle>

          <DialogContent
            sx={{
              px: 3.5,
              pt: "12px !important",
            }}
          >
            <Typography
              sx={{
                mb: 3,
                color: "#718096",
                lineHeight: 1.6,
              }}
            >
              Informe o e-mail cadastrado. Enviaremos
              um link seguro para você criar uma nova
              senha.
            </Typography>

            {recoveryMessage && (
              <Alert
                severity="success"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                }}
              >
                {recoveryMessage}
              </Alert>
            )}

            {recoveryError && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                }}
              >
                {recoveryError}
              </Alert>
            )}

            <TextField
              label="E-mail"
              type="email"
              value={recoveryEmail}
              onChange={(event) => {
                setRecoveryEmail(
                  event.target.value,
                );

                setRecoveryError(null);
              }}
              fullWidth
              required
              autoFocus
              autoComplete="email"
              disabled={
                recoveryLoading ||
                Boolean(recoveryMessage)
              }
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlined
                        sx={{
                          color: "#94a3b8",
                        }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  minHeight: 56,
                  borderRadius: 2.5,
                  backgroundColor: "transparent",
                },

                "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                  borderColor: "#0095FF",
                },

                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#0095FF",
                },
              }}
            />
          </DialogContent>

          <DialogActions
            sx={{
              px: 3.5,
              pt: 2,
              pb: 3.5,
            }}
          >
            <Button
              type="button"
              disabled={recoveryLoading}
              onClick={closeForgotPasswordDialog}
              sx={{
                color: "#64748b",
                fontWeight: 650,
                textTransform: "none",
              }}
            >
              Fechar
            </Button>

            {!recoveryMessage && (
              <Button
                type="submit"
                variant="contained"
                disabled={recoveryLoading}
                sx={{
                  minWidth: 125,
                  minHeight: 42,
                  borderRadius: 2,
                  fontWeight: 700,
                  textTransform: "none",

                  background:
                    "linear-gradient(90deg, #0095FF 0%, #33b5ff 100%)",
                }}
              >
                {recoveryLoading ? (
                  <CircularProgress
                    size={20}
                    color="inherit"
                  />
                ) : (
                  "Enviar link"
                )}
              </Button>
            )}
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
