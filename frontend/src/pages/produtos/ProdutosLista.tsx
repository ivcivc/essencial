import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'

import { ProdutosService } from '../../services/produtos'
import { produtosFiltrosSchema } from '../../schemas/produtos'
import { DomiexSelect } from '../../components/form/DomiexForm'
import type { Produto, ProdutosFiltros } from '../../types/produtos'

import { CATEGORIAS_PRODUTO, CATEGORIAS_SERVICO } from '../../types/produtos'

export const ProdutosLista: React.FC = () => {
  const navigate = useNavigate()
  
  // Estado
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEstoqueModal, setShowEstoqueModal] = useState(false)
  const [estoqueAction, setEstoqueAction] = useState<'baixar' | 'repor'>('baixar')
  const [quantidadeEstoque, setQuantidadeEstoque] = useState<number>(1)
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null)

  // Formulário de filtros
  const { register, watch, setValue, reset } = useForm<ProdutosFiltros>({
    resolver: zodResolver(produtosFiltrosSchema),
    defaultValues: {
      search: '',
      tipo: undefined,
      categoria: '',
      ativo: true,
      estoqueBaixo: false
    }
  })

  const search = watch('search')
  const tipo = watch('tipo')
  const categoria = watch('categoria')
  const ativo = watch('ativo')
  const estoqueBaixo = watch('estoqueBaixo')
  const tipoSelecionado = tipo

  // Carregar produtos
  const carregarProdutos = useCallback(async (page = 1, filtrosCustom?: ProdutosFiltros) => {
    try {
      setLoading(true)
      const filtrosParaUsar = filtrosCustom || {
        search,
        tipo,
        categoria,
        ativo,
        estoqueBaixo
      }
      
      const response = await ProdutosService.listar(page, 10, filtrosParaUsar)
      
      setProdutos(response.data.data)
      setCurrentPage(response.data.meta.currentPage)
      setTotalPages(response.data.meta.lastPage)
      setTotalItems(response.data.meta.total)
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
      toast.error('Erro ao carregar produtos')
      setProdutos([])
    } finally {
      setLoading(false)
    }
  }, [search, tipo, categoria, ativo])

  // Efeito para carregamento inicial (apenas uma vez)
  useEffect(() => {
    carregarProdutos(1)
  }, [])

  // Efeito para mudanças nos filtros (com debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1)
      carregarProdutos(1)
    }, search ? 500 : 100)
    
    return () => clearTimeout(timeoutId)
  }, [search, tipo, categoria, ativo, estoqueBaixo])

  // Handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    carregarProdutos(page)
  }

  const handleView = (produto: Produto) => {
    setSelectedProduto(produto)
    setShowViewModal(true)
  }

  const handleEdit = (produto: Produto) => {
    navigate(`/produtos/editar/${produto.id}`)
  }

  const handleDelete = (produto: Produto) => {
    setSelectedProduto(produto)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!selectedProduto) return

    try {
      await ProdutosService.excluir(selectedProduto.id)
      toast.success('Produto excluído com sucesso')
      setShowDeleteModal(false)
      setSelectedProduto(null)
      carregarProdutos(currentPage)
    } catch (error) {
      console.error('Erro ao excluir produto:', error)
      toast.error('Erro ao excluir produto')
    }
  }

  const handleBaixarEstoque = (produto: Produto) => {
    setSelectedProduto(produto)
    setEstoqueAction('baixar')
    setQuantidadeEstoque(1)
    setShowEstoqueModal(true)
  }

  const handleReporEstoque = (produto: Produto) => {
    setSelectedProduto(produto)
    setEstoqueAction('repor')
    setQuantidadeEstoque(1)
    setShowEstoqueModal(true)
  }

  const confirmEstoqueAction = async () => {
    if (!selectedProduto) return

    try {
      if (estoqueAction === 'baixar') {
        await ProdutosService.baixarEstoque(selectedProduto.id, quantidadeEstoque)
        toast.success('Estoque baixado com sucesso')
      } else {
        await ProdutosService.reporEstoque(selectedProduto.id, quantidadeEstoque)
        toast.success('Estoque reposto com sucesso')
      }
      
      setShowEstoqueModal(false)
      setSelectedProduto(null)
      carregarProdutos(currentPage)
    } catch (error: any) {
      console.error('Erro ao atualizar estoque:', error)
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Erro ao atualizar estoque')
      }
    }
  }

  const clearFilters = () => {
    reset({
      search: '',
      tipo: undefined,
      categoria: '',
      ativo: true,
      estoqueBaixo: false
    })
  }

  // Obter categorias baseadas no tipo selecionado
  const getCategorias = () => {
    if (tipoSelecionado === 'produto') {
      return CATEGORIAS_PRODUTO
    } else if (tipoSelecionado === 'servico') {
      return CATEGORIAS_SERVICO
    }
    // Remover duplicatas quando mostrar todas as categorias
    const todasCategorias = [...new Set([...CATEGORIAS_PRODUTO, ...CATEGORIAS_SERVICO])]
    return todasCategorias
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Produtos e Serviços
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie produtos e serviços da clínica
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <Link
            to="/produtos/novo"
            className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 dark:bg-primary-500 dark:hover:bg-primary-600"
          >
            <i className="las la-plus mr-2"></i>
            Novo Produto/Serviço
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-dark-850 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Busca */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buscar
            </label>
            <div className="relative">
              <input
                type="text"
                {...register('search')}
                placeholder="Nome, descrição, código..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <i className="las la-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>

          {/* Tipo */}
          <div>
            <DomiexSelect
              label="Tipo"
              register={register('tipo')}
              options={[
                { value: '', label: 'Todos os tipos' },
                { value: 'produto', label: 'Produto' },
                { value: 'servico', label: 'Serviço' }
              ]}
            />
          </div>

          {/* Categoria */}
          <div>
            <DomiexSelect
              label="Categoria"
              register={register('categoria')}
              options={[
                { value: '', label: 'Todas as categorias' },
                ...getCategorias().map(categoria => ({
                  value: categoria,
                  label: ProdutosService.formatarCategoria(categoria)
                }))
              ]}
            />
          </div>

          {/* Status */}
          <div>
            <DomiexSelect
              label="Status"
              register={register('ativo')}
              options={[
                { value: '', label: 'Todos' },
                { value: 'true', label: 'Ativos' },
                { value: 'false', label: 'Inativos' }
              ]}
            />
          </div>

          {/* Estoque Baixo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estoque
            </label>
            <div className="flex items-center h-[42px]">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  {...register('estoqueBaixo')}
                  className="rounded border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Apenas estoque baixo
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Ações dos filtros */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={clearFilters}
            className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <i className="las la-times mr-1"></i>
            Limpar filtros
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-dark-850 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Carregando produtos...</span>
          </div>
        ) : produtos.length === 0 ? (
          <div className="text-center py-12">
            <i className="las la-box-open text-4xl text-gray-400 dark:text-gray-500 mb-4"></i>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Nenhum produto encontrado</p>
            <Link
              to="/produtos/novo"
              className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 dark:bg-primary-500 dark:hover:bg-primary-600"
            >
              <i className="las la-plus mr-2"></i>
              Cadastrar primeiro produto
            </Link>
          </div>
        ) : (
          <>
            {/* Header da tabela */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Lista de Produtos e Serviços
                </h3>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {totalItems} {totalItems === 1 ? 'item' : 'itens'}
                </span>
              </div>
            </div>

            {/* Conteúdo da tabela */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-dark-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Produto/Serviço
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Preço
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Estoque
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-dark-700">
                  {produtos.map((produto) => {
                    const statusEstoque = ProdutosService.obterStatusEstoque(produto)
                    
                    return (
                      <tr key={produto.id} className="hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {produto.nome}
                            </div>
                            {produto.codigoInterno && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                Código: {produto.codigoInterno}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            produto.tipo === 'produto' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          }`}>
                            {ProdutosService.formatarTipo(produto.tipo)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {ProdutosService.formatarCategoria(produto.categoria)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {ProdutosService.formatarPreco(produto.precoVenda)}
                            </div>
                            {produto.duracaoMinutos && (
                              <div className="text-gray-500 dark:text-gray-400">
                                {ProdutosService.formatarDuracao(produto.duracaoMinutos)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <i className={`las la-${statusEstoque.icone} ${statusEstoque.cor} mr-1`}></i>
                            <span className={`text-sm ${statusEstoque.cor}`}>
                              {statusEstoque.texto}
                            </span>
                          </div>
                          {/* Só mostrar detalhes de estoque para produtos que controlam estoque */}
                          {produto.tipo === 'produto' && produto.controlaEstoque && produto.estoqueAtual !== null && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Atual: {produto.estoqueAtual} | Mín: {produto.estoqueMinimo}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            produto.ativo
                              ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {produto.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => handleView(produto)}
                              className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors p-1"
                              title="Visualizar"
                            >
                              <i className="las la-eye text-lg"></i>
                            </button>
                            <button
                              onClick={() => handleEdit(produto)}
                              className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors p-1"
                              title="Editar"
                            >
                              <i className="las la-edit text-lg"></i>
                            </button>
                            
                            {/* Botões de estoque apenas para produtos que controlam estoque */}
                            {produto.tipo === 'produto' && produto.controlaEstoque && (
                              <>
                                <button
                                  onClick={() => handleBaixarEstoque(produto)}
                                  className="text-gray-600 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400 transition-colors p-1"
                                  title="Baixar Estoque"
                                >
                                  <i className="las la-minus-circle text-lg"></i>
                                </button>
                                <button
                                  onClick={() => handleReporEstoque(produto)}
                                  className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors p-1"
                                  title="Repor Estoque"
                                >
                                  <i className="las la-plus-circle text-lg"></i>
                                </button>
                              </>
                            )}
                            
                            <button
                              onClick={() => handleDelete(produto)}
                              className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors p-1"
                              title="Excluir"
                            >
                              <i className="las la-trash text-lg"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
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
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => 
                        page === 1 || 
                        page === totalPages || 
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      )
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-3 py-1 text-sm text-gray-400">...</span>
                          )}
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 text-sm rounded transition-colors ${
                              page === currentPage
                                ? 'bg-primary-600 text-white dark:bg-primary-500'
                                : 'bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700'
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      ))}
                    
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
      {showViewModal && selectedProduto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-850 rounded-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Detalhes do {ProdutosService.formatarTipo(selectedProduto.tipo)}
                </h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <i className="las la-times text-xl"></i>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nome
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedProduto.nome}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Código Interno
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedProduto.codigoInterno || '-'}
                    </p>
                  </div>
                </div>

                {selectedProduto.descricao && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Descrição
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedProduto.descricao}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tipo
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {ProdutosService.formatarTipo(selectedProduto.tipo)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Categoria
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {ProdutosService.formatarCategoria(selectedProduto.categoria)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Preço de Venda
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {ProdutosService.formatarPreco(selectedProduto.precoVenda)}
                    </p>
                  </div>
                  
                  {selectedProduto.duracaoMinutos && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Duração
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {ProdutosService.formatarDuracao(selectedProduto.duracaoMinutos)}
                      </p>
                    </div>
                  )}
                </div>

                {selectedProduto.tags && Array.isArray(selectedProduto.tags) && selectedProduto.tags.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {selectedProduto.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProduto.tipo === 'servico' && selectedProduto.salas && Array.isArray(selectedProduto.salas) && selectedProduto.salas.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Salas Disponíveis
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduto.salas.map((sala) => (
                        <div
                          key={`sala-${sala.id}`}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-700"
                        >
                          <i className="las la-door-open mr-1.5"></i>
                          <div>
                            <div className="font-medium">{sala.nome}</div>
                            {sala.descricao && (
                              <div className="text-xs opacity-75">{sala.descricao}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProduto.observacoes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Observações
                    </label>
                    <p className="text-gray-900 dark:text-white">{selectedProduto.observacoes}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-dark-700">
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    handleEdit(selectedProduto)
                  }}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 dark:bg-primary-500 dark:hover:bg-primary-600"
                >
                  <i className="las la-edit mr-2"></i>
                  Editar
                </button>
                
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 dark:bg-gray-500 dark:hover:bg-gray-600"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Gestão de Estoque */}
      {showEstoqueModal && selectedProduto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-850 rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className={`flex-shrink-0 w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                  estoqueAction === 'baixar' 
                    ? 'bg-orange-100 dark:bg-orange-900' 
                    : 'bg-primary-100 dark:bg-primary-900'
                }`}>
                  <i className={`las ${
                    estoqueAction === 'baixar' ? 'la-minus-circle' : 'la-plus-circle'
                  } ${
                    estoqueAction === 'baixar' 
                      ? 'text-orange-600 dark:text-orange-400' 
                      : 'text-primary-600 dark:text-primary-400'
                  } text-xl`}></i>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {estoqueAction === 'baixar' ? 'Baixar' : 'Repor'} Estoque
                  </h3>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  <strong className="text-gray-900 dark:text-white">{selectedProduto.nome}</strong>
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Estoque atual: <strong>{selectedProduto.estoqueAtual}</strong> unidades
                </div>
                
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quantidade a {estoqueAction === 'baixar' ? 'baixar' : 'repor'}
                </label>
                <input
                  type="number"
                  min="1"
                  max={estoqueAction === 'baixar' ? selectedProduto.estoqueAtual : 9999}
                  value={quantidadeEstoque}
                  onChange={(e) => setQuantidadeEstoque(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Quantidade"
                />
                
                {estoqueAction === 'baixar' && (
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Novo estoque: {Math.max(0, (selectedProduto.estoqueAtual || 0) - quantidadeEstoque)} unidades
                  </div>
                )}
                
                {estoqueAction === 'repor' && (
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Novo estoque: {(selectedProduto.estoqueAtual || 0) + quantidadeEstoque} unidades
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowEstoqueModal(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 dark:bg-gray-500 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
                
                <button
                  onClick={confirmEstoqueAction}
                  className={`px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors duration-200 ${
                    estoqueAction === 'baixar'
                      ? 'bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600'
                      : 'bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600'
                  }`}
                >
                  <i className={`las ${estoqueAction === 'baixar' ? 'la-minus' : 'la-plus'} mr-2`}></i>
                  {estoqueAction === 'baixar' ? 'Baixar' : 'Repor'} Estoque
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && selectedProduto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-850 rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <i className="las la-exclamation-triangle text-red-600 dark:text-red-400 text-xl"></i>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Confirmar Exclusão
                  </h3>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Tem certeza que deseja excluir o {ProdutosService.formatarTipo(selectedProduto.tipo).toLowerCase()} 
                <strong className="text-gray-900 dark:text-white"> {selectedProduto.nome}</strong>?
                Esta ação não poderá ser desfeita.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 dark:bg-gray-500 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
                
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 dark:bg-red-500 dark:hover:bg-red-600"
                >
                  <i className="las la-trash mr-2"></i>
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