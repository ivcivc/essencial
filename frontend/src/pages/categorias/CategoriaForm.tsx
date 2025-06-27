import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Tag, Save } from 'lucide-react'
import toast from 'react-hot-toast'

import { categoriaSchema } from '../../schemas/categorias'
import { CategoriaFormData } from '../../types/categorias'
import { CategoriasService } from '../../services/categorias'
import { DomiexInput, DomiexTextarea, DomiexSelect } from '../../components/form/DomiexForm'

function CategoriaForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id

  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingNome, setIsCheckingNome] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch
  } = useForm<CategoriaFormData>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: {
      nome: '',
      tipo: 'produto',
      descricao: '',
      ativo: true
    }
  })

  // Carregar dados para edição
  useEffect(() => {
    if (isEditMode && id) {
      console.log('Modo edição detectado. Carregando categoria ID:', id)
      setIsLoading(true)
      
      CategoriasService.buscarPorId(Number(id))
        .then(response => {
          console.log('Resposta da API:', response)
          if (response.success && response.data) {
            const categoria = response.data
            console.log('Categoria carregada:', categoria)
            setValue('nome', categoria.nome)
            setValue('tipo', categoria.tipo)
            setValue('descricao', categoria.descricao || '')
            setValue('ativo', Boolean(categoria.ativo)) // Garantir boolean
            
            console.log('Dados carregados no formulário')
          }
        })
        .catch(error => {
          console.error('Erro ao carregar categoria:', error)
          toast.error('Erro ao carregar categoria')
          navigate('/categorias')
        })
        .finally(() => setIsLoading(false))
    }
  }, [id, isEditMode, setValue, navigate])

  // Verificar nome único
  const watchedNome = watch('nome')
  const watchedTipo = watch('tipo')
  
  useEffect(() => {
    if (!watchedNome || watchedNome.length < 2 || !watchedTipo) return

    // Se estiver editando e o nome não mudou, não verificar
    if (isEditMode && watchedNome === watch('nome')) return

    setIsCheckingNome(true)

    const timeoutId = setTimeout(() => {
      CategoriasService.verificarNome(watchedNome, watchedTipo, id ? Number(id) : undefined)
        .then(response => {
          if (response.success && response.existe) {
            toast.error('Nome já está em uso')
          }
        })
        .catch(error => {
          console.error('Erro ao verificar nome:', error)
        })
        .finally(() => setIsCheckingNome(false))
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [watchedNome, watchedTipo, isEditMode, id, watch])

  // Helper para obter mensagem de erro
  const getErrorMessage = (error: any): string | undefined => {
    return error?.message ? String(error.message) : undefined
  }

  const isSubmitDisabled = !isValid || isSubmitting || isCheckingNome

  const onSubmit = async (data: CategoriaFormData) => {
    try {
      setIsSubmitting(true)
      console.log('Dados do formulário:', data)

      if (isEditMode && id) {
        console.log('Atualizando categoria ID:', id)
        const response = await CategoriasService.atualizar(Number(id), data)
        console.log('Resposta da API:', response)
        toast.success('Categoria atualizada com sucesso!')
      } else {
        console.log('Criando nova categoria')
        const response = await CategoriasService.criar(data)
        console.log('Resposta da API:', response)
        toast.success('Categoria criada com sucesso!')
      }

      navigate('/categorias')
    } catch (error: any) {
      console.error('Erro ao salvar categoria:', error)
      const errorMessage = error?.response?.data?.message || 'Erro ao salvar categoria'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 bg-gray-50 dark:bg-dark-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate('/categorias')}
            className="mr-4 p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-dark-300 hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-50 flex items-center">
              <Tag className="mr-3 h-6 w-6 text-primary-600 dark:text-primary-400" />
              {isEditMode ? 'Editar Categoria' : 'Nova Categoria'}
            </h1>
            <p className="text-gray-600 dark:text-dark-400 mt-1">
              {isEditMode 
                ? 'Atualize as informações da categoria' 
                : 'Preencha os dados para criar uma nova categoria'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div className="bg-white dark:bg-dark-850 rounded-lg shadow-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Grid de campos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nome */}
              <div>
                <DomiexInput
                  label="Nome"
                  placeholder="Digite o nome da categoria"
                  register={register('nome')}
                  error={getErrorMessage(errors.nome)}
                  required
                />
                {isCheckingNome && (
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Verificando disponibilidade...
                  </p>
                )}
              </div>

              {/* Tipo */}
              <div>
                <DomiexSelect
                  label="Tipo"
                  register={register('tipo')}
                  error={getErrorMessage(errors.tipo)}
                  required
                  options={[
                    { value: 'produto', label: 'Produto' },
                    { value: 'servico', label: 'Serviço' }
                  ]}
                />
              </div>

              {/* Status */}
              <div>
                <DomiexSelect
                  label="Status"
                  register={register('ativo', {
                    setValueAs: (value) => value === 'true'
                  })}
                  error={getErrorMessage(errors.ativo)}
                  required
                  options={[
                    { value: 'true', label: 'Ativo' },
                    { value: 'false', label: 'Inativo' }
                  ]}
                />
              </div>
            </div>

            {/* Descrição */}
            <div>
              <DomiexTextarea
                label="Descrição"
                placeholder="Descrição opcional da categoria"
                register={register('descricao')}
                error={getErrorMessage(errors.descricao)}
                rows={3}
              />
            </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={() => navigate('/categorias')}
              className="px-4 py-2 border border-gray-300 dark:border-dark-700 rounded-lg text-sm font-medium text-gray-700 dark:text-dark-300 bg-white dark:bg-dark-850 hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-dark-850 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              <Save className="h-4 w-4 mr-2" />
              {isEditMode ? 'Atualizar' : 'Criar'} Categoria
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CategoriaForm