import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { isAxiosError } from "axios";
import {
  FormEvent,
  useMemo,
  useState,
} from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router";

import logoCemear from "../../assets/logo cem.png";
import { resetPassword } from "../../api/authApi";


interface ApiErrorResponse {
  detail?: string;
}


function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return "A senha deve possuir pelo menos 8 caracteres.";
  }

  if (password.length > 128) {
    return "A senha deve possuir no máximo 128 caracteres.";
  }

  if (!/[A-Z]/.test(password)) {
    return "A senha deve possuir pelo menos uma letra maiúscula.";
  }

  if (!/[a-z]/.test(password)) {
    return "A senha deve possuir pelo menos uma letra minúscula.";
  }

  if (!/\d/.test(password)) {
    return "A senha deve possuir pelo menos um número.";
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    return "A senha deve possuir pelo menos um caractere especial.";
  }

  return null;
}


function getRequestErrorMessage(error: unknown): string {
  if (isAxiosError<ApiErrorResponse>(error)) {
    const detail = error.response?.data?.detail;

    if (typeof detail === "string" && detail.trim()) {
      return detail;
    }

    if (!error.response) {
      return (
        "Não foi possível conectar ao servidor. " +
        "Verifique se a API está em execução."
      );
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return (
    "Não foi possível redefinir a senha. " +
    "O link pode estar expirado ou já ter sido utilizado."
  );
}


export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = useMemo(
    () => searchParams.get("token")?.trim() ?? "",
    [searchParams],
  );

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErrorMessage(null);
    setSuccessMessage(null);

    if (!token) {
      setErrorMessage(
        "O link de recuperação não possui um token válido.",
      );
      return;
    }

    const passwordError = validatePassword(
      newPassword,
    );

    if (passwordError) {
      setErrorMessage(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage(
        "A confirmação da senha não confere.",
      );
      return;
    }

    try {
      setLoading(true);

      const response = await resetPassword({
        token,
        new_password: newPassword,
      });

      setSuccessMessage(response.message);

      window.setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            successMessage: response.message,
          },
        });
      }, 2000);
    } catch (error) {
      setErrorMessage(
        getRequestErrorMessage(error),
      );
    } finally {
      setLoading(false);
    }
  }


  const formDisabled =
    loading ||
    Boolean(successMessage) ||
    !token;


  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        py: {
          xs: 4,
          md: 6,
        },
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",

        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,

          background:
            "radial-gradient(circle at 84% 10%, rgba(14, 165, 233, 0.17), transparent 32%)",

          pointerEvents: "none",
        },

        "&::after": {
          content: '""',
          position: "absolute",

          width: 460,
          height: 460,

          right: -180,
          bottom: -330,

          borderRadius: "50%",

          background: "rgba(37, 99, 235, 0.12)",

          filter: "blur(24px)",
          pointerEvents: "none",
        },
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          position: "relative",
          zIndex: 1,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            overflow: "hidden",
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            boxShadow:
              "0 24px 70px rgba(15, 23, 42, 0.14)",
          }}
        >
          <Box
            sx={{
              height: 8,
              background:
                "linear-gradient(90deg, #ef6c00 0%, #ff9800 100%)",
            }}
          />

          <Box
            sx={{
              p: {
                xs: 3,
                sm: 5,
              },
            }}
          >
            <Stack
              spacing={1.5}
              sx={{
                mb: 4,
                alignItems: "center",
              }}
            >
              <Box
                component="img"
                src={logoCemear}
                alt="Cemear"
                sx={{
                  maxWidth: 190,
                  width: "100%",
                  height: "auto",
                  objectFit: "contain",
                }}
              />

              <Typography
                component="h1"
                variant="h4"
                color="text.primary"
                sx={{
                  fontWeight: 800,
                  textAlign: "center",
                }}
              >
                Redefinir senha
              </Typography>

              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  maxWidth: 420,
                  textAlign: "center",
                }}
              >
                Crie uma nova senha para acessar o
                Dashboard Gerencial de Obras.
              </Typography>
            </Stack>

            {!token && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                }}
              >
                Link inválido. Solicite uma nova
                recuperação de senha.
              </Alert>
            )}

            {errorMessage && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                }}
              >
                {errorMessage}
              </Alert>
            )}

            {successMessage && (
              <Alert
                severity="success"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                }}
              >
                {successMessage} Redirecionando para
                o login...
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
            >
              <Stack spacing={3}>
                <TextField
                  label="Nova senha"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={newPassword}
                  onChange={(event) => {
                    setNewPassword(
                      event.target.value,
                    );

                    if (errorMessage) {
                      setErrorMessage(null);
                    }
                  }}
                  fullWidth
                  required
                  autoFocus
                  autoComplete="new-password"
                  disabled={formDisabled}
                  helperText={
                    "Mínimo de 8 caracteres, com letra " +
                    "maiúscula, minúscula, número e símbolo."
                  }
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={
                              showPassword
                                ? "Ocultar senha"
                                : "Mostrar senha"
                            }
                            edge="end"
                            disabled={formDisabled}
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
                />

                <TextField
                  label="Confirmar nova senha"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(
                      event.target.value,
                    );

                    if (errorMessage) {
                      setErrorMessage(null);
                    }
                  }}
                  fullWidth
                  required
                  autoComplete="new-password"
                  disabled={formDisabled}
                  error={
                    confirmPassword.length > 0 &&
                    newPassword !== confirmPassword
                  }
                  helperText={
                    confirmPassword.length > 0 &&
                    newPassword !== confirmPassword
                      ? "As senhas não conferem."
                      : "Digite novamente a nova senha."
                  }
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={
                              showConfirmPassword
                                ? "Ocultar confirmação"
                                : "Mostrar confirmação"
                            }
                            edge="end"
                            disabled={formDisabled}
                            onClick={() =>
                              setShowConfirmPassword(
                                (current) =>
                                  !current,
                              )
                            }
                          >
                            {showConfirmPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={formDisabled}
                  sx={{
                    minHeight: 52,
                    borderRadius: 2,
                    fontWeight: 700,
                    textTransform: "none",
                    fontSize: "1rem",
                    background:
                      "linear-gradient(90deg, #ef6c00 0%, #ff9800 100%)",
                    boxShadow:
                      "0 10px 24px rgba(239, 108, 0, 0.25)",
                    "&:hover": {
                      background:
                        "linear-gradient(90deg, #e65100 0%, #f57c00 100%)",
                      boxShadow:
                        "0 12px 28px rgba(239, 108, 0, 0.32)",
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress
                      size={24}
                      color="inherit"
                    />
                  ) : (
                    "Redefinir senha"
                  )}
                </Button>

                <Button
                  type="button"
                  fullWidth
                  disabled={loading}
                  onClick={() =>
                    navigate("/login", {
                      replace: true,
                    })
                  }
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Voltar para o login
                </Button>
              </Stack>
            </Box>
          </Box>
        </Paper>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 3,
            textAlign: "center",
          }}
        >
          Dashboard Gerencial de Obras
        </Typography>
      </Container>
    </Box>
  );
}