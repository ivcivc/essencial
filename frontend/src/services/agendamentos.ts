import api from './api'
import type {
  Agendamento,
  AgendamentoFormData,
  AgendamentoFilters,
  AgendamentosResponse,
  AgendamentoResponse,
  DisponibilidadeRequest,
  DisponibilidadeResponse,
  CalendarioResponse,
  EstatisticasResponse,
  EstatisticasAgendamento,
  AgendamentoListItem,
  AgendamentoCalendarioResponse,
  AgendamentoCalendario
} from '../types/agendamentos'
import { ConfiguracoesService } from './configuracoes'

export class AgendamentosService {
  private baseUrl = '/agendamentos'
  private configuracaoService = new ConfiguracoesService()

  /**
   * Listar agendamentos com filtros e paginação
   */
  async listar(filters: AgendamentoFilters = {}): Promise<AgendamentosResponse> {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value))
      }
    })

    const response = await api.get(`${this.baseUrl}?${params.toString()}`)
    
    return response.data
  }

  /**
   * Buscar agendamento por ID
   */
  async buscarPorId(id: number): Promise<AgendamentoResponse> {
    const response = await api.get(`${this.baseUrl}/${id}`)
    return response.data
  }

  /**
   * Criar novo agendamento
   */
  async criar(data: AgendamentoFormData): Promise<AgendamentoResponse> {
    const response = await api.post(this.baseUrl, data)
    return response.data
  }

  /**
   * Atualizar agendamento
   */
  async atualizar(id: number, data: Partial<AgendamentoFormData>): Promise<AgendamentoResponse> {
    console.log('🔗 === SERVICE ATUALIZAR AGENDAMENTO ===')
    console.log('📍 ID recebido:', id, 'Tipo:', typeof id)
    console.log('📦 Dados recebidos:', data)
    console.log('🌐 URL que será chamada:', `${this.baseUrl}/${id}`)
    console.log('🌐 URL completa:', `http://localhost:3334/api${this.baseUrl}/${id}`)
    
    try {
      console.log('📡 Fazendo requisição PUT...')
      const response = await api.put(`${this.baseUrl}/${id}`, data)
      console.log('✅ Resposta recebida:', response)
      console.log('📊 Status HTTP:', response.status)
      console.log('📋 Headers resposta:', response.headers)
      console.log('🎯 Data da resposta:', response.data)
      
      return response.data
    } catch (error: any) {
      console.error('❌ ERRO no service atualizar:', error)
      console.error('❌ Error.message:', error.message)
      console.error('❌ Error.response:', error.response)
      console.error('❌ Error.response.status:', error.response?.status)
      console.error('❌ Error.response.data:', error.response?.data)
      
      // Re-lançar o erro para ser capturado no componente
      throw error
    }
  }

  /**
   * Excluir agendamento
   */
  async excluir(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`${this.baseUrl}/${id}`)
    return response.data
  }

  /**
   * Verificar disponibilidade de horário
   */
  async verificarDisponibilidade(data: DisponibilidadeRequest): Promise<DisponibilidadeResponse> {
    const response = await api.post(`${this.baseUrl}/verificar-disponibilidade`, data)
    return response.data
  }

  /**
   * Buscar eventos para calendário
   */
  async buscarEventosCalendario(
    dataInicio: string,
    dataFim: string,
    profissionalId?: number
  ): Promise<CalendarioResponse> {
    const params = new URLSearchParams({
      dataInicio,
      dataFim
    })

    if (profissionalId) {
      params.append('profissionalId', String(profissionalId))
    }

    const response = await api.get(`${this.baseUrl}/calendario/eventos?${params.toString()}`)
    return response.data
  }

  /**
   * Marcar chegada do paciente
   */
  async marcarChegada(id: number): Promise<AgendamentoResponse> {
    const response = await api.patch(`${this.baseUrl}/${id}/marcar-chegada`)
    return response.data
  }

  /**
   * Iniciar atendimento
   */
  async iniciarAtendimento(id: number): Promise<AgendamentoResponse> {
    const response = await api.patch(`${this.baseUrl}/${id}/iniciar-atendimento`)
    return response.data
  }

  /**
   * Finalizar atendimento
   */
  async finalizarAtendimento(id: number): Promise<AgendamentoResponse> {
    const response = await api.patch(`${this.baseUrl}/${id}/finalizar-atendimento`)
    return response.data
  }

  /**
   * Cancelar agendamento
   */
  async cancelar(id: number, motivo?: string): Promise<AgendamentoResponse> {
    const response = await api.patch(`${this.baseUrl}/${id}/cancelar`, { motivo })
    return response.data
  }

  /**
   * Obter estatísticas de agendamentos
   */
  async obterEstatisticas(dataInicio: string, dataFim: string): Promise<EstatisticasResponse> {
    const params = new URLSearchParams({
      dataInicio,
      dataFim
    })

    const response = await api.get(`${this.baseUrl}/estatisticas/periodo?${params.toString()}`)
    return response.data
  }

  // Métodos auxiliares para formatação

  /**
   * Formatar status do agendamento
   */
  formatarStatus(status: Agendamento['status']): string {
    const statusMap = {
      agendado: 'Agendado',
      confirmado: 'Confirmado',
      em_andamento: 'Em Andamento',
      concluido: 'Concluído',
      cancelado: 'Cancelado',
      nao_compareceu: 'Não Compareceu'
    }
    return statusMap[status] || status
  }

  /**
   * Obter cor do status
   */
  obterCorStatus(status: Agendamento['status']): string {
    const coresMap = {
      agendado: 'primary-500',
      confirmado: 'emerald-500',
      em_andamento: 'amber-500',
      concluido: 'green-500',
      cancelado: 'red-500',
      nao_compareceu: 'gray-500'
    }
    return coresMap[status] || 'primary-500'
  }

  /**
   * Formatar data para exibição
   */
  formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR')
  }

  /**
   * Formatar hora para exibição
   */
  formatarHora(hora: string): string {
    return hora.substring(0, 5) // Remove segundos se houver
  }

  /**
   * Formatar duração em minutos para texto
   */
  formatarDuracao(minutos: number): string {
    const horas = Math.floor(minutos / 60)
    const minutosRestantes = minutos % 60

    if (horas === 0) {
      return `${minutosRestantes}min`
    } else if (minutosRestantes === 0) {
      return `${horas}h`
    } else {
      return `${horas}h ${minutosRestantes}min`
    }
  }

  /**
   * Formatar valor monetário
   */
  formatarValor(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  /**
   * Gerar horários disponíveis baseado nas configurações da clínica
   */
  async gerarHorariosDisponiveis(data: string, intervaloCustom?: number): Promise<string[]> {
    try {
      const response = await this.configuracaoService.gerarHorariosDisponiveis({
        data,
        intervaloCustom
      })
      
      if (response.success) {
        return response.data
      } else {
        console.warn('Erro ao gerar horários:', response.message)
        return []
      }
    } catch (error) {
      console.error('Erro ao gerar horários disponíveis:', error)
      return []
    }
  }

  /**
   * Gerar horários disponíveis para um dia (versão atualizada)
   */
  async gerarHorariosDisponiveisParaDia(data: string): Promise<string[]> {
    return await this.gerarHorariosDisponiveis(data)
  }

  /**
   * Calcular hora de fim baseada na hora de início e duração
   */
  calcularHoraFim(horaInicio: string, duracaoMinutos: number): string {
    const [horas, minutos] = horaInicio.split(':').map(Number)
    const inicioEmMinutos = horas * 60 + minutos
    const fimEmMinutos = inicioEmMinutos + duracaoMinutos
    
    const horasFim = Math.floor(fimEmMinutos / 60)
    const minutosFim = fimEmMinutos % 60
    
    return `${horasFim.toString().padStart(2, '0')}:${minutosFim.toString().padStart(2, '0')}`
  }

  /**
   * Verificar se a clínica funciona em uma data específica
   */
  async verificarFuncionamentoData(data: string): Promise<boolean> {
    try {
      const horarios = await this.gerarHorariosDisponiveis(data)
      return horarios.length > 0
    } catch (error) {
      console.error('Erro ao verificar funcionamento:', error)
      return false
    }
  }

  /**
   * Obter configuração de tolerância para edição
   */
  async obterToleranciaEdicao(): Promise<number> {
    try {
      const response = await this.configuracaoService.obterConfiguracaoAgendamentos()
      if (response.success) {
        return response.data.toleranciaEdicaoPassado || 60
      }
      return 60 // padrão de 1 hora
    } catch (error) {
      console.error('Erro ao obter tolerância:', error)
      return 60
    }
  }

  /**
   * Verificar se agendamento pode ser editado
   */
  podeEditar(agendamento: Agendamento): boolean {
    return !['concluido', 'cancelado'].includes(agendamento.status)
  }

  /**
   * Verificar se agendamento pode ser cancelado
   */
  podeCancelar(agendamento: Agendamento): boolean {
    return !['concluido', 'cancelado'].includes(agendamento.status)
  }

  /**
   * Verificar se pode marcar chegada
   */
  podeMarcarChegada(agendamento: Agendamento): boolean {
    return agendamento.status === 'agendado'
  }

  /**
   * Verificar se pode iniciar atendimento
   */
  podeIniciarAtendimento(agendamento: Agendamento): boolean {
    return ['agendado', 'confirmado'].includes(agendamento.status)
  }

  /**
   * Verificar se pode finalizar atendimento
   */
  podeFinalizarAtendimento(agendamento: Agendamento): boolean {
    return agendamento.status === 'em_andamento'
  }

  /**
   * Filtrar agendamentos por data
   */
  filtrarPorData(agendamentos: Agendamento[], data: string): Agendamento[] {
    return agendamentos.filter(agendamento => agendamento.dataAgendamento === data)
  }

  /**
   * Agrupar agendamentos por data
   */
  agruparPorData(agendamentos: Agendamento[]): Record<string, Agendamento[]> {
    return agendamentos.reduce((grupos, agendamento) => {
      const data = agendamento.dataAgendamento
      if (!grupos[data]) {
        grupos[data] = []
      }
      grupos[data].push(agendamento)
      return grupos
    }, {} as Record<string, Agendamento[]>)
  }

  /**
   * Calcular estatísticas básicas de uma lista de agendamentos
   */
  calcularEstatisticasBasicas(agendamentos: Agendamento[]): EstatisticasAgendamento {
    const total = agendamentos.length
    const agendados = agendamentos.filter(a => a.status === 'agendado').length
    const confirmados = agendamentos.filter(a => a.status === 'confirmado').length
    const concluidos = agendamentos.filter(a => a.status === 'concluido').length
    const cancelados = agendamentos.filter(a => a.status === 'cancelado').length
    const naoCompareceu = agendamentos.filter(a => a.status === 'nao_compareceu').length

    const faturamento = agendamentos
      .filter(a => a.status === 'concluido' && a.valorPago)
      .reduce((sum, a) => sum + a.valorServico, 0)

    return {
      total,
      agendados,
      confirmados,
      concluidos,
      cancelados,
      naoCompareceu,
      faturamento,
      taxaConclusao: total > 0 ? (concluidos / total) * 100 : 0,
      taxaCancelamento: total > 0 ? ((cancelados + naoCompareceu) / total) * 100 : 0
    }
  }
}

// Instância singleton do service
export const agendamentosService = new AgendamentosService() 