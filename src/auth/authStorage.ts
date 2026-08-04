export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  is_active: boolean;

  avatar_url: string | null;

  created_at: string;
  updated_at: string | null;
  last_login_at: string | null;
}

interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

const ACCESS_TOKEN_KEY =
  "dashboard_obras_access_token";

const REFRESH_TOKEN_KEY =
  "dashboard_obras_refresh_token";

const USER_KEY =
  "dashboard_obras_user";

export function saveAuthSession(
  session: AuthSession,
): void {
  localStorage.setItem(
    ACCESS_TOKEN_KEY,
    session.accessToken,
  );

  localStorage.setItem(
    REFRESH_TOKEN_KEY,
    session.refreshToken,
  );

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(session.user),
  );
}

export function saveAuthTokens(
  accessToken: string,
  refreshToken: string,
): void {
  localStorage.setItem(
    ACCESS_TOKEN_KEY,
    accessToken,
  );

  localStorage.setItem(
    REFRESH_TOKEN_KEY,
    refreshToken,
  );
}

export function getAccessToken(): string | null {
  return localStorage.getItem(
    ACCESS_TOKEN_KEY,
  );
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(
    REFRESH_TOKEN_KEY,
  );
}

export function getStoredUser(): AuthUser | null {
  const storedUser = localStorage.getItem(
    USER_KEY,
  );

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(
      storedUser,
    ) as AuthUser;
  } catch {
    localStorage.removeItem(USER_KEY);

    return null;
  }
}

export function clearAuthSession(): void {
  localStorage.removeItem(
    ACCESS_TOKEN_KEY,
  );

  localStorage.removeItem(
    REFRESH_TOKEN_KEY,
  );

  localStorage.removeItem(
    USER_KEY,
  );
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}