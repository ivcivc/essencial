import api from './api'
import type { 
  ConfiguracaoSistema, 
  HorariosFuncionamento, 
  ConfiguracaoAgendamentos,
  DadosClinica,
  ConfiguracaoNotificacoes,
  GerarHorariosRequest,
  GerarHorariosResponse
} from '../types/configuracoes'

export class ConfiguracoesService {
  private baseUrl = '/configuracoes'

  /**
   * Listar todas as configurações
   */
  async listar() {
    try {
      const response = await api.get(this.baseUrl)
      return {
        success: true,
        data: response.data.data as ConfiguracaoSistema[]
      }
    } catch (error: any) {
      console.error('Erro ao listar configurações:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao listar configurações'
      }
    }
  }

  /**
   * Obter configuração específica
   */
  async obterPorChave(chave: string) {
    try {
      const response = await api.get(`${this.baseUrl}/${chave}`)
      return {
        success: true,
        data: response.data.data as ConfiguracaoSistema
      }
    } catch (error: any) {
      console.error(`Erro ao obter configuração ${chave}:`, error)
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao obter configuração'
      }
    }
  }

  /**
   * Obter horários de funcionamento
   */
  async obterHorariosFuncionamento() {
    try {
      const response = await api.get(`${this.baseUrl}/horarios-funcionamento`)
      return {
        success: true,
        data: response.data.data as HorariosFuncionamento
      }
    } catch (error: any) {
      console.error('Erro ao obter horários de funcionamento:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao obter horários de funcionamento'
      }
    }
  }

  /**
   * Atualizar horários de funcionamento
   */
  async atualizarHorariosFuncionamento(horarios: HorariosFuncionamento) {
    try {
      const response = await api.put(`${this.baseUrl}/horarios-funcionamento`, horarios)
      return {
        success: true,
        data: response.data.data as HorariosFuncionamento,
        message: response.data.message
      }
    } catch (error: any) {
      console.error('Erro ao atualizar horários de funcionamento:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao atualizar horários de funcionamento'
      }
    }
  }

  /**
   * Obter configurações de agendamento
   */
  async obterConfiguracaoAgendamentos() {
    try {
      const response = await api.get(`${this.baseUrl}/agendamentos`)
      return {
        success: true,
        data: response.data.data as ConfiguracaoAgendamentos
      }
    } catch (error: any) {
      console.error('Erro ao obter configuração de agendamentos:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao obter configuração de agendamentos'
      }
    }
  }

  /**
   * Atualizar configurações de agendamento
   */
  async atualizarConfiguracaoAgendamentos(configuracao: ConfiguracaoAgendamentos) {
    try {
      const response = await api.put(`${this.baseUrl}/agendamentos`, configuracao)
      return {
        success: true,
        data: response.data.data as ConfiguracaoAgendamentos,
        message: response.data.message
      }
    } catch (error: any) {
      console.error('Erro ao atualizar configuração de agendamentos:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao atualizar configuração de agendamentos'
      }
    }
  }

  /**
   * Gerar horários disponíveis baseado na configuração da clínica e disponibilidade do parceiro
   */
  async gerarHorariosDisponiveis(request: GerarHorariosRequest): Promise<GerarHorariosResponse> {
    try {
      const response = await api.post(`${this.baseUrl}/gerar-horarios`, request)
      return {
        success: true,
        data: response.data.data as string[],
        message: response.data.message
      }
    } catch (error: any) {
      console.error('Erro ao gerar horários disponíveis:', error)
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Erro ao gerar horários disponíveis'
      }
    }
  }

  /**
   * Helpers para formatação
   */
  static formatarHorario(horario: string): string {
    return horario
  }

  static formatarPeriodo(inicio: string, fim: string): string {
    return `${inicio} - ${fim}`
  }

  static obterNomeDia(dia: string): string {
    const nomes: Record<string, string> = {
      segunda: 'Segunda-feira',
      terca: 'Terça-feira',
      quarta: 'Quarta-feira',
      quinta: 'Quinta-feira',
      sexta: 'Sexta-feira',
      sabado: 'Sábado',
      domingo: 'Domingo'
    }
    return nomes[dia] || dia
  }

  static validarHorario(horario: string): boolean {
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    return regex.test(horario)
  }

  static validarPeriodo(inicio: string, fim: string): boolean {
    if (!this.validarHorario(inicio) || !this.validarHorario(fim)) {
      return false
    }

    const [inicioH, inicioM] = inicio.split(':').map(Number)
    const [fimH, fimM] = fim.split(':').map(Number)
    const inicioMinutos = inicioH * 60 + inicioM
    const fimMinutos = fimH * 60 + fimM

    return inicioMinutos < fimMinutos
  }
} 