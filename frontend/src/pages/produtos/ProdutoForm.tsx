import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'

import { ProdutosService } from '../../services/produtos'
import { ParceirosService } from '../../services/parceiros'
import { SalasService } from '../../services/salas'
import { produtoFormSchema } from '../../schemas/produtos'
import type { ProdutoFormData, Produto } from '../../types/produtos'
import type { Parceiro } from '../../types/parceiros'
import type { Sala } from '../../types/salas'
import { CATEGORIAS_PRODUTO, CATEGORIAS_SERVICO } from '../../types/produtos'
import { formatMoney, parseMoney } from '../../utils/formatters'
import { DomiexInput, DomiexTextarea, DomiexSelect, DomiexCheckbox } from '../../components/form/DomiexForm'
// import ModalErro from '../../components/ModalErro' // Comentado para corrigir build

// Componente auxiliar para campos monetários
interface MoneyDomiexInputProps {
  label: string;
  register: any;
  error?: string;
  required?: boolean;
  placeholder?: string;
}

const MoneyDomiexInput: React.FC<MoneyDomiexInputProps> = ({
  label,
  register,
  error,
  required = false,
  placeholder = "0,00"
}) => {
  return (
    <div className="form-group">
      <label className="form-label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 z-10">
          R$
        </span>
        <input
          type="number"
          step="0.01"
          min="0"
          {...register}
          className={`form-input pl-8 ${error ? '!border-red-500 focus:!border-red-500' : ''}`}
          placeholder={placeholder}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

interface ProdutoFormProps {}

export const ProdutoForm: React.FC<ProdutoFormProps> = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)

  // Estado
  const [loading, setLoading] = useState(false)
  const [parceiros, setParceiros] = useState<Parceiro[]>([])
  const [salas, setSalas] = useState<Sala[]>([])
  const [produto, setProduto] = useState<Produto | null>(null)
  const [checkingCodigo, setCheckingCodigo] = useState(false)
  const [novaCategoria, setNovaCategoria] = useState('')
  const [mostrarInputCategoria, setMostrarInputCategoria] = useState(false)
  const [categoriasDinamicas, setCategoriasDinamicas] = useState<string[]>([])

  // Formulário
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    reset,
    control,
    formState: { errors, isSubmitting }
  } = useForm<any>({
    resolver: zodResolver(produtoFormSchema),
    defaultValues: {
      nome: '',
      descricao: '',
      tipo: 'produto',
      categoria: '',
      precoVenda: 0,
      precoCusto: undefined,
      precoParceiro: undefined,
      duracaoMinutos: undefined,
      estoqueAtual: undefined,
      estoqueMinimo: undefined,
      controlaEstoque: false,
      parceiroId: undefined,
      disponivelAgendamento: false,
      requerPreparo: false,
      instrucoesPreparo: '',
      tags: [],
      codigoInterno: '',
      observacoes: '',
      ativo: undefined,
      salaIds: []
    }
  })

  // Field array para tags
  const { fields: tagFields, append: appendTag, remove: removeTag } = useFieldArray({
    control,
    name: 'tags'
  })

  // Watch fields
  const tipoSelecionado = watch('tipo')
  const controlaEstoque = watch('controlaEstoque')
  const parceiroId = watch('parceiroId')
  const codigoInterno = watch('codigoInterno')
  const salasSelecionadas = watch('salaIds') || []
  
  // Debug: Log quando salasSelecionadas muda
  useEffect(() => {
    console.log('=== SALAS SELECIONADAS MUDARAM ===')
    console.log('salasSelecionadas:', salasSelecionadas)
    console.log('Tipo:', typeof salasSelecionadas)
    console.log('É array?', Array.isArray(salasSelecionadas))
  }, [salasSelecionadas])

  // Carregar dados iniciais
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true)
        
        // Carregar parceiros
        const parceirosResponse = await ParceirosService.listar(1, 100, undefined, true)
        setParceiros(parceirosResponse.data.data)

        // Carregar salas ativas
        const salasAtivas = await SalasService.listarAtivas()
        setSalas(salasAtivas)

        // Se for edição, carregar produto
        if (isEdit && id) {
          const produtoResponse = await ProdutosService.buscarPorId(Number(id))
          const produtoData = produtoResponse.data
          console.log('=== DADOS DO PRODUTO CARREGADO ===')
          console.log('Produto completo:', produtoData)
          console.log('Salas do produto:', produtoData.salas)
          console.log('SalaIds extraídos:', produtoData.salas?.map(sala => sala.id))
          setProduto(produtoData)

          // Preencher formulário
          reset({
            nome: produtoData.nome,
            descricao: produtoData.descricao || '',
            tipo: produtoData.tipo,
            categoria: produtoData.categoria,
            precoVenda: produtoData.precoVenda,
            precoCusto: produtoData.precoCusto,
            precoParceiro: produtoData.precoParceiro,
            duracaoMinutos: produtoData.duracaoMinutos,
            estoqueAtual: produtoData.estoqueAtual,
            estoqueMinimo: produtoData.estoqueMinimo,
            controlaEstoque: produtoData.controlaEstoque,
            parceiroId: produtoData.parceiroId,
            disponivelAgendamento: produtoData.disponivelAgendamento,
            requerPreparo: produtoData.requerPreparo,
            instrucoesPreparo: produtoData.instrucoesPreparo || '',
            tags: produtoData.tags || [],
            codigoInterno: produtoData.codigoInterno || '',
            observacoes: produtoData.observacoes || '',
            ativo: produtoData.ativo ? 'true' : 'false',
            salaIds: produtoData.salas?.map(sala => sala.id) || []
          })
          
          console.log('=== DADOS DEFINIDOS NO FORMULÁRIO ===')
          console.log('SalaIds definidos:', produtoData.salas?.map(sala => sala.id) || [])
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast.error('Erro ao carregar dados do formulário')
      } finally {
        setLoading(false)
      }
    }

    carregarDados()
  }, [isEdit, id, reset])

  // Verificar código interno único
  const verificarCodigoInterno = async (codigo: string) => {
    if (!codigo || codigo.trim() === '') return

    try {
      setCheckingCodigo(true)
      const response = await ProdutosService.verificarCodigoInterno(
        codigo.trim(),
        isEdit ? Number(id) : undefined
      )
      
      if (response.data.existe) {
        setError('codigoInterno', {
          type: 'manual',
          message: 'Este código interno já está sendo usado por outro produto'
        })
      } else {
        clearErrors('codigoInterno')
      }
    } catch (error) {
      console.error('Erro ao verificar código interno:', error)
    } finally {
      setCheckingCodigo(false)
    }
  }

  // Debounce para verificação do código
  useEffect(() => {
    const timer = setTimeout(() => {
      if (codigoInterno) {
        verificarCodigoInterno(codigoInterno)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [codigoInterno])

  // Obter categorias baseadas no tipo
  const getCategorias = () => {
    const categoriasBase = tipoSelecionado === 'produto' ? CATEGORIAS_PRODUTO : CATEGORIAS_SERVICO
    return [...categoriasBase, ...categoriasDinamicas.filter(cat => !categoriasBase.includes(cat as any))]
  }

  // Adicionar nova categoria
  const handleAdicionarCategoria = () => {
    if (novaCategoria.trim() && !getCategorias().includes(novaCategoria.trim())) {
      setCategoriasDinamicas([...categoriasDinamicas, novaCategoria.trim()])
      setValue('categoria', novaCategoria.trim())
      setNovaCategoria('')
      setMostrarInputCategoria(false)
    }
  }

  // Cancelar adição de categoria
  const handleCancelarCategoria = () => {
    setNovaCategoria('')
    setMostrarInputCategoria(false)
  }

  // Helper para exibir mensagens de erro
  const getErrorMessage = (error: any): string => {
    if (error.response?.data?.errors?.[0]?.message) {
      return error.response.data.errors[0].message
    }
    return error?.message || ''
  }

  // Submit do formulário
  const onSubmit = async (data: ProdutoFormData) => {
    console.log('=== DADOS PROCESSADOS PELO ZOD ===');
    console.log('Dados convertidos automaticamente:', data);
    console.log('Tipos dos dados:', {
      precoVenda: typeof data.precoVenda,
      precoCusto: typeof data.precoCusto,
      precoParceiro: typeof data.precoParceiro,
      ativo: typeof data.ativo,
      controlaEstoque: typeof data.controlaEstoque,
      disponivelAgendamento: typeof data.disponivelAgendamento,
      requerPreparo: typeof data.requerPreparo,
      salaIds: typeof data.salaIds
    });
    console.log('SalaIds valor:', data.salaIds);
    console.log('SalaIds tipo de cada item:', data.salaIds?.map(id => typeof id));

    try {
      if (isEdit && id) {
        await ProdutosService.atualizar(Number(id), data)
        toast.success('Produto atualizado com sucesso!')
      } else {
        await ProdutosService.criar(data)
        toast.success('Produto criado com sucesso!')
      }
      
      navigate('/produtos')
    } catch (error: any) {
      console.error('Erro ao salvar produto:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error message:', error.message)
      
      toast.error('Erro ao salvar. Verifique os dados.')
    }
  }

  // Adicionar tag
  const handleAddTag = () => {
    appendTag('')
  }

  // Gerenciar seleção de salas
  const handleSalaChange = (salaId: number, checked: boolean) => {
    const salasSelecionadasAtual = salasSelecionadas || []
    
    if (checked) {
      // Adicionar sala se não estiver na lista
      if (!salasSelecionadasAtual.includes(salaId)) {
        setValue('salaIds', [...salasSelecionadasAtual, salaId])
      }
    } else {
      // Remover sala da lista
      setValue('salaIds', salasSelecionadasAtual.filter(id => id !== salaId))
    }
  }

  // Aplicar máscara de preço
  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, '')
    const formattedValue = (Number(numericValue) / 100).toFixed(2)
    return formattedValue
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Carregando...</span>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <button
            onClick={() => navigate('/produtos')}
            className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
          >
            <i className="las la-arrow-left text-xl"></i>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEdit ? 'Editar' : 'Novo'} Produto/Serviço
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          {isEdit ? 'Atualize as informações do produto/serviço' : 'Preencha os dados do novo produto/serviço'}
        </p>
      </div>

      {/* Formulário */}
      <div className="container mt-4">
        <div className="bg-white dark:bg-dark-800 shadow-lg rounded-lg p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-white dark:bg-dark-850 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Informações Básicas
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome */}
                <div className="md:col-span-2">
                  <DomiexInput
                    label="Nome"
                    register={register('nome')}
                    error={errors.nome?.message}
                    placeholder="Nome do produto ou serviço"
                    required
                  />
                </div>

                {/* Tipo */}
                <div>
                  <DomiexSelect
                    label="Tipo"
                    register={register('tipo')}
                    error={errors.tipo?.message}
                    required
                    options={[
                      { value: 'produto', label: 'Produto' },
                      { value: 'servico', label: 'Serviço' }
                    ]}
                  />
                </div>

                {/* Categoria */}
                <div>
                  {!mostrarInputCategoria ? (
                    <div className="space-y-2">
                      <DomiexSelect
                        label="Categoria"
                        register={register('categoria')}
                        error={errors.categoria?.message}
                        required
                        options={[
                          { value: '', label: 'Selecione uma categoria' },
                          ...getCategorias().map(categoria => ({
                            value: categoria,
                            label: ProdutosService.formatarCategoria(categoria)
                          }))
                        ]}
                      />
                      
                      <button
                        type="button"
                        onClick={() => setMostrarInputCategoria(true)}
                        className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors flex items-center"
                      >
                        <span className="mr-1">+</span>
                        Adicionar nova categoria
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="form-label">
                        Categoria <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={novaCategoria}
                          onChange={(e) => setNovaCategoria(e.target.value)}
                          className="form-input flex-1"
                          placeholder="Digite o nome da nova categoria"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleAdicionarCategoria()
                            } else if (e.key === 'Escape') {
                              handleCancelarCategoria()
                            }
                          }}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleAdicionarCategoria}
                          disabled={!novaCategoria.trim()}
                          className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelarCategoria}
                          className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Pressione Enter para adicionar ou Esc para cancelar
                      </p>
                    </div>
                  )}
                </div>

                {/* Código Interno */}
                <div>
                  <div className="relative">
                    <DomiexInput
                      label="Código Interno"
                      register={register('codigoInterno')}
                      error={errors.codigoInterno?.message}
                      placeholder="Código para controle interno"
                    />
                    {checkingCodigo && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <DomiexSelect
                    label="Status"
                    register={register('ativo')}
                    error={errors.ativo?.message}
                    required
                    options={[
                      { value: '', label: 'Selecione o status...' },
                      { value: 'true', label: 'Ativo' },
                      { value: 'false', label: 'Inativo' }
                    ]}
                  />
                </div>

                {/* Descrição */}
                <div className="md:col-span-2">
                  <DomiexTextarea
                    label="Descrição"
                    register={register('descricao')}
                    error={errors.descricao?.message}
                    placeholder="Descrição detalhada do produto ou serviço"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Preços */}
            <div className="bg-white dark:bg-dark-850 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Preços
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Preço de Venda */}
                <div>
                  <MoneyDomiexInput
                    label="Preço de Venda"
                    register={register('precoVenda')}
                    error={errors.precoVenda?.message}
                    required
                  />
                </div>

                {/* Preço de Custo */}
                <div>
                  <MoneyDomiexInput
                    label="Preço de Custo"
                    register={register('precoCusto')}
                    error={errors.precoCusto?.message}
                  />
                </div>

                {/* Preço do Parceiro */}
                <div>
                  <MoneyDomiexInput
                    label="Preço do Parceiro"
                    register={register('precoParceiro')}
                    error={errors.precoParceiro?.message}
                  />
                </div>
              </div>
            </div>

            {/* Configurações específicas */}
            <div className="bg-white dark:bg-dark-850 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Configurações Específicas
              </h3>

              <div className="space-y-6">
                {/* Duração (apenas para serviços) */}
                {tipoSelecionado === 'servico' && (
                  <div>
                    <DomiexInput
                      label="Duração em Minutos"
                      register={register('duracaoMinutos', { 
                        valueAsNumber: true,
                        setValueAs: (value) => value === '' ? null : Number(value)
                      })}
                      error={errors.duracaoMinutos?.message}
                      type="number"
                      min="1"
                      max="480"
                      placeholder="Ex: 60"
                      required
                    />
                  </div>
                )}

                {/* Salas Disponíveis (apenas para serviços) */}
                {tipoSelecionado === 'servico' && (
                  <div>
                    <label className="form-label mb-3 block">
                      Salas Disponíveis
                      <span className="text-gray-500 dark:text-gray-400 font-normal ml-1">
                        (Selecione as salas onde este serviço pode ser realizado)
                      </span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {salas.map(sala => (
                        <label
                          key={sala.id}
                          className="flex items-center p-3 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={salasSelecionadas.includes(sala.id)}
                            onChange={(e) => handleSalaChange(sala.id, e.target.checked)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-dark-500 rounded mr-3"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {sala.nome}
                            </p>
                            {sala.descricao && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {sala.descricao}
                              </p>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                    {errors.salaIds && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {getErrorMessage(errors.salaIds)}
                      </p>
                    )}
                    {salas.length === 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                        Nenhuma sala disponível. Cadastre salas primeiro em Configurações → Salas.
                      </p>
                    )}
                  </div>
                )}

                {/* Controle de Estoque (apenas para produtos) */}
                {tipoSelecionado === 'produto' && (
                  <div className="space-y-4">
                    <DomiexCheckbox
                      label="Controlar estoque"
                      register={register('controlaEstoque', {
                        setValueAs: (value) => Boolean(value)
                      })}
                    />

                    {controlaEstoque && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                        <div>
                          <DomiexInput
                            label="Estoque Atual"
                            register={register('estoqueAtual', { 
                              valueAsNumber: true,
                              setValueAs: (value) => value === '' ? null : Number(value)
                            })}
                            error={errors.estoqueAtual?.message}
                            type="number"
                            min="0"
                            placeholder="0"
                            required
                          />
                        </div>

                        <div>
                          <DomiexInput
                            label="Estoque Mínimo"
                            register={register('estoqueMinimo', { 
                              valueAsNumber: true,
                              setValueAs: (value) => value === '' ? null : Number(value)
                            })}
                            error={errors.estoqueMinimo?.message}
                            type="number"
                            min="0"
                            placeholder="0"
                            required
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Parceiro */}
                <div>
                  <DomiexSelect
                    label="Parceiro Responsável"
                    register={register('parceiroId', { 
                      setValueAs: (value) => value === '' ? null : Number(value)
                    })}
                    error={errors.parceiroId?.message}
                    options={[
                      { value: '', label: 'Nenhum parceiro' },
                      ...parceiros.map(parceiro => ({
                        value: parceiro.id.toString(),
                        label: parceiro.nomeCompleto
                      }))
                    ]}
                  />
                </div>

                {/* Disponível para Agendamento */}
                <div>
                  <DomiexCheckbox
                    label="Disponível para agendamento"
                    register={register('disponivelAgendamento', {
                      setValueAs: (value) => Boolean(value)
                    })}
                  />
                </div>

                {/* Requer Preparo */}
                <div className="space-y-4">
                  <DomiexCheckbox
                    label="Requer preparo especial"
                    register={register('requerPreparo', {
                      setValueAs: (value) => Boolean(value)
                    })}
                  />

                  {watch('requerPreparo') && (
                    <div className="ml-6">
                      <DomiexTextarea
                        label="Instruções de Preparo"
                        register={register('instrucoesPreparo')}
                        error={errors.instrucoesPreparo?.message}
                        rows={3}
                        placeholder="Descreva as instruções de preparo necessárias"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white dark:bg-dark-850 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Tags
              </h3>

              <div className="space-y-4">
                {tagFields.map((field, index) => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <input
                      type="text"
                      {...register(`tags.${index}` as const)}
                      className="form-input flex-1"
                      placeholder="Digite uma tag"
                    />
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    >
                      <i className="las la-times text-lg"></i>
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddTag}
                  className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  <i className="las la-plus mr-1"></i>
                  Adicionar tag
                </button>
              </div>
            </div>

            {/* Observações */}
            <div className="bg-white dark:bg-dark-850 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Observações
              </h3>

              <DomiexTextarea
                register={register('observacoes')}
                error={errors.observacoes?.message}
                rows={4}
                placeholder="Observações gerais sobre o produto ou serviço"
              />
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                type="button"
                onClick={() => navigate('/produtos')}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200 dark:bg-gray-500 dark:hover:bg-gray-600"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200 dark:bg-primary-500 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                <i className="las la-save mr-2"></i>
                {isEdit ? 'Atualizar' : 'Criar'} Produto/Serviço
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* O modal de erro continuará comentado */}
    </div>
  )
} 