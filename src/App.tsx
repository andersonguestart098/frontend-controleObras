import {
  Navigate,
  Route,
  Routes,
} from "react-router";

import ProtectedRoute from "@/auth/ProtectedRoute";

import { DashboardPage } from "@/pages/DashboardPage";

import LoginPage from "@/pages/auth/LoginPage";

import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";


export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/reset-password"
        element={<ResetPasswordPage />}
      />

      <Route element={<ProtectedRoute />}>
        <Route
          path="/"
          element={<DashboardPage />}
        />
      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  );
}