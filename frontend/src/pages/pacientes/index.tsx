import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, Eye, Filter, Users, Calendar, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { Paciente } from '../../types/Paciente';
import { pacientesService } from '../../services/pacientes';
import { useAuth } from '../../contexts/AuthContext';

const PacientesList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estados
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPacientes, setFilteredPacientes] = useState<Paciente[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPacientes, setTotalPacientes] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pacienteToDelete, setPacienteToDelete] = useState<Paciente | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [pacienteToView, setPacienteToView] = useState<Paciente | null>(null);

  const itemsPerPage = 10;

  // Carregar pacientes
  const carregarPacientes = useCallback(async (search?: string, page = 1) => {
    try {
      setLoading(true);
      const response = await pacientesService.listar(search, page, itemsPerPage);
      
      setPacientes(response.pacientes);
      setFilteredPacientes(response.pacientes);
      setTotalPacientes(response.meta?.total || response.pacientes.length);
      setTotalPages(response.meta?.lastPage || 1);
      setCurrentPage(response.meta?.currentPage || 1);
    } catch (error: any) {
      toast.error('Erro ao carregar pacientes');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Busca em tempo real
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    
    if (value.length >= 2) {
      carregarPacientes(value, 1);
    } else if (value.length === 0) {
      carregarPacientes(undefined, 1);
    }
  }, [carregarPacientes]);

  // Carregar dados iniciais
  useEffect(() => {
    document.title = 'Pacientes | Clínica Essencial';
    carregarPacientes();
  }, [carregarPacientes]);

  // Funções de navegação
  const handleEdit = (paciente: Paciente) => {
    navigate(`/pacientes/editar/${paciente.id}`);
  };

  const handleView = (paciente: Paciente) => {
    setPacienteToView(paciente);
    setShowViewModal(true);
  };

  const handleDelete = (paciente: Paciente) => {
    setPacienteToDelete(paciente);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!pacienteToDelete) return;

    try {
      await pacientesService.excluir(pacienteToDelete.id!);
      toast.success('Paciente excluído com sucesso');
      carregarPacientes(searchTerm, currentPage);
      setShowDeleteModal(false);
      setPacienteToDelete(null);
    } catch (error: any) {
      toast.error('Erro ao excluir paciente');
      console.error('Erro:', error);
    }
  };

  // Formatação de dados
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatPhone = (phone?: string) => {
    if (!phone) return '-';
    return phone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
  };

  const calcularIdade = (dataNascimento: string) => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  // Paginação
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      carregarPacientes(searchTerm, page);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-dark-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
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
              Gestão de Pacientes
            </h1>
            <p className="text-gray-600 dark:text-dark-400 mt-1">
              {totalPacientes} paciente{totalPacientes !== 1 ? 's' : ''} cadastrado{totalPacientes !== 1 ? 's' : ''}
            </p>
          </div>
          
          <Link
            to="/pacientes/novo"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-dark-900 transition-colors"
          >
            <Plus className="-ml-1 mr-2 h-4 w-4" />
            Novo Paciente
          </Link>
        </div>
      </div>

      {/* Busca */}
      <div className="mb-6">
        <div className="max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 dark:text-dark-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nome, CPF, e-mail ou telefone..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-700 rounded-lg leading-5 bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-50 placeholder-gray-500 dark:placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-dark-850 shadow-lg rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-700">
            <thead className="bg-gray-50 dark:bg-dark-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">
                  Localização
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">
                  Cadastro
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-850 divide-y divide-gray-200 dark:divide-dark-700">
              {filteredPacientes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Users className="h-12 w-12 text-gray-300 dark:text-dark-600 mb-4" />
                      <p className="text-gray-500 dark:text-dark-400 text-lg font-medium">
                        {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
                      </p>
                      <p className="text-gray-400 dark:text-dark-500">
                        {searchTerm ? 'Tente buscar com outros termos' : 'Cadastre o primeiro paciente para começar'}
                      </p>
                      {!searchTerm && (
                        <Link
                          to="/pacientes/novo"
                          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 transition-colors"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Cadastrar Primeiro Paciente
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPacientes.map((paciente) => (
                  <tr key={paciente.id} className="hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-dark-50">
                            {paciente.nomeCompleto}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-dark-400 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {calcularIdade(paciente.dataNascimento)} anos
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-dark-50">
                        <div className="flex items-center mb-1">
                          <Phone className="h-4 w-4 text-primary-500 dark:text-primary-400 mr-1" />
                          {formatPhone(paciente.telefone || paciente.whatsapp)}
                        </div>
                        {paciente.email && (
                          <div className="flex items-center text-gray-500 dark:text-dark-400">
                            <Mail className="h-4 w-4 mr-1" />
                            {paciente.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-dark-50">
                        {paciente.cidade && paciente.estado ? `${paciente.cidade} - ${paciente.estado}` : '-'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-dark-400">
                        {paciente.bairro || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-400">
                      {formatDate(paciente.createdAt || new Date().toISOString())}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleView(paciente)}
                          className="inline-flex items-center p-2 border border-transparent rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors"
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(paciente)}
                          className="inline-flex items-center p-2 border border-transparent rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {user?.role === 'admin' && (
                          <button
                            onClick={() => handleDelete(paciente)}
                            className="inline-flex items-center p-2 border border-transparent rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                            title="Excluir"
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

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="bg-white dark:bg-dark-850 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-dark-700 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-dark-700 text-sm font-medium rounded-md text-gray-700 dark:text-dark-300 bg-white dark:bg-dark-850 hover:bg-gray-50 dark:hover:bg-dark-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-dark-700 text-sm font-medium rounded-md text-gray-700 dark:text-dark-300 bg-white dark:bg-dark-850 hover:bg-gray-50 dark:hover:bg-dark-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Próximo
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-dark-300">
                  Mostrando{' '}
                  <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                  {' '}até{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, totalPacientes)}
                  </span>
                  {' '}de{' '}
                  <span className="font-medium">{totalPacientes}</span>
                  {' '}resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-dark-700 bg-white dark:bg-dark-850 text-sm font-medium text-gray-500 dark:text-dark-400 hover:bg-gray-50 dark:hover:bg-dark-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Anterior
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, index) => {
                    const page = index + 1;
                    const isCurrentPage = page === currentPage;
                    
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                          isCurrentPage
                            ? 'z-10 bg-primary-50 dark:bg-primary-500/20 border-primary-500 dark:border-primary-400 text-primary-600 dark:text-primary-400'
                            : 'bg-white dark:bg-dark-850 border-gray-300 dark:border-dark-700 text-gray-500 dark:text-dark-400 hover:bg-gray-50 dark:hover:bg-dark-800'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-dark-700 bg-white dark:bg-dark-850 text-sm font-medium text-gray-500 dark:text-dark-400 hover:bg-gray-50 dark:hover:bg-dark-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Próximo
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Visualização */}
      {showViewModal && pacienteToView && (
        <div className="fixed inset-0 bg-gray-600 dark:bg-dark-900 bg-opacity-50 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="bg-white dark:bg-dark-850 rounded-lg shadow-xl">
              {/* Header do Modal */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-50 flex items-center">
                  <Users className="mr-2 h-5 w-5 text-primary-600 dark:text-primary-400" />
                  Dados do Paciente
                </h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-dark-300 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Conteúdo do Modal */}
              <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Dados Pessoais */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 dark:text-dark-50 mb-3 border-b border-gray-200 dark:border-dark-700 pb-2">
                      Dados Pessoais
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-dark-400">Nome Completo</label>
                        <p className="text-gray-900 dark:text-dark-50">{pacienteToView.nomeCompleto}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-dark-400">CPF</label>
                        <p className="text-gray-900 dark:text-dark-50">{pacienteToView.cpf}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-dark-400">Data de Nascimento</label>
                        <p className="text-gray-900 dark:text-dark-50">
                          {formatDate(pacienteToView.dataNascimento)} ({calcularIdade(pacienteToView.dataNascimento)} anos)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contato */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 dark:text-dark-50 mb-3 border-b border-gray-200 dark:border-dark-700 pb-2">
                      Contato
                    </h4>
                    <div className="space-y-3">
                      {pacienteToView.telefone && (
                        <div>
                          <label className="text-sm font-medium text-gray-600 dark:text-dark-400">Telefone</label>
                          <p className="text-gray-900 dark:text-dark-50">{formatPhone(pacienteToView.telefone)}</p>
                        </div>
                      )}
                      {pacienteToView.whatsapp && (
                        <div>
                          <label className="text-sm font-medium text-gray-600 dark:text-dark-400">WhatsApp</label>
                          <p className="text-gray-900 dark:text-dark-50">{formatPhone(pacienteToView.whatsapp)}</p>
                        </div>
                      )}
                      {pacienteToView.email && (
                        <div>
                          <label className="text-sm font-medium text-gray-600 dark:text-dark-400">E-mail</label>
                          <p className="text-gray-900 dark:text-dark-50">{pacienteToView.email}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Endereço */}
                  <div className="md:col-span-2">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-dark-50 mb-3 border-b border-gray-200 dark:border-dark-700 pb-2">
                      Endereço
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-dark-400">CEP</label>
                        <p className="text-gray-900 dark:text-dark-50">{pacienteToView.cep || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-dark-400">Logradouro</label>
                        <p className="text-gray-900 dark:text-dark-50">{pacienteToView.logradouro || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-dark-400">Número</label>
                        <p className="text-gray-900 dark:text-dark-50">{pacienteToView.numero || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-dark-400">Complemento</label>
                        <p className="text-gray-900 dark:text-dark-50">{pacienteToView.complemento || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-dark-400">Bairro</label>
                        <p className="text-gray-900 dark:text-dark-50">{pacienteToView.bairro || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-dark-400">Cidade/Estado</label>
                        <p className="text-gray-900 dark:text-dark-50">
                          {pacienteToView.cidade && pacienteToView.estado ? `${pacienteToView.cidade} - ${pacienteToView.estado}` : '-'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Informações Adicionais */}
                  {(pacienteToView.comoConheceu || pacienteToView.indicacao || pacienteToView.observacoes) && (
                    <div className="md:col-span-2">
                      <h4 className="text-md font-semibold text-gray-900 dark:text-dark-50 mb-3 border-b border-gray-200 dark:border-dark-700 pb-2">
                        Informações Adicionais
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pacienteToView.comoConheceu && (
                          <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-dark-400">Como Conheceu</label>
                            <p className="text-gray-900 dark:text-dark-50">{pacienteToView.comoConheceu}</p>
                          </div>
                        )}
                        {pacienteToView.indicacao && (
                          <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-dark-400">Indicação</label>
                            <p className="text-gray-900 dark:text-dark-50">{pacienteToView.indicacao}</p>
                          </div>
                        )}
                        {pacienteToView.observacoes && (
                          <div className="md:col-span-2">
                            <label className="text-sm font-medium text-gray-600 dark:text-dark-400">Observações</label>
                            <p className="text-gray-900 dark:text-dark-50">{pacienteToView.observacoes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer do Modal */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-dark-700 flex justify-end space-x-3">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg text-sm font-medium text-gray-700 dark:text-dark-300 bg-white dark:bg-dark-850 hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
                >
                  Fechar
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEdit(pacienteToView);
                  }}
                  className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 transition-colors"
                >
                  Editar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && pacienteToDelete && (
        <div className="fixed inset-0 bg-gray-600 dark:bg-dark-900 bg-opacity-50 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md">
            <div className="bg-white dark:bg-dark-850 rounded-lg shadow-xl">
              <div className="px-6 py-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-dark-50 mb-4">
                  Confirmar Exclusão
                </h3>
                <p className="text-sm text-gray-600 dark:text-dark-400 mb-6">
                  Tem certeza que deseja excluir o paciente <strong>{pacienteToDelete.nomeCompleto}</strong>? 
                  Esta ação não pode ser desfeita.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg text-sm font-medium text-gray-700 dark:text-dark-300 bg-white dark:bg-dark-850 hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 transition-colors"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PacientesList; 