import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { AgendamentosService } from '../../services/agendamentos'
import type { Agendamento } from '../../types/agendamentos'

const agendamentosService = new AgendamentosService()

const AgendamentosPage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [estatisticas, setEstatisticas] = useState({
    agendados: 0,
    confirmados: 0,
    emAndamento: 0,
    concluidos: 0
  })
  const [proximosAgendamentos, setProximosAgendamentos] = useState<Agendamento[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const hoje = new Date().toISOString().split('T')[0]
      
      // Buscar agendamentos de hoje
      const response = await agendamentosService.listar({
        dataInicio: hoje,
        dataFim: hoje,
        limit: 100,
        page: 1
      })

      if (response.success && response.data) {
        const agendamentosHoje = response.data.data

        // Calcular estatísticas
        const stats = {
          agendados: agendamentosHoje.filter(a => a.status === 'agendado').length,
          confirmados: agendamentosHoje.filter(a => a.status === 'confirmado').length,
          emAndamento: agendamentosHoje.filter(a => a.status === 'em_andamento').length,
          concluidos: agendamentosHoje.filter(a => a.status === 'concluido').length
        }
        setEstatisticas(stats)

        // Buscar próximos agendamentos (próximos 3 agendamentos de hoje em diante)
        const proximosResponse = await agendamentosService.listar({
          dataInicio: hoje,
          limit: 3,
          page: 1
        })

        if (proximosResponse.success && proximosResponse.data) {
          setProximosAgendamentos(proximosResponse.data.data)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados do dashboard')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      agendado: 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300',
      confirmado: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300',
      em_andamento: 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300',
      concluido: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300',
      cancelado: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700'
  }

  const getStatusText = (status: string) => {
    const texts = {
      agendado: 'Agendado',
      confirmado: 'Confirmado', 
      em_andamento: 'Em Andamento',
      concluido: 'Concluído',
      cancelado: 'Cancelado',
      nao_compareceu: 'Não Compareceu'
    }
    return texts[status as keyof typeof texts] || status
  }

  const formatarData = (data: string) => {
    // Verificar se a data existe e é válida
    if (!data) return 'Data não definida'
    
    try {
      const hoje = new Date().toISOString().split('T')[0]
      if (data === hoje) return 'Hoje'
      
      const dataObj = new Date(data + 'T00:00:00') // Forçar timezone local
      
      // Verificar se a data é válida
      if (isNaN(dataObj.getTime())) {
        console.warn('Data inválida:', data)
        return 'Data inválida'
      }
      
      return dataObj.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'short' 
      })
    } catch (error) {
      console.warn('Erro ao formatar data:', data, error)
      return 'Data inválida'
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Sistema de Agendamentos
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Gerencie todos os agendamentos da clínica
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card Calendário */}
        <div className="bg-white dark:bg-dark-850 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
              <i className="las la-calendar text-2xl text-primary-600 dark:text-primary-400"></i>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Calendário
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Visualização em calendário
              </p>
            </div>
          </div>
          <Link
            to="/agendamentos/calendario"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <i className="las la-calendar-alt mr-2"></i>
            Abrir Calendário
          </Link>
        </div>

        {/* Card Lista */}
        <div className="bg-white dark:bg-dark-850 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
              <i className="las la-list text-2xl text-emerald-600 dark:text-emerald-400"></i>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Lista de Agendamentos
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Visualização em lista
              </p>
            </div>
          </div>
          <Link
            to="/agendamentos/lista"
            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <i className="las la-list-ul mr-2"></i>
            Ver Lista
          </Link>
        </div>

        {/* Card Novo Agendamento */}
        <div className="bg-white dark:bg-dark-850 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
              <i className="las la-plus text-2xl text-amber-600 dark:text-amber-400"></i>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Novo Agendamento
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Criar agendamento
              </p>
            </div>
          </div>
          <Link
            to="/agendamentos/novo"
            className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <i className="las la-plus mr-2"></i>
            Novo Agendamento
          </Link>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Estatísticas de Hoje
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-dark-850 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <i className="las la-clock text-blue-600 dark:text-blue-400"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Agendados</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{estatisticas.agendados}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-850 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <i className="las la-check text-green-600 dark:text-green-400"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Confirmados</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{estatisticas.confirmados}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-850 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                <i className="las la-play text-amber-600 dark:text-amber-400"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Em Andamento</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{estatisticas.emAndamento}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-850 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                <i className="las la-check-circle text-emerald-600 dark:text-emerald-400"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Concluídos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{estatisticas.concluidos}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Próximos Agendamentos */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Próximos Agendamentos
        </h2>
        <div className="bg-white dark:bg-dark-850 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700">
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                <span className="ml-2">Carregando agendamentos...</span>
              </div>
            ) : proximosAgendamentos.length > 0 ? (
              <div className="space-y-4">
                {proximosAgendamentos.map((agendamento, index) => (
                  <div key={agendamento.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-800 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                        <i className="las la-user text-primary-600 dark:text-primary-400"></i>
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {agendamento.paciente?.nome || 'Paciente'} - {agendamento.servico?.nome || 'Serviço'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatarData(agendamento.dataAgendamento || agendamento.data)}, {agendamento.horaInicio || 'Horário não definido'} - {agendamento.parceiro?.nome || 'Profissional'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(agendamento.status)}`}>
                      {getStatusText(agendamento.status)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="las la-calendar text-2xl text-gray-400"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Nenhum agendamento encontrado
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Não há agendamentos para os próximos dias.
                </p>
                <Link
                  to="/agendamentos/novo"
              state={{ from: location.pathname }}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <i className="las la-plus mr-2"></i>
                  Criar Primeiro Agendamento
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AgendamentosPage 