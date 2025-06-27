import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Categoria } from '../../types/categorias'
import { CategoriasService } from '../../services/categorias'
import { DomiexSelect } from '../../components/form/DomiexForm'

export const CategoriasList: React.FC = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [tipoFilter, setTipoFilter] = useState<'produto' | 'servico' | ''>('')
  const [ativoFilter, setAtivoFilter] = useState<'true' | 'false' | 'all'>('true')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)

  const navigate = useNavigate()

  // Carregar categorias
  useEffect(() => {
    carregarCategorias()
  }, [currentPage, searchTerm, tipoFilter, ativoFilter])

  const carregarCategorias = async () => {
    try {
      setLoading(true)
      const response = await CategoriasService.listar({
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        tipo: tipoFilter || undefined,
        ativo: ativoFilter
      })

      if (response.success) {
        setCategorias(response.data.data)
        setTotalPages(response.data.meta.last_page)
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
      toast.error('Erro ao carregar categorias')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleView = (categoria: Categoria) => {
    setSelectedCategoria(categoria)
    setShowViewModal(true)
  }

  const handleEdit = (categoria: Categoria) => {
    navigate(`/categorias/editar/${categoria.id}`)
  }

  const handleDelete = (categoria: Categoria) => {
    setSelectedCategoria(categoria)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!selectedCategoria) return

    try {
      const response = await CategoriasService.excluir(selectedCategoria.id)
      if (response.success) {
        toast.success(response.message)
        setShowDeleteModal(false)
        setSelectedCategoria(null)
        carregarCategorias()
      }
    } catch (error: any) {
      console.error('Erro ao excluir categoria:', error)
      const message = error.response?.data?.message || 'Erro ao excluir categoria'
      toast.error(message)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setTipoFilter('')
    setAtivoFilter('true')
    setCurrentPage(1)
  }

  return (
    <div className="p-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestão de Categorias
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie as categorias de produtos e serviços
          </p>
        </div>
        
        <button
          onClick={() => navigate('/categorias/nova')}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <i className="las la-plus"></i>
          Nova Categoria
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-dark-850 rounded-lg border border-gray-200 dark:border-dark-700 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Busca */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buscar
            </label>
            <div className="relative">
              <i className="las la-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nome ou descrição..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Tipo */}
          <div>
            <DomiexSelect
              label="Tipo"
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value as any)}
              options={[
                { value: '', label: 'Todos os tipos' },
                { value: 'produto', label: 'Produto' },
                { value: 'servico', label: 'Serviço' }
              ]}
            />
          </div>

          {/* Status */}
          <div>
            <DomiexSelect
              label="Status"
              value={ativoFilter}
              onChange={(e) => setAtivoFilter(e.target.value as any)}
              options={[
                { value: 'true', label: 'Apenas Ativas' },
                { value: 'false', label: 'Apenas Inativas' },
                { value: 'all', label: 'Todas' }
              ]}
            />
          </div>

          {/* Limpar filtros */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-dark-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
            >
              <i className="las la-filter mr-2"></i>
              Limpar
            </button>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-dark-850 rounded-lg border border-gray-200 dark:border-dark-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center">
              <i className="las la-spinner la-spin text-4xl text-primary-600 mb-4"></i>
              <p className="text-gray-600 dark:text-gray-400">Carregando categorias...</p>
            </div>
          </div>
        ) : categorias.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center">
              <i className="las la-tags text-6xl text-gray-400 mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhuma categoria encontrada
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                {searchTerm || tipoFilter ? 
                  'Tente ajustar os filtros para encontrar categorias' : 
                  'Comece criando sua primeira categoria de produto ou serviço'
                }
              </p>
              {!searchTerm && !tipoFilter && (
                <button
                  onClick={() => navigate('/categorias/nova')}
                  className="mt-4 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <i className="las la-plus mr-2"></i>
                  Criar Primeira Categoria
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-dark-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Origem
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-850 divide-y divide-gray-200 dark:divide-dark-700">
                  {categorias.map((categoria) => (
                    <tr key={categoria.id} className="hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {categoria.nome}
                          </div>
                          {categoria.descricao && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {categoria.descricao}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          CategoriasService.obterCorTipo(categoria.tipo)
                        }`}>
                          {CategoriasService.formatarTipo(categoria.tipo)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          CategoriasService.obterCorStatus(categoria.ativo)
                        }`}>
                          {CategoriasService.formatarStatus(categoria.ativo)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          CategoriasService.obterCorSistema(categoria.sistema)
                        }`}>
                          {CategoriasService.formatarSistema(categoria.sistema)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => handleView(categoria)}
                            className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors p-1"
                            title="Visualizar"
                          >
                            <i className="las la-eye text-lg"></i>
                          </button>
                          
                          {!categoria.sistema && (
                            <>
                              <button
                                onClick={() => handleEdit(categoria)}
                                className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors p-1"
                                title="Editar"
                              >
                                <i className="las la-edit text-lg"></i>
                              </button>
                              <button
                                onClick={() => handleDelete(categoria)}
                                className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors p-1"
                                title="Excluir"
                              >
                                <i className="las la-trash text-lg"></i>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-dark-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Página {currentPage} de {totalPages}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 rounded text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                    >
                      Anterior
                    </button>
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 rounded text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                    >
                      Próxima
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Visualização */}
      {showViewModal && selectedCategoria && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-850 rounded-xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Detalhes da Categoria
                </h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <i className="las la-times text-xl"></i>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedCategoria.nome}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo
                  </label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    CategoriasService.obterCorTipo(selectedCategoria.tipo)
                  }`}>
                    {CategoriasService.formatarTipo(selectedCategoria.tipo)}
                  </span>
                </div>

                {selectedCategoria.descricao && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Descrição
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedCategoria.descricao}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      CategoriasService.obterCorStatus(selectedCategoria.ativo)
                    }`}>
                      {CategoriasService.formatarStatus(selectedCategoria.ativo)}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Origem
                    </label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      CategoriasService.obterCorSistema(selectedCategoria.sistema)
                    }`}>
                      {CategoriasService.formatarSistema(selectedCategoria.sistema)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && selectedCategoria && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-850 rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900 rounded-full mb-4">
                <i className="las la-exclamation-triangle text-red-600 dark:text-red-400 text-2xl"></i>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
                Confirmar Exclusão
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                Tem certeza que deseja excluir a categoria "{selectedCategoria.nome}"? 
                Esta ação não pode ser desfeita.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-dark-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 