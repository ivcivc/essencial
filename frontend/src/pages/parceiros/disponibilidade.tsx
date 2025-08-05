import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-hot-toast'
import { ParceirosService } from '../../services/parceiros'
import { disponibilidadeParceiroSchema } from '../../schemas/parceiros'
import type { DisponibilidadeFormData } from '../../types/parceiros'
import BreadCrumb from '../../components/common/breadCrumb'
import DiaParceiro from '../../components/DiaParceiro'

const DisponibilidadeParceiro: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [parceiro, setParceiro] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  // Modal de sucesso
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const { register, handleSubmit, setValue, watch, control, formState: { errors } } = useForm<DisponibilidadeFormData>({
    resolver: zodResolver(disponibilidadeParceiroSchema),
    defaultValues: {
      parceiroId: Number(id),
      disponibilidade: ParceirosService.obterDisponibilidadePadrao()
    }
  })

  // Configuração dos dias da semana
  const diasSemana = [
    { key: 'seg', nome: 'Segunda-feira', abrev: 'Seg' },
    { key: 'ter', nome: 'Terça-feira', abrev: 'Ter' },
    { key: 'qua', nome: 'Quarta-feira', abrev: 'Qua' },
    { key: 'qui', nome: 'Quinta-feira', abrev: 'Qui' },
    { key: 'sex', nome: 'Sexta-feira', abrev: 'Sex' },
    { key: 'sab', nome: 'Sábado', abrev: 'Sáb' },
    { key: 'dom', nome: 'Domingo', abrev: 'Dom' }
  ]

  // Determinar para onde voltar
  const getReturnPath = () => {
    const from = location.state?.from
    if (from) return from
    return '/parceiros'
  }

  // Carregar dados do parceiro e disponibilidade
  useEffect(() => {
    if (id) {
      loadDisponibilidade()
    }
  }, [id])

  const loadDisponibilidade = async () => {
    try {
      setLoadingData(true)
      
      // Carregar dados do parceiro e disponibilidade
      const response = await ParceirosService.obterDisponibilidade(Number(id))
      
      if (response.success) {
        setParceiro(response.data)
        setValue('parceiroId', response.data.parceiroId)
        setValue('disponibilidade', response.data.disponibilidade)
      } else {
        toast.error(response.message || 'Erro ao carregar disponibilidade')
        navigate(getReturnPath())
      }
    } catch (error: any) {
      console.error('Erro ao carregar disponibilidade:', error)
      toast.error('Erro ao carregar dados do parceiro')
      navigate(getReturnPath())
    } finally {
      setLoadingData(false)
    }
  }

  const onSubmit = async (data: DisponibilidadeFormData) => {
    try {
      setSaving(true)
      
      const response = await ParceirosService.atualizarDisponibilidade(
        data.parceiroId,
        data.disponibilidade
      )
      
      if (response.success) {
        setShowSuccessModal(true)
      } else {
        toast.error(response.message || 'Erro ao salvar disponibilidade')
      }
    } catch (error: any) {
      console.error('Erro ao salvar disponibilidade:', error)
      toast.error('Erro interno do servidor')
    } finally {
      setSaving(false)
    }
  }

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false)
    navigate(getReturnPath())
  }

  const handleCancel = () => {
    navigate(getReturnPath())
  }

  // Função para aplicar horário padrão a todos os dias
  const aplicarHorarioPadrao = () => {
    const horarioPadrao = {
      ativo: true,
      periodos: [
        { inicio: '08:00', fim: '12:00' },
        { inicio: '14:00', fim: '18:00' }
      ]
    }

    diasSemana.forEach(dia => {
      setValue(`disponibilidade.${dia.key}.ativo`, horarioPadrao.ativo)
      setValue(`disponibilidade.${dia.key}.periodos`, [...horarioPadrao.periodos])
    })

    toast.success('Horário padrão aplicado a todos os dias')
  }

  // Função para copiar horário de um dia para outro
  const copiarHorario = (diaOrigem: string, diaDestino: string) => {
    const horarioOrigem = watch(`disponibilidade.${diaOrigem}`)
    
    setValue(`disponibilidade.${diaDestino}.ativo`, horarioOrigem.ativo)
    setValue(`disponibilidade.${diaDestino}.periodos`, [...horarioOrigem.periodos])

    toast.success(`Horário copiado de ${diaOrigem} para ${diaDestino}`)
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <BreadCrumb 
        title={`Disponibilidade - ${parceiro?.nome || 'Parceiro'}`} 
        subTitle=""
      />

      <div className="bg-white dark:bg-dark-850 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700">
        {/* Cabeçalho */}
        <div className="p-6 border-b border-gray-200 dark:border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Configurar Disponibilidade
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Configure os horários de atendimento de <strong>{parceiro?.nome}</strong>
              </p>
            </div>
            
            {/* Ações rápidas */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={aplicarHorarioPadrao}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-dark-850"
              >
                <i className="las la-magic text-sm"></i>
                <span className="whitespace-nowrap">Aplicar Padrão</span>
              </button>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Grid de dias da semana */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {diasSemana.map((dia) => (
              <div key={dia.key} className="relative">
                {/* Removido o posicionamento absoluto do menu de ações */}

                {/* Componente DiaParceiro */}
                <DiaParceiro
                  dia={dia.key as keyof DisponibilidadeFormData['disponibilidade']}
                  nome={dia.nome}
                  register={register}
                  control={control}
                  watch={watch}
                  setValue={setValue}
                  errors={errors}
                />
              </div>
            ))}
          </div>

          {/* Botões de ação */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-dark-700">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-gray-700 dark:text-gray-300 font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-dark-850"
              disabled={saving}
            >
              <i className="las la-arrow-left text-sm"></i>
              <span className="whitespace-nowrap">Voltar</span>
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-dark-850"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="whitespace-nowrap">Salvando...</span>
                </>
              ) : (
                <>
                  <i className="las la-save text-sm"></i>
                  <span className="whitespace-nowrap">Salvar Disponibilidade</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Sucesso */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-850 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <i className="las la-check text-green-600 dark:text-green-400 text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Disponibilidade Salva!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  A disponibilidade de {parceiro?.nome} foi atualizada com sucesso.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleSuccessModalClose}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-dark-850 flex-1"
              >
                <i className="las la-arrow-right text-sm"></i>
                <span className="whitespace-nowrap">Continuar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DisponibilidadeParceiro 