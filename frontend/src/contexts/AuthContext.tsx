import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { User, LoginData, CreateUserData, UpdateUserData } from '../services/auth';
import toast from 'react-hot-toast';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  updateUserData: (userData: User) => void;
  // Métodos para gestão de usuários
  getUsers: () => Promise<User[]>;
  createUser: (data: CreateUserData) => Promise<User>;
  updateUser: (id: number, data: UpdateUserData) => Promise<User>;
  deleteUser: (id: number) => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  // Inicializar autenticação
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = authService.getToken();
        const storedUser = authService.getUser();

        if (token && storedUser) {
          // Verificar se o token ainda é válido
          const userData = await authService.me();
          setUser(userData);
          authService.setUser(userData);
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        // Token inválido, limpar dados
        authService.setToken('');
        authService.setUser({} as User);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (data: LoginData) => {
    try {
      setLoading(true);
      const response = await authService.login(data);
      
      const { user: userData, token } = response;
      
      // Salvar dados no localStorage
      authService.setToken(token);
      authService.setUser(userData);
      
      // Atualizar estado
      setUser(userData);
      
      toast.success('Login realizado com sucesso!');
    } catch (error: any) {
      console.error('Erro no login:', error);
      
      const message = 
        error.response?.data?.message || 
        'Erro ao fazer login. Verifique suas credenciais.';
      
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      // Sempre limpar dados locais
      setUser(null);
      setLoading(false);
      toast.success('Logout realizado com sucesso!');
    }
  };

  const updateUserData = (userData: User) => {
    setUser(userData);
    authService.setUser(userData);
  };

  // Métodos para gestão de usuários
  const getUsers = async (): Promise<User[]> => {
    return await authService.getUsers();
  };

  const createUser = async (data: CreateUserData): Promise<User> => {
    return await authService.createUser(data);
  };

  const updateUser = async (id: number, data: UpdateUserData): Promise<User> => {
    return await authService.updateUser(id, data);
  };

  const deleteUser = async (id: number): Promise<void> => {
    return await authService.deleteUser(id);
  };

  const value: AuthContextData = {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    updateUserData,
    getUsers,
    createUser,
    updateUser,
    deleteUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 