import api from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'recepcionista';
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'recepcionista';
  active: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'recepcionista';
  active?: boolean;
}

class AuthService {
  async login(data: LoginData): Promise<LoginResponse> {
    const response = await api.post('/auth/login', data);
    return response.data;
  }

  async logout(): Promise<void> {
    await api.post('/auth/logout');
    localStorage.removeItem('@clinica:token');
    localStorage.removeItem('@clinica:user');
  }

  async me(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data.user;
  }

  async getUsers(): Promise<User[]> {
    const response = await api.get('/users');
    return response.data.users;
  }

  async getUserById(id: number): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return response.data.user;
  }

  async createUser(data: CreateUserData): Promise<User> {
    const response = await api.post('/users', data);
    return response.data.user;
  }

  async updateUser(id: number, data: UpdateUserData): Promise<User> {
    const response = await api.put(`/users/${id}`, data);
    return response.data.user;
  }

  async deleteUser(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  }

  // Métodos auxiliares para localStorage
  setToken(token: string): void {
    localStorage.setItem('@clinica:token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('@clinica:token');
  }

  setUser(user: User): void {
    localStorage.setItem('@clinica:user', JSON.stringify(user));
  }

  getUser(): User | null {
    const user = localStorage.getItem('@clinica:user');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'admin';
  }
}

export default new AuthService(); 