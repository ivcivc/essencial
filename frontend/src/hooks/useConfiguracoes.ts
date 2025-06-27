import { useState, useEffect } from 'react'
import { ConfiguracoesService } from '../services/configuracoes'
import type { 
  HorariosFuncionamento, 
  ConfiguracaoAgendamentos,
  ConfiguracaoSistema 
} from '../types/configuracoes'

const configuracaoService = new ConfiguracoesService()

export const useConfiguracoes = () => {
  const [configuracoes, setConfiguracoes] = useState<ConfiguracaoSistema[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const carregarConfiguracoes = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await configuracaoService.listar()
      
      if (response.success && response.data) {
        setConfiguracoes(response.data)
      } else {
        setError(response.message || 'Erro ao carregar configurações')
      }
    } catch (err: any) {
      setError(err.message || 'Erro inesperado')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarConfiguracoes()
  }, [])

  return {
    configuracoes,
    loading,
    error,
    recarregar: carregarConfiguracoes
  }
}

export const useHorariosFuncionamento = () => {
  const [horarios, setHorarios] = useState<HorariosFuncionamento | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const carregarHorarios = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await configuracaoService.obterHorariosFuncionamento()
      
      if (response.success && response.data) {
        setHorarios(response.data)
      } else {
        setError(response.message || 'Erro ao carregar horários')
      }
    } catch (err: any) {
      setError(err.message || 'Erro inesperado')
    } finally {
      setLoading(false)
    }
  }

  const atualizarHorarios = async (novosHorarios: HorariosFuncionamento) => {
    try {
      setError(null)
      const response = await configuracaoService.atualizarHorariosFuncionamento(novosHorarios)
      
      if (response.success && response.data) {
        setHorarios(response.data)
        return { success: true, message: response.message }
      } else {
        setError(response.message || 'Erro ao atualizar horários')
        return { success: false, message: response.message }
      }
    } catch (err: any) {
      const message = err.message || 'Erro inesperado'
      setError(message)
      return { success: false, message }
    }
  }

  useEffect(() => {
    carregarHorarios()
  }, [])

  return {
    horarios,
    loading,
    error,
    atualizarHorarios,
    recarregar: carregarHorarios
  }
}

export const useConfiguracaoAgendamentos = () => {
  const [configuracao, setConfiguracao] = useState<ConfiguracaoAgendamentos | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const carregarConfiguracao = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await configuracaoService.obterConfiguracaoAgendamentos()
      
      if (response.success && response.data) {
        setConfiguracao(response.data)
      } else {
        setError(response.message || 'Erro ao carregar configuração')
      }
    } catch (err: any) {
      setError(err.message || 'Erro inesperado')
    } finally {
      setLoading(false)
    }
  }

  const atualizarConfiguracao = async (novaConfiguracao: ConfiguracaoAgendamentos) => {
    try {
      setError(null)
      const response = await configuracaoService.atualizarConfiguracaoAgendamentos(novaConfiguracao)
      
      if (response.success && response.data) {
        setConfiguracao(response.data)
        return { success: true, message: response.message }
      } else {
        setError(response.message || 'Erro ao atualizar configuração')
        return { success: false, message: response.message }
      }
    } catch (err: any) {
      const message = err.message || 'Erro inesperado'
      setError(message)
      return { success: false, message }
    }
  }

  useEffect(() => {
    carregarConfiguracao()
  }, [])

  return {
    configuracao,
    loading,
    error,
    atualizarConfiguracao,
    recarregar: carregarConfiguracao
  }
}

export const useHorariosDisponiveis = (data?: string) => {
  const [horarios, setHorarios] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const gerarHorarios = async (dataParam?: string) => {
    const dataParaGerar = dataParam || data
    
    if (!dataParaGerar) {
      setHorarios([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await configuracaoService.gerarHorariosDisponiveis({ data: dataParaGerar })
      
      if (response.success) {
        setHorarios(response.data)
      } else {
        setError(response.message || 'Erro ao gerar horários')
        setHorarios([])
      }
    } catch (err: any) {
      setError(err.message || 'Erro inesperado')
      setHorarios([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (data) {
      gerarHorarios(data)
    }
  }, [data])

  return {
    horarios,
    loading,
    error,
    gerarHorarios
  }
} 