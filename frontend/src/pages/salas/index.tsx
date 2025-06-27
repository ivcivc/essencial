import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Home, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { SalasService } from '../../services/salas';
import type { Sala } from '../../types/salas';

const SalasPage: React.FC = () => {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSalas, setTotalSalas] = useState(0);
  const [selectedSala, setSelectedSala] = useState<Sala | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [salaToDelete, setSalaToDelete] = useState<Sala | null>(null);

  // Carregar salas com debounce
  const loadSalas = useCallback(async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      
      const params: any = {
        page,
        limit: 10,
        ativas: true, // Mostrar apenas salas ativas
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      const response = await SalasService.listar(params);
      
      setSalas(response.data.data);
      setCurrentPage(response.data.meta.currentPage);
      setTotalPages(response.data.meta.lastPage);
      setTotalSalas(response.data.meta.total);
    } catch (error) {
      console.error('Erro ao carregar salas:', error);
      toast.error('Erro ao carregar salas');
      setSalas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce para pesquisa
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      loadSalas(1, searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, loadSalas]);

  // Carregar salas na inicialização
  useEffect(() => {
    document.title = 'Gestão de Salas | Clínica Essencial';
    loadSalas();
  }, [loadSalas]);

  // Paginação
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      loadSalas(page, searchTerm);
    }
  };

  // Visualizar sala
  const handleView = (sala: Sala) => {
    setSelectedSala(sala);
    setShowViewModal(true);
  };

  // Confirmar exclusão
  const handleDeleteConfirm = (sala: Sala) => {
    setSalaToDelete(sala);
    setShowDeleteModal(true);
  };

  // Excluir sala
  const handleDelete = async () => {
    if (!salaToDelete) return;

    try {
      setLoading(true);
      await SalasService.excluir(salaToDelete.id);
      toast.success('Sala removida com sucesso!');
      
      // Recarregar lista
      await loadSalas(currentPage, searchTerm);
      
      setShowDeleteModal(false);
      setSalaToDelete(null);
    } catch (error: any) {
      console.error('Erro ao excluir sala:', error);
      const message = error.response?.data?.message || 'Erro ao excluir sala';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Formattar recursos
  const formatRecursos = (recursos: string[] | null) => {
    if (!recursos || recursos.length === 0) return 'Nenhum recurso cadastrado';
    if (recursos.length <= 3) return recursos.join(', ');
    return `${recursos.slice(0, 3).join(', ')} e mais ${recursos.length - 3}`;
  };

  return (
    <div className="container mx-auto px-4 py-6 bg-gray-50 dark:bg-dark-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-50 flex items-center">
              <Home className="mr-3 h-6 w-6 text-primary-600 dark:text-primary-400" />
              Gestão de Salas
            </h1>
            <p className="text-gray-600 dark:text-dark-400 mt-1">
              {totalSalas} sala{totalSalas !== 1 ? 's' : ''} ativa{totalSalas !== 1 ? 's' : ''}
            </p>
          </div>
          <Link
            to="/salas/nova"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-dark-900 transition-colors"
          >
            <Plus className="-ml-1 mr-2 h-4 w-4" />
            Nova Sala
          </Link>
        </div>

        {/* Busca */}
        <div className="mt-4">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 dark:text-dark-500" />
            </div>
            <input
              type="text"
              placeholder="Buscar salas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-700 rounded-lg leading-5 bg-white dark:bg-dark-850 text-gray-900 dark:text-dark-50 placeholder-gray-500 dark:placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Tabela de salas */}
      <div className="bg-white dark:bg-dark-850 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-700">
            <thead className="bg-gray-50 dark:bg-dark-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">
                  Sala
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">
                  Recursos
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-850 divide-y divide-gray-200 dark:divide-dark-700">
              {loading && salas.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mb-4"></div>
                      <p className="text-gray-500 dark:text-dark-400">Carregando salas...</p>
                    </div>
                  </td>
                </tr>
              ) : salas.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Home className="h-12 w-12 text-gray-300 dark:text-dark-600 mb-4" />
                      <p className="text-gray-500 dark:text-dark-400 text-lg font-medium">
                        {searchTerm ? 'Nenhuma sala encontrada' : 'Nenhuma sala cadastrada'}
                      </p>
                      <p className="text-gray-400 dark:text-dark-500">
                        {searchTerm ? 'Tente pesquisar com outros termos' : 'Cadastre a primeira sala da clínica'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                salas.map((sala) => (
                  <tr key={sala.id} className="hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
                            <Home className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-dark-50">{sala.nome}</div>
                          <div className="text-sm text-gray-500 dark:text-dark-400">
                            {sala.descricao || 'Sem descrição'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-dark-50">
                        {formatRecursos(sala.recursos)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleView(sala)}
                          className="inline-flex items-center p-2 border border-transparent rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors"
                          title="Visualizar sala"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <Link
                          to={`/salas/editar/${sala.id}`}
                          className="inline-flex items-center p-2 border border-transparent rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                          title="Editar sala"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteConfirm(sala)}
                          className="inline-flex items-center p-2 border border-transparent rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          title="Excluir sala"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
          <div className="bg-white dark:bg-dark-850 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-dark-700">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-dark-700 text-sm font-medium rounded-md text-gray-700 dark:text-dark-300 bg-white dark:bg-dark-850 hover:bg-gray-50 dark:hover:bg-dark-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-dark-700 text-sm font-medium rounded-md text-gray-700 dark:text-dark-300 bg-white dark:bg-dark-850 hover:bg-gray-50 dark:hover:bg-dark-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-dark-300">
                  Mostrando{' '}
                  <span className="font-medium">{((currentPage - 1) * 10) + 1}</span>
                  {' até '}
                  <span className="font-medium">
                    {Math.min(currentPage * 10, totalSalas)}
                  </span>
                  {' de '}
                  <span className="font-medium">{totalSalas}</span>
                  {' salas'}
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-dark-700 bg-white dark:bg-dark-850 text-sm font-medium text-gray-500 dark:text-dark-400 hover:bg-gray-50 dark:hover:bg-dark-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === currentPage
                              ? 'z-10 bg-primary-50 dark:bg-primary-500/20 border-primary-500 dark:border-primary-400 text-primary-600 dark:text-primary-400'
                              : 'bg-white dark:bg-dark-850 border-gray-300 dark:border-dark-700 text-gray-500 dark:text-dark-400 hover:bg-gray-50 dark:hover:bg-dark-800'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    }
                    return null;
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-dark-700 bg-white dark:bg-dark-850 text-sm font-medium text-gray-500 dark:text-dark-400 hover:bg-gray-50 dark:hover:bg-dark-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Visualização */}
      {showViewModal && selectedSala && (
        <div className="fixed inset-0 bg-gray-600 dark:bg-dark-900 bg-opacity-50 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg">
            <div className="bg-white dark:bg-dark-850 rounded-lg shadow-xl">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-50">
                  Detalhes da Sala
                </h3>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">
                    Nome
                  </label>
                  <p className="text-sm text-gray-900 dark:text-dark-50">{selectedSala.nome}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">
                    Descrição
                  </label>
                  <p className="text-sm text-gray-900 dark:text-dark-50">
                    {selectedSala.descricao || 'Sem descrição'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">
                    Recursos ({selectedSala.recursos?.length || 0})
                  </label>
                  {selectedSala.recursos && selectedSala.recursos.length > 0 ? (
                    <div className="space-y-1">
                      {selectedSala.recursos.map((recurso, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-2 h-2 bg-primary-500 rounded-full mr-2"></div>
                          <span className="text-sm text-gray-900 dark:text-dark-50">{recurso}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-dark-400">Nenhum recurso cadastrado</p>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 dark:border-dark-700 flex justify-end">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg text-sm font-medium text-gray-700 dark:text-dark-300 bg-white dark:bg-dark-850 hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && salaToDelete && (
        <div className="fixed inset-0 bg-gray-600 dark:bg-dark-900 bg-opacity-50 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md">
            <div className="bg-white dark:bg-dark-850 rounded-lg shadow-xl">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-50">
                  Confirmar Exclusão
                </h3>
              </div>
              
              <div className="p-6">
                <p className="text-sm text-gray-600 dark:text-dark-400">
                  Tem certeza que deseja excluir a sala <strong>{salaToDelete.nome}</strong>?
                </p>
                <p className="text-sm text-gray-500 dark:text-dark-500 mt-2">
                  Esta ação não pode ser desfeita.
                </p>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 dark:border-dark-700 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg text-sm font-medium text-gray-700 dark:text-dark-300 bg-white dark:bg-dark-850 hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-dark-850 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  )}
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalasPage; 