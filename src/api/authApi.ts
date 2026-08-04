import { httpClient } from "./httpClient";

import type {
  AuthUser,
} from "@/auth/authStorage";


export interface LoginPayload {
  email: string;
  password: string;
}


export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number;
  user: AuthUser;
}


export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number;
}


export interface MessageResponse {
  message: string;
}


export interface ResetPasswordPayload {
  token: string;
  new_password: string;
}


export async function login(
  payload: LoginPayload,
): Promise<LoginResponse> {
  const response =
    await httpClient.post<LoginResponse>(
      "/auth/login",
      payload,
    );

  return response.data;
}


export async function forgotPassword(
  email: string,
): Promise<MessageResponse> {
  const response =
    await httpClient.post<MessageResponse>(
      "/auth/forgot-password",
      {
        email,
      },
    );

  return response.data;
}


export async function resetPassword(
  payload: ResetPasswordPayload,
): Promise<MessageResponse> {
  const response =
    await httpClient.post<MessageResponse>(
      "/auth/reset-password",
      payload,
    );

  return response.data;
}


export async function refreshTokens(
  refreshToken: string,
): Promise<RefreshResponse> {
  const response =
    await httpClient.post<RefreshResponse>(
      "/auth/refresh",
      {
        refresh_token: refreshToken,
      },
    );

  return response.data;
}


export async function logout(
  refreshToken: string,
): Promise<MessageResponse> {
  const response =
    await httpClient.post<MessageResponse>(
      "/auth/logout",
      {
        refresh_token: refreshToken,
      },
    );

  return response.data;
}


export async function getCurrentUser(): Promise<AuthUser> {
  const response =
    await httpClient.get<AuthUser>(
      "/auth/me",
    );

  return response.data;
}