import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Building2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { loginSchema, LoginFormData } from "../../../schemas/auth";
import backgroundImg from "@assets/images/others/auth.jpg";
import toast from "react-hot-toast";

const SignInClinica: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      navigate("/dashboard");
    } catch (error) {
      // O erro já é tratado no contexto
      console.error("Erro no login:", error);
    }
  };

  // Função para preencher credenciais de teste
  const handleAdminLogin = () => {
    setValue("email", "admin@clinicaessencial.com");
    setValue("password", "admin123");
  };

  const handleRecepcionistaLogin = () => {
    setValue("email", "recepcao@clinicaessencial.com");
    setValue("password", "recepcao123");
  };

  return (
    <div
      className="relative flex items-center justify-center min-h-screen py-12 bg-center bg-cover"
      style={{ backgroundImage: `url(${backgroundImg})` }}
    >
      <div className="absolute inset-0 bg-gray-950/60"></div>
      <div className="container relative">
        <div className="grid grid-cols-12">
          <div className="col-span-12 mb-0 border-none shadow-none md:col-span-10 lg:col-span-6 xl:col-span-4 md:col-start-2 lg:col-start-4 xl:col-start-5 card bg-white/10 backdrop-blur-md">
            <div className="md:p-10 card-body">
              {/* Logo e Título */}
              <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-green-500/20">
                  <Building2 className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Clínica Essencial
                </h2>
                <p className="text-white/75">
                  Sistema de Gestão Integrada
                </p>
              </div>

              <h4 className="mb-2 text-xl font-semibold text-center text-white">
                Bem-vindo de volta!
              </h4>
              <p className="mb-6 text-center text-white/75">
                Faça login para acessar o sistema
              </p>

              {/* Formulário de Login */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block mb-2 text-sm font-medium text-white/75">
                    Email
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    id="email"
                    className={`w-full px-4 py-3 text-white border-none rounded-lg form-input bg-white/10 placeholder:text-white/50 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-green-500/50 ${
                      errors.email ? 'ring-2 ring-red-500' : ''
                    }`}
                    placeholder="Digite seu email"
                    disabled={isSubmitting || loading}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-300">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block mb-2 text-sm font-medium text-white/75">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      {...register("password")}
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className={`w-full px-4 py-3 pr-12 text-white border-none rounded-lg form-input bg-white/10 placeholder:text-white/50 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-green-500/50 ${
                        errors.password ? 'ring-2 ring-red-500' : ''
                      }`}
                      placeholder="Digite sua senha"
                      disabled={isSubmitting || loading}
                    />
                    <button
                      type="button"
                      onClick={handleTogglePassword}
                      className="absolute inset-y-0 right-3 flex items-center text-white/60 hover:text-white focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-300">{errors.password.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="w-full py-3 font-medium text-white transition-colors duration-200 bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting || loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Entrando...
                    </div>
                  ) : (
                    "Entrar"
                  )}
                </button>
              </form>

              {/* Credenciais de Teste */}
              <div className="mt-8 space-y-4">
                <div className="text-center">
                  <p className="text-sm text-white/60 mb-4">Credenciais de teste:</p>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex-1">
                    <h6 className="mb-1 text-sm font-medium text-white">Administrador</h6>
                    <p className="text-xs text-white/60">admin@clinicaessencial.com</p>
                    <p className="text-xs text-white/60">admin123</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAdminLogin}
                    className="px-4 py-2 text-sm font-medium text-white transition-colors duration-200 bg-blue-600/80 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    disabled={isSubmitting || loading}
                  >
                    Login
                  </button>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex-1">
                    <h6 className="mb-1 text-sm font-medium text-white">Recepcionista</h6>
                    <p className="text-xs text-white/60">recepcao@clinicaessencial.com</p>
                    <p className="text-xs text-white/60">recepcao123</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRecepcionistaLogin}
                    className="px-4 py-2 text-sm font-medium text-white transition-colors duration-200 bg-purple-600/80 rounded hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    disabled={isSubmitting || loading}
                  >
                    Login
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 text-center">
                <p className="text-xs text-white/50">
                  © 2025 Clínica Essencial - Sistema de Gestão Integrada
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInClinica; 