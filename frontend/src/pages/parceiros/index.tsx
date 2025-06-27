import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Eye, Edit, Trash2, Users, Filter, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { ParceirosService } from '../../services/parceiros';
import { DomiexSelect } from '../../components/form/DomiexForm';
import type { Parceiro, TipoParceria } from '../../types/parceiros';

const ParceirosPage: React.FC = () => {
  const [parceiros, setParceiros] = useState<Parceiro[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalParceiros, setTotalParceiros] = useState(0);
  const [selectedParceiro, setSelectedParceiro] = useState<Parceiro | null>(null);
  const [parceiroToDelete, setParceiroToDelete] = useState<Parceiro | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filtros
  const [filterTipo, setFilterTipo] = useState<TipoParceria | ''>('');
  const [filterAtivos, setFilterAtivos] = useState<boolean | undefined>(true);

  // Carregar parceiros
  const loadParceiros = useCallback(async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      const response = await ParceirosService.listar(
        page, 
        10, 
        search || undefined,
        filterAtivos,
        filterTipo || undefined
      );
      
      setParceiros(response.data.data);
      setCurrentPage(response.data.meta.currentPage);
      setTotalPages(response.data.meta.lastPage);
      setTotalParceiros(response.data.meta.total);
    } catch (error: any) {
      console.error('Erro ao carregar parceiros:', error);
      toast.error('Erro ao carregar parceiros');
    } finally {
      setLoading(false);
    }
  }, [filterTipo, filterAtivos]);

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      loadParceiros(1, searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, loadParceiros]);

  // Carregar parceiros na inicialização
  useEffect(() => {
    document.title = 'Gestão de Parceiros | Clínica Essencial';
    loadParceiros();
  }, [loadParceiros]);

  // Aplicar filtros
  const applyFilters = () => {
    setCurrentPage(1);
    loadParceiros(1, searchTerm);
    setShowFilters(false);
  };

  // Limpar filtros
  const clearFilters = () => {
    setFilterTipo('');
    setFilterAtivos(true);
    setCurrentPage(1);
    loadParceiros(1, searchTerm);
    setShowFilters(false);
  };

  // Paginação
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      loadParceiros(page, searchTerm);
    }
  };

  // Visualizar parceiro
  const handleView = (parceiro: Parceiro) => {
    setSelectedParceiro(parceiro);
    setShowViewModal(true);
  };

  // Confirmar exclusão
  const handleDeleteConfirm = (parceiro: Parceiro) => {
    setParceiroToDelete(parceiro);
    setShowDeleteModal(true);
  };

  // Excluir parceiro
  const handleDelete = async () => {
    if (!parceiroToDelete) return;

    try {
      setLoading(true);
      await ParceirosService.excluir(parceiroToDelete.id);
      toast.success('Parceiro removido com sucesso!');
      
      // Recarregar lista
      await loadParceiros(currentPage, searchTerm);
      
      setShowDeleteModal(false);
      setParceiroToDelete(null);
    } catch (error: any) {
      console.error('Erro ao excluir parceiro:', error);
      const message = error.response?.data?.message || 'Erro ao excluir parceiro';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && parceiros.length === 0) {
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
              Gestão de Parceiros
            </h1>
            <p className="text-gray-600 dark:text-dark-400 mt-1">
              {totalParceiros} parceiro{totalParceiros !== 1 ? 's' : ''} cadastrado{totalParceiros !== 1 ? 's' : ''}
            </p>
          </div>
          
          <Link
            to="/parceiros/novo"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-dark-900 transition-colors"
          >
            <Plus className="-ml-1 mr-2 h-4 w-4" />
            Novo Parceiro
          </Link>
        </div>
      </div>

      {/* Busca e Filtros */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Campo de busca */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 dark:text-dark-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nome, CPF/CNPJ, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-700 rounded-lg leading-5 bg-white dark:bg-dark-900 text-gray-900 dark:text-dark-50 placeholder-gray-500 dark:placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 transition-colors"
            />
          </div>

          {/* Botão de filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
              showFilters || filterTipo || filterAtivos !== true
                ? 'border-primary-500 text-primary-700 bg-primary-50 dark:bg-primary-500/10 dark:text-primary-400 dark:border-primary-400'
                : 'border-gray-300 dark:border-dark-700 text-gray-700 dark:text-dark-300 bg-white dark:bg-dark-900 hover:bg-gray-50 dark:hover:bg-dark-800'
            }`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            {(filterTipo || filterAtivos !== true) && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-primary-100 bg-primary-600 rounded-full">
                {(filterTipo ? 1 : 0) + (filterAtivos !== true ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Painel de filtros */}
        {showFilters && (
          <div className="bg-white dark:bg-dark-850 border border-gray-200 dark:border-dark-700 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <DomiexSelect
                  label="Tipo de Parceria"
                  value={filterTipo}
                  onChange={(e) => setFilterTipo(e.target.value as TipoParceria | '')}
                  options={[
                    { value: '', label: 'Todos os tipos' },
                    { value: 'sublocacao', label: 'Sublocação' },
                    { value: 'porcentagem', label: 'Porcentagem' },
                    { value: 'porcentagem_produto', label: 'Porcentagem com Produto' }
                  ]}
                />
              </div>

              <div>
                <DomiexSelect
                  label="Status"
                  value={filterAtivos === undefined ? 'todos' : filterAtivos ? 'ativos' : 'inativos'}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFilterAtivos(value === 'todos' ? undefined : value === 'ativos');
                  }}
                  options={[
                    { value: 'todos', label: 'Todos' },
                    { value: 'ativos', label: 'Apenas Ativos' },
                    { value: 'inativos', label: 'Apenas Inativos' }
                  ]}
                />
              </div>

              <div className="flex items-end space-x-2">
                <button
                  onClick={applyFilters}
                  className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Aplicar
                </button>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Limpar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-dark-850 shadow-sm rounded-lg border border-gray-200 dark:border-dark-700 overflow-hidden">
        {parceiros.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400 dark:text-dark-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-dark-50">
              Nenhum parceiro encontrado
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-dark-400">
              {searchTerm ? 'Tente ajustar sua busca ou filtros.' : 'Comece criando um novo parceiro.'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <Link
                  to="/parceiros/novo"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 transition-colors"
                >
                  <Plus className="-ml-1 mr-2 h-4 w-4" />
                  Novo Parceiro
                </Link>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-700">
                <thead className="bg-gray-50 dark:bg-dark-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">
                      Parceiro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">
                      Especialidades
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">
                      Tipo de Parceria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">
                      Disponibilidade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-850 divide-y divide-gray-200 dark:divide-dark-700">
                  {parceiros.map((parceiro) => (
                    <tr key={parceiro.id} className="hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-dark-50">
                            {parceiro.nomeCompleto}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-dark-400">
                            {ParceirosService.formatarCpfCnpj(parceiro.cpfCnpj)}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-dark-400">
                            {ParceirosService.formatarTelefone(parceiro.telefoneContato)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-dark-50">
                          {ParceirosService.formatarEspecialidades(parceiro.especialidades)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-dark-50">
                          {ParceirosService.formatarTipoParceria(parceiro.tipoParceria)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-dark-400">
                          {parceiro.tipoParceria === 'sublocacao' && parceiro.valorSublocacao && (
                            `${ParceirosService.formatarValor(parceiro.valorSublocacao)} - Dia ${parceiro.diaVencimentoSublocacao}`
                          )}
                          {parceiro.tipoParceria === 'porcentagem' && parceiro.valorRepasseServico && (
                            ParceirosService.formatarValor(parceiro.valorRepasseServico)
                          )}
                          {parceiro.tipoParceria === 'porcentagem_produto' && parceiro.percentualClinica && (
                            `${parceiro.percentualClinica}% para clínica`
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-dark-50">
                          {ParceirosService.formatarDisponibilidade(parceiro.disponibilidade)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          parceiro.ativo
                            ? 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400'
                        }`}>
                          {parceiro.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleView(parceiro)}
                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <Link
                            to={`/parceiros/${parceiro.id}/disponibilidade`}
                            state={{ from: '/parceiros' }}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                            title="Configurar Disponibilidade"
                          >
                            <i className="las la-clock text-base"></i>
                          </Link>
                          <Link
                            to={`/parceiros/editar/${parceiro.id}`}
                            className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteConfirm(parceiro)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="bg-white dark:bg-dark-850 px-4 py-3 border-t border-gray-200 dark:border-dark-700 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-dark-700 text-sm font-medium rounded-md text-gray-700 dark:text-dark-300 bg-white dark:bg-dark-900 hover:bg-gray-50 dark:hover:bg-dark-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-dark-700 text-sm font-medium rounded-md text-gray-700 dark:text-dark-300 bg-white dark:bg-dark-900 hover:bg-gray-50 dark:hover:bg-dark-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Próximo
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700 dark:text-dark-300">
                        Mostrando{' '}
                        <span className="font-medium">{(currentPage - 1) * 10 + 1}</span>
                        {' '}até{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * 10, totalParceiros)}
                        </span>
                        {' '}de{' '}
                        <span className="font-medium">{totalParceiros}</span>
                        {' '}resultados
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-dark-700 bg-white dark:bg-dark-900 text-sm font-medium text-gray-500 dark:text-dark-400 hover:bg-gray-50 dark:hover:bg-dark-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Anterior
                        </button>
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                                currentPage === pageNum
                                  ? 'z-10 bg-primary-50 dark:bg-primary-500/10 border-primary-500 dark:border-primary-400 text-primary-600 dark:text-primary-400'
                                  : 'bg-white dark:bg-dark-900 border-gray-300 dark:border-dark-700 text-gray-500 dark:text-dark-400 hover:bg-gray-50 dark:hover:bg-dark-800'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-dark-700 bg-white dark:bg-dark-900 text-sm font-medium text-gray-500 dark:text-dark-400 hover:bg-gray-50 dark:hover:bg-dark-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Próximo
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Visualização */}
      {showViewModal && selectedParceiro && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-dark-900 dark:bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-dark-850">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-dark-50">
                Detalhes do Parceiro
              </h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-dark-400 dark:hover:text-dark-300 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-300">Nome Completo</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-dark-50">{selectedParceiro.nomeCompleto}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-300">CPF/CNPJ</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-dark-50">
                    {ParceirosService.formatarCpfCnpj(selectedParceiro.cpfCnpj)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-300">Telefone</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-dark-50">
                    {ParceirosService.formatarTelefone(selectedParceiro.telefoneContato)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-300">Email</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-dark-50">{selectedParceiro.email}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-300">Especialidades</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-dark-50">
                    {selectedParceiro.especialidades.join(', ')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-300">Tipo de Parceria</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-dark-50">
                    {ParceirosService.formatarTipoParceria(selectedParceiro.tipoParceria)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-300">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedParceiro.ativo
                      ? 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400'
                  }`}>
                    {selectedParceiro.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                {selectedParceiro.observacoes && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-300">Observações</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-dark-50">{selectedParceiro.observacoes}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-md text-sm font-medium text-gray-700 dark:text-dark-300 bg-white dark:bg-dark-900 hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
              >
                Fechar
              </button>
              <Link
                to={`/parceiros/editar/${selectedParceiro.id}`}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 transition-colors"
              >
                Editar
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && parceiroToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-dark-900 dark:bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-dark-850">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-500/10">
                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-dark-50 mt-4">
                Confirmar Exclusão
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 dark:text-dark-400">
                  Tem certeza que deseja remover o parceiro{' '}
                  <span className="font-medium">{parceiroToDelete.nomeCompleto}</span>?
                  Esta ação não pode ser desfeita.
                </p>
              </div>
              <div className="flex justify-center space-x-3 mt-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={loading}
                  className="px-4 py-2 bg-white dark:bg-dark-900 text-gray-500 dark:text-dark-400 border border-gray-300 dark:border-dark-700 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-dark-800 disabled:opacity-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Removendo...' : 'Remover'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParceirosPage; 