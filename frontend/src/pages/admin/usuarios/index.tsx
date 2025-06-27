import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Edit, Trash2, Eye, EyeOff, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../contexts/AuthContext';
import { createUserSchema, updateUserSchema } from '../../../schemas/auth';
import { DomiexSelect } from '../../../components/form/DomiexForm';
import type { CreateUserData, UpdateUserData, User } from '../../../services/auth';

const UsuariosPage: React.FC = () => {
  const { user: currentUser, createUser, updateUser, getUsers, deleteUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateUserData | UpdateUserData>({
    resolver: zodResolver(editingUser ? updateUserSchema : createUserSchema),
  });

  // Carregar usuários
  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Gestão de Usuários | Clínica Essencial';
    loadUsers();
  }, []);

  // Resetar formulário
  const resetForm = () => {
    reset({
      name: '',
      email: '',
      password: '',
      role: 'recepcionista',
      active: true,
    });
    setEditingUser(null);
    setShowModal(false);
    setShowPassword(false);
  };

  // Abrir modal para criar usuário
  const handleCreate = () => {
    resetForm();
    setShowModal(true);
  };

  // Abrir modal para editar usuário
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setValue('name', user.name);
    setValue('email', user.email);
    setValue('role', user.role);
    setValue('active', true); // Assumir ativo se não tiver esse campo no tipo User atual
    setShowModal(true);
  };

  // Submeter formulário
  const onSubmit = async (data: CreateUserData | UpdateUserData) => {
    try {
      setLoading(true);

      if (editingUser) {
        // Editar usuário
        await updateUser(editingUser.id, data as UpdateUserData);
        toast.success('Usuário atualizado com sucesso!');
      } else {
        // Criar usuário
        await createUser(data as CreateUserData);
        toast.success('Usuário criado com sucesso!');
      }

      await loadUsers();
      resetForm();
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error);
      const message = error.response?.data?.message || 'Erro ao salvar usuário';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Excluir usuário
  const handleDelete = async (user: User) => {
    if (user.id === currentUser?.id) {
      toast.error('Você não pode excluir seu próprio usuário');
      return;
    }

    if (window.confirm(`Tem certeza que deseja excluir o usuário ${user.name}?`)) {
      try {
        setLoading(true);
        await deleteUser(user.id);
        toast.success('Usuário excluído com sucesso!');
        await loadUsers();
      } catch (error: any) {
        console.error('Erro ao excluir usuário:', error);
        const message = error.response?.data?.message || 'Erro ao excluir usuário';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }
  };

  const getRoleLabel = (role: string) => {
    return role === 'admin' ? 'Administrador' : 'Recepcionista';
  };

  // Só administradores podem ver esta página
  if (currentUser?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-6 bg-gray-50 dark:bg-dark-900 min-h-screen">
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-6">
          <h3 className="text-red-800 dark:text-red-400 font-medium text-lg">Acesso Negado</h3>
          <p className="text-red-600 dark:text-red-300 mt-2">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 bg-gray-50 dark:bg-dark-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-50 flex items-center">
              <Users className="mr-3 h-6 w-6 text-primary-600 dark:text-primary-400" />
              Gestão de Usuários
            </h1>
            <p className="text-gray-600 dark:text-dark-400 mt-1">
              {users.length} usuário{users.length !== 1 ? 's' : ''} cadastrado{users.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-dark-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="-ml-1 mr-2 h-4 w-4" />
            Novo Usuário
          </button>
        </div>
      </div>

      {/* Tabela de usuários */}
      <div className="bg-white dark:bg-dark-850 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-700">
            <thead className="bg-gray-50 dark:bg-dark-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">
                  Perfil
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-850 divide-y divide-gray-200 dark:divide-dark-700">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mb-4"></div>
                      <p className="text-gray-500 dark:text-dark-400">Carregando usuários...</p>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Users className="h-12 w-12 text-gray-300 dark:text-dark-600 mb-4" />
                      <p className="text-gray-500 dark:text-dark-400 text-lg font-medium">Nenhum usuário encontrado</p>
                      <p className="text-gray-400 dark:text-dark-500">Cadastre o primeiro usuário do sistema</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-dark-50">{user.name}</div>
                          <div className="text-sm text-gray-500 dark:text-dark-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'admin'
                            ? 'bg-primary-100 dark:bg-primary-500/20 text-primary-800 dark:text-primary-400'
                            : 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-400'
                        }`}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="inline-flex items-center p-2 border border-transparent rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                          title="Editar usuário"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {user.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDelete(user)}
                            className="inline-flex items-center p-2 border border-transparent rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                            title="Excluir usuário"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 dark:bg-dark-900 bg-opacity-50 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md">
            <div className="bg-white dark:bg-dark-850 rounded-lg shadow-xl">
              {/* Header do Modal */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-50">
                  {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                </h3>
              </div>

              {/* Formulário */}
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-50 transition-colors"
                    placeholder="Digite o nome completo"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-50 transition-colors"
                    placeholder="Digite o e-mail"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
                  )}
                </div>

                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                      Senha *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...register('password')}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-dark-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-50 transition-colors"
                        placeholder="Digite a senha"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-dark-300"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
                    )}
                  </div>
                )}

                <div>
                  <DomiexSelect
                    label="Perfil"
                    register={register('role')}
                    error={errors.role?.message}
                    required
                    options={[
                      { value: 'recepcionista', label: 'Recepcionista' },
                      { value: 'admin', label: 'Administrador' }
                    ]}
                  />
                </div>

                {/* Botões */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg text-sm font-medium text-gray-700 dark:text-dark-300 bg-white dark:bg-dark-850 hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-dark-850 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    )}
                    {editingUser ? 'Atualizar' : 'Criar'} Usuário
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosPage; 