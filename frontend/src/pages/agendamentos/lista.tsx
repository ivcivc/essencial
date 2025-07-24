import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { AgendamentosService } from '../../services/agendamentos'
import type { Agendamento, AgendamentoFilters } from '../../types/agendamentos'
import { DomiexSelect } from '../../components/form/DomiexForm'

const agendamentosService = new AgendamentosService()

interface Filtros {
  data: string
  status: string
  parceiroId: string
  busca: string
}

// Função para formatar data sem problemas de fuso horário
const formatarDataSemFuso = (dataISO: string): string => {
  if (!dataISO) return 'Data não definida'
  
  try {
    // Se a data contém 'T' (formato ISO), extrair apenas a parte da data
    let dataLimpa = dataISO
    if (dataISO.includes('T')) {
      dataLimpa = dataISO.split('T')[0]
    }
    
    // Verificar se é hoje
    const hoje = new Date().toISOString().split('T')[0]
    if (dataLimpa === hoje) return 'Hoje'
    
    // Criar data usando os componentes individuais para evitar fuso horário
    const [ano, mes, dia] = dataLimpa.split('-').map(Number)
    const dataObj = new Date(ano, mes - 1, dia) // mes - 1 porque Date usa 0-11 para meses
    
    return dataObj.toLocaleDateString('pt-BR')
  } catch (error) {
    console.error('Erro ao formatar data:', dataISO, error)
    return 'Data inválida'
  }
}

const AgendamentosLista: React.FC = () => {
  console.log('🎯 COMPONENTE LISTA DE AGENDAMENTOS CARREGADO!')
  const navigate = useNavigate()
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [filtros, setFiltros] = useState<Filtros>({
    data: '',
    status: '',
    parceiroId: '',
    busca: ''
  })
  
  const [modalVisualizar, setModalVisualizar] = useState<{ show: boolean; agendamento: Agendamento | null }>({
    show: false,
    agendamento: null
  })

  // Carregar agendamentos da API real
  useEffect(() => {
    loadAgendamentos()
  }, [filtros, currentPage])

  const loadAgendamentos = async () => {
    try {
      setLoading(true)
      
      const apiFilters: AgendamentoFilters = {
        page: currentPage,
        limit: 10,
        search: filtros.busca || undefined,
        status: filtros.status || undefined,
        parceiroId: filtros.parceiroId ? Number(filtros.parceiroId) : undefined,
        dataInicio: filtros.data || undefined,
        dataFim: filtros.data || undefined,
      }

      const response = await agendamentosService.listar(apiFilters)
      
      console.log('🔍 Response da lista:', response)
      
      if (response.success && response.data) {
        // Tratar tanto estrutura paginada quanto array direto
        const agendamentosData = response.data.data || response.data
        const metaData = response.data.meta || { currentPage: 1, lastPage: 1, total: Array.isArray(agendamentosData) ? agendamentosData.length : 0 }
        
        console.log('🔍 Agendamentos processados:', agendamentosData)
        
        setAgendamentos(agendamentosData)
        setCurrentPage(metaData.currentPage)
        setTotalPages(metaData.lastPage)
        setTotal(metaData.total)
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error)
      toast.error('Erro ao carregar agendamentos')
      setAgendamentos([])
    } finally {
      setLoading(false)
    }
  }

  const handleFiltroChange = (campo: keyof Filtros, valor: string) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }))
    setCurrentPage(1) // Reset para primeira página ao filtrar
  }

  const handleVisualizar = (agendamento: Agendamento) => {
    setModalVisualizar({ show: true, agendamento })
  }

  const handleEditar = (id: number) => {
    // Navegar para página de edição passando a origem
    navigate(`/agendamentos/editar/${id}`, { 
      state: { from: '/agendamentos/lista' } 
    })
  }

  const handleIniciarAtendimento = async (agendamento: Agendamento) => {
    try {
      setLoading(true)
      
      const response = await agendamentosService.iniciarAtendimento(agendamento.id)
      
      if (response.success) {
        // Recarregar lista para atualizar o status
        await loadAgendamentos()
        toast.success('Atendimento iniciado com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao iniciar atendimento:', error)
      toast.error('Erro ao iniciar atendimento')
    } finally {
      setLoading(false)
    }
  }

  const handleFinalizarAtendimento = async (agendamento: Agendamento) => {
    try {
      setLoading(true)
      
      const response = await agendamentosService.finalizarAtendimento(agendamento.id)
      
      if (response.success) {
        // Recarregar lista para atualizar o status
        await loadAgendamentos()
        toast.success('Atendimento finalizado com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao finalizar atendimento:', error)
      toast.error('Erro ao finalizar atendimento')
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

  // Filtrar agendamentos
  const agendamentosFiltrados = agendamentos.filter(agendamento => {
    const matchData = !filtros.data || (agendamento.data || agendamento.dataAgendamento) === filtros.data
    const matchStatus = !filtros.status || agendamento.status === filtros.status
    const matchParceiro = !filtros.parceiroId || agendamento.parceiroId?.toString() === filtros.parceiroId
    const matchBusca = !filtros.busca ||
      agendamento.paciente?.nome?.toLowerCase().includes(filtros.busca.toLowerCase())
    
    return matchData && matchStatus && matchParceiro && matchBusca
  })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Lista de Agendamentos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Visualize e gerencie todos os agendamentos
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link
            to="/agendamentos"
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <i className="las la-arrow-left mr-2"></i>
            Voltar
          </Link>
          
          <Link
                          to="/agendamentos/novo"
              state={{ from: location.pathname }}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <i className="las la-plus mr-2"></i>
            Novo Agendamento
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-dark-850 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filtros</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data
            </label>
            <input
              type="date"
              value={filtros.data}
              onChange={(e) => handleFiltroChange('data', e.target.value)}
              className="form-input [color-scheme:dark]"
            />
          </div>
          
          <div>
            <DomiexSelect
              label="Status"
              value={filtros.status}
              onChange={(e) => handleFiltroChange('status', e.target.value)}
              options={[
                { value: '', label: 'Todos' },
                { value: 'agendado', label: 'Agendado' },
                { value: 'confirmado', label: 'Confirmado' },
                { value: 'em_andamento', label: 'Em Andamento' },
                { value: 'concluido', label: 'Concluído' },
                { value: 'cancelado', label: 'Cancelado' },
                { value: 'nao_compareceu', label: 'Não Compareceu' }
              ]}
              placeholder="Selecione o status"
            />
          </div>
          
          <div>
            <DomiexSelect
              label="Profissional"
              value={filtros.parceiroId}
              onChange={(e) => handleFiltroChange('parceiroId', e.target.value)}
              options={[
                { value: '', label: 'Todos' },
                { value: '1', label: 'Dr. João Santos' },
                { value: '2', label: 'Dra. Maria Costa' },
                { value: '3', label: 'Ana Paula Ribeiro' }
              ]}
              placeholder="Selecione o profissional"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buscar
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Nome do paciente..."
                value={filtros.busca}
                onChange={(e) => handleFiltroChange('busca', e.target.value)}
                className="form-input pl-10"
              />
              <i className="las la-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Agendamentos */}
      <div className="bg-white dark:bg-dark-850 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700">
        <div className="p-6 border-b border-gray-200 dark:border-dark-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Agendamentos {filtros.data ? `- ${formatarDataSemFuso(filtros.data)}` : 'de Hoje'}
          </h3>
        </div>
        
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Carregando agendamentos...</p>
          </div>
        ) : agendamentosFiltrados.length === 0 ? (
          <div className="p-12 text-center">
            <i className="las la-calendar-times text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-600 dark:text-gray-400">Nenhum agendamento encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-700">
              <thead className="bg-gray-50 dark:bg-dark-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Serviço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Profissional
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Horário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-850 divide-y divide-gray-200 dark:divide-dark-700">
                {agendamentosFiltrados.map((agendamento) => (
                  <tr key={agendamento.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                          <i className="las la-user text-primary-600 dark:text-primary-400"></i>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {agendamento.paciente?.nome || 'Paciente'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {agendamento.paciente?.telefone || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{agendamento.servico?.nome || 'Serviço'}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{agendamento.servico?.duracaoMinutos || 0} min</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{agendamento.parceiro?.nome || 'Parceiro'}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{agendamento.sala?.nome || 'Sala não definida'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{agendamento.horaInicio} - {agendamento.horaFim}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatarDataSemFuso(agendamento.dataAgendamento || agendamento.data)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(agendamento.status)}`}>
                        {getStatusText(agendamento.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleVisualizar(agendamento)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                          title="Visualizar"
                        >
                          <i className="las la-eye"></i>
                        </button>
                        
                        {agendamento.status === 'agendado' && (
                          <button 
                            onClick={() => handleEditar(agendamento.id)}
                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                            title="Editar"
                          >
                            <i className="las la-edit"></i>
                          </button>
                        )}
                        
                        {agendamento.status === 'confirmado' && (
                          <button 
                            onClick={() => handleIniciarAtendimento(agendamento)}
                            className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300"
                            title="Iniciar Atendimento"
                          >
                            <i className="las la-play"></i>
                          </button>
                        )}
                        
                        {agendamento.status === 'em_andamento' && (
                          <button 
                            onClick={() => handleFinalizarAtendimento(agendamento)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            title="Finalizar Atendimento"
                          >
                            <i className="las la-stop"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Paginação */}
        {agendamentosFiltrados.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 dark:bg-dark-800 border-t border-gray-200 dark:border-dark-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Mostrando <span className="font-medium">1</span> a <span className="font-medium">{agendamentosFiltrados.length}</span> de{' '}
                <span className="font-medium">{agendamentosFiltrados.length}</span> resultados
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-dark-600 rounded hover:bg-gray-50 dark:hover:bg-dark-700">
                  Anterior
                </button>
                <button className="px-3 py-1 text-sm bg-primary-600 text-white rounded">
                  1
                </button>
                <button className="px-3 py-1 text-sm text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-dark-600 rounded hover:bg-gray-50 dark:hover:bg-dark-700">
                  Próximo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Visualizar */}
      {modalVisualizar.show && modalVisualizar.agendamento && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-850 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Detalhes do Agendamento
                </h3>
                <button
                  onClick={() => setModalVisualizar({ show: false, agendamento: null })}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <i className="las la-times text-xl"></i>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Paciente</label>
                  <p className="text-gray-900 dark:text-white">{modalVisualizar.agendamento.paciente?.nome || 'Paciente'}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{modalVisualizar.agendamento.paciente?.telefone || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Serviço</label>
                  <p className="text-gray-900 dark:text-white">{modalVisualizar.agendamento.servico?.nome || 'Serviço'}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Duração: {modalVisualizar.agendamento.servico?.duracaoMinutos || 0} minutos</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Profissional</label>
                  <p className="text-gray-900 dark:text-white">{modalVisualizar.agendamento.parceiro?.nome || 'Parceiro'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Local</label>
                  <p className="text-gray-900 dark:text-white">{modalVisualizar.agendamento.sala?.nome || 'Sala não definida'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data e Horário</label>
                  <p className="text-gray-900 dark:text-white">
                    {formatarDataSemFuso(modalVisualizar.agendamento.dataAgendamento || modalVisualizar.agendamento.data)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {modalVisualizar.agendamento.horaInicio} - {modalVisualizar.agendamento.horaFim}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(modalVisualizar.agendamento.status)}`}>
                    {getStatusText(modalVisualizar.agendamento.status)}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setModalVisualizar({ show: false, agendamento: null })}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AgendamentosLista 