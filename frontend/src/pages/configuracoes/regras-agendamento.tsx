import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { ConfiguracoesService } from '../../services/configuracoes'
import ModalFeedback from '../../components/ModalFeedback'

const schema = z.object({
  permitirMoverConcluido: z.boolean(),
  permitirMoverCancelado: z.boolean(),
})

type RegrasAgendamentoForm = z.infer<typeof schema>

const textos = {
  permitirMoverConcluido: {
    label: 'Permitir movimentação de agendamentos concluídos',
    descricao: 'Se ativado, administradores e recepcionistas poderão mover agendamentos já concluídos para outro dia/horário. Útil para ajustes administrativos, mas pode impactar o histórico de atendimentos.'
  },
  permitirMoverCancelado: {
    label: 'Permitir movimentação de agendamentos cancelados',
    descricao: 'Se ativado, será possível mover agendamentos cancelados para outro dia/horário. Recomendado apenas para casos de reabertura ou correção de lançamentos.'
  }
}

const RegrasAgendamento: React.FC = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<RegrasAgendamentoForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      permitirMoverConcluido: false,
      permitirMoverCancelado: false,
    }
  })
  const [modalFeedback, setModalFeedback] = useState({
    open: false,
    titulo: '',
    mensagem: '',
    tipo: 'info' as 'info' | 'erro' | 'alerta',
    onConfirmar: undefined as (() => void) | undefined,
  })

  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true)
      try {
        const config = await ConfiguracoesService.buscarRegrasAgendamento()
        if (config) {
          setValue('permitirMoverConcluido', !!config.permitirMoverConcluido)
          setValue('permitirMoverCancelado', !!config.permitirMoverCancelado)
        }
      } catch (error) {
        toast.error('Erro ao carregar configurações')
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()
  }, [setValue])

  const onSubmit = async (values: RegrasAgendamentoForm) => {
    try {
      const response = await ConfiguracoesService.salvarRegrasAgendamento(values)
      setModalFeedback({
        open: true,
        titulo: 'Configurações salvas',
        mensagem: response.message || 'Configurações de agendamento atualizadas com sucesso!',
        tipo: 'info',
        onConfirmar: undefined,
      })
    } catch (error: any) {
      setModalFeedback({
        open: true,
        titulo: 'Erro ao salvar',
        mensagem: error?.response?.data?.message || 'Erro ao salvar configurações',
        tipo: 'erro',
        onConfirmar: undefined,
      })
    }
  }

  if (!user || user.role !== 'admin') {
    return <div className="p-8 text-center text-red-600">Acesso restrito a administradores.</div>
  }

  return (
    <div className="max-w-xl mx-auto p-8 bg-white dark:bg-dark-850 rounded-lg shadow-md mt-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Regras de Agendamento</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" {...register('permitirMoverConcluido')} className="form-checkbox h-5 w-5 text-primary-600" />
            <span className="font-medium text-gray-900 dark:text-white">{textos.permitirMoverConcluido.label}</span>
          </label>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{textos.permitirMoverConcluido.descricao}</p>
        </div>
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" {...register('permitirMoverCancelado')} className="form-checkbox h-5 w-5 text-primary-600" />
            <span className="font-medium text-gray-900 dark:text-white">{textos.permitirMoverCancelado.label}</span>
          </label>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{textos.permitirMoverCancelado.descricao}</p>
        </div>
        <button type="submit" disabled={loading} className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-60">
          {loading ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </form>
      <ModalFeedback
        isOpen={modalFeedback.open}
        onClose={() => setModalFeedback({ ...modalFeedback, open: false })}
        titulo={modalFeedback.titulo}
        mensagem={modalFeedback.mensagem}
        tipo={modalFeedback.tipo}
      />
    </div>
  )
}

export default RegrasAgendamento 