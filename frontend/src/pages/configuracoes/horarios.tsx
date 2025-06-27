import React, { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { useNavigate, useLocation } from 'react-router-dom'
import { ConfiguracoesService } from '../../services/configuracoes'
import type { HorariosFuncionamento, DiaFuncionamento, PeriodoFuncionamento } from '../../types/configuracoes'
import { DomiexInput, DomiexCheckbox } from '../../components/form/DomiexForm'

const configuracaoService = new ConfiguracoesService()

// Schema de validação
const periodoSchema = z.object({
  inicio: z.string()
    .min(1, 'Horário de início é obrigatório')
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  fim: z.string()
    .min(1, 'Horário de fim é obrigatório')
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)')
}).refine(data => {
  const [inicioH, inicioM] = data.inicio.split(':').map(Number)
  const [fimH, fimM] = data.fim.split(':').map(Number)
  const inicioMinutos = inicioH * 60 + inicioM
  const fimMinutos = fimH * 60 + fimM
  return inicioMinutos < fimMinutos
}, {
  message: 'Horário de início deve ser anterior ao horário de fim',
  path: ['fim']
})

const diaSchema = z.object({
  ativo: z.boolean(),
  periodos: z.array(periodoSchema).default([])
})

const horariosSchema = z.object({
  segunda: diaSchema,
  terca: diaSchema,
  quarta: diaSchema,
  quinta: diaSchema,
  sexta: diaSchema,
  sabado: diaSchema,
  domingo: diaSchema
})

type HorariosFormData = z.infer<typeof horariosSchema>

const ConfiguracaoHorarios: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  
  const navigate = useNavigate()
  const location = useLocation()

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors }
  } = useForm<HorariosFormData>({
    resolver: zodResolver(horariosSchema),
    defaultValues: {
      segunda: { ativo: true, periodos: [] },
      terca: { ativo: true, periodos: [] },
      quarta: { ativo: true, periodos: [] },
      quinta: { ativo: true, periodos: [] },
      sexta: { ativo: true, periodos: [] },
      sabado: { ativo: false, periodos: [] },
      domingo: { ativo: false, periodos: [] }
    }
  })

  // Carregar dados iniciais
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true)
        const response = await configuracaoService.obterHorariosFuncionamento()
        
        if (response.success && response.data) {
          // Definir valores do formulário
          Object.entries(response.data).forEach(([dia, config]) => {
            setValue(dia as keyof HorariosFormData, config)
          })
        }
      } catch (error) {
        console.error('Erro ao carregar horários:', error)
        toast.error('Erro ao carregar configurações de horários')
      } finally {
        setLoading(false)
      }
    }

    carregarDados()
  }, [setValue])

  // Componente para cada dia da semana
  const DiaConfiguração: React.FC<{ 
    dia: keyof HorariosFormData
    nome: string 
  }> = ({ dia, nome }) => {
    const diaAtivo = watch(`${dia}.ativo`)
    
    const { fields, append, remove } = useFieldArray({
      control,
      name: `${dia}.periodos`
    })

    const adicionarPeriodo = () => {
      append({ inicio: '08:00', fim: '12:00' })
    }

    return (
      <div className="bg-white dark:bg-dark-850 rounded-lg border border-gray-200 dark:border-dark-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {nome}
          </h3>
          <DomiexCheckbox
            label="Ativo"
            register={register(`${dia}.ativo`)}
          />
        </div>

        {diaAtivo && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Períodos de Funcionamento
              </h4>
              <button
                type="button"
                onClick={adicionarPeriodo}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-dark-850"
              >
                <i className="las la-plus text-sm"></i>
                <span className="whitespace-nowrap">Adicionar Período</span>
              </button>
            </div>

            {fields.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <i className="las la-clock text-3xl mb-2"></i>
                <p>Nenhum período configurado</p>
                <p className="text-sm">Clique em "Adicionar Período" para começar</p>
              </div>
            )}

            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-dark-800 rounded-lg">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Início
                  </label>
                  <input
                    type="time"
                    {...register(`${dia}.periodos.${index}.inicio`)}
                    className="form-input [color-scheme:dark]"
                  />
                  {errors[dia]?.periodos?.[index]?.inicio && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[dia]?.periodos?.[index]?.inicio?.message}
                    </p>
                  )}
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fim
                  </label>
                  <input
                    type="time"
                    {...register(`${dia}.periodos.${index}.fim`)}
                    className="form-input [color-scheme:dark]"
                  />
                  {errors[dia]?.periodos?.[index]?.fim && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[dia]?.periodos?.[index]?.fim?.message}
                    </p>
                  )}
                </div>

                <div className="flex-shrink-0 pt-6">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="inline-flex items-center justify-center w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-dark-850"
                    title="Remover período"
                  >
                    <i className="las la-trash text-sm"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!diaAtivo && (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500">
            <i className="las la-ban text-3xl mb-2"></i>
            <p>Clínica fechada neste dia</p>
          </div>
        )}
      </div>
    )
  }

  const onSubmit = async (data: any) => {
    try {
      setSaving(true)
      const response = await configuracaoService.atualizarHorariosFuncionamento(data)
      
      if (response.success) {
        setShowSuccessModal(true)
      } else {
        toast.error(response.message || 'Erro ao salvar configurações')
      }
    } catch (error) {
      console.error('Erro ao salvar horários:', error)
      toast.error('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false)
    
    // Verificar se veio de alguma página específica
    const from = location.state?.from
    
    if (from) {
      navigate(from)
    } else {
      // Se não veio de lugar específico, voltar para dashboard
      navigate('/dashboard')
    }
  }

  const handleCancel = () => {
    const from = location.state?.from
    
    if (from) {
      navigate(from)
    } else {
      navigate('/dashboard')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando configurações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
            <i className="las la-clock text-xl text-primary-600 dark:text-primary-400"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Horários de Funcionamento
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Configure os horários de funcionamento da clínica por dia da semana
            </p>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <DiaConfiguração dia="segunda" nome="Segunda-feira" />
          <DiaConfiguração dia="terca" nome="Terça-feira" />
          <DiaConfiguração dia="quarta" nome="Quarta-feira" />
          <DiaConfiguração dia="quinta" nome="Quinta-feira" />
          <DiaConfiguração dia="sexta" nome="Sexta-feira" />
          <DiaConfiguração dia="sabado" nome="Sábado" />
          <div className="lg:col-span-2">
            <DiaConfiguração dia="domingo" nome="Domingo" />
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-dark-700">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-gray-700 dark:text-gray-300 font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-dark-850"
            disabled={saving}
          >
            <i className="las la-arrow-left text-sm"></i>
            <span className="whitespace-nowrap">Voltar</span>
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-dark-850"
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
                <span className="whitespace-nowrap">Salvar Configurações</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Informações adicionais */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <i className="las la-info-circle text-blue-600 dark:text-blue-400 text-xl mt-0.5"></i>
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              Informações Importantes
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Os horários configurados serão aplicados automaticamente em todos os módulos de agendamento</li>
              <li>• Você pode definir múltiplos períodos por dia (ex: manhã e tarde)</li>
              <li>• Dias marcados como inativos não aparecerão nas opções de agendamento</li>
              <li>• As alterações entram em vigor imediatamente após salvar</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal de Sucesso */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-gray-900/20 dark:bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-850 rounded-lg p-8 max-w-md w-full mx-4 shadow-xl border border-gray-200 dark:border-dark-700">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900/20 mb-6">
                <i className="las la-check text-3xl text-primary-600 dark:text-primary-400"></i>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Configurações Salvas!
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Os horários de funcionamento foram atualizados com sucesso. As alterações já estão ativas no sistema.
              </p>
              
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
        </div>
      )}
    </div>
  )
}

export default ConfiguracaoHorarios 