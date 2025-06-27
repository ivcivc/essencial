import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Users, UserCheck, Activity, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    document.title = 'Dashboard | Clínica Essencial';
  }, []);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const roleLabel = user.role === 'admin' ? 'Administrador' : 'Recepcionista';

  return (
    <div className="p-6 bg-gray-50 dark:bg-dark-900 min-h-screen">
      {/* Header de Boas-vindas */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-500 dark:to-primary-700 rounded-lg p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Bem-vindo(a), {user.name.split(' ')[0]}!
          </h1>
          <p className="text-primary-100 dark:text-primary-50 text-lg">
            {roleLabel} da Clínica Essencial - {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Agendamentos Hoje */}
        <div className="bg-white dark:bg-dark-850 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-dark-500">Agendamentos Hoje</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-dark-50">8</p>
            </div>
          </div>
        </div>

        {/* Total de Pacientes */}
        <div className="bg-white dark:bg-dark-850 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 dark:bg-primary-500/20 rounded-lg">
              <Users className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-dark-500">Total de Pacientes</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-dark-50">247</p>
            </div>
          </div>
        </div>

        {/* Atendimentos Concluídos */}
        <div className="bg-white dark:bg-dark-850 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-lg">
              <UserCheck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-dark-500">Atendimentos Hoje</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-dark-50">12</p>
            </div>
          </div>
        </div>

        {/* Taxa de Ocupação */}
        <div className="bg-white dark:bg-dark-850 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-500/20 rounded-lg">
              <Activity className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-dark-500">Taxa de Ocupação</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-dark-50">75%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Informações da Clínica */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos Agendamentos */}
        <div className="bg-white dark:bg-dark-850 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-dark-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-50">Próximos Agendamentos</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-900 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-dark-50">Ana Silva</p>
                  <p className="text-sm text-gray-600 dark:text-dark-500">Acupuntura - Sala 1</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-dark-50">09:00</p>
                  <p className="text-xs text-gray-500 dark:text-dark-500">Dr. Carlos</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-900 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-dark-50">Roberto Santos</p>
                  <p className="text-sm text-gray-600 dark:text-dark-500">Massagem Terapêutica - Sala 2</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-dark-50">10:30</p>
                  <p className="text-xs text-gray-500 dark:text-dark-500">Dra. Maria</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-900 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-dark-50">Fernanda Lima</p>
                  <p className="text-sm text-gray-600 dark:text-dark-500">Consulta Nutricional - Sala 3</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-dark-50">14:00</p>
                  <p className="text-xs text-gray-500 dark:text-dark-500">Dra. Ana</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informações do Usuário */}
        <div className="bg-white dark:bg-dark-850 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-dark-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-50">Suas Informações</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-dark-500">Nome Completo</label>
                <p className="text-gray-900 dark:text-dark-50">{user.name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-dark-500">Email</label>
                <p className="text-gray-900 dark:text-dark-50">{user.email}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-dark-500">Perfil de Acesso</label>
                <p className="text-gray-900 dark:text-dark-50">{roleLabel}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-dark-500">Status</label>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 dark:bg-primary-500/20 text-primary-800 dark:text-primary-400">
                  Ativo
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="mt-8 bg-white dark:bg-dark-850 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-50 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Agendamentos */}
          <Link 
            to="/agendamentos"
            className="p-4 border border-gray-300 dark:border-dark-800 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:border-amber-300 dark:hover:border-amber-700 transition-colors group"
          >
            <Calendar className="h-6 w-6 text-amber-600 dark:text-amber-400 mb-2 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors" />
            <p className="font-medium text-gray-900 dark:text-dark-50 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">Agendamentos</p>
            <p className="text-sm text-gray-600 dark:text-dark-500">Gerenciar agendamentos</p>
          </Link>
          
          {/* Cadastrar Paciente */}
          <Link 
            to="/pacientes/novo"
            className="p-4 border border-gray-300 dark:border-dark-800 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-500/10 hover:border-primary-300 dark:hover:border-primary-700 transition-colors group"
          >
            <Users className="h-6 w-6 text-primary-600 dark:text-primary-400 mb-2 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors" />
            <p className="font-medium text-gray-900 dark:text-dark-50 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">Cadastrar Paciente</p>
            <p className="text-sm text-gray-600 dark:text-dark-500">Adicionar novo paciente</p>
          </Link>
          
          {/* Produtos e Serviços */}
          <Link 
            to="/produtos"
            className="p-4 border border-gray-300 dark:border-dark-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group"
          >
            <i className="las la-box text-2xl text-blue-600 dark:text-blue-400 mb-2 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors"></i>
            <p className="font-medium text-gray-900 dark:text-dark-50 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">Produtos e Serviços</p>
            <p className="text-sm text-gray-600 dark:text-dark-500">Gerenciar catálogo</p>
          </Link>
          
          {/* Configurações - Só para Admin */}
          {user.role === 'admin' && (
            <Link 
              to="/configuracoes/horarios"
              state={{ from: '/dashboard' }}
              className="p-4 border border-gray-300 dark:border-dark-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-500/10 hover:border-slate-300 dark:hover:border-slate-700 transition-colors group"
            >
              <Settings className="h-6 w-6 text-slate-600 dark:text-slate-400 mb-2 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors" />
              <p className="font-medium text-gray-900 dark:text-dark-50 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">Configurações</p>
              <p className="text-sm text-gray-600 dark:text-dark-500">Horários de funcionamento</p>
            </Link>
          )}
          
          {/* Gestão de Usuários - Só para Admin */}
          {user.role === 'admin' && (
            <Link 
              to="/admin/usuarios"
              className="p-4 border border-gray-300 dark:border-dark-800 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:border-purple-300 dark:hover:border-purple-700 transition-colors group"
            >
              <UserCheck className="h-6 w-6 text-purple-600 dark:text-purple-400 mb-2 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors" />
              <p className="font-medium text-gray-900 dark:text-dark-50 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">Gestão de Usuários</p>
              <p className="text-sm text-gray-600 dark:text-dark-500">Gerenciar usuários do sistema</p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 