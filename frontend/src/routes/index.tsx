import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { nonAuthRoutes, routes } from "./allRoutes";
import NonLayout from "@src/layout/nonLayout";
import Layout from "@src/layout/layout";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../contexts/AuthContext";

const Routing = () => {
  const { isAuthenticated } = useAuth();

  return (
    <React.Fragment>
      <Routes>
        {/* Rotas protegidas (autenticadas) */}
        {(routes || []).map((item, key) => (
          <Route
            key={key}
            path={item.path}
            element={
              <ProtectedRoute>
                <Layout>{item.component}</Layout>
              </ProtectedRoute>
            }
          />
        ))}

        {/* Rotas públicas (não autenticadas) */}
        {(nonAuthRoutes || []).map((item, key) => (
          <Route
            key={key}
            path={item.path}
            element={
              // Se já estiver logado e tentar acessar login, redireciona para dashboard
              isAuthenticated && (item.path === "/login" || item.path === "/auth/signin-clinica") ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <NonLayout>{item.component}</NonLayout>
              )
            }
          />
        ))}

        {/* Rota catch-all - redireciona para 404 */}
        <Route path="*" element={<Navigate to="/page/404" replace />} />
      </Routes>
    </React.Fragment>
  );
};

export default Routing;
